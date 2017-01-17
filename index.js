var fs = require("fs");
var path = require("path");
var forEach = require("lodash/forEach");
var merge = require("lodash/merge");

var BASE_STYLE = fs.readFileSync(path.join(__dirname, "hsl-gl-map-v9-base-style.json"), "utf8");
var ADDON_STOPS_STYLE = fs.readFileSync(path.join(__dirname, "hsl-gl-map-v9-stops-addon.json"), "utf8");
var ADDON_ICONS_STYLE = fs.readFileSync(path.join(__dirname, "hsl-gl-map-v9-icons-addon.json"), "utf8");
var DEFAULT_LANGUAGE = "fi";

var replaceableValues = {
	LABEL_NAME: { default: "{name}" },
};
var layerPlacements = {
	icons: [{
		afterLayerId: "poi_label_harbour",
		layerAmount: 5
	}, {
		afterLayerId: "poi_label_subway-station_entrance",
		layerAmount: 3
	}],
	stops: [{
		afterLayerId: "admin_country",
		layerAmount: 15
	}, {
		afterLayerId: "poi_label_park-and-ride_hub",
		layerAmount: 1
	}, {
		afterLayerId: "poi_label_Aerodrome",
		layerAmount: 2
	}]
}

function trimLanguage(lang) {
	return lang ===  DEFAULT_LANGUAGE ? "" : "_" + lang;
}

function findLayerById(layers, id) {
	for (var i = 0; i < layers.length; i++) {
		if (layers[i].id === id) {
			return i;
		}
	}
	return layers.length

}

/**
 * Creates values that replace the defaults in the base style
 * @param  {Object} options 				Received options that are used to create replacements
 * @param  {String|Array} options.lang 		Language, or array of languages to display on text labels
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
	if(extensions.indexOf("icons") !== -1) {
		exts.push({ name: "icons", style: JSON.parse(ADDON_ICONS_STYLE)});
	}
	if(extensions.indexOf("stops") !== -1) {
		exts.push({ name: "stops", style: JSON.parse(ADDON_STOPS_STYLE)});
	}
	return exts;
}

/**
 * Replaces certain values in the basestyle, based on received options
 * @param  {Object} options 	Determines what values to replace
 * @return {Object}        		Modified style
 */
function replaceInStyle(style, options) {
	var values = merge(replaceableValues, getReplacements(options));
	var replacedStyle = JSON.stringify(style);

	forEach(values, function(value) {
		if (value.replacement) {
			var replaceableRegexp = new RegExp(value.default, "g");
			replacedStyle = replacedStyle.replace(replaceableRegexp, value.replacement);
		}
	})
	return JSON.parse(replacedStyle);
}

/**
 * Extends style with certain objects (e.g. layers, sources), based on received options
 * @param  {Object} style   	Style that is extended
 * @param  {Object} options 	Determines what extensions to add
 * @return {Object}         	Extended style
 */
function extendStyle(style, options) {
	if(!options.extensions) return style;

	var extensions = getExtensions(options.extensions);
	var extendedStyle = JSON.parse(JSON.stringify(style));
	var extendedLayers =  JSON.parse(JSON.stringify(extendedStyle.layers));

	forEach(extensions, function(extension) {
		forEach(layerPlacements, function(placement, placementKey) {
			if(placementKey === extension.name) {
				var start = 0;
				placement.forEach(function (subset) {
					var end = start + subset.layerAmount;
					var index = findLayerById(extendedLayers, subset.afterLayerId);

					extendedLayers = [].concat(extendedLayers.slice(0, index + 1), extension.style.layers.slice(start, end), extendedLayers.slice(index + 1));
					extendedStyle = merge(extendedStyle, extension.style);
					start = end;
				})
			}
		})	
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

		var extendedStyle = extendStyle(JSON.parse(BASE_STYLE), options);
		var replacedStyle = replaceInStyle(extendedStyle, options);

		return replacedStyle;
	}
}
