# HSL Map Style

This is the main vector style for maps used throughout HSL's internal and external services. It's MapBox-compatible and customizable depending on your needs by toggling the layers.

## CLI tool

A CLI tool for splitting and combining the style is also included in `bin/styletool-cli`. It is useful if you want to split a big `style.json` file into toggleable partials, or if you want to render a selection of layers to one large `style.json` file.

Please note that the CLI tool was developed based on what already existed in the style we have, and some special cases that may or may not exist in the future have explicit conditions in the code. The tool might not handle everything the style may contain in the future either.

### Usage

##### Help

View the instructions with the command

```bash
bin/styletool-cli -h
```

##### Split

Split a complete `style.json` file into parts and save the parts in a directory of your choosing:

```bash
bin/styletool-cli split ./style.json ./style_parts_dir
```

##### Render

Render the parts into one continuous json file. This command is simpler, and uses the same functionality as you would use when using the hsl-map-style module in a Node project. Select the layers you need in `cli/render.js` and run this command:

```bash
bin/styletool-cli render
```

By default it will output the style to stdout, so you can pipe the output to another command or write it to a file:

```bash
bin/styletool-cli render >> style.json
```

##### Match order

If you have to style JSON files and you need to match the order of the layers, use the `matchorder` command:

```bash
bin/styletool-cli matchorder styleA.json styleB.json
```

Matchorder will read the order from the second input file (`styleB.json`) and rewrite the layers in first input file (`styleA.json`) in that same order. The first input file will be modified.

##### Extract diff

To extract layers that are different between two style files, use `extract-diff`. It will move layers that don't exist in fileB out from fileA into a third file.

```bash
bin/styletool-cli extract-diff styleA.json styleB.json
```

The new file will be created in the same location as the first input file (`styleA.json`) and be named with the prefix `layerdiff_` and the name of the first input file (`layerdiff_styleA.json`). The first input file will be modified.

## How to view HSL map style?

Install dependencies and start the development server:

```sh
npm install
npm start
```

Browse to `http://localhost:3000` to see a basic Mapbox.js map with the HSL map style applied.

## How to use HSL map style in my project?

To use the style in your own project, install it with either yarn or npm from Github. It is not currently published in the npm registry.

Use the exported `generateStyle` function and pass it the layers you want to include in the style:

```javascript
import { generateStyle } from "hsl-map-style";

const style = generateStyle({
  sourcesUrl: 'https://cdn.digitransit.fi/map/v1/', // <-- You can override the default sources URL
  // glyphsUrl: '', <-- The glyphsUrl prop is removed. URL for fonts from HSL Azure storage is used.
  components: {
    // Set each layer you want to include to true
    routes: { enabled: false },
    stops: { enabled: false },
    citybikes: { enabled: false },
    municipal_borders: { enabled: false },
    poi: { enabled: false },
    ticket_sales: { enabled: false },
    driver_instructions: { enabled: false },
    icons: { enabled: true },
    text_fisv: { enabled: true },
  },
});

const map = new mapboxgl.Map({
  style: style, // <-- add the generated style to your map
});
```

Some layers are enabled by default and the layers may change as we develop the style. Check `index.js` for the list of layers.


