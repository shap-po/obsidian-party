import { Plugin } from "obsidian";
import { EffectConfiguration, RANGE_CONFIGS } from "./effectConfig";
import {
	ObsidianPartySettings,
	ObsidianPartySettingsTab,
	DEFAULT_SETTINGS,
	DEFAULT_CONFIGURATION,
	EFFECT_CONFIGS,
	EffectConfig,
} from "./settings";

import "./styles/partyFixes.css";

//import "party-js" for typehints
import Party from "party-js";
import { isValidHTML } from "./utils";
// actual party import
const party: typeof Party = window.party || require("party-js");

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
		party?: typeof Party;
	}
}
type PartyConfiguration = Partial<
	Party.ConfettiConfiguration & Party.SparkleConfiguration
>;

export const DEFAULT_SHAPES = {
	square: `<div style="height: 10px; width: 10px;"></div>`,
	rectangle: `<div style="height: 6px; width: 10px;"></div>`,
	circle: `<svg viewBox="0 0 2 2" width="10" height="10"><circle cx="1" cy="1" r="1"/></svg>`,
	star: `<svg viewBox="0 0 512 512" width="15" height="15"><polygon points="512,197.816 325.961,185.585 255.898,9.569 185.835,185.585 0,197.816 142.534,318.842 95.762,502.431 255.898,401.21 416.035,502.431 369.263,318.842"/></svg>`,
	diamond: `<svg width="12" height="12"><path d="m5.89 0-5 6 5 6 5-6-5-6Z"/></svg>`,
	triangle: `<svg width="14" height="14"><path d="m7 1 6.062 10.5H.938L7 1Z"/></svg>`,
	heart: `<svg viewBox="0 0 512 512" height="14" width="14"><path d="M316.722,29.761c66.852,0,121.053,54.202,121.053,121.041c0,110.478-218.893,257.212-218.893,257.212S0,266.569,0,150.801 C0,67.584,54.202,29.761,121.041,29.761c40.262,0,75.827,19.745,97.841,49.976C240.899,49.506,276.47,29.761,316.722,29.761z"/></svg>`,
	snowflake: `<svg width="14" height="14"><path d="M14 6.523h-2.555l.985-.984-.676-.676-1.66 1.66h-2.27l1.137-1.96 2.27-.61-.247-.922-1.351.36 1.281-2.215-.828-.473-1.277 2.211-.36-1.348-.926.246.61 2.266L7 6.047 5.867 4.078l.61-2.266-.926-.246-.36 1.348L3.914.704l-.828.472L4.367 3.39l-1.351-.36-.246.922 2.27.61 1.136 1.96h-2.27l-1.66-1.66-.676.676.985.984H0v.954h2.555l-.985.984.676.676 1.66-1.66h2.27l-1.137 1.96-2.27.61.247.922 1.351-.36-1.281 2.215.828.473 1.277-2.211.36 1.348.926-.246-.61-2.266L7 7.953l1.133 1.969-.61 2.265.926.247.36-1.348 1.277 2.21.828-.472-1.281-2.215 1.351.36.246-.922-2.27-.61-1.136-1.96h2.27l1.66 1.66.676-.676-.985-.984H14Zm0 0"/></svg>`,

	frog: `<svg width="14" height="14" viewBox="0 0 1280 1217"><path d="M770.4 1c-8.4 1.7-25.6 7.1-30.7 9.6-18.6 9.4-27.4 20.2-39.9 49.2-3.2 7.4-7.2 15.2-9 17.5-8 10-14.1 16.3-21.1 21.5-4.1 3.2-14.5 12-23.2 19.7-22.8 20.3-32.4 26.8-49.1 33.1-16 6-43.6 9.2-89.9 10.4-42.8 1.1-47.8 1.5-58.5 5-49.9 16.3-106.1 52-154.3 97.9l-7.8 7.5-10-4.9c-5.4-2.7-9.9-5.2-9.9-5.5 0-.3 3.5-4.6 7.7-9.5 13.1-15.4 28.7-37 38.7-53.7 7.7-13 9.6-16.8 9.6-20 0-3.6-.2-3.8-2.5-3.2-1.5.4-3.9 0-6-1-2.9-1.4-4.2-1.5-7.7-.5-14.7 3.9-40.5 23-70.5 52.3-7.9 7.6-14.3 13.6-14.3 13.2 0-.3 3.7-4.9 8.1-10.2 4.5-5.4 13.2-16.5 19.5-24.8 6.4-8.6 13.2-16.6 15.9-18.6 9.5-7.2 10.7-8.4 12.9-12.9 1.3-2.5 3.3-9.1 4.5-14.6 1.2-5.5 2.9-12 3.8-14.4 2.2-5.9 1.1-7.6-5.3-7.8-2.7 0-6.3-.4-8-.8-2.3-.5-4.4 0-8.5 2-7.8 3.9-26.4 23.2-44.1 45.5-8 10.2-19.2 24.3-24.9 31.5-13.5 17.1-21.3 25.8-27.3 30.6-5.7 4.6-9.1 5-10.8 1.4-1.6-3.5 1.5-22.2 4.2-25 1-1.1 3.5-6.5 5.4-12 1.9-5.5 6.9-18.2 11-28.3 4.2-10 7.5-18.6 7.4-19-.1-.4.4-2.5 1.1-4.6 1.4-3.9 1.2-11.3-.5-32.8l-.7-7.7-7.2-.6c-8-.8-9.9-.2-15.3 4.9-10.1 9.3-19.2 31.4-30.2 72.8-11 41.3-13.8 49.8-19.5 58.9-1.3 2-7.9 9.9-14.5 17.5-20.6 23.5-33.8 41.2-62.8 84.4C17.4 382.8 4.4 420.6.9 457c-1.6 17.1-.1 45.9 3.3 63.8.9 5 1.5 6.2 2.9 6 1.1-.2 3.1 1.9 6 6.2 6 8.8 10.5 11.8 20.5 13.4 14 2.2 18.9 1 46-11.8 4.9-2.4 13.1-6.8 18.2-9.9 5.1-3.1 9.2-5.1 9.2-4.4 0 .7-3.4 18.5-7.5 39.6l-7.4 38.3 4.1 6.7c2.3 3.6 5.3 8.2 6.7 10.1l2.5 3.5-3.3-3c-5.1-4.6-3.4-1.6 5.6 9.8 10.5 13.2 47.1 49.2 62.8 61.8 13 10.5 50.9 38.1 67 48.9 38.4 25.7 90.5 49.3 113.5 51.5 4.9.4 13.7 2.7 25.5 6.5 19.2 6.3 33.8 10.6 47.5 14 4.7 1.1 9.2 2.3 9.9 2.6 2.3.8-7.3 4.9-28.2 12-49.2 16.8-84 31.5-106.2 44.7-33 19.7-43.2 27.4-53.2 40.3-2.7 3.5-5.7 5.3-21 12.4-12.4 5.7-19.9 8.6-24.8 9.5-11.8 2.1-18.6 6-22.1 12.7-1.4 2.8-1.7 12.4-.5 16.8.4 1.5.1 4.3-1 7-1.9 5.1-1.6 7 1.1 7 1.4 0 2.1 1 2.5 3.7.4 2.1 1.2 4.9 1.8 6.3 2.1 4.3 17.9 19.3 25.7 24.3 4.1 2.7 13.4 8.7 20.5 13.3 20.9 13.7 48.4 26.8 77 36.7 5.5 1.9 16.3 6.2 24 9.4 7.7 3.3 20.1 8.1 27.5 10.7 7.4 2.7 19.1 6.8 26 9.3 17.9 6.5 38.2 11.3 72.1 17.2 27.1 4.7 30.1 5 35 4 3.6-.8 11.6-1 23.9-.6 27.6.8 38.6 4.1 58.4 17.2 5.3 3.5 15.3 11.1 22.2 16.9 14.5 12.1 27.7 22.2 38.4 29.3 14.3 9.6 58.4 35.6 65.9 39 4.2 1.9 8.7 4 10.1 4.8 1.4.7 4.1 1.6 6.2 2 4.5.9 9.3-2.3 10.7-6.9.5-1.7 1.2-3.9 1.6-4.9.5-1.2.2-1.7-.8-1.7-.8 0-2.9-2.1-4.5-4.7-3-4.6-18.9-20.7-32.2-32.6l-6.5-5.9 6.3 4.7c3.4 2.6 11 9.2 16.8 14.7 9.3 8.9 12.9 11.1 12.9 8.2 0-.5.4-1.6.9-2.3.7-1.1-1.3-3.6-8.1-10-10.8-10.3-18.9-16.2-43.3-31.6-18.5-11.7-26.8-18.5-33.6-27.7-1.9-2.5-3.9-6-4.5-7.8-1-2.7-.9-3.4 1-5.4 2.7-2.8 10.8-4 38.6-5.7 21.9-1.3 119.3-.2 121.3 1.3 2.7 2.2 13.2-1.5 13.2-4.6 0-.8-1.6-3.3-3.5-5.6s-3.5-5-3.5-6c0-1.8-4.6-3.5-5.5-1.9-.3.4-3.1-.1-6.3-1.2-14.9-5.2-31.8-7.6-73.7-10.5-23.5-1.6-26.1-1.6-43.5-.1-10.2 1-21.4 1.7-25 1.7-11.4 0-36-7-36-10.3 0-1.6 3.2-4.6 8-7.5 4.5-2.6 32.5-12.7 40.7-14.6 3.4-.8 7.5-2.3 9-3.4 6-4.2 16.1-8.5 35.8-15.2 23.5-8 31.6-11.8 40.6-19 8.1-6.5 8.6-7.4 6.5-11.7-.9-1.8-1.6-4.4-1.6-5.7v-2.3l-16.2.3c-12.9.1-19 .7-29.5 2.8-22.2 4.4-45.9 11.9-75.8 23.8-23.8 9.5-28.7 11.2-42.5 14.4-16.9 3.8-32.5 5-48.7 3.6-7.6-.7-16-1.8-18.8-2.6l-5-1.3 2.8-1.2c1.6-.6 3-1.1 3.2-1.1 1.2 0 34.5-14.3 47-20.2 33.2-15.7 50.6-26.6 67.5-42l7.3-6.7-1.2-5.5c-.7-3.1-2-6.5-2.9-7.6-10.1-12.5-62.1 8.2-143.8 57.2-13.3 8-24.1 13.8-25.6 13.8-4.9 0-61.5-9.9-80.2-14-25.2-5.6-36.4-9.2-41.1-13.5-2-1.9-4.5-3.7-5.6-4-2.1-.7-2.4-3.2-.6-5.6 2.2-2.9 24.5-9.2 46.7-13.3 4.7-.8 21.3-3.6 37-6.1 47.6-7.6 69.4-13.4 91.7-24.4 13.1-6.5 23.6-13.6 35.7-24.4 4.5-4 14-12 21.1-17.8 16.1-13.2 28-25.5 32.4-33.9 3.3-6.2 3.4-6.5 2.8-15.6-.5-8-1-10.2-3.8-15.5-3.1-5.8-11.7-15.3-18.6-20.6-1.8-1.4-11.6-6.5-21.9-11.4-24.3-11.6-36-19.3-50.4-33.3-18.8-18.3-29.3-26.1-56.5-42.2-8.2-4.8-17.1-10.5-19.8-12.5l-4.7-3.8 4.2-.5c2.4-.3 11.1-1.2 19.3-2.1 49.3-5.2 97.9-18 154.5-40.7 26.3-10.6 50-24.6 73.5-43.5 12.6-10.1 36.4-32.9 50.2-48.2 10.1-11.1 32.8-40.7 42.6-55.6 4-6.1 5.7-8 5.3-6-12.5 51.8-15.1 106-6.5 134.3 2.5 8 9.6 21.4 13.9 26.2 1.8 1.9 2.7 2.7 2 1.7-.7-.9-1-1.7-.8-1.7.3 0 4.3 2.5 8.9 5.5 17.1 11.3 41.2 16.1 102.9 20.6 45.1 3.2 47 3.3 73.4 1.4 27.1-1.9 41.5-1.7 54.1 1 11 2.3 11.8 2.9 7.2 5.1-4.1 2-4.3 2.3-2.4 4.7 1 1.4 1.8 1.4 5.3.5 3.4-.9 5.3-.8 10.5.6 9 2.5 32 11.8 47.9 19.3 23 11 43.1 19.9 53.5 23.8 12.4 4.6 31.2 9.5 38.5 9.9 3 .2 8.3.9 11.7 1.7 6.1 1.3 6.2 1.3 6.5 4.8.2 3 .7 3.7 2.8 3.9 5.1.8 17.4-5.4 17.8-8.9.1-.8.5-3.1.8-5.1.5-2.8.1-4.6-1.6-7.2-8.2-13.4-46-33-101.4-52.7-14-5-17.3-6.5-15.5-7 9.6-2.8 46.1-15.1 58.4-19.6 32.6-12.1 63.9-26.3 81.3-37.1 4.2-2.6 9.9-5.8 12.5-7.1 11.4-5.5 20.8-17.8 19.3-25.1-.9-4.5-5.5-10-10.1-12.1-16.2-7.4-67.6 8.6-133 41.3-7.3 3.7-11.4 5.3-10.5 4.2.8-1.1 5.6-6.6 10.5-12.4 5-5.8 11-13 13.5-16 6.5-8.2 18.4-20.3 27.5-28 7.6-6.4 8.4-7.4 14.5-19.4 5.4-10.7 6.5-13.6 6.8-19 .6-8.7-.5-10.3-7.3-11.1-6.7-.9-10.6.5-21.9 7.6-21.9 13.9-55 41.8-103.5 87.3l-22.3 21-11.4-3.8c-6.3-2-11.4-3.9-11.4-4 0-.2 1.4-3.4 3.1-7.2 1.8-3.8 6.1-13.9 9.6-22.4 3.6-8.5 8-19.1 9.8-23.5 1.9-4.4 4.1-12.1 5-17 .9-5 2.5-13.2 3.6-18.3 1-5.1 1.9-10.8 1.9-12.8 0-4.5-2.3-10-4.8-11.3-3.2-1.7-9.2-1.3-12.7.9-11.1 6.9-30.2 42.8-48.9 91.8-2.2 5.6-3.2 7.2-4.5 6.8-5.3-1.7-27.5-6.8-38.6-9-24.2-4.7-31-5.5-50-6-11.9-.3-20.9-1-24-1.9-10.7-3-20.9-10.4-16.4-11.9 1.6-.5-.5-4.5-4.3-8-3.2-3-3.3-4.6-1.4-14 2.5-11.8 6.5-19.1 29.6-54.8 4.8-7.4 10.1-16.9 11.8-21 1.6-4.1 5-12.5 7.6-18.5 8.4-20.4 9.7-32 5-45-4-11.2-4.1-10.5 2.7-15.5 8.5-6.3 37.8-36.5 47.5-49 10.1-13 24.4-34.3 35.4-52.6 4.6-7.6 12.4-20.1 17.2-27.8 4.9-7.6 10-16.6 11.4-20 2.8-6.6 5.5-12.1 28.1-56.6 21.8-43.1 28.9-62.7 32.3-89 .6-4.7 1.8-12.5 2.7-17.3 1.4-7.5 1.4-10.1.4-16.5-1.9-12.8-10.1-27.3-21-37.5-2.8-2.6-5.1-5-5.1-5.2 0-.3 1.4-.5 3-.5 1.7 0 3-.3 3-.8-.1-2.2-13.6-10.1-28.9-16.7-21.6-9.5-27.8-11.5-46.6-15.3-30.4-6.3-46.5-6.6-71.2-1.3-35.5 7.6-56 8-92.8 1.6-30.4-5.3-41-6.3-50.1-4.5zm294.1 151.6c-1.5 4.9-4.4 13.2-6.7 18.4-5.9 14-20 44.1-20.4 43.7-.2-.2 2.8-7.5 6.6-16.2 6.9-15.5 18.5-44.3 21-51.8 2.4-7.5 2-2.9-.5 5.9zM742 1075.4c9.2.8 18.7 2.3 21.5 3.2l5 1.8-3.5.7c-8.7 1.9-32.9 3.1-40.6 2.1-44.3-6-61.5-8.8-58.8-9.4 4.8-1.2 58.6 0 76.4 1.6z"/>
<!--    *quack*    -->
</svg>`,
};

