# HSL Map Style

This is the main vector style for maps used throughout HSL's internal and external services. It's Mapbox / Maplibre -compatible and customizable depending on your needs by toggling the layers.

## About components

The complete style with all the layers is in file [`style.json`](style.json). The same style splitted in components is under [`style/`](style/) directory. There are also a couple of themes available.

The difference between style and theme component is that a style component defines new layers, but a theme component modifies the existing ones.


### Style components


| Name                | Desciption                                                          | Enabled by default |
|---------------------|---------------------------------------------------------------------|:------------------:|
| `base`              | Base map (landuse, roads, buildings)                                |         x          |
| `municipal_borders` | Municipal borders near HSL area                                     |                    |
| `routes`            | Routes of HSL traffic                                               |                    |
| `text`              | Text labels (roads, places, POIs) in Finnish                        |         x          |
| `subway_entrance`   | Icons for subway entrances                                          |                    |
| `poi`               | Icons for HSL terminals and airports                                |                    |
| `park_and_ride`     | Style for specific parking areas designed for public transportation |                    |
| `ticket_sales`      | Icons for ticket sales points                                       |                    |
| `stops`             | Stops of HSL traffic                                                |                    |
| `citybikes`         | Citybike stations in Helsinki area                                  |                    |
| `ticket_zones`      | Ticket zones of HSL                                                 |                    |

There're no limits which style components can be enabled or disabled at the same time. 

### Theme components

| Name                | Desciption                                                          | Collides with     |
|---------------------|---------------------------------------------------------------------|-------------------|
| `text_sv`           | Shows texts in Swedish                                              | `text_fisv`       |
| `text_fisv`         | Shows texts in both Finnish and Swedish                             | `text_sv`         |
| `regular_routes`    | Shows only regular routes (filters near bus routes)                 | `near_bus_routes` |
| `near_bus_routes`   | Shows only near bus routes                                          | `regular_routes`  |
| `regular_stops`     | Shows only regular stops (filters near bus stops)                   | `near_bus_stops`  |
| `near_bus_stops`    | Shows only near bus stops                                           | `regular_stops`   |
| `print`             | Modifies color scheme better for printing (base map and texts)      | `greyscale`       |
| `greyscale`         | Modifies color to dark greyscale (base map and texts)               | `print`           |
| `simplified`        | Adds minzoom values to limit map elements. "Reittiopas style"       |                   |

Multiple themes can be enabled at the same time, but be aware of combinations that collide with each other. Those layers will overwrite style parameters twice, which leads to unexpected results.
Remember also to enable the corresponding styles when using themes. Theme components just overwrite parameters, if they exist, and do not add any layers. E.g., `stops` style component should be enabled, if you want to use `regular_stops` theme.

### Route filter

Routes can be filtered by their JORE ids. See the syntax below.

### Map server location

`sourcesUrl` parameter helps to manage url configurations. All strings matched by default url value will be replaced with this parameter. The default url is defined in [`index.js`](index.js). The path `/map/v{1|2}/` used by [hsl-map-server](https://github.com/HSLdevcom/hsl-map-server/tree/master) should be excluded from the parameter to make it possible to mix `v1` and `v2`. This is not the optimal situation, though.


## How to view HSL map style?

Modify `server.js` and enable right components to get the preferred style. See more about components below.

Install dependencies and start the development server:

```sh
yarn install
yarn start
```

Browse to `http://localhost:3000` to see a basic Mapbox.js map with the HSL map style applied.

## How to use HSL map style in my project?

To use the style in your own project, install it with either yarn or npm from Github. It is not currently published in the npm registry.

Use the exported `generateStyle` function and pass it the layers you want to include in the style:

```javascript
import { generateStyle } from "hsl-map-style";

const style = generateStyle({
  sourcesUrl: 'https://cdn.digitransit.fi/', // <-- You can override the default sources URL.
  components: {
    // Set each layer you want to include to true
    
    // Styles
    base: { enabled: true }, // Enabled by default
    municipal_borders: { enabled: false },
    routes: { enabled: false },
    text: { enabled: true }, // Enabled by default
    subway_entrance: { enabled: false },
    poi: { enabled: false },
    park_and_ride: { enabled: false },
    ticket_sales: { enabled: false },
    stops: { enabled: false },
    citybikes: { enabled: false },
    ticket_zones: { enabled: false },

    // Themes
    text_sv: { enabled: false },
    text_fisv: { enabled: false },
    regular_routes: { enabled: false },
    near_bus_routes: { enabled: false },
    regular_stops: { enabled: false },
    near_bus_stops: { enabled: false },
    print: { enabled: false },
    greyscale: { enabled: false },
    simplified: { enabled: false },
  },

  // optional property to show only listed routes by jore id
  routeFilter: ["2550", "4570"]
});

const map = new mapboxgl.Map({
  style: style, // <-- add the generated style to your map
});
```

Check `index.js` for the updated list of components.


## How to develop the style

The syntax of the style is Mapbox / Maplibre Style Specification. See more https://maplibre.org/maplibre-gl-js-docs/style-spec/. The preferred style editor is [Maputnik](https://maputnik.github.io/).

Most likely, the best way to start is to upload [`style.json`](style.json) and make modifications to it. After saving the file, run split tool to copy modifications to the right files under [`style/`](style/)

```bash
bin/styletool-cli split ./style.json ./style/
```

Remember to name new layers logically `id`. The partition of `style.json` to different components is made by the prefix of `id` field. See [`cli/fileMappings.js`](cli/fileMappings.js) how the layers will be picked up.

To add new components and make them to work with the cli tool, do the following steps.
- add layers to [`style.json`](style.json) and decide the naming
- make modifications to [`cli/fileMappings.js`](cli/fileMappings.js) so that the right names will be picked up to the right component
- add new component available in [`index.js`](index.js)
- run `split` command with the cli tool (you might need to create a dummy file under [`style/`](style/) first, if you're getting errors)


### Themes

Themes are not included in `style.json`. They will be copied from [`cli/static`](cli/static), so make modifications there and run split tool.

### New map icons

Use spritezero to add new icons. See more [`spritezero/README.md`](spritezero/README.md)

### 

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
bin/styletool-cli split ./style.json ./style/
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
