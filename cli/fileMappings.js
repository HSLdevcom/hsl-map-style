const some = require("lodash/some");
const reduce = require("lodash/reduce");
const get = require("lodash/get");

const select = (values, value) => some(values, (val) => val === value);

const fileMappers = {
  routes: (value) => /route|subway|rail/.test(value),
  base: (value) => {
    const names = [
      "background",
      "building",
      "facilities",
      "road",
      "water",
      "waterway",
      "waterway_case",
      "aeroway",
      "aeroway_taxiway",
      "admin_country",
    ];

    if (/landuse|road|building|tunnel|bridge/.test(value)) {
      return true;
    }

    return select(names, value);
  },
  text: (value) => /label/.test(value),
  stops: ["stops", "Stops_hub"],
  poi: [
    "poi_label_park-and-ride_hub",
    "poi_label_subway-station",
    "poi_label_bus-station",
    "poi_label_railway-station",
    "poi_label_Aerodrome",
  ],
  "driver-instructions": ["poi_bajamaja", "poi_taukotila"],
  "ticket-sales": [
    "poi_label_service-point",
    "poi_label_ticket-machine-parking",
    "poi_label_ticket-machine",
    "poi_label_tickets-sales-point",
  ],
  citybikes: ["stations", "Stops_citybikes"],
  "municipal-borders": ["municipal_border"],
};

function layerToFile(layer) {
  const sourceLayer = get(layer, "source-layer", "base");
  const layerId = get(layer, "id", "base");

  return reduce(
    fileMappers,
    (groupName, match, layerGroupName) => {
      const matchToGroup = (val) => {
        if (typeof match === "function") {
          return match(val);
        }
        if (Array.isArray(match)) {
          return select(match, val);
        }

        return false;
      };

      let isInGroup = matchToGroup(sourceLayer);

      if (!isInGroup) {
        isInGroup = matchToGroup(layerId);
      }

      if (isInGroup) {
        return layerGroupName;
      }

      return groupName;
    },
    sourceLayer
  );
}

module.exports = layerToFile;
