const style = require("../index");

module.exports = function() {
  const styleJson = style.generateStyle({
    glyphsUrl: "https://kartat.hsl.fi/",
    components: {
      routes: { enabled: false },
      stops: { enabled: false },
      citybikes: { enabled: false },
      municipal_borders: { enabled: false },
      poi: { enabled: true },
      ticket_sales: { enabled: false },
      driver_instructions: { enabled: false },
      icons: { enabled: false },
      text_fisv: { enabled: false },
    },
  });

  process.stdout.write(JSON.stringify(styleJson, null, 2));
  process.exit(0);
};
