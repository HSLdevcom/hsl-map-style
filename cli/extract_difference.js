const path = require("path");
const fs = require("fs-extra");
const get = require("lodash/get");
const differenceBy = require("lodash/differenceBy");
const merge = require("lodash/merge");

module.exports = async function(file, compareFile) {
  const filePath = path.resolve(process.cwd(), file);
  const orderFilePath = path.resolve(process.cwd(), compareFile);

  const fileJson = await fs.readJson(filePath);
  const compareFileJson = await fs.readJson(orderFilePath);

  const layers = get(fileJson, "layers", []);

  if (layers.length === 0) {
    throw new Error("No layers in file!");
  }

  const compareLayers = get(compareFileJson, "layers", []);

  if (compareLayers.length === 0) {
    throw new Error("No layers in order file!");
  }

  const diffLayers = differenceBy(layers, compareLayers, "id");

  const diffFilejson = {
    layers: diffLayers,
  };

  diffLayers.forEach((layer) => {
    const source = get(layer, "source");
    const mapboxGroup = get(layer, "metadata.mapbox:group", "");

    if (source) {
      merge(diffFilejson, {
        sources: { [source]: fileJson.sources[source] },
      });
    }

    if (mapboxGroup) {
      merge(diffFilejson, {
        metadata: {
          "mapbox:groups": {
            [mapboxGroup]: fileJson.metadata["mapbox:groups"][mapboxGroup],
          },
        },
      });
    }
  });

  const newLayers = layers.filter((layer) => {
    const isDiff = diffLayers.find((dl) => dl.id === layer.id);
    return !isDiff;
  });

  fileJson.layers = newLayers;

  await fs.writeJson(filePath, fileJson, { spaces: 2 });
  await fs.writeJson(
    path.resolve(path.dirname(filePath), `layerdiff_${path.basename(file)}`),
    diffFilejson,
    { spaces: 2 }
  );

  process.exit(0);
};
