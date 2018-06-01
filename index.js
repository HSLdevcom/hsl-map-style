var includes = require("lodash/includes");
var forEach = require("lodash/forEach");
var merge = require("lodash/merge");
var mergeWith = require("lodash/mergeWith");
var cloneDeep = require("lodash/cloneDeep");
var isPlainObject = require("lodash/isPlainObject");

var BASE_JSON = require("./hsl-gl-map-v9-style.json");

var replaceableValues = {
  SOURCES_URL: { default: "https://cdn.digitransit.fi/map/v1/" },
  GLYPHS_URL: { default: "http://localhost:8000/" }
};

var components = [
  {
    id: "base",
    enabled: true,
    description: "Taustakartta",
    style: require("./hsl-gl-map-v9-base.json")
  },
  {
    id: "municipal_borders",
    enabled: false,
    description: "Kuntarajat",
    style: require("./hsl-gl-map-v9-municipal-borders.json")
  },
  {
    id: "routes",
    enabled: false,
    description: "Linjaviivat",
    style: require("./hsl-gl-map-v9-routes.json")
  },
  {
    id: "regular_routes",
    enabled: false,
    description: "Linjaviivat ilman lähibusseja",
    style: require("./hsl-gl-map-v9-regular-routes.json")
  },
  {
    id: "text",
    enabled: true,
    description: "Tekstit",
    style: require("./hsl-gl-map-v9-text.json"),
  },
  {
    id: "text_sv",
    enabled: false,
    description: "Ruotsinkieliset tekstit",
    style: require("./hsl-gl-map-v9-text-sv.json"),
    dependencies: ["text"]
  },
  {
    id: "text_fisv",
    enabled: false,
    description: "Kaksikieliset tekstit",
    style: require("./hsl-gl-map-v9-text-fisv.json"),
    dependencies: ["text"]
  },
  {
    id: "poi",
    enabled: false,
    description: "Joukkoliikenne-POI",
    style: require("./hsl-gl-map-v9-poi.json")
  },
  {
    id: "ticket_sales",
    enabled: false,
    description: "Lipunmyyntipisteet",
    style: require("./hsl-gl-map-v9-ticket-sales.json")
  },
  {
    id: "driver_instructions",
    enabled: false,
    description: "Kuljettajaohjeet",
    style: require("./hsl-gl-map-v9-driver-instructions.json")
  },
  {
    id: "stops",
    enabled: false,
    description: "Pysäkit",
    style: require("./hsl-gl-map-v9-stops.json")
  },
  {
    id: "regular_stops",
    enabled: false,
    description: "Pysäkit ilman lähibusseja",
    style: require("./hsl-gl-map-v9-regular-stops.json")
  },
  {
    id: "citybikes",
    enabled: false,
    description: "Kaupunkipyörät",
    style: require("./hsl-gl-map-v9-citybikes.json")
  },
  {
    id: "print",
    enabled: false,
    description: "Tulostevärit",
    style: require("./hsl-gl-map-v9-print.json")
  },
  {
    id: "jore_terminals",
    enabled: false,
    description: "Tulostevärit",
    style: require("./hsl-gl-map-v9-jore-terminals.json")
  },
  {
    id: "near_bus_routes",
    enabled: false,
    description: "Lähibussi reitit",
    style: require("./hsl-gl-map-v9-near-bus-routes.json")
  },
  {
    id: "near_bus_stops",
    enabled: false,
    description: "Lähibussi pysäkit",
    style: require("./hsl-gl-map-v9-near-bus-stops.json")
  },
  {
    id: "ticket_zones",
    enabled: false,
    description: "Lippyvyöhykkeet",
    style: require("./hsl-gl-map-v9-ticket-zones.json")
  }
];

/**
 * Prepends http:// to relative urls. Returns original string if absolute or protocol-relative url.
 * @param url {string}
 * @returns {string}
 */
function makeAbsoluteUrl(url) {
  var isAbsoluteUrl = new RegExp("^(?:[a-z]+:)?//", "i");
  if (isAbsoluteUrl.test(url)) {
    return url;
  }
  return "http://" + url;
}

/**
 * Creates values that replace the defaults in the base style
 * @param  {Object} options         Received options that are used to create replacements
 * @return {Object}                 Replacement values that are used to modify the base style
 */
function getReplacements(options) {
  var replacements = {};
  if (options.sourcesUrl) {
    var sourcesUrl = makeAbsoluteUrl(options.sourcesUrl);
    replacements.SOURCES_URL = { replacement: sourcesUrl };
  }
  if (options.glyphsUrl) {
    var glyphsUrl = makeAbsoluteUrl(options.glyphsUrl);
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
  var values = merge(replaceableValues, getReplacements(options));
  var replacedStyle = JSON.stringify(style);

  forEach(values, function (value) {
    if (value.replacement) {
      var replaceableRegexp = new RegExp(value.default, "g");
      replacedStyle = replacedStyle.replace(replaceableRegexp, value.replacement);
    }
  });
  return JSON.parse(replacedStyle);
}

function customizer(objValue, srcValue) {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    srcValue.forEach(function(srcElement) {
      // Objects with id properties are layers
      if (isPlainObject(srcElement) && srcElement.id) {
        const destElement = objValue.find(function(objElement) {
          return isPlainObject(objElement) && objElement.id === srcElement.id;
        });
        if (destElement) {
          // Override or add properties to existing layer
          merge(destElement, srcElement);
          return;
        }
        if (!srcElement.ref && (!srcElement.type || !srcElement.paint ||
            (srcElement.type !== "background" && !srcElement.source))) {
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
  var extendedStyle = cloneDeep(style);
  var extendedComponents = cloneDeep(components);

  extendedComponents.forEach(function (component) {
    if (options.components) {
      var componentOptions = options.components[component.id];
      if (componentOptions && componentOptions.enabled !== undefined) {
        component.enabled = !!componentOptions.enabled;
      }
    }
  });

  extendedComponents.forEach(function (component) {
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
    var extendedStyle = extendStyle(BASE_JSON, options || {});
    var replacedStyle = replaceInStyle(extendedStyle, options || {});
    return replacedStyle;
  },
  components: components
};
