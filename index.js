var fs = require("fs");
var forEach = require("lodash/forEach");
var merge = require("lodash/merge");
var baseStyle = fs.readFileSync("hsl-gl-map-v9.json", "utf8");

var DEFAULT_LANGUAGE = "fi";

var replaceableValues = {
	LABEL_NAME: { default: "{name}" },
};

function trimLanguage(lang) {
	return lang ===  DEFAULT_LANGUAGE ? "" : "_" + lang;
}

/**
 * Creates values that replaces the defaults in the hsl-gl-map style
 * @param  {Object} options 				Received options that are used to create replacements
 * @param  {(String|string[]} options.lang 	Language, or array of languages to use on text labels
 * @return {Object}         				Replacement values that are used to modify the hsl-gl-map style
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

module.exports = function(options) {
	var styleString = JSON.stringify(baseStyle);
	var values = merge(replaceableValues, getReplacements(options));

	forEach(values, function(value) {
		if (value.replacement) {
			var replaceableRegexp = new RegExp(value.default, "g");
			styleString = styleString.replace(replaceableRegexp, value.replacement);
		}
	})

	fs.writeFile("hsl-gl-map-v9-final.json", JSON.parse(styleString), function (err) {
    	if (err) return console.log(err);
	});

}