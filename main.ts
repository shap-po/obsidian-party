import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import party from "party-js";

type Effect = "none" | "confetti" | "sparkles";
interface ObsidianPartySettings {
	taskEffect: Effect;
}

class ObsidianPartySettingsTab extends PluginSettingTab {
	plugin: ObsidianParty;

	constructor(app: App, plugin: ObsidianParty) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", {
			text: "Settings for Obsidian party plugin",
		});

		new Setting(this.containerEl)
			.setName("Task effect")
			.setDesc("Effect that will be viewed when checking off a task")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						none: "None",
						confetti: "Confetti",
						sparkles: "Sparkles",
					})
					.setValue(this.plugin.settings.taskEffect)
					.onChange((newValue) => {
						this.plugin.settings.taskEffect = newValue as Effect;
						this.plugin.saveSettings();
					})
			);
	}
}

const DEFAULT_SETTINGS: ObsidianPartySettings = { taskEffect: "none" };

export default class ObsidianParty extends Plugin {
	settings: ObsidianPartySettings = DEFAULT_SETTINGS;
	observer: MutationObserver;

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.setupObserver(); // update observer
	}

	async onload() {
		// load setting values
		await this.loadSettings();

		// register settings tab
		this.addSettingTab(new ObsidianPartySettingsTab(this.app, this));

		// register party
		window.party = party;

		// register mouse click event
		this.registerDomEvent(window, "click", (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target.instanceOf(HTMLElement)) {
				if (target.hasClass("confetti")) party.confetti(evt);
				if (target.hasClass("sparkles")) party.sparkles(evt);
			}
		});
		this.setupObserver();
	}

	setupObserver() {
		// observer will only be active if taskEffect is not "none"
		if (this.settings.taskEffect === "none") {
			if (this.observer) this.observer.disconnect();
			return;
		} else if (this.observer) return;
		// obsidian-tasks plugin blocks onclick events on checkboxes, so we need to add them manually for each checkbox
		this.observer = new MutationObserver((mutations: MutationRecord[]) => {
			// add onclick event to each checkbox
			document
				.querySelectorAll(
					".view-content input[type=checkbox]:not(.party-patched)"
				)
				.forEach((checkbox: HTMLInputElement) => {
					checkbox.addEventListener("click", (evt: MouseEvent) => {
						if (checkbox.checked) this.taskEffect(evt);
					});
					checkbox.classList.add("party-patched");
				});
		});
		// observe any changes to document structure
		this.observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	// Exposed as public to allow calling from other plugins
	public taskEffect(target: party.sources.DynamicSourceType) {
		switch (this.settings.taskEffect) {
			case "confetti":
				party.confetti(target);
				return;
			case "sparkles":
				party.sparkles(target);
				return;
		}
	}

	onunload() {
		// unregister party
		delete window.party;
		if (this.observer) this.observer.disconnect();
	}
}
