import { Editor, EditorPosition, HoverPopover, MarkdownFileInfo, MarkdownView, Plugin, TFile } from 'obsidian';
import { constantsAndUtils } from './comments/ConstantsAndUtils';
import { TextToTreeDataParser } from "./comments/TextToTreeDataParser";
import { EventsAggregator } from './internalUtils';
import { ErrorModal, ToggleSelectionErrorModal } from './obsidianModal';
import { DEFAULT_SETTINGS, HtmlCommentsSettingTab, HtmlCommentsSettings } from "./obsidianSettings";
import { HtmlCommentsView, VIEW_TYPE } from './obsidianView';
import { viewState } from "./reactiveState";

export class HtmlCommentsPlugin extends Plugin {
	settings: HtmlCommentsSettings;
	private cursorClientX: number;
	private cursorClientY: number;
	private popoverShown: boolean;

	async onload() {
		await this.loadSettings();
		this.registerView(
			VIEW_TYPE,
			(leaf) => new HtmlCommentsView(leaf, this)
		);


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new HtmlCommentsSettingTab(this.app, this));

		this.initState();
		this.registerCommands();
		this.registerListener();
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.applySettingsStylesAndEvents();
	}

	initState() {
		viewState.settings.dark = document.body.hasClass("theme-dark");
		viewState.defaultTag.value = this.settings.defaultTagEditorValue
		this.registerDomEvent(document, 'keydown', this.onKeyDown);
		this.registerDomEvent(document, 'keyup', this.onKeyUp);
		this.registerDomEvent(document, 'mousemove', this.saveMousePosition);
	}

	registerCommands() {
		// This adds an editor command that can perform some operation on the current editor instance
		const addReadingComment = (editor: Editor, container: string) => {
			const selection = editor.getSelection();
			const replacement = constantsAndUtils.selectionToComment(viewState.defaultTag.value, container, selection);
			if (replacement) {
				const currentCursor = editor.getCursor("from");
				const tagLength = viewState.defaultTag.value.length;
				const placeholderPositionStartCh = currentCursor.ch + container.length + 126 + tagLength ;
				const placeholderPositionEndCh = placeholderPositionStartCh + 18;
				const placeholderPositionStart: EditorPosition = { line: currentCursor.line, ch: placeholderPositionStartCh }
				const placeholderPositionEnd: EditorPosition = { line: currentCursor.line, ch: placeholderPositionEndCh }
				editor.replaceSelection(replacement, selection);
				editor.setSelection(placeholderPositionStart, placeholderPositionEnd);
			} else {
				new ErrorModal(this.app, 'Multiline comments not supported yet!').open();
			}
		}
		this.addCommand({
			id: 'add-reading-comment',
			name: 'Add reading comment for selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				addReadingComment(editor, this.settings.container);
			}
		});

		this.addCommand({
			id: 'add-inline-reading-comment',
			name: 'Add inline reading comment for selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				addReadingComment(editor, "span");
			}
		});

		this.addCommand({
			id: 'add-block-reading-comment',
			name: 'Add block reading comment for selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				addReadingComment(editor, "div");
			}
		});

		this.addCommand({
			id: 'toggle-block-inline-reading-comment',
			name: 'Toggle block/inline for selected reading comment',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				const replacement = constantsAndUtils.toggleCommentContainerInSelection(selection);
				if (!replacement) {
					new ToggleSelectionErrorModal(this.app).open();
				} else {
					editor.replaceSelection(replacement);
				}
			}
		});

		this.addCommand({
			id: 'remove-comment-reading-comment',
			name: 'Remove selected reading comment',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				const replacement = constantsAndUtils.removeCommentInSelection(selection);
				if (!replacement) {
					new ToggleSelectionErrorModal(this.app).open();
				} else {
					editor.replaceSelection(replacement);
				}
			}
		});

		this.addCommand({
			id: "reading-comments",
			name: "Reading Comments Panel",
			callback: () => {
				this.activateView();
			}
		});

		this.addCommand({
			id: "reading-comments-extract-original-note",
			name: "Extract original note with links to comments note",
			callback: () => {
				this.extractOriginalNote();
			}
		});
	}

	registerListener() {
		this.registerEvent(this.app.workspace.on('file-open', async (_) => {
			this.parseActiveViewToCommentsAndClearExpandedItems();
		}));
		const aggregateTimeoutMillis = 2000
		const editorEventsAggregator = new EventsAggregator(aggregateTimeoutMillis, () => {
			this.parseActiveViewToComments(false);
		});

		this.registerEvent(this.app.workspace.on('editor-change', async (editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
			if (!this.settings.liveReloadOnEdit) {
				return;
			}
			editorEventsAggregator.triggerEvent();
		}));
	}

	async activateView() {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length === 0) {
			await this.app.workspace.getRightLeaf(false).setViewState({
				type: VIEW_TYPE,
				active: true,
			});
		}
		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE)[0]
		);
	}

	private getActiveFile(): TFile | null {
		return this.app.workspace.getActiveFile();
	}

	private getActiveView(): MarkdownView | null {
		// @ts-ignore
		return this.app.workspace.getActiveFileView();
	}

	withActiveView(actionWithActiveView: (view: MarkdownView) => void) {
		const activeView = this.getActiveView();
		if (activeView) {
			actionWithActiveView(activeView);
		}
	}
	private showPopoverEventListener = (event: MouseEvent) => {
		if (!this.settings.showCommentWhenCtrlKeyPressed) {
			return;
		}
		if (event.ctrlKey || event.metaKey) {
			this.withActiveView(view => {
				const el = event.currentTarget as Element;
				this.showPopoverForMouseEvent(view, el);
			}
			);
		}
	};

	private showPopoverForMouseEvent(view: MarkdownView, el: Element) {
		this.showPopoverInternal(view, el, el.firstChild?.textContent ?? "");
	}

	private popoverOnLoad = () => {
		this.popoverShown = true;
	}

	private popoverOnUnload = () => {
		this.popoverShown = false;
	}

	private showPopoverInternal(view: MarkdownView, el: Element, text: string) {
		if (this.popoverShown) {
			return;
		}
		// @ts-ignore
		const popover = new HoverPopover(view, el, null);
		popover.onload = this.popoverOnLoad;
		popover.onunload = this.popoverOnUnload;
		popover.hoverEl.innerHTML = constantsAndUtils.getPopoverLayout(text);
	}

	private saveMousePosition = (event: MouseEvent) => {
		this.cursorClientX = event.clientX;
		this.cursorClientY = event.clientY;
	}

	private hidePopoverEventListener = (event: MouseEvent) => {
		if (!this.settings.showCommentWhenCtrlKeyPressed) {
			return;
		}
		if (event.ctrlKey || event.metaKey) {
			this.withActiveView(view => {
				view.hoverPopover = null;
			}
			);
		}
	};

	private onKeyDown = (event: KeyboardEvent) => {
		if (this.settings.showCommentWhenCtrlKeyPressed && event.key == "Control") {
			const hoveredEls = document.querySelectorAll(":hover");
			const hoveredElement: Element | null = hoveredEls[hoveredEls.length - 1];
			const commentsEls = document.querySelectorAll('.ob-html-comment');
			commentsEls.forEach(it => {
				it.addEventListener('mouseover', this.showPopoverEventListener);
				it.addEventListener('mousemove', this.showPopoverEventListener);
				it.addEventListener('mouseleave', this.hidePopoverEventListener);
				if (hoveredElement && it.id == hoveredElement.id) {
					setTimeout(() => {
						let mouseMoveEvent = new MouseEvent("mousemove", {
							bubbles: true,
							cancelable: true,
							ctrlKey: true,
							metaKey: true,
							clientX: this.cursorClientX,
							clientY: this.cursorClientY,
							view: window
						});
						hoveredElement.dispatchEvent(mouseMoveEvent);
					}, 50);
				}
			});
		}
	}

	private onKeyUp = (event: KeyboardEvent) => {
		if (this.settings.showCommentWhenCtrlKeyPressed && event.key == "Control") {

			const commentsEls = document.querySelectorAll('.ob-html-comment');
			commentsEls.forEach(it => {
				it.removeEventListener('mouseover', this.showPopoverEventListener);
				it.removeEventListener('mousemove', this.showPopoverEventListener);
				it.removeEventListener('mouseleave', this.hidePopoverEventListener);
			});
		}
	}

	applySettingsStylesAndEvents() {
		const stylesSettings = this.settings;
		let hoverEffectStyle = "";
		if (stylesSettings.showCommentWhenCtrlKeyPressed) {
		} else {
			hoverEffectStyle = `.view-content .ob-html-comment:hover>.ob-html-comment-body {
				display: inline;
				position: relative;
			}`;
		}
		let styleEl = document.getElementById(constantsAndUtils.customColorStyleElementId);
		if (styleEl) {
			document.head.removeChild(styleEl);
		}
		styleEl = document.createElement('style');
		styleEl.id = constantsAndUtils.customColorStyleElementId;
		styleEl.textContent = `
				${hoverEffectStyle}
                .view-content .ob-html-comment {
                    background-color: ${stylesSettings.commentedTextColorDark};
                }

                .view-content .ob-html-comment:hover>.ob-html-comment-body {
                    background-color: ${stylesSettings.commentColorDark};
                }

                .theme-light .view-content .ob-html-comment {
                    background-color: ${stylesSettings.commentedTextColorLight};
                }

                .theme-light .view-content .ob-html-comment:hover>.ob-html-comment-body {
                    background-color: ${stylesSettings.commentColorLight};
    }`;
		document.head.appendChild(styleEl);
	}

	async parseActiveViewToCommentsAndClearExpandedItems() {
		await this.parseActiveViewToComments(true);
	}

	private async parseActiveViewToComments(clearExpandedItems: boolean) {
		const file = this.getActiveFile();
		if (!file) {
			return;
		}
		const text = await this.app.vault.cachedRead(file);
		const parsedText = new TextToTreeDataParser(text, this.settings.parseNativeComments);
		viewState.viewTreeOptions.value.length = 0;
		viewState.viewTreeOptions.value.push(...parsedText.parsedComments.treeOptions);
	}

	private async extractOriginalNote() {
		const file = this.getActiveFile();
		if (!file) {
			new ErrorModal(this.app, 'There is no comments in current file or file not selected!').open();
			return;
		}
		const fileName = file.name;
		const parentFolderPath = file.parent?.path;
		let parentPath = '';
		if (parentFolderPath == null || parentFolderPath == "/") {
			parentPath = ''
		} else {
			parentPath = parentFolderPath + '/';
		}
		if (!fileName.endsWith(".md")) {
			new ErrorModal(this.app, "Current file should end with '.md'!").open();
			return;
		}
		const fileNameWithoutExtension = fileName.substring(0, fileName.length - 3)
		let extractedNoteName = `${fileNameWithoutExtension} Original.md`;
		let extractedOriginalNotePath = `${parentPath}${extractedNoteName}`;

		let extractedNoteCommentsName = `${fileNameWithoutExtension} Comments.md`;
		let extractedCommentsNotePath = `${parentPath}${extractedNoteCommentsName}`;

		const noteText = await this.app.vault.cachedRead(file);
		const parsedText = new TextToTreeDataParser(noteText, this.settings.parseNativeComments);
		const commentsFileContent = constantsAndUtils.convertParsedCommentsToCommentsNote(parsedText.parsedComments);
		const originalFileContent = constantsAndUtils.convertNoteWithCommentsToOriginalNote(noteText, extractedNoteCommentsName);

		const commentsFile = this.app.vault.getAbstractFileByPath(extractedCommentsNotePath);
		if (commentsFile) {
			this.app.vault.trash(commentsFile, true);
		}
		await this.app.vault.create(extractedCommentsNotePath, commentsFileContent);

		const originalFile = this.app.vault.getAbstractFileByPath(extractedOriginalNotePath);
		if (originalFile) {
			this.app.vault.trash(originalFile, true);
		}
		await this.app.vault.create(extractedOriginalNotePath, originalFileContent);
	}
}

