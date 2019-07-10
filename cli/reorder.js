const path = require("path");
const fs = require("fs-extra");
const get = require("lodash/get");
const sortBy = require("lodash/sortBy");

module.exports = async function(file, orderFile) {
  const filePath = path.resolve(process.cwd(), file);
  const orderFilePath = path.resolve(process.cwd(), orderFile);

  const fileJson = await fs.readJson(filePath);
  const orderFileJson = await fs.readJson(orderFilePath);

  const layers = get(fileJson, "layers", []);

  if (layers.length === 0) {
    throw new Error("No layers in file!");
  }

  const orderLayers = get(orderFileJson, "layers", []);

  if (orderLayers.length === 0) {
    throw new Error("No layers in order file!");
  }

  const newLayers = sortBy(layers, (layer) =>
    orderLayers.findIndex((ol) => ol.id === layer.id)
  );

  fileJson.layers = newLayers;
  await fs.writeJson(filePath, fileJson, { spaces: 2 });

  process.exit(0);
};
