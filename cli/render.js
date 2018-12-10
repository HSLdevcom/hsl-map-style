const style = require("../index");

module.exports = function() {
  const styleJson = style.generateStyle({
    glyphsUrl: "https://kartat.hsldev.com/",
    components: {
      routes: { enabled: false },
      stops: { enabled: false },
      citybikes: { enabled: false },
      municipal_borders: { enabled: false },
      poi: { enabled: false },
      ticket_sales: { enabled: false },
      driver_instructions: { enabled: false },
      icons: { enabled: true },
      text_fisv: { enabled: true },
    },
  });

  process.stdout.write(JSON.stringify(styleJson, null, 2));
  process.exit(0);
};
