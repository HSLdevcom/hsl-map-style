var fs = require("fs");
var sortStyle = require("./utils").sortStyle;

var OPTIONS_LANG = { lang: "fi" };
var OPTIONS_HSL = {
	sourcesUrl: "hsl-map-server:8080/",
	glyphsUrl: "file://" + process.env.WORK + "/node_modules/hsl-map-style/",
	lang: "fi",
	extensions: ["icons"],
};

var OPTIONS_LANGS = { lang: ["fi", "sv"] };
var OPTIONS_ICONS = { extensions: ["icons"] };
var OPTIONS_STOPS = { extensions: ["stops"] };
var OPTIONS_ALL = { extensions: ["icons", "stops"] };
var OPTIONS_FULL = { lang: ["fi", "sv"], extensions: ["icons", "stops"]};

function generateStyle(options, comparisonFile) {
	var style = require("./index.js").generateStyle(options);
	
	fs.writeFile("test-hsl-gl-map-v9-final.json", JSON.stringify(style), function (err) {
    	if (err) return console.log(err);
    	sortStyle(comparisonFile, "test-sorted-" + comparisonFile);
    	sortStyle("test-hsl-gl-map-v9-final.json", "test-sorted-hsl-gl-map-v9-final.json");
	});

	fs.writeFileSync("test-" + comparisonFile, fs.readFileSync(comparisonFile, "utf8"));
}

generateStyle(OPTIONS_HSL, "hsl-gl-map-v9.json");
