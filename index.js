const forEach = require("lodash/forEach");
const merge = require("lodash/merge");
const mergeWith = require("lodash/mergeWith");
const cloneDeep = require("lodash/cloneDeep");
const isPlainObject = require("lodash/isPlainObject");

const BASE_JSON = require("./style/hsl-map-template.json");

const replaceableValues = {
  SOURCES_URL: {
    default: "https://dev-api.digitransit.fi/",
  },
};

const components = [
  {
    id: "base",
    enabled: true,
    description: "Taustakartta",
    style: require("./style/hsl-map-style-base.json"),
  },
  {
    id: "municipal_borders",
    enabled: false,
    description: "Kuntarajat",
    style: require("./style/hsl-map-style-municipal-borders.json"),
  },
  {
    id: "routes",
    enabled: false,
    description: "Linjaviivat",
    style: require("./style/hsl-map-style-routes.json"),
  },
  {
    id: "text",
    enabled: true,
    description: "Tekstit",
    style: require("./style/hsl-map-style-text.json"),
  },
  {
    id: "subway_entrance",
    enabled: false,
    description: "Metron sisäänkäynnit",
    style: require("./style/hsl-map-style-subway-entrance.json"),
  },
  {
    id: "poi",
    enabled: false,
    description: "Terminaalit",
    style: require("./style/hsl-map-style-icon.json"),
  },

  {
    id: "park_and_ride",
    enabled: false,
    description: "Liityntäpysäköinti",
    style: require("./style/hsl-map-style-park-and-ride.json"),
  },
  {
    id: "ticket_sales",
    enabled: false,
    description: "Lipunmyyntipisteet",
    style: require("./style/hsl-map-style-ticket-sales.json"),
  },
  {
    id: "stops",
    enabled: false,
    description: "Pysäkit",
    style: require("./style/hsl-map-style-stops.json"),
  },
  {
    id: "citybikes",
    enabled: false,
    description: "Kaupunkipyörät",
    style: require("./style/hsl-map-style-citybikes.json"),
  },
  {
    id: "ticket_zones",
    enabled: false,
    description: "Lippyvyöhykkeet",
    style: require("./style/hsl-map-style-ticket-zones.json"),
  },
  // Themes, which just modify the previous styles.
  {
    id: "text_sv",
    enabled: false,
    description: "Ruotsinkieliset tekstit",
    style: require("./style/hsl-map-theme-text-sv.json"),
    dependencies: ["text"],
  },
  {
    id: "text_fisv",
    enabled: false,
    description: "Kaksikieliset tekstit",
    style: require("./style/hsl-map-theme-text-fisv.json"),
    dependencies: ["text"],
  },
  {
    id: "regular_routes",
    enabled: false,
    description: "Linjaviivat ilman lähibusseja",
    style: require("./style/hsl-map-theme-regular-routes.json"),
    dependencies: ["routes"],
  },
  {
    id: "near_bus_routes",
    enabled: false,
    description: "Vain lähibussien reitit",
    style: require("./style/hsl-map-theme-near-bus-routes.json"),
    dependencies: ["routes"],
  },
  {
    id: "regular_stops",
    enabled: false,
    description: "Pysäkit ilman lähibusseja",
    style: require("./style/hsl-map-theme-regular-stops.json"),
    dependencies: ["stops"],
  },
  {
    id: "near_bus_stops",
    enabled: false,
    description: "Vain lähibussien pysäkit",
    style: require("./style/hsl-map-theme-near-bus-stops.json"),
    dependencies: ["stops"],
  },
  {
    id: "print",
    enabled: false,
    description: "Tulostevärit",
    style: require("./style/hsl-map-theme-print.json"),
  },
  {
    id: "greyscale",
    enabled: false,
    description: "Harmaasävy",
    style: require("./style/hsl-map-theme-greyscale.json"),
  },
  {
    id: "simplified",
    enabled: false,
    description: "Yksinkertaistettu (Reittiopas)",
    style: require("./style/hsl-map-theme-simplified.json"),
  },
  {
    id: "3d",
    enabled: false,
    description: "3D-rakennukset",
    style: require("./style/hsl-map-theme-3d.json"),
  },
];

/**
 * Prepends http:// to relative urls. Returns original string if absolute or
 * protocol-relative url.
 * @param url {string}
 * @returns {string}
 */
