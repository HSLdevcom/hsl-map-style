var fs = require("fs");
var express = require("express");

var index = fs.readFileSync("index.html", "utf8");

var style = require("./index").generateStyle({
    lang: ["fi", "sv"],
    sourcesUrl: "http://dev-api.digitransit.fi/map/v1/",
    glyphsUrl: "http://kartat.hsl.fi/",
    components: {
        routes: { enabled: true },
        stops: { enabled: true },
        citybikes: { enabled: true },
        icons: { enables: true },
    }
});

var app = express();

app.get("/", function (req, res) {
    res.redirect("/index.html");
});

app.get("/index.html", function (req, res) {
    res.set("Content-Type", "text/html");
    res.send(index);
});

app.get("/style.json", function (req, res) {
    res.set("Content-Type", "application/json");
    res.send(style);
});

app.listen(3000, function () {
    console.log("Listening at localhost:3000");
});