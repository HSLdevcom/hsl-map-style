var path = require("path");
var mkdirp = require("mkdirp");

module.exports = function (file, dir) {
  var filePath = path.resolve(process.cwd(), file);
  var outputPath = path.resolve(process.cwd(), dir);

  mkdirp(outputPath);

  console.log(filePath, outputPath);
};
