import { Modal, App } from "obsidian";

export class ToggleSelectionErrorModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Please select full comment with all tags in editor!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

export class ExtractNoteErrorModal extends Modal {
	constructor(app: App, private readonly text?: string) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		if (this.text) {
			contentEl.setText(this.text);
		} else {
			contentEl.setText('There is no comments in current file or file not selected!');
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
