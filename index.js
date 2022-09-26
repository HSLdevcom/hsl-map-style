const forEach = require("lodash/forEach");
const merge = require("lodash/merge");
const mergeWith = require("lodash/mergeWith");
const cloneDeep = require("lodash/cloneDeep");
const isEmpty = require("lodash/isEmpty");
const isPlainObject = require("lodash/isPlainObject");

const BASE_JSON = require("./style/hsl-map-template.json");

const ROUTEFILTER_COMPONENTS = ["routes", "stops"]; // Components which are filtered by routefilter
const JORE_SOURCES = ["routes", "stops", "stops-by-routes"]; // Sources which can be queried by date

const replaceableValues = {
  SOURCES_URL: {
    default: "https://api.digitransit.fi/",
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
  {
    id: "ticket_zone_labels",
    enabled: false,
    description: "Lippyvyöhykeiden ikonit",
    style: require("./style/hsl-map-style-ticket-zone-labels.json"),
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
    id: "text_en",
    enabled: false,
    description: "Englanninkieliset tekstit",
    style: require("./style/hsl-map-theme-text-en.json"),
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
    id: "routes_with_departures_only",
    enabled: true,
    description: "Vain lähtöjä sisältävät reitit",
    style: require("./style/hsl-map-theme-routes-with-departures-only.json"),
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
    id: "stops_with_route_info",
    enabled: false,
    description: "Pysäkit reittitiedoilla",
    style: require("./style/hsl-map-theme-stops-with-route-info.json"),
    dependencies: ["stops"],
    hidden: true, // There should not be any need to enable this manually, so hide it from gui by this parameter.
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
  {
    id: "driver_info",
    enabled: false,
    description: "Kuljettajaohjeet",
    style: require("./style/hsl-map-theme-driver-info.json"),
    dependencies: ["stops"],
  },
];

/**
 * Prepends http:// to relative urls. Returns original string if absolute or
 * protocol-relative url.
 * @param url {string}
 * @returns {string}
 */
function makeAbsoluteUrl(url) {
  const isAbsoluteUrl = /^(?:[a-z]+:)?\/\//i;

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

  replacedStyle = JSON.parse(replacedStyle);

  if (options.queryParams) {
    Object.values(replacedStyle.sources).forEach((source) => {
      if (source.url) {
        const queryString = options.queryParams
          .filter((param) => source.url.startsWith(makeAbsoluteUrl(param.url)))
          .map((param) => `${param.name}=${param.value}`)
          .join("&");

        if (queryString) {
          source.url += `?${queryString}`; // eslint-disable-line no-param-reassign
        }
      }
    });
  }

  return replacedStyle;
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
          // Filter needs to be an union
          if (srcElement.filter && destElement.filter) {
            destElement.filter = ["all", destElement.filter, srcElement.filter];
            delete srcElement.filter; // eslint-disable-line no-param-reassign
          }
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

  // Logic to add route filter
  // Route filter is the list of Jore ids
  const { routeFilter } = options;

  let routeFilterLine;

  if (routeFilter && routeFilter.length > 0) {
    // Enable route information for stops so that filtering is possible.
    // eslint-disable-next-line no-param-reassign
    options.components.stops_with_route_info = { enabled: true };

    const filters = routeFilter
      .map((f) => {
        if (typeof f === "string" && f !== "") {
          return ["==", ["get", "routeId"], f];
        }
        if (f.id && f.direction) {
          return [
            "all",
            ["==", ["get", "routeId"], f.id],
            ["==", ["get", "direction"], f.direction],
          ];
        }
        if (f.idParsed && f.direction) {
          return [
            "all",
            ["==", ["get", "routeIdParsed"], f.idParsed],
            ["==", ["get", "direction"], f.direction],
          ];
        }
        if (f.id) {
          return ["==", ["get", "routeId"], f.id];
        }
        if (f.idParsed) {
          return ["==", ["get", "routeIdParsed"], f.idParsed];
        }
        return undefined;
      })
      .filter((f) => !isEmpty(f)); // Filter invalid filters

    routeFilterLine = ["any", ...filters];
  }

  extendedComponents.forEach((component) => {
    if (options.components) {
      const componentOptions = options.components[component.id];
      if (componentOptions && componentOptions.enabled !== undefined) {
        // eslint-disable-next-line no-param-reassign
        component.enabled = !!componentOptions.enabled;
      }
    }
  });

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
    // No existing filter, add new filter
    return routeFilterLine;
  };

  extendedComponents.forEach((component) => {
    if (routeFilterLine && ROUTEFILTER_COMPONENTS.includes(component.id)) {
      component.style.layers.forEach((l) => {
        // eslint-disable-next-line no-param-reassign
        l.filter = createFilter(l);
      });
    }

    if (component.enabled) {
      mergeWith(extendedStyle, component.style, customizer);
    }
  });

  if (options.joreDate && Date.parse(options.joreDate)) {
    const dateString = new Date(options.joreDate).toISOString().split("T")[0]; // convert to YYYY-MM-DD format
    Object.keys(extendedStyle.sources).forEach((k) => {
      if (JORE_SOURCES.includes(k)) {
        extendedStyle.sources[k].url += `?date=${dateString}`;
      }
    });
  }
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
