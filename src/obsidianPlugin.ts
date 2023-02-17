import { App, Editor, MarkdownView, MarkdownFileInfo, Modal, Notice, Plugin } from 'obsidian';
import { v4 as uuidv4 } from 'uuid';
import { HtmlCommentsSettings, HtmlCommentsSettingTab, DEFAULT_SETTINGS } from "./obsidianSettings";
import { viewState } from "./reactiveState";
import { HtmlCommentsView, VIEW_TYPE } from './obsidianView';
import { TextToTreeDataParser } from "./comments/TextToTreeDataParser";
import { constantsAndUtils, AbstractTreeOption } from './comments/ConstantsAndUtils';
import { EventsAggregator } from './internalUtils';
import { ErrorModal, ToggleSelectionErrorModal } from './obsidianModal';
import { TreeOption } from 'naive-ui';

export class HtmlCommentsPlugin extends Plugin {
	settings: HtmlCommentsSettings;
	currentNote: MarkdownView;

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
		viewState.toggleColorSettingsChanged();
	}

	initState() {
		viewState.settings.dark = document.body.hasClass("theme-dark");
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			this.currentNote = view
		}
	}

	registerCommands() {
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'add-reading-comment',
			name: 'Add reading comment for selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				const replacement = constantsAndUtils.selectionToComment(this.settings.container, selection);
				if (replacement) {
					editor.replaceSelection(replacement);
				} else {
					new ErrorModal(this.app, 'Multiline comments not supported yet!').open();
				}
			}
		});

		this.addCommand({
			id: 'add-inline-reading-comment',
			name: 'Add inline reading comment for selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				const replacement = constantsAndUtils.selectionToComment("span", selection);
				if (replacement) {
					editor.replaceSelection(replacement);
				} else {
					new ErrorModal(this.app, 'Multiline comments not supported yet!').open();
				}
			}
		});

		this.addCommand({
			id: 'add-block-reading-comment',
			name: 'Add block reading comment for selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				const replacement = constantsAndUtils.selectionToComment("div", selection);
				if (replacement) {
					editor.replaceSelection(replacement);
				} else {
					new ErrorModal(this.app, 'Multiline comments not supported yet!').open();
				}
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
			let view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				this.currentNote = view;
				this.parseActiveViewToCommentsAndClearExpandedItems();
			}
		}));
		const editorEventsAggregator = new EventsAggregator(2000, () => {
			this.parseActiveViewToComments(false);
		});
		this.registerEvent(this.app.workspace.on('editor-change', async (editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
			if (!this.settings.liveReloadOnEdit) {
				return;
			}
			let view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				this.currentNote = view;
				editorEventsAggregator.triggerEvent();
			}
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

	getActiveView(): MarkdownView {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			return this.currentNote;
		}
		return activeView;
	}

	parseActiveViewToCommentsAndClearExpandedItems() {
		this.parseActiveViewToComments(true);
	}

	private parseActiveViewToComments(clearExpandedItems: boolean) {
		const text = this.getActiveView().getViewData();
		const parsedText = new TextToTreeDataParser(text);
		viewState.viewTreeOptions.value = parsedText.parsedComments.treeOptions;
		if (!clearExpandedItems) {
			return;
		}
		if (this.settings.autoExpand) {
			const expandedKeys = parsedText.parsedComments.treeOptions.map(it => it.key) as string[];
			viewState.viewExpandedKeys.value = expandedKeys;
		} else {
			viewState.viewExpandedKeys.value = [];
		}
	}

	private async extractOriginalNote() {
		if (this.currentNote == null) {
			new ErrorModal(this.app, 'There is no comments in current file or file not selected!').open();
			return;
		}
		const fileName = this.currentNote.file.name;
		const parentPath = this.currentNote.file.parent.path;
		if (!fileName.endsWith(".md")) {
			new ErrorModal(this.app, "Current file should end with '.md'!").open();
			return;
		}
		const fileNameWithoutExtension = fileName.substring(0, fileName.length - 3)
		let extractedNoteName = `${fileNameWithoutExtension} Original.md`;
		let extractedOriginalNotePath = `${parentPath == "/" ? '' : parentPath + '/'}${extractedNoteName}`;

		let extractedNoteCommentsName = `${fileNameWithoutExtension} Comments.md`;
		let extractedCommentsNotePath = `${parentPath == "/" ? '' : parentPath + '/'}${extractedNoteCommentsName}`;

		const noteText = this.currentNote.getViewData();
		const parsedText = new TextToTreeDataParser(noteText);
		const commentsFileContent = constantsAndUtils.convertParsetCommentsToCommentsNote(parsedText.parsedComments);
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

