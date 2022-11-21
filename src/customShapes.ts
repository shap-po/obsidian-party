import { Modal, Setting } from "obsidian";
import ObsidianParty, { DEFAULT_SHAPES } from "./main";
import "./styles/customShapes.css";
import ConfirmationModal from "./confirmationModal";
import { applyColor, isValidHTML } from "./utils";

const SHAPE_MAX_SIZE = 20;
const COLOR_NORMAL = "var(--party-shape-normal-color)";
const COLOR_RESIZED = "var(--party-shape-resized-color)";

export class CustomShapesModal extends Modal {
	plugin: ObsidianParty;
	constructor(plugin: ObsidianParty) {
		super(plugin.app);
		this.plugin = plugin;
		this.modalEl.addClass("party-shapes-modal");
		this.modalEl.style.setProperty("--max-size", `${SHAPE_MAX_SIZE}px`);
	}
	onOpen() {
		this.display();
	}
	display() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", {
			text: "Custom shapes",
		});

		contentEl.createEl("p", {
			text: `Shapes larger than ${SHAPE_MAX_SIZE}x${SHAPE_MAX_SIZE}px, will be resized only in preview, actual particles will be rendered with original size.`,
		});
		contentEl.createEl("p", {
			text: "Helpful websites for creating SVG shapes:",
		});
		contentEl.createEl("ul", undefined, (ul) => {
			ul.createEl("li", undefined, (li) => {
				li.createEl("a", {
					text: "SVG Editor",
					href: "https://yqnn.github.io/svg-path-editor/",
				});
			});
			ul.createEl("li", undefined, (li) => {
				li.createEl("a", {
					text: "SVG Compressor",
					href: "https://jakearchibald.github.io/svgomg/",
				});
			});
			ul.createEl("li", undefined, (li) => {
				li.createEl("a", {
					text: "Simple icons",
					href: "https://boxicons.com/",
				});
			});
		});

		const customShapes = this.plugin.settings.customShapes;
		contentEl.createEl("h3", {
			text: "Custom shapes",
		});
		new Setting(contentEl).addButton((button) =>
			button
				.setButtonText("Add shape")
				.onClick(() => {
					// find a unique key
					let key = "shape";
					let i = 1;
					while (customShapes[key] !== undefined) {
						key = `shape-${i}`;
						i++;
					}
					this.plugin.settings.customShapes[key] = "";
					this.plugin.saveSettings();
					this.display();
				})
				.setCta()
		);
		Object.entries(customShapes).forEach(([key, value]) => {
			this.displayShape(key, value, true);
		});

		contentEl.createEl("h3", {
			text: "Default shapes",
		});

		Object.entries(DEFAULT_SHAPES).forEach(([key, value]) => {
			this.displayShape(key, value, false);
		});
	}

	displayShape(key: string, value: string, editable = true) {
		const setting = new Setting(this.contentEl)
			.addText((text) => {
				text.setValue(key).setPlaceholder("Shape name");
				if (editable) {
					text.onChange((newKey) => {
						this.plugin.settings.customShapes[newKey] = value;
						delete this.plugin.settings.customShapes[key];
						key = newKey;
						this.plugin.saveSettings();
					});
				} else {
					text.setDisabled(true);
				}
			})
			.addTextArea((text) => {
				text.setValue(value).setPlaceholder("Shape HTML");
				if (editable) {
					text.onChange((newValue) => {
						newValue = newValue.trim();
						this.plugin.settings.customShapes[key] = newValue;
						value = newValue;
						this.plugin.saveSettings();
						this.updateShape(setting, newValue);
					});
				} else {
					text.setDisabled(true);
				}
			});
		setting
			.addExtraButton((button) =>
				button
					.setIcon("wand")
					.setTooltip("Test confetti")
					.onClick(() => {
						if (!isValidHTML(value)) return;
						this.plugin.party.confetti(button.extraSettingsEl, {
							shapes: [key],
							count: this.plugin.party.variation.range(10, 20),
						});
					})
			)
			.addExtraButton((button) =>
				button
					.setIcon("star")
					.setTooltip("Test sparkles")
					.onClick(() => {
						if (!isValidHTML(value)) return;
						this.plugin.party.sparkles(button.extraSettingsEl, {
							shapes: [key],
							count: this.plugin.party.variation.range(8, 16),
						});
					})
			);

		setting.addExtraButton((button) => {
			button.setIcon("trash");
			if (editable) {
				button.setTooltip("Delete shape").onClick(() => {
					if (!value) this.deleteShape(key);
					else {
						new ConfirmationModal(this.app, "Delete shape?", () => {
							this.deleteShape(key);
						});
					}
				});
			} else {
				button.setDisabled(true);
				button.extraSettingsEl.style.opacity = "0";
			}
		});
		this.updateShape(setting, value);
	}
	deleteShape(name: string) {
		delete this.plugin.settings.customShapes[name];
		this.plugin.saveSettings();
		this.display();
	}
	updateShape(setting: Setting, shape: string) {
		setting.setTooltip("");
		setting.nameEl.classList.remove("party-shape-resized");
		setting.nameEl.empty();
		if (!isValidHTML(shape)) return;
		setting.nameEl.innerHTML = shape;
		const el = setting.nameEl.firstChild as HTMLElement;
		if (!el) return;
		applyColor(el, COLOR_NORMAL);
		if (
			el.clientWidth > SHAPE_MAX_SIZE ||
			el.clientHeight > SHAPE_MAX_SIZE
		) {
			setting.setTooltip("Preview is resized");
			setting.nameEl.classList.add("party-shape-resized");
			applyColor(el, COLOR_RESIZED);
		}
	}
}
