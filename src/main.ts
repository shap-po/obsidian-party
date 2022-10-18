import { Plugin } from "obsidian";
import party from "party-js";
import { EffectConfiguration, RANGE_CONFIGS } from "./effectConfig";
import {
	ObsidianPartySettings,
	ObsidianPartySettingsTab,
	DEFAULT_SETTINGS,
	SettingsOfType,
	Effect,
} from "./settings";

declare module "obsidian" {
	interface App {
		plugins: {
			enabledPlugins: Set<string>;
		};
	}
}
// allow registering party as a global
declare global {
	interface Window {
		party?: typeof party;
	}
}

export default class ObsidianParty extends Plugin {
	settings: ObsidianPartySettings = DEFAULT_SETTINGS;
	observer?: MutationObserver;
	configs: Partial<{
		[P in keyof ObsidianPartySettings]: ObsidianPartySettings[P] extends EffectConfiguration
			? party.ConfettiConfiguration & party.SparkleConfiguration
			: never;
	}> = {};

	async onload() {
		await this.loadSettings();

		// register party
		window.party = party;

		this.registerDomEvent(window, "click", (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target && target.instanceOf(HTMLElement)) {
				let t;
				if (document.body.contains(target)) {
					t = party.Rect.fromElement(target);
				} else {
					t = evt;
				}
				if (target.hasClass("confetti")) party.confetti(t);
				if (target.hasClass("sparkles")) party.sparkles(t);
			}
		});
		this.setupShapes();
		this.setupObserver();
		this.addSettingTab(new ObsidianPartySettingsTab(this.app, this));
	}
	onunload() {
		// unregister party
		delete window.party;
		this.observer?.disconnect();
		delete this.observer;
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.setupObserver(); // update observer
		this.configs = {}; // reset configs
	}
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		// convert settings from v1.0.0 to v2.0.0
		const taskEffect = (this.settings as unknown as { taskEffect: Effect })
			.taskEffect;
		if (taskEffect !== undefined) {
			this.settings.taskEffectConfig.effect = taskEffect;
			this.settings.dataviewEffectConfig.effect = taskEffect;
			this.settings.checkboxEffectConfig.effect = taskEffect;
			delete (this.settings as unknown as { taskEffect?: Effect })
				.taskEffect;
		}
	}

	setupShapes() {
		// replace default shapes with svg shapes, so they can be displayed in the settings
		party.resolvableShapes[
			"square"
		] = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><path d="M0 0h10v10H0z" fill="currentColor"/></svg>`;
		party.resolvableShapes[
			"rectangle"
		] = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><path d="M0 2h10v6H0V2Z" fill="currentColor"/></svg>`;
		// remove rounded shapes
		delete party.resolvableShapes["roundedSquare"];
		delete party.resolvableShapes["roundedRectangle"];
		// add custom shapes
		party.resolvableShapes[
			"snowflake"
		] = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path d="M14 6.523h-2.555l.985-.984-.676-.676-1.66 1.66h-2.27l1.137-1.96 2.27-.61-.247-.922-1.351.36 1.281-2.215-.828-.473-1.277 2.211-.36-1.348-.926.246.61 2.266L7 6.047 5.867 4.078l.61-2.266-.926-.246-.36 1.348L3.914.704l-.828.472L4.367 3.39l-1.351-.36-.246.922 2.27.61 1.136 1.96h-2.27l-1.66-1.66-.676.676.985.984H0v.954h2.555l-.985.984.676.676 1.66-1.66h2.27l-1.137 1.96-2.27.61.247.922 1.351-.36-1.281 2.215.828.473 1.277-2.211.36 1.348.926-.246-.61-2.266L7 7.953l1.133 1.969-.61 2.265.926.247.36-1.348 1.277 2.21.828-.472-1.281-2.215 1.351.36.246-.922-2.27-.61-1.136-1.96h2.27l1.66 1.66.676-.676-.985-.984H14Zm0 0" fill="currentColor"/></svg>`;
		party.resolvableShapes[
			"diamond"
		] = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><path d="m5.89 0-5 6 5 6 5-6-5-6Z" fill="currentColor"/></svg>`;
		party.resolvableShapes[
			"triangle"
		] = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path fill="currentColor" d="m7 1 6.062 10.5H.938L7 1Z"/></svg>`;
	}

	setupObserver() {
		// observer will only be active if at least one effect is enabled
		if (
			this.settings.taskEffectConfig.effect === "none" &&
			this.settings.dataviewEffectConfig.effect === "none" &&
			this.settings.checkboxEffectConfig.effect === "none"
		) {
			this.observer?.disconnect();
			delete this.observer;
			return;
		}
		if (this.observer) return;
		// obsidian-tasks plugin blocks onclick events on checkboxes, so we need to add them manually for each checkbox
		this.observer = new MutationObserver((mutations: MutationRecord[]) => {
			// add onclick event to each checkbox
			document
				.querySelectorAll(
					".view-content input[type=checkbox]:not(.party-patched)"
				)
				.forEach((checkbox: HTMLInputElement) => {
					checkbox.addEventListener("click", (evt: MouseEvent) => {
						if (checkbox.checked) {
							// check the setting on click, because .has-list-bullet class might not be set yet
							const setting =
								checkbox.closest(".plugin-tasks-list-item") &&
								!checkbox.closest(".has-list-bullet")
									? "taskEffectConfig"
									: checkbox.closest(".dataview")
									? "dataviewEffectConfig"
									: "checkboxEffectConfig";
							this.triggerEffect(evt, setting);
						}
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

	/** @deprecated Since v2.0.0. Use `triggerEffect` instead */
	public taskEffect(evt: MouseEvent) {
		this.triggerEffect(evt, "taskEffectConfig");
	}

	// Exposed as public to allow calling from other plugins
	public triggerEffect(
		evt: MouseEvent,
		optionName: SettingsOfType<EffectConfiguration>
	) {
		if (this.settings[optionName].effect === "none") return;
		const effectConfig = this.getConfig(optionName);

		// get target element
		let target: party.sources.DynamicSourceType;
		let checkbox: HTMLElement | undefined = evt.target as HTMLElement;
		if (!checkbox?.instanceOf(HTMLElement)) checkbox = undefined;
		switch (this.settings[optionName].target) {
			case "element": {
				if (checkbox && document.body.contains(checkbox)) {
					// convert element to Rect, so if element is deleted, the effect will still be visible in the right place
					target = party.Rect.fromElement(checkbox);
				} else target = evt;
				break;
			}
			case "line": {
				const line =
					checkbox?.closest(".cm-line") || checkbox?.closest("li");
				if (
					line &&
					line?.instanceOf(HTMLElement) &&
					document.body.contains(line)
				) {
					target = party.Rect.fromElement(line);
				} else target = evt;
				break;
			}
			case "note": {
				const note = checkbox?.closest(".view-content");
				if (note && note?.instanceOf(HTMLElement)) {
					target = party.Rect.fromElement(note);
				} else target = evt;
				break;
			}
			case "app":
				target = document.body;
				break;
			default:
				target = evt;
		}

		// create effect
		switch (this.settings[optionName].effect) {
			case "confetti":
				party.confetti(target, effectConfig);
				return;
			case "sparkles":
				party.sparkles(target, effectConfig);
				return;
		}
	}

	convertConfig(config: EffectConfiguration) {
		const cfg = {} as unknown as party.ConfettiConfiguration &
			party.SparkleConfiguration;
		RANGE_CONFIGS.forEach((key) => {
			if (config[key][0] && config[key][1])
				cfg[key] = party.variation.range(
					config[key][0] as number,
					config[key][1] as number
				);
			else if (config[key].find((value) => value))
				cfg[key] = config[key].find((value) => value) as number;
		});
		if (config.shapes.length)
			cfg.shapes = config.shapes.filter((s) =>
				Object.keys(party.resolvableShapes).includes(s)
			);
		if (config.colors.length)
			cfg.color = config.colors.map((color) =>
				party.Color.fromHex(color)
			);

		return cfg;
	}
	getConfig(optionName: SettingsOfType<EffectConfiguration>) {
		if (this.configs[optionName] === undefined) {
			this.configs[optionName] = this.convertConfig(
				this.settings[optionName]
			);
		}
		return this.configs[optionName];
	}
}
