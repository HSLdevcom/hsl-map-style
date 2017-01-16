var fs = require("fs");
var sortStyle = require("./utils").sortStyle;

var OPTIONS_LANG = { lang: "fi" };
var OPTIONS_LANGS = { lang: ["fi", "sv"] };
var OPTIONS_ADDON_ICONS = { extensions: ["icons"] };
var OPTIONS_ADDON_STOPS = { extensions: ["stops"] };
var OPTIONS_ALL = { lang: ["fi", "sv"], extensions: ["icons", "stops"]};

function generateStyle(options, comparisonFile) {
	var style = require("./index.js").generateStyle(options);
	
	fs.writeFile("test-hsl-gl-map-v9-final.json", JSON.stringify(style), function (err) {
    	if (err) return console.log(err);
    	sortStyle(comparisonFile, "test-sorted-" + comparisonFile);
    	sortStyle("test-hsl-gl-map-v9-final.json", "test-sorted-hsl-gl-map-v9-final.json");
	});
}

generateStyle(OPTIONS_ALL, "hsl-gl-map-with-stops-v9.json");