function makeAbsoluteUrl(url) {
  const isAbsoluteUrl = new RegExp("^(?:[a-z]+:)?//", "i");

  if (isAbsoluteUrl.test(url)) {
    return url;
  }

  return `https://${url}`;
}

/**
 * Creates values that replace the defaults in the base style
 * @param  {Object} options         Received options that are used to create
 *   replacements
 * @return {Object}                 Replacement values that are used to modify the
 *   base style
 */
function getReplacements(options) {
  const replacements = {};

  if (options.sourcesUrl) {
    const sourcesUrl = makeAbsoluteUrl(options.sourcesUrl);
    replacements.SOURCES_URL = { replacement: sourcesUrl };
  }

  return replacements;
}

/**
 * Replaces certain values in the basestyle, based on received options
 * @param  {Object} options   Determines what values to replace
 * @return {Object}            Modified style
 */
function replaceInStyle(style, options) {
  const values = merge(replaceableValues, getReplacements(options));
  let replacedStyle = JSON.stringify(style);

  forEach(values, (value) => {
    if (value.replacement) {
      const replaceableRegexp = new RegExp(value.default, "g");
      replacedStyle = replacedStyle.replace(replaceableRegexp, value.replacement);
    }
  });

  return JSON.parse(replacedStyle);
}

// eslint-disable-next-line consistent-return
function customizer(objValue, srcValue) {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    srcValue.forEach((srcElement) => {
      // Objects with id properties are layers
      if (isPlainObject(srcElement) && srcElement.id) {
        const destElement = objValue.find(
          (objElement) =>
            isPlainObject(objElement) && objElement.id === srcElement.id
        );
        if (destElement) {
          // Override or add properties to existing layer
          merge(destElement, srcElement);
          return;
        }
        if (
          !srcElement.ref &&
          (!srcElement.type ||
            (srcElement.type !== "background" && !srcElement.source))
        ) {
          // Omit incomplete layer with no matching layer in destination array
          return;
        }
      }
      objValue.push(srcElement);
    });
    return objValue;
  }
}

/**
 * Creates a style with certain objects (e.g. layers, sources), based on received
 * options
 * @param  {Object} style     Style that is extended
 * @param  {Object} options   Determines what components to add
 * @return {Object}           Extended style
 */
function extendStyle(style, options) {
  const extendedStyle = cloneDeep(style);
  const extendedComponents = cloneDeep(components);

  extendedComponents.forEach((component) => {
    if (options.components) {
      const componentOptions = options.components[component.id];
      if (componentOptions && componentOptions.enabled !== undefined) {
        // eslint-disable-next-line no-param-reassign
        component.enabled = !!componentOptions.enabled;
      }
    }
  });

  extendedComponents.forEach((component) => {
    // Logic to add route filter
    // Route filter is the list of Jore ids
    const routeFilter =
      options.routeFilter && options.routeFilter.filter((r) => r !== "");
    if (routeFilter && routeFilter.length > 0) {
      // remove duplicates, because the following match-expression cannot handle them
      const cleanFilter = [...new Set(routeFilter)];
      const routeFilterLine = [
        "match",
        ["string", ["get", "routeId"]],
        cleanFilter,
        true,
        false,
      ];
      // Function to decide how to merge filter with the existing ones.
      const createFilter = (layer) => {
        const f = layer.filter;
        if (f && f[0] === "all") {
          // Append the filter to the list of existing filters
          return f.concat([routeFilterLine]);
        }
        if (f) {
          // There was one filter already, create all rule.
          return ["all", f, routeFilterLine];
        }
        if (!layer.ref) {
          // No existing filter, add new filter if the layer is not ref-layer
          return routeFilterLine;
        }
        return undefined;
      };

      if (component.id === "routes") {
        component.style.layers.forEach((l) => {
          // eslint-disable-next-line no-param-reassign
          l.filter = createFilter(l);
        });
      }
    }

    if (component.enabled) {
      mergeWith(extendedStyle, component.style, customizer);
    }
  });

  return extendedStyle;
}

module.exports = {
  /**
   * Generates a GL Map Style object based on received options
   * @param  {Object} options Options used to generate the style object
   * @return {Object}         Generated style object
   */
  generateStyle: function generateStyle(options) {
    const extendedStyle = extendStyle(BASE_JSON, options || {});
    return replaceInStyle(extendedStyle, options || {});
  },
  components,
};
