var style = require("../index");

module.exports = function () {
  var styleJson = style.generateStyle({
    glyphsUrl: "https://kartat.hsldev.com/",
    components: {
      text_fisv: { enabled: true },
      routes: { enabled: true },
      stops: { enabled: true },
      citybikes: { enabled: true },
      print: { enabled: true },
      municipal_borders: { enabled: true },
      poi: { enabled: true },
      ticket_sales: { enabled: true },
      driver_instructions: { enabled: true }
    }
  });

  process.stdout.write(JSON.stringify(styleJson, null, 2));
  process.exit(0);
};
