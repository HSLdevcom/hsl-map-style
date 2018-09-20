var path = require("path");
var fs = require("fs-extra");
var get = require("lodash/get");
var set = require("lodash/set");
var reduce = require("lodash/reduce");
var find = require("lodash/find");
var merge = require("lodash/merge");

var FILENAME_PREFIX = "hsl-gl-map-v9-";

var manualLayerGroups = {
  base: [
    "building",
    "facilities",
    "hubs",
    "landuse",
    "landuse_overlay",
    "road",
    "water",
    "waterway"
  ],
  text: [
    "airport_label",
    "country_label",
    "housenum_label",
    "place_label",
    "poi_label",
    "rail_station_label",
    "road_label",
    "water_label"
  ]
};

module.exports = function (file, dir) {
  var filePath = path.resolve(process.cwd(), file);
  var outputPath = path.resolve(process.cwd(), dir);

  fs.mkdirpSync(outputPath);

  var styleJson = fs.readJsonSync(filePath);
  var mapboxGroups = get(styleJson, "metadata.mapbox:groups", {});
  var layers = get(styleJson, "layers", []);

  console.log("Resetting style wrapper...");

  // Reset these to empty things
  set(styleJson, "metadata.mapbox-groups", {});
  set(styleJson, "layers", []);

  console.log("Writing style wrapper...");

  fs.writeJsonSync(path.resolve(outputPath, FILENAME_PREFIX + "style.json"), styleJson, { spaces: 2 });

  console.log("Splitting layers...");

  var layerGroups = reduce(layers, function (groups, layer) {
    var sourceLayer = get(layer, "source-layer", "base");
    var fileGroup = reduce(manualLayerGroups, function (groupName, layerNames, layerGroupName) {
      var isInGroup = find(layerNames, function (layerName) {
        return layerName === sourceLayer;
      });

      if (typeof isInGroup !== "undefined") {
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
      var mapboxGroup = get(layer, "metadata.mapbox:group", "");
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
