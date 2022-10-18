import Pickr from "@simonwep/pickr";
import "@simonwep/pickr/dist/themes/nano.min.css"; // 'nano' theme
import { Modal, Setting } from "obsidian";
import party from "party-js";
import ObsidianParty from "./main";
import {
	Effect,
	EFFECTS,
	ObsidianPartySettingsTab,
	SettingsOfType,
} from "./settings";
import { capitalize } from "./utils";
import "./effectConfig.css";

export type Range = [(number | null)?, (number | null)?];

const TARGETS = ["mouse", "element", "line", "note", "app"];

export interface EffectConfiguration {
	effect: Effect;
	target: typeof TARGETS[number];

	count: Range;
	speed: Range;
	size: Range;
	// TODO: rotation;

	spread: Range;
	lifetime: Range;

	colors: string[];
	shapes: Array<string>;
	//TODO: custom shapes
}

export const RANGE_DEFAULTS: {
	[T in Effect]: {
		[Key in keyof EffectConfiguration]?: EffectConfiguration[Key];
	};
} = {
	confetti: {
		count: [20, 40],
		speed: [300, 600],
		size: [0.8, 1.2],
		spread: [35, 45],
	},
	sparkles: {
		count: [10, 20],
		speed: [100, 200],
		size: [0.8, 1.8],
		lifetime: [1, 2],
	},
	none: {},
};

export const RANGE_CONFIGS = [
	"count",
	"speed",
	"size",
	"spread",
	"lifetime",
] as const;

export class EffectConfigurationModal extends Modal {
	plugin: ObsidianParty;
	option: EffectConfiguration;
	settingsTab: ObsidianPartySettingsTab;
	constructor(
		plugin: ObsidianParty,
		optionName: SettingsOfType<EffectConfiguration>,
		settingsTab: ObsidianPartySettingsTab
	) {
		super(plugin.app);
		this.plugin = plugin;
		this.option = this.plugin.settings[optionName];
		this.settingsTab = settingsTab;
	}
	onOpen() {
		this.display();
	}

	display() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", {
			text: "Effect configuration",
		});

		contentEl.createEl("p", {
			text: "All settings here are optional. If you leave a setting blank, it will use the default value.",
		});
		contentEl.createEl("p", {
			text: "If you set only one of the min or max values, then it will be used as fixed value instead of random in range.",
		});
		new Setting(contentEl)
			.setName("Type")
			.setDesc("The type of effect to use.")
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
					.setValue(this.option.effect)
					.onChange((value) => {
						this.option.effect = value as Effect;
						this.plugin.saveSettings();
						this.display();
						this.settingsTab.display();
					})
			);

		new Setting(contentEl)
			.setName("Target")
			.setDesc("Where the effect should be emitted from.")
			.addDropdown((dropdown) => {
				dropdown.addOptions(
					Object.fromEntries(TARGETS.map((t) => [t, capitalize(t)]))
				);
				dropdown.setValue(this.option.target);
				dropdown.onChange((value: typeof TARGETS[number]) => {
					this.option.target = value;
					this.plugin.saveSettings();
				});
			});

		// add settings for all min/max values
		RANGE_CONFIGS.forEach((key) => {
			const s = new Setting(contentEl).setName(capitalize(key));
			[0, 1].forEach((i) => {
				s.addText((text) => {
					text.setPlaceholder(i ? "Max" : "Min")
						.setValue(this.option[key][i]?.toString() || "")
						.onChange((value: string) => {
							let val: number | undefined = value
								? Number(value)
								: undefined;
							if (val && isNaN(val)) val = undefined;

							this.option[key][i] = val;

							this.plugin.saveSettings();
						});
				});
			});

			if (this.option.effect !== "none") {
				if (RANGE_DEFAULTS[this.option.effect][key]) {
					s.setDesc(
						"Default: " +
							RANGE_DEFAULTS[this.option.effect][key]?.join(" - ")
					);
				} else {
					s.setDesc(
						`Option is not available for ${this.option.effect} effect.`
					);
				}
			}
		});

		contentEl.createEl("h3", {
			text: "Shapes",
		});
		contentEl.createEl("p", {
			text: "Click on shape to toggle it. If no shapes are selected, only default shapes will be used.",
		});

		const shapes = contentEl.createDiv({ cls: "party-shapes" });
		const enabledShapes = new Setting(shapes).setName("Enabled");
		const disabledShapes = new Setting(shapes).setName("Disabled");

		Object.entries(party.resolvableShapes).forEach(([shape, image]) => {
			(this.option.shapes.includes(shape)
				? enabledShapes
				: disabledShapes
			).addButton(
				(button) =>
					(button.onClick(() => {
						this.option.shapes.includes(shape)
							? this.option.shapes.remove(shape)
							: this.option.shapes.push(shape);

						this.plugin.saveSettings();
						this.display();
					}).buttonEl.innerHTML = image) // set svg image as button content
			);
		});
		// add invisible buttons, so when row is empty, it still has height
		[enabledShapes, disabledShapes].forEach((setting) =>
			setting.addButton((button) =>
				button.setDisabled(true).buttonEl.addClass("party-shape-empty")
			)
		);

		contentEl.createEl("h3", {
			text: "Colors",
		});
		const palette = contentEl.createDiv({ cls: "party-palette" });
		for (let i = 0; i < this.option.colors.length + 1; i++) {
			this.addPicker(palette, i);
		}
	}

	addPicker(container: HTMLDivElement, index: number) {
		const picker = Pickr.create({
			el: container.createDiv(),
			container: this.containerEl,
			theme: "nano",
			position: "left-middle",
			default: this.option.colors[index] || "#FFFFFF",
			components: {
				preview: true,
				hue: true,
				interaction: {
					hex: true,
					rgba: true,
					input: true,
					cancel: true,
					save: true,
					clear: true,
				},
			},
		})
			.on("save", (color: Pickr.HSVaColor, instance: Pickr) => {
				if (color) {
					this.option.colors[index] = color?.toHEXA().toString();
				}
				this.plugin.saveSettings();
				instance.hide();
				if (index == this.option.colors.length - 1) {
					this.display();
				}
			})

			.on("cancel", (instance: Pickr) => {
				instance.setColor(this.option.colors[index] || null, true);
				instance.hide();
			})
			.on("clear", (instance: Pickr) => {
				this.option.colors.splice(index, 1);
				this.plugin.saveSettings();
				this.display();
			});
		return picker;
	}
}
