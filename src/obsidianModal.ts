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
