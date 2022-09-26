const style = require("../index");

module.exports = () => {
  const styleJson = style.generateStyle({
    sourcesUrl: "https://api.digitransit.fi/",
    queryParams: [
      {
        url: "https://api.digitransit.fi/",
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
      routes_with_departures_only: { enabled: true }, // Enabled by default. Doesn't do anything until routes is enabled
      regular_stops: { enabled: false },
      near_bus_stops: { enabled: false },
      print: { enabled: false },
      greyscale: { enabled: false },
      simplified: { enabled: false },
      "3d": { enabled: false },
      driver_info: { enabled: false },
    },
    routeFilter: [],
    joreDate: null, // defaults to current date in API
  });

  process.stdout.write(JSON.stringify(styleJson, null, 2));
  process.exit(0);
};
