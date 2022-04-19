const style = require("../index");

module.exports = () => {
  const styleJson = style.generateStyle({
    glyphsUrl: "https://kartat.hsl.fi/",
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
      regular_routes: { enabled: false },
      near_bus_routes: { enabled: false },
      regular_stops: { enabled: false },
      near_bus_stops: { enabled: false },
      print: { enabled: false },
      greyscale: { enabled: false },
      simplified: { enabled: false },
      "3d": { enabled: false },
    },
  });

  process.stdout.write(JSON.stringify(styleJson, null, 2));
  process.exit(0);
};
