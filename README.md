<h1 align="center">
    <img src="https://raw.githubusercontent.com/yiliansource/party-js/main/.github/banner.svg"/>
</h1>

<p align="center">
    <a href="#installation">Installation</a> &bull;
    <a href="#usage">Usage</a> &bull;
    <a href="https://party.js.org/docs">Documentation</a>
</p>

<p align="center">
  <a href="https://www.paypal.com/donate/?hosted_button_id=89AG7T2HQA8K6"><img src="https://img.shields.io/badge/Donate-PayPal-blue.svg"></a>
  <a href="https://www.buymeacoffee.com/shap"><img src="https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg"></a>
</p>

# Party🎉
An implementation of the [party.js](https://party.js.org/) library for the [Obsidian](https://obsidian.md).

# Features
- Create confetti and sparkles effects

<img src="https://raw.githubusercontent.com/shap-po/obsidian-party/master/images/confetti.gif" width="40%"/> <img src="https://raw.githubusercontent.com/shap-po/obsidian-party/master/images/sparkles.gif" width="40%"/>

- Add effects to checkboxes (also supports dataview tasks and a tasks plugin)

<img src="https://raw.githubusercontent.com/shap-po/obsidian-party/master/images/checkbox.gif" width="40%"/> <img src="https://raw.githubusercontent.com/shap-po/obsidian-party/master/images/snowflakes.gif" width="40%"/>

- A lot of customization options

<img src="https://raw.githubusercontent.com/shap-po/obsidian-party/master/images/customization.png" width="40%"/>

- Custom shapes

<img src="https://raw.githubusercontent.com/shap-po/obsidian-party/master/images/custom-shapes.png" width="40%"/>

- Kanban compatibility

- What else do you want? (I'm open to suggestions!)

# Installation
Search for the "Party🎉" in the Obsidian plugin list.
## Manual Installation
1. Go to [Releases](https://github.com/shap-po/obsidian-party/releases) and download the latest release
2. Enable plugins in the Obsidian settings
3. Extract the contents of the zip file to obsidian plugins folder
4. You should have a folder named "obsidian-party", containing "main.js" and "manifest.json" files
5. Restart Obsidian and enable the plugin in the plugin list
## Manual build
1. Clone the repository
2. Run `npm i` or `yarn` to install dependencies
3. `npm run dev` to build the plugin

# Examples
## Checkbox effects
1. Open plugin settings
2. Select effect type
3. Enjoy!
## Custom elements / API
Either add a `confetti` or `sparkles` class for an element, or make use of all features of the [party module](https://party.js.org/docs), which can be accessed through `window.party`!
Also, you'd better to not spam particles, because it can cause performance issues.
## Simple confetti button
```html
<button class="confetti">Click me!</button>
```
<button class="confetti">Click me!</button>
(This button will launch confetti on click if you have this plugin enabled)
## DataView JS support 
````
```dataviewjs
const buttonMaker = (text) => {
  const btn = this.container.createEl('button', {"text": text});
  btn.addEventListener('click', async (evt) => {
    evt.preventDefault();
    party.confetti(evt); // <---- creating confetti
    party.sparkles(evt); // <---- creating sparkles
  });
  return btn;
}

dv.table(["File", "Button"],
	dv.pages('"Dataview"')
    .map(t => [
      t.file.link,
      buttonMaker("Let's start the party!")
    ]
  )
)
```
````
## Custom shapes
Any HTML code can be used as a shape. For example, you can use an SVG image as a shape.
```html
<svg viewBox="0 0 2 2" width="10" height="10"><circle cx="1" cy="1" r="1"/></svg>
```
Put the code in the "Shape HTML" field in the custom shapes section of the plugin settings, give it a name and you're good to go! Now you can select custom shapes in the "Shapes" field of the effect settings.