export default class ObsidianParty extends Plugin {
	settings: ObsidianPartySettings = DEFAULT_SETTINGS;
	observer?: MutationObserver;
	configs: Partial<{
		[optionName in EffectConfig]: PartyConfiguration;
	}> = {};
	party: typeof Party;
	mousePos: { x: number; y: number } = { x: 0, y: 0 };

	async onload() {
		await this.loadSettings();

		// register party
		window.party = party;
		this.party = party;

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
		// save mouse position, so it can be used to simulate a click event
		this.registerDomEvent(window, "mousemove", (evt: MouseEvent) => {
			this.mousePos = { x: evt.clientX, y: evt.clientY };
		});

		this.setupShapes();
		this.setupObserver();
		this.addSettingTab(new ObsidianPartySettingsTab(this.app, this));
	}
	onunload() {
		this.observer?.disconnect();
		delete this.observer;
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.setupObserver(); // update observer
		this.configs = {}; // reset configs
		this.setupShapes();
	}
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const unknownSettings = this.settings as any; // cast to any to allow accessing unknown properties

		// convert settings from v1.0.0 to v2.0.0
		const taskEffect = unknownSettings.taskEffect;
		if (taskEffect !== undefined) {
			EFFECT_CONFIGS.forEach((optionName) => {
				unknownSettings.effectConfigs[optionName].effect = taskEffect;
			});
			delete unknownSettings.taskEffect;
		}

