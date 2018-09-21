const some = require("lodash/some");
const reduce = require("lodash/reduce");
const get = require("lodash/get");

const select = (values, value) => some(values, (val) => val === value);

/**
 * Map layers to files. FileMappers is a map of file names and the criteria
 * a layer has to fulfill with its id or source-layer property to be included
 * in the file. The criteria can be either a function that returns a boolean
 * to indicate whether or not the layer should be included, or an array of
 * strings that the layer's id or source-layer prop should match.
 *
 * The order is important. Later file matchers override earlier ones. For a
 * layer called "rail_tunnel", and the files "routes" and "base", the layer
 * will be included in the "base" file if both criterias match.
 */

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

      // The matchers will be called with the sourceLayer first, and then the layerId.
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
