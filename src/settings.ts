import { App, PluginSettingTab, Setting } from "obsidian";
import ObsidianParty from "./main";
import { EffectConfiguration, EffectConfigurationModal } from "./effectConfig";
import { CustomShapesModal } from "./customShapes";
import { capitalize } from "./utils";

import "./styles/settings.css";

export const EFFECTS = ["none", "confetti", "sparkles"];
export const EFFECT_CONFIGS = [
	"checkbox",
	"task",
	"dataview",
	"kanban",
] as const;
export type EffectConfig = typeof EFFECT_CONFIGS[number];

export type Effect = typeof EFFECTS[number];

export interface ObsidianPartySettings {
	effectConfigs: {
		[T in EffectConfig]: EffectConfiguration;
	};

	customShapes: { [key: string]: string };
}
export const DEFAULT_CONFIGURATION: EffectConfiguration = {
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
	effectConfigs: Object.fromEntries(
		EFFECT_CONFIGS.map((effectConfig) => [
			effectConfig,
			structuredClone(DEFAULT_CONFIGURATION),
		])
	) as { [T in EffectConfig]: EffectConfiguration },

	customShapes: {},
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

		this.addEffectSetting(
			"checkbox",
			"Checkbox effect",
			"The effect that will be displayed when checkbox is marked as completed (regular markdown checkbox)"
		);
		if (app.plugins.enabledPlugins.has("obsidian-tasks-plugin")) {
			this.addEffectSetting(
				"task",
				"Task effect",
				"The effect that will be displayed when marking the task as completed (obsidian-tasks-plugin)"
			);
		}
		if (app.plugins.enabledPlugins.has("dataview")) {
			this.addEffectSetting(
				"dataview",
				"Dataview effect",
				"The effect that will be displayed when marking the task as completed (dataview plugin)"
			);
		}
		if (app.plugins.enabledPlugins.has("obsidian-kanban")) {
			this.addEffectSetting(
				"kanban",
				"Kanban effect",
				"The effect that will be displayed when marking the card as completed (obsidian-kanban plugin)"
			);
		}

		const shapesModal = new CustomShapesModal(this.plugin);
		new Setting(containerEl)
			.setName("Custom shapes")
			.setDesc(
				"Custom shapes that can be used in the effect configuration."
			)
			.addExtraButton((button) =>
				button
					.setIcon("gear")
					.setTooltip("Edit custom shapes")
					.onClick(() => {
						shapesModal.open();
					})
			);

		containerEl.createEl("h2", {
			text: "Donate to the developer 💝",
		});
		containerEl.createDiv({ cls: "obsidian-party-donate" }, (el) => {
			el.createEl("button", undefined, (el) => {
				el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.554 9.488c.121.563.106 1.246-.04 2.051-.582 2.978-2.477 4.466-5.683 4.466h-.442a.666.666 0 0 0-.444.166.72.72 0 0 0-.239.427l-.041.189-.553 3.479-.021.151a.706.706 0 0 1-.247.426.666.666 0 0 1-.447.166H8.874a.395.395 0 0 1-.331-.15.457.457 0 0 1-.09-.363c.061-.373.148-.938.267-1.689.117-.75.206-1.314.267-1.689s.15-.938.272-1.685c.121-.748.212-1.31.271-1.685.033-.248.179-.371.433-.371h1.316c.893.013 1.682-.057 2.375-.211 1.172-.262 2.134-.744 2.886-1.449.685-.637 1.203-1.462 1.56-2.473.162-.47.277-.917.352-1.338.006-.041.014-.066.025-.074.008-.011.022-.014.035-.011a.378.378 0 0 1 .062.035c.524.398.854.941.98 1.632zm-1.728-2.836c0 .717-.154 1.508-.465 2.374-.537 1.562-1.547 2.618-3.037 3.168-.758.269-1.602.408-2.535.425 0 .006-.301.007-.904.007l-.903-.007c-.672 0-1.067.32-1.187.964-.013.053-.298 1.83-.855 5.329-.008.066-.048.102-.121.102H4.854a.473.473 0 0 1-.369-.165.469.469 0 0 1-.115-.39L6.702 3.664a.784.784 0 0 1 .276-.483.785.785 0 0 1 .519-.19h6.014c.228 0 .555.044.979.131.428.084.801.194 1.123.321.718.274 1.266.688 1.645 1.237.379.552.568 1.207.568 1.972z"></path></svg><span>PayPal</span>`;
				el.addEventListener("click", () => {
					this.plugin.party.sparkles(el, {
						shapes: ["heart"],
						color: ["#E31313", "#1040C1", "#E22EFF", "#0FFF00"].map(
							(color) => this.plugin.party.Color.fromHex(color)
						),
					});
					setTimeout(() => {
						window.open(
							"https://www.paypal.com/donate/?hosted_button_id=89AG7T2HQA8K6",
							"_blank"
						);
					}, 500);
				});
			});
			el.createEl("button", undefined, (el) => {
				el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m18.5 5-1.224-2.447A1 1 0 0 0 16.382 2H7.618a1 1 0 0 0-.894.553L5.5 5H3v2h18V5h-2.5zM6.734 21.142c.071.492.493.858.991.858h8.551a1 1 0 0 0 .99-.858L19 9H5l1.734 12.142zM16 12l-.714 5H8.714L8 12h8z"></path></svg><span>Buy me a coffee</span>`;
				el.addEventListener("click", () => {
					this.plugin.party.sparkles(el, {
						shapes: ["heart"],
						color: ["#E31313", "#ff6937", "#E22EFF", "#0FFF00"].map(
							(color) => this.plugin.party.Color.fromHex(color)
						),
					});
					setTimeout(() => {
						window.open(
							"https://www.buymeacoffee.com/shap",
							"_blank"
						);
					}, 500);
				});
			});
		});
	}
	addEffectSetting(
		optionName: EffectConfig,
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
					.setValue(
						this.plugin.settings.effectConfigs[optionName].effect
					)
					.onChange((value) => {
						this.plugin.settings.effectConfigs[optionName].effect =
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
