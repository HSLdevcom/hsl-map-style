var includes = require("lodash/includes");
var forEach = require("lodash/forEach");
var merge = require("lodash/merge");
var mergeWith = require("lodash/mergeWith");
var cloneDeep = require("lodash/cloneDeep");
var isPlainObject = require("lodash/isPlainObject");

var BASE_JSON = require("./hsl-gl-map-v9-style.json");
var DEFAULT_LANGUAGE = "fi";

var replaceableValues = {
  LABEL_NAME: { default: "{name}" },
  SOURCES_URL: { default: "http://api.digitransit.fi/map/v1/" },
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
    id: "icons",
    enabled: false,
    description: "Joukkoliikenne-POI",
    style: require("./hsl-gl-map-v9-icons.json")
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
    id: "citybikes",
    enabled: false,
    description: "Kaupunkipyörät",
    style: require("./hsl-gl-map-v9-citybikes.json")
  },
  {
    id: "print",
    enabled: false,
    description: "Tulostevärit",
    style: require("./hsl-gl-map-v9-print.json"),
    dependencies: ["base"]
  }
];

function trimLanguage(lang) {
  return lang === DEFAULT_LANGUAGE ? "" : "_" + lang;
}

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
 * @param  {String|Array} options.lang     Language, or array of languages to display on text labels
 * @return {Object}                 Replacement values that are used to modify the base style
 */
function getReplacements(options) {
  var replacements = {};
  if (options.lang) {
    var replacement;
    if (typeof options.lang === "string") {
      replacement = "{name" + trimLanguage(options.lang) + "}";
    } else {
      replacement = options.lang.reduce(
        function (prev, cur, index) {
          var separator = "   ";
          if (index === 0) separator = "";
          return prev + separator + "{name" + trimLanguage(cur) + "}";
        },
        ""
      );
    }
    replacements.LABEL_NAME = {
      replacement: replacement
    };
  }
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
      if (isPlainObject(srcElement) && srcElement.id) {
        const destElement = objValue.find(function(objElement) {
          return isPlainObject(objElement) && objElement.id === srcElement.id;
        });
        if (destElement) {
          merge(destElement, srcElement);
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
    if (options.extensions && includes(options.extensions, component.id)) {
      component.enabled = true;
      return;
    }
    if (options.components) {
      var componentOptions = options.components[component.id];
      if (componentOptions && componentOptions.enabled !== undefined) {
        component.enabled = !!componentOptions.enabled;
      }
    }
  });

  extendedComponents.forEach(function (component) {
    var dependenciesEnabled = !component.dependencies || component.dependencies.every(function(id) {
      const dependency = extendedComponents.find(function(element) { return element.id === id; });
      return dependency && dependency.enabled;
    });

    if (component.enabled && dependenciesEnabled) {
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
