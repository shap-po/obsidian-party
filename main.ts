import {App, Plugin, PluginSettingTab, Setting} from "obsidian";
import party from "party-js";

type Effect = "none" | "confetti" | "sparkles"
interface ObsidianPartySettings {
	taskEffect: Effect
}

class ObsidianPartySettingsTab extends PluginSettingTab {
	plugin: ObsidianParty;

	constructor(app: App, plugin: ObsidianParty) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl("h2", {text: "Settings for Obsidian party plugin"});

		new Setting(this.containerEl)
			.setName("Task effect")
			.setDesc("Effect that will be viewed when clicking on a task")
			.addDropdown(dropdown => dropdown
				.addOptions({none: "None", confetti: "Confetti", sparkles: "Sparkles"})
				.setValue(this.plugin.settings.taskEffect)
				.onChange(newValue => {
					this.plugin.settings.taskEffect = newValue as Effect;
					this.plugin.saveSettings();
				})

			);
	}
}

const DEFAULT_SETTINGS: ObsidianPartySettings = {taskEffect: "none"}

export default class ObsidianParty extends Plugin {
	settings: ObsidianPartySettings = DEFAULT_SETTINGS

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}

	async onload() {
		// load setting values
		await this.loadSettings()

		// register settings tab
		this.addSettingTab(new ObsidianPartySettingsTab(this.app, this))

		// register party
		window.party = party;

		// register mouse click event
		this.registerDomEvent(window, "click", (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target.instanceOf(HTMLElement)) {
				if (target.hasClass("task-list-item-checkbox")) this.taskEffect(target);
				if (target.hasClass("confetti")) party.confetti(target);
				if (target.hasClass("sparkles")) party.sparkles(target);
			}
		});
	}

	// Exposed as public to allow calling from other plugins
	public taskEffect(target: HTMLElement) {
		switch (this.settings.taskEffect) {
			case "confetti":
				party.confetti(target);
				return
			case "sparkles":
				party.sparkles(target)
				return;
		}
	}

	onunload() {
		// unregister party
		delete window.party;
	}
}
