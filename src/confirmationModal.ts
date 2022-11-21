import { App, Modal, Setting } from "obsidian";

export default class ConfirmationModal extends Modal {
	constructor(app: App, title: string, confirmCallback: () => void) {
		super(app);
		this.titleEl.setText(title);
		this.contentEl.setText("This action cannot be undone.");
		new Setting(this.contentEl)
			.addButton((button) =>
				button.setButtonText("Cancel").onClick(() => {
					this.close();
				})
			)
			.addButton((button) =>
				button.setButtonText("Confirm").onClick(() => {
					confirmCallback();
					this.close();
				})
			);
		this.open();
	}
}
