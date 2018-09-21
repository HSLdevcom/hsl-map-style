const path = require("path");
const fs = require("fs-extra");
const get = require("lodash/get");
const set = require("lodash/set");
const reduce = require("lodash/reduce");
const merge = require("lodash/merge");
const layerToFile = require("./fileMappings");

const FILENAME_PREFIX = "hsl-gl-map-v9-";

module.exports = async function(file, dir) {
  const filePath = path.resolve(process.cwd(), file);
  const outputPath = path.resolve(process.cwd(), dir);

  const writeFile = async (name, content) => {
    await fs.writeJson(path.resolve(outputPath, FILENAME_PREFIX + name), content, {
      spaces: 2,
    });
  };

  await fs.mkdirp(outputPath);

  const styleJson = await fs.readJson(filePath);
  const mapboxGroups = get(styleJson, "metadata.mapbox:groups", {});
  const sources = get(styleJson, "sources", {});
  const layers = get(styleJson, "layers", []);

  console.log("Resetting style wrapper...");

  // Reset these to empty things
  set(styleJson, "metadata.mapbox-groups", {});
  set(styleJson, "sources", {});
  set(styleJson, "layers", []);

  console.log("Writing style wrapper...");

  await writeFile("style.json", styleJson);

  console.log("Splitting layers...");

  // Determine which layers go into which files.
  const layerGroups = reduce(
    layers,
    (groups, layer) => {
      const fileGroup = layerToFile(layer);

      if (!(fileGroup in groups)) {
        set(groups, fileGroup, []);
      }

      groups[fileGroup].push(layer);
      return groups;
    },
    {}
  );

  // Create the json structure that will be written into the file
  const fileGroups = reduce(
    layerGroups,
    (files, groupLayers, groupName) => {
      const container = {
        layers: groupLayers,
      };

      groupLayers.forEach((layer) => {
        const source = get(layer, "source");
        const mapboxGroup = get(layer, "metadata.mapbox:group", "");

        if (source) {
          merge(container, {
            sources: { [source]: sources[source] },
          });
        }

        if (mapboxGroup) {
          merge(container, {
            metadata: {
              "mapbox:groups": { [mapboxGroup]: mapboxGroups[mapboxGroup] },
            },
          });
        }
      });

      files.push({ name: groupName, content: container });
      return files;
    },
    []
  );

  const writePromises = fileGroups.map((styleFile) => {
    console.log("Writing file %s", styleFile.name);
    return writeFile(`${styleFile.name}.json`, styleFile.content);
  });

  await Promise.all(writePromises);

  process.exit(0);
};