		// convert settings from v2.0.0 to v2.1.0
		[
			["taskEffectConfig", "task"],
			["dataviewEffectConfig", "dataview"],
			["checkboxEffectConfig", "checkbox"],
		].forEach(([oldName, newName]) => {
			const oldConfig = unknownSettings[oldName];
			if (oldConfig !== undefined) {
				unknownSettings.effectConfigs[newName] = oldConfig;
				delete unknownSettings[oldName];
			}
		});

		// make sure all effect configs are defined
		EFFECT_CONFIGS.forEach((optionName) => {
			unknownSettings.effectConfigs[optionName] = Object.assign(
				{},
				DEFAULT_CONFIGURATION,
				unknownSettings.effectConfigs[optionName]
			);
		});
	}

	setupShapes() {
		// clear all shapes, including the default ones
		for (const prop of Object.getOwnPropertyNames(party.resolvableShapes)) {
			delete party.resolvableShapes[prop];
		}
		// add default and custom shapes to resolvableShapes
		Object.assign(
			party.resolvableShapes,
			DEFAULT_SHAPES,
			Object.fromEntries(
				Object.entries(this.settings.customShapes).filter(
					([name, value]) => name && isValidHTML(value)
				)
			)
		);
	}

	setupObserver() {
		// observer will only be active if at least one effect is enabled
		if (
			// if all effects are disabled, disconnect observer
			Object.values(this.settings.effectConfigs).every(
				(config) => config.effect === "none"
			)
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
									? "task"
									: checkbox.closest(".dataview")
									? "dataview"
									: "checkbox";
							this.triggerEffect(evt, setting);
						}
					});
					checkbox.classList.add("party-patched");
				});

			// kanban plugin support
			mutations.forEach((mutation) => {
				if (mutation.addedNodes.length !== 1) return;
				const node: HTMLElement = mutation.addedNodes[0] as HTMLElement;
				if (
					node?.instanceOf(HTMLElement) &&
					node.classList &&
					node.classList.contains("kanban-plugin__item-wrapper") && //it's a kanban item
					node.find(".is-complete") //the item is marked as complete
				) {
					// simulate a click event on the kanban card as party.js might need a click event
					const evt = new MouseEvent("click", {
						view: window,
						bubbles: true,
						cancelable: true,
					});
					// define all properties needed for the event
					(
						[
							["target", node],
							["clientX", this.mousePos.x],
							["clientY", this.mousePos.y],
						] as const
					).forEach(([key, value]) => {
						Object.defineProperty(evt, key, {
							value: value,
							enumerable: true,
						});
					});

					this.triggerEffect(evt, "kanban");
				}
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
		this.triggerEffect(evt, "task");
	}

	// Exposed as public to allow calling from other plugins
	public triggerEffect(evt: MouseEvent, optionName: EffectConfig) {
		if (this.settings.effectConfigs[optionName].effect === "none") return;
		const effectConfig = this.getConfig(optionName);

		// get target element
		let target: Party.sources.DynamicSourceType;
		let element: HTMLElement | undefined = evt.target as HTMLElement;
		if (!element?.instanceOf(HTMLElement)) element = undefined;
		switch (this.settings.effectConfigs[optionName].target) {
			case "element": {
				if (element && document.body.contains(element)) {
					// convert element to Rect, so if element is deleted, the effect will still be visible in the right place
					target = party.Rect.fromElement(element);
				} else target = evt;
				break;
			}
			case "line": {
				const line =
					element?.closest(".cm-line") ||
					element?.closest("li") ||
					element?.closest(".setting-item");
				if (
					line &&
					line?.instanceOf(HTMLElement) &&
					document.body.contains(line)
				) {
					target = party.Rect.fromElement(line);
				} else if (element && document.body.contains(element)) {
					// fallback to element
					target = party.Rect.fromElement(element);
				} else target = evt;
				break;
			}
			case "note": {
				const note =
					element?.closest(".view-content") ||
					document.querySelector(
						".workspace-leaf.mod-active .view-content"
					);
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
		switch (this.settings.effectConfigs[optionName].effect) {
			case "confetti":
				party.confetti(target, effectConfig);
				return;
			case "sparkles":
				party.sparkles(target, effectConfig);
				return;
		}
	}

	convertConfig(config: EffectConfiguration) {
		const cfg: PartyConfiguration = {};
		RANGE_CONFIGS.forEach((key) => {
			if (config[key][0] && config[key][1])
				cfg[key] = party.variation.range(
					config[key][0] as number,
					config[key][1] as number
				);
			else if (config[key].find((value) => value))
				cfg[key] = config[key].find((value) => value) as number;
		});
		const shapes = config.shapes.filter((s) =>
			Object.keys(party.resolvableShapes).includes(s)
		);
		if (shapes.length) cfg.shapes = shapes;
		if (config.colors.length)
			cfg.color = config.colors.map((color) =>
				party.Color.fromHex(color)
			);
		return cfg;
	}
	getConfig(optionName: EffectConfig) {
		if (this.configs[optionName] === undefined) {
			this.configs[optionName] = this.convertConfig(
				this.settings.effectConfigs[optionName]
			);
		}
		return this.configs[optionName];
	}
}
