import { Plugin } from "obsidian";
import party from "party-js";

export default class ObsidianParty extends Plugin {
	async onload() {
		// register party
		window.party = party;

		// register mouse click event
		this.registerDomEvent(window, "click", (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target.instanceOf(HTMLElement)) {
				if (target.hasClass("confetti")) party.confetti(target);
				if (target.hasClass("sparkles")) party.sparkles(target);
			}
		});
	}

	onunload() {
		// unregister party
		delete window.party;
	}
}
