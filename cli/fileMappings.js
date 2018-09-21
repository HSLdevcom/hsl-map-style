const some = require("lodash/some");
const reduce = require("lodash/reduce");
const get = require("lodash/get");

const select = (values, value) => some(values, (val) => val === value);

const fileMappers = {
  base(value) {
    const names = [
      "background",
      "building",
      "facilities",
      "hubs",
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
  text(value) {
    return /label/.test(value);
  },
  "driver-instructions": function(value) {
    const names = ["poi_bajamaja", "poi_taukotila"];
    return select(names, value);
  },
  "ticket-sales": function(value) {
    const names = [
      "poi_label_service-point",
      "poi_label_ticket-machine-parking",
      "poi_label_ticket-machine",
      "poi_label_tickets-sales-point",
    ];

    return select(names, value);
  },
  citybikes(value) {
    const names = ["stations", "Stops_citybikes"];
    return select(names, value);
  },
};

function layerToFile(layer) {
  const sourceLayer = get(layer, "source-layer", "base");
  const layerId = get(layer, "id", "base");

  return reduce(
    fileMappers,
    (groupName, match, layerGroupName) => {
      let isInGroup = [layerId, sourceLayer].some(match);

      if (!isInGroup) {
        isInGroup = match(layerId);
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
