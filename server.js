const fs = require("fs");
const express = require("express");

const index = fs.readFileSync("index.html", "utf8");

const style = require("./index").generateStyle({
  // Urls to replace
  sourcesUrl: "http://localhost:8080/",
  glyphsUrl: "",
  spriteUrl: "",

  queryParams: [
    {
      url: "https://dev-api.digitransit.fi/",
      name: "digitransit-subscription-key",
      value: "my-secret-key",
    },
  ],
  components: {
    // Set each layer you want to include to true
    // Styles
    base: { enabled: true }, // Enabled by default
    municipal_borders: { enabled: false },
    routes: { enabled: false },
    text: { enabled: true }, // Enabled by default
    subway_entrance: { enabled: false },
    poi: { enabled: false },
    park_and_ride: { enabled: false },
    ticket_sales: { enabled: false },
    stops: { enabled: false },
    citybikes: { enabled: false },
    ticket_zones: { enabled: false },
    ticket_zone_labels: { enabled: false },
    // Themes
    text_sv: { enabled: false },
    text_fisv: { enabled: false },
    text_en: { enabled: false },
    regular_routes: { enabled: false },
    near_bus_routes: { enabled: false },
    routes_with_departures_only: { enabled: true }, // Enabled by default. Doesn't do anything until routes is enabled.
    regular_stops: { enabled: false },
    near_bus_stops: { enabled: false },
    print: { enabled: false },
    greyscale: { enabled: false },
    simplified: { enabled: false },
    "3d": { enabled: false },
  },
  // optional property to show only listed routes by jore id
  routeFilter: [],
});

const app = express();

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.get("/index.html", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(index);
});

app.get("/style.json", (req, res) => {
  res.set("Content-Type", "application/json");
  res.send(style);
});

app.listen(3000, () => {
  console.log("Listening at localhost:3000");
});
