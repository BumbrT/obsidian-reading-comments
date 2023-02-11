import { Modal, App } from "obsidian";

export class ToggleSelectionErrorModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Please put full comment with all tags into editor selection!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
