const includes = require("lodash/includes");
const forEach = require("lodash/forEach");
const merge = require("lodash/merge");
const mergeWith = require("lodash/mergeWith");
const cloneDeep = require("lodash/cloneDeep");
const isPlainObject = require("lodash/isPlainObject");

const BASE_JSON = require("./_oldstyle/hsl-gl-map-v9-style.json");

const replaceableValues = {
  SOURCES_URL: { default: "https://cdn.digitransit.fi/map/v1/" },
  GLYPHS_URL: { default: "http://localhost:8000/" },
};

const components = [
  {
    id: "base",
    enabled: true,
    description: "Taustakartta",
    style: require("./_oldstyle/hsl-gl-map-v9-base.json"),
  },
  {
    id: "municipal_borders",
    enabled: false,
    description: "Kuntarajat",
    style: require("./_oldstyle/hsl-gl-map-v9-municipal-borders.json"),
  },
  {
    id: "routes",
    enabled: false,
    description: "Linjaviivat",
    style: require("./_oldstyle/hsl-gl-map-v9-routes.json"),
  },
  {
    id: "text",
    enabled: true,
    description: "Tekstit",
    style: require("./_oldstyle/hsl-gl-map-v9-text.json"),
  },
  {
    id: "text_sv",
    enabled: false,
    description: "Ruotsinkieliset tekstit",
    style: require("./_oldstyle/hsl-gl-map-v9-text-sv.json"),
    dependencies: ["text"],
  },
  {
    id: "text_fisv",
    enabled: false,
    description: "Kaksikieliset tekstit",
    style: require("./_oldstyle/hsl-gl-map-v9-text-fisv.json"),
    dependencies: ["text"],
  },
  {
    id: "poi",
    enabled: false,
    description: "Joukkoliikenne-POI",
    style: require("./_oldstyle/hsl-gl-map-v9-poi.json"),
  },
  {
    id: "ticket_sales",
    enabled: false,
    description: "Lipunmyyntipisteet",
    style: require("./_oldstyle/hsl-gl-map-v9-ticket-sales.json"),
  },
  {
    id: "driver_instructions",
    enabled: false,
    description: "Kuljettajaohjeet",
    style: require("./_oldstyle/hsl-gl-map-v9-driver-instructions.json"),
  },
  {
    id: "stops",
    enabled: false,
    description: "Pysäkit",
    style: require("./_oldstyle/hsl-gl-map-v9-stops.json"),
  },
  {
    id: "citybikes",
    enabled: false,
    description: "Kaupunkipyörät",
    style: require("./_oldstyle/hsl-gl-map-v9-citybikes.json"),
  },
  {
    id: "print",
    enabled: false,
    description: "Tulostevärit",
    style: require("./_oldstyle/hsl-gl-map-v9-print.json"),
  },
];

/**
 * Prepends http:// to relative urls. Returns original string if absolute or protocol-relative url.
 * @param url {string}
 * @returns {string}
 */
function makeAbsoluteUrl(url) {
  const isAbsoluteUrl = new RegExp("^(?:[a-z]+:)?//", "i");
  if (isAbsoluteUrl.test(url)) {
    return url;
  }
  return `http://${url}`;
}

/**
 * Creates values that replace the defaults in the base style
 * @param  {Object} options         Received options that are used to create replacements
 * @return {Object}                 Replacement values that are used to modify the base style
 */
function getReplacements(options) {
  const replacements = {};
  if (options.sourcesUrl) {
    const sourcesUrl = makeAbsoluteUrl(options.sourcesUrl);
    replacements.SOURCES_URL = { replacement: sourcesUrl };
  }
  if (options.glyphsUrl) {
    const glyphsUrl = makeAbsoluteUrl(options.glyphsUrl);
    replacements.GLYPHS_URL = { replacement: glyphsUrl };
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
            !srcElement.paint ||
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
 * Creates a style with certain objects (e.g. layers, sources), based on received options
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
        component.enabled = !!componentOptions.enabled;
      }
    }
  });

  extendedComponents.forEach((component) => {
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
    const replacedStyle = replaceInStyle(extendedStyle, options || {});
    return replacedStyle;
  },
  components,
};
