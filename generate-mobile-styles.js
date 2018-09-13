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

fs.writeFile(output + "/finnish_with_stops.json", JSON.stringify(style), function generateFiStops(err) {
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

fs.writeFile(output + "/swedish_with_stops.json", JSON.stringify(style), function generateFiStops(err) {
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

fs.writeFile(output + "/finnish_base.json", JSON.stringify(style), function generateFiStops(err) {
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

fs.writeFile(output + "/swedish_base.json", JSON.stringify(style), function generateFiStops(err) {
  if (err) {
    // eslint-disable-next-line
    console.log(err);
  }
  return 0;
});
