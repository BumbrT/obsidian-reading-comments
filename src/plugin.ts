import { App, Editor, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import { v4 as uuidv4 } from 'uuid';
import { HtmlCommentsSettings, HtmlCommentsSettingTab, DEFAULT_SETTINGS } from "./settings";
import { state } from "./state";

export class HtmlComments extends Plugin {
	settings: HtmlCommentsSettings;
	current_note: MarkdownView;
	current_file: string;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a HFF notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'add-html-comment',
			name: 'Add html comment for selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				const commentId = uuidv4();
				editor.replaceSelection(`<span class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>${selection}</span>`);
			}
		});


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new HtmlCommentsSettingTab(this.app, this));

		this.initState();
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	initState() {
		state.headers = [];
		state.dark = document.body.hasClass("theme-dark");
		state.autoExpand = this.settings.autoExpand;
		state.leafChange = false;
	}
}

