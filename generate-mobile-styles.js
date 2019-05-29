var fs = require("fs");
var index = require("./index");

var fontAddress = "https://static.hsl.fi/mapfonts/";
var output = "./out";
var style;

if (!fs.existsSync(output)) {
  fs.mkdirSync(output);
}

style = index.generateStyle({
  glyphsUrl: fontAddress,
  components: {
    text: { enabled: true },
    otp_stops: { enabled: true },
    otp_stations: { enabled: true },
    citybikes: { enabled: true }
  }
});

fs.writeFile(output + "/hsl-map-style-with-stations.json", JSON.stringify(style), function generateFiStops(err) {
  if (err) {
    // eslint-disable-next-line
    console.log(err);
  }
  return 0;
});

style = index.generateStyle({
  glyphsUrl: fontAddress,
  components: {
    text: { enabled: true },
    text_sv: { enabled: true },
    otp_stops: { enabled: true },
    otp_stations: { enabled: true },
    citybikes: { enabled: true }
  }
});

fs.writeFile(output + "/hsl-map-style-with-stations-swedish.json", JSON.stringify(style), function generateFiStops(err) {
  if (err) {
    // eslint-disable-next-line
    console.log(err);
  }
  return 0;
});

style = index.generateStyle({
  glyphsUrl: fontAddress,
  components: {
    text: { enabled: true },
    otp_stops: { enabled: true },
    otp_stations: { enabled: true },
    citybikes: { enabled: false }
  }
});

fs.writeFile(output + "/hsl-map-style-bike-stations-hidden-with-stations.json", JSON.stringify(style), function generateFiStops(err) {
  if (err) {
    // eslint-disable-next-line
    console.log(err);
  }
  return 0;
});

style = index.generateStyle({
  glyphsUrl: fontAddress,
  components: {
    text: { enabled: true },
    text_sv: { enabled: true },
    otp_stops: { enabled: true },
    otp_stations: { enabled: true },
    citybikes: { enabled: false }
  }
});

fs.writeFile(output + "/hsl-map-style-bike-stations-hidden-with-stations-swedish.json", JSON.stringify(style), function generateFiStops(err) {
  if (err) {
    // eslint-disable-next-line
    console.log(err);
  }
  return 0;
});

style = index.generateStyle({
  glyphsUrl: fontAddress,
  components: {
    text: { enabled: true }
  }
});

fs.writeFile(output + "/hsl-map-style-without-stops.json", JSON.stringify(style), function generateFiStops(err) {
  if (err) {
    // eslint-disable-next-line
    console.log(err);
  }
  return 0;
});


style = index.generateStyle({
  glyphsUrl: fontAddress,
  components: {
    text: { enabled: true },
    text_sv: { enabled: true }
  }
});

fs.writeFile(output + "/hsl-map-style-without-stops-swedish.json", JSON.stringify(style), function generateFiStops(err) {
  if (err) {
    // eslint-disable-next-line
    console.log(err);
  }
  return 0;
});
