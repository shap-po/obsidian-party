import { App, PluginSettingTab, Setting } from "obsidian";
import ObsidianParty from "./main";
import { EffectConfiguration, EffectConfigurationModal } from "./effectConfig";
import { capitalize } from "./utils";

export const EFFECTS = ["none", "confetti", "sparkles"];

export type Effect = typeof EFFECTS[number];

export interface ObsidianPartySettings {
	taskEffectConfig: EffectConfiguration;
	dataviewEffectConfig: EffectConfiguration;
	checkboxEffectConfig: EffectConfiguration;
}
const DEFAULT_CONFIGURATION: EffectConfiguration = {
	effect: "confetti",
	target: "element",

	count: [],
	speed: [],
	size: [],

	spread: [],
	lifetime: [],

	colors: [],
	shapes: [],
};
export const DEFAULT_SETTINGS: ObsidianPartySettings = {
	taskEffectConfig: structuredClone(DEFAULT_CONFIGURATION),
	dataviewEffectConfig: structuredClone(DEFAULT_CONFIGURATION),
	checkboxEffectConfig: structuredClone(DEFAULT_CONFIGURATION),
};

export type SettingsOfType<T> = {
	[Property in keyof ObsidianPartySettings]: ObsidianPartySettings[Property] extends T
		? Property
		: never;
}[keyof ObsidianPartySettings];

export class ObsidianPartySettingsTab extends PluginSettingTab {
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

		if (app.plugins.enabledPlugins.has("obsidian-tasks-plugin")) {
			this.addEffectSetting(
				"taskEffectConfig",
				"Task effect",
				"The effect that will be displayed when marking the task as completed (obsidian-tasks-plugin)"
			);
		}
		if (app.plugins.enabledPlugins.has("dataview")) {
			this.addEffectSetting(
				"dataviewEffectConfig",
				"Dataview effect",
				"The effect that will be displayed when marking the task as completed (dataview plugin)"
			);
		}
		this.addEffectSetting(
			"checkboxEffectConfig",
			"Checkbox effect",
			"The effect that will be displayed when checkbox is marked as completed (regular markdown checkbox)"
		);
	}
	addEffectSetting(
		optionName: SettingsOfType<EffectConfiguration>,
		name: string,
		desc: string | (string | Node)[] | DocumentFragment
	) {
		if (Array.isArray(desc)) {
			const d = new DocumentFragment();
			d.append(...desc);
			desc = d;
		}
		const configModal = new EffectConfigurationModal(
			this.plugin,
			optionName,
			this
		);
		return new Setting(this.containerEl)
			.setName(name)
			.setDesc(desc)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(
						Object.fromEntries(
							EFFECTS.map((effect) => [
								effect,
								capitalize(effect),
							])
						)
					)
					.setValue(this.plugin.settings[optionName].effect)
					.onChange((value) => {
						this.plugin.settings[optionName].effect =
							value as Effect;
						this.plugin.saveSettings();
					})
			)
			.addExtraButton((button) =>
				button
					.setIcon("gear")
					.setTooltip("Effect configuration")
					.onClick(() => {
						configModal.open();
					})
			);
	}
}
