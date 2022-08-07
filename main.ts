import { Plugin } from "obsidian";
import party from "party-js";

export default class ObsidianParty extends Plugin {
	async onload() {
		// register party
		window.party = party;

		// register mouse click event
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			// check if the event target has confetti or sparkles class
			if (evt.target instanceof HTMLElement) {
				if (evt.target.classList.contains("confetti"))
					party.confetti(evt.target);
				if (evt.target.classList.contains("sparkles"))
					party.sparkles(evt.target);
			}
		});
	}

	onunload() {
		// unregister party
		delete window.party;
	}
}
