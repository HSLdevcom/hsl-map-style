const program = require("commander");
const split = require("./split");
const render = require("./render");
const reorder = require("./reorder");
const extract_difference = require("./extract_difference");

module.exports = function() {
  program.version("1.0.0");

  program
    .command("split <file> <dir>")
    .description("Split a style json file into distinct parts.")
    .action(split);

  program
    .command("render")
    .description("Render a complete style.json from parts.")
    .action(render);

  program
    .command("matchorder")
    .description("Match layer order between different style files")
    .action(reorder);

  program
    .command("extract-diff")
    .description(
      "Separate layers from file A that don't exist in file B. Modifies file A."
    )
    .action(extract_difference);

  program.parse(process.argv);
};
