const some = require("lodash/some");
const reduce = require("lodash/reduce");
const get = require("lodash/get");

const select = (values, value) => some(values, (val) => val === value);
const inGroups = (values, value) => some(values, (val) => value.startsWith(val));

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
  base: (value) => {
    const names = ["background", "admin_country"];
    const groups = [
      "landuse",
      "water",
      "aeroway",
      "building",
      "road",
      "tunnel",
      "bridge",
    ];
    if (inGroups(groups, value)) {
      return true;
    }
    return select(names, value);
  },
  "municipal-borders": ["municipal_border"],
  routes: (value) => inGroups(["route"], value),
  stops: (value) => inGroups(["stops"], value),
  "ticket-zones": (value) => inGroups(["ticket-zones"], value),
  text: (value) => inGroups(["label"], value),
  "subway-entrance": (value) => inGroups(["subway-entrance"], value),
  icon: (value) => inGroups(["icon"], value),
  "park-and-ride": (value) => inGroups(["park-and-ride"], value),
  "ticket-sales": (value) => inGroups(["ticket-sales"], value),
  citybikes: (value) => inGroups(["citybike"], value),
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
