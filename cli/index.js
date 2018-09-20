var program = require("commander");
var split = require("./split");
var render = require("./render");

module.exports = function () {
  program.version("1.0.0");

  program
    .command("split <file> <dir>")
    .description("Split a style json file into distinct parts.")
    .action(split);

  program
    .command("render")
    .description("Render a complete style.json from parts.")
    .action(render);

  program.parse(process.argv);
};
