var fs = require("fs");
var forEach = require("lodash/forEach");
var merge = require("lodash/merge");
var sortStyle = require("./utils").sortStyle;

var BASE_STYLE = fs.readFileSync("hsl-gl-map-v9.json", "utf8");
var ADDON_STOPS_STYLE = fs.readFileSync("hsl-gl-map-v9-stops-addon.json", "utf8");
var ADDON_ICONS_STYLE = fs.readFileSync("hsl-gl-map-v9-icons-addon.json", "utf8");
var DEFAULT_LANGUAGE = "fi";
var replaceableValues = {
	LABEL_NAME: { default: "{ name }" },
};

function trimLanguage(lang) {
	return lang ===  DEFAULT_LANGUAGE ? "" : "_" + lang;
}

/**
 * Creates values that replaces the defaults in the base style
 * @param  {Object} options 				Received options that are used to create replacements
 * @param  {(String|Array} options.lang 	Language, or array of languages to display on text labels
 * @return {Object}         				Replacement values that are used to modify the base style
 */
function getReplacements(options) {
	var replacements = {}
	if (options.lang) {
		var replacement;
		if (typeof(options.lang) == "string") {
			replacement = "{name" + trimLanguage(options.lang) + "}";
		} else {
			replacement = options.lang.reduce(function(prev, cur, index) {
				var separator = "   ";
				if (index === 0) separator = "";
				return prev + separator + "{name" + trimLanguage(cur) + "}";
			}, "")
		}
		replacements.LABEL_NAME = {
			replacement : replacement,
		};
	}
	return replacements;
}

/**
 * Returns the extension styles that are used to extend the original style
 * @param  {Array} extensions  Received extensions that are used to determine the extension styles
 * @return {Array]}            List of extension styles
 */
function getExtensions(extensions) {
	var exts = [];
	if(extensions.indexOf("stops") !== -1) {
		exts.push(JSON.parse(ADDON_STOPS_STYLE));
	}
	if(extensions.indexOf("icons") !== -1) {
		exts.push(JSON.parse(ADDON_ICONS_STYLE));
	}
	return exts;
}

/**
 * Replaces certain values in the basestyle, based on received options
 * @param  {Object} options Determines what values to replace
 * @return {String}         Modified style
 */
function replaceInStyle(style, options) {
	var values = merge(replaceableValues, getReplacements(options));

	forEach(values, function(value) {
		if (value.replacement) {
			var replaceableRegexp = new RegExp(value.default, "g");
			style = style.replace(replaceableRegexp, value.replacement);
		}
	})
	return style;
}

/**
 * Extends style with certain objects (e.g. layers, sources), based on received options
 * @param  {Object} style   Style that is extended
 * @param  {Object} options Determines what extensions to add
 * @return {Object}         Extended style
 */
function extendStyle(style, options) {
	if(!options.extensions) return style;

	var extensions = getExtensions(options.extensions);
	var extendedStyle = JSON.parse(JSON.stringify(style));
	var extendedLayers = extendedStyle.layers;
	extendedLayers = JSON.parse(JSON.stringify(extendedLayers));
	
	forEach(extensions, function(extension) {
		extendedLayers = extendedLayers.concat(extension.layers);;
		extendedStyle = merge(extendedStyle, extension);
	});
	
	extendedStyle.layers = extendedLayers;

	return extendedStyle;
}


module.exports = {
	/**
	 * Generates a GL Map Style object based on received options
	 * @param  {Object} options Options used to generate the style object
	 * @return {Object}         Generated style object
	 */
	generateStyle: function(options) {
		if (!options) return JSON.parse(BASE_STYLE);
		
		var replacedStyle = replaceInStyle(BASE_STYLE, options);
		var extendedStyle = extendStyle(JSON.parse(replacedStyle), options);
		return extendedStyle;
	}
}
