var path = require("path");
var fs = require("fs-extra");
var get = require("lodash/get");
var set = require("lodash/set");
var reduce = require("lodash/reduce");
var find = require("lodash/find");
var some = require("lodash/some");
var merge = require("lodash/merge");

var FILENAME_PREFIX = "hsl-gl-map-v9-";

function select(values, value) {
  return some(values, function (val) {
    return val === value;
  });
}

// manually assign layers into files. The order matters -
// the later file group will override the earlier.
var layerFileGroups = {
  base: function (value) {
    var sourceLayers = [
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
      "admin_country"
    ];

    if (/landuse|road|building|tunnel|bridge/.test(value)) {
      return true;
    }

    return select(sourceLayers, value);
  },
  text: function (value) {
    return /label/.test(value);
  },
  "driver-instructions": function (value) {
    var sourceLayers = [
      "poi_bajamaja",
      "poi_taukotila"
    ];

    return select(sourceLayers, value);
  },
  "ticket-sales": function (value) {
    var sourceLayers = [
      "poi_label_service-point",
      "poi_label_ticket-machine-parking",
      "poi_label_ticket-machine",
      "poi_label_tickets-sales-point"
    ];

    return select(sourceLayers, value);
  }
};

module.exports = function (file, dir) {
  var filePath = path.resolve(process.cwd(), file);
  var outputPath = path.resolve(process.cwd(), dir);

  fs.mkdirpSync(outputPath);

  var styleJson = fs.readJsonSync(filePath);
  var mapboxGroups = get(styleJson, "metadata.mapbox:groups", {});
  var sources = get(styleJson, "sources", {});
  var layers = get(styleJson, "layers", []);

  console.log("Resetting style wrapper...");

  // Reset these to empty things
  set(styleJson, "metadata.mapbox-groups", {});
  set(styleJson, "sources", {});
  set(styleJson, "layers", []);

  console.log("Writing style wrapper...");

  fs.writeJsonSync(path.resolve(outputPath, FILENAME_PREFIX + "style.json"), styleJson, { spaces: 2 });

  console.log("Splitting layers...");

  var layerGroups = reduce(layers, function (groups, layer) {
    var layerId = get(layer, "id");
    var sourceLayer = get(layer, "source-layer", "base");

    var fileGroup = reduce(layerFileGroups, function (groupName, match, layerGroupName) {
      var isInGroup = [layerId, sourceLayer].some(match);

      if (!isInGroup) {
        isInGroup = match(layerId);
      }

      if (isInGroup) {
        return layerGroupName;
      }

      return groupName;
    }, sourceLayer);

    if (!(fileGroup in groups)) {
      set(groups, fileGroup, []);
    }

    groups[fileGroup].push(layer);
    return groups;
  }, {});

  var fileGroups = reduce(layerGroups, function (files, groupLayers, groupName) {
    var container = {
      layers: groupLayers
    };

    groupLayers.forEach(function (layer) {
      var source = get(layer, "source");
      var mapboxGroup = get(layer, "metadata.mapbox:group", "");

      if (source) {
        if (!("sources" in container)) {
          container.sources = {};
        }

        set(container.sources, source, get(sources, source, {}));
      }

      if (mapboxGroup) {
        if (!("metadata" in container)) {
          container.metadata = {
            "mapbox:groups": {}
          };
        }

        // Can't use set() here since the mapbox group ID contains a dot.
        var mapboxMeta = {};
        mapboxMeta[mapboxGroup] = mapboxGroups[mapboxGroup];
        merge(container.metadata["mapbox:groups"], mapboxMeta);
      }
    });

    files.push({ name: groupName, content: container });
    return files;
  }, []);

  fileGroups.forEach(function (styleFile) {
    console.log("Writing file %s", styleFile.name);

    fs.writeJsonSync(
      path.resolve(outputPath, FILENAME_PREFIX + styleFile.name + ".json"),
      styleFile.content,
      { spaces: 2 }
    );
  });

  process.exit(0);
};
