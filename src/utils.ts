export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function applyColor(element: HTMLElement, color: string): void {
	// Note that by default, HTML node names are uppercase.
	switch (element.nodeName.toLowerCase()) {
		case "div":
			element.style.background = color;
			break;
		case "svg":
			element.style.fill = element.style.color = color;
			break;
		default:
			element.style.color = color;
			break;
	}
}

export function isValidHTML(html: string): boolean {
	if (html.trim() === "") return false;
	const template = document.createElement("template");
	template.innerHTML = html;
	return (
		template.content.childNodes.length > 0 &&
		Array.from(template.content.childNodes).every(
			(node) =>
				node.nodeName.toLowerCase() === "svg" ||
				(node instanceof HTMLElement && node.style !== undefined) // node must be an element with style property
		)
	);
}
