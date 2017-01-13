var fs = require("fs");
var sortStyle = require("./utils").sortStyle;

var OPTIONS_LANG = { lang: "fi" };
var OPTIONS_LANGS = { lang: ["fi", "sv"] };
var OPTIONS_ADDON = { extensions: ["icons"] };
var OPTIONS_LANGS_ADDONS = { lang: ["fi", "sv"], extensions: ["icons", "stops"]};

function generateStyle() {
	var style = require("./index.js").generateStyle(OPTIONS_LANGS_ADDONS);
	
	fs.writeFile("test-hsl-gl-map-v9-final.json", JSON.stringify(style), function (err) {
    	if (err) return console.log(err);
    	sortStyle("hsl-gl-map-with-stops-v9.json", "test-sorted-hsl-gl-map-with-stops-v9.json");
    	sortStyle("test-hsl-gl-map-v9-final.json", "test-sorted-hsl-gl-map-v9-final.json");
	});
}

generateStyle();
