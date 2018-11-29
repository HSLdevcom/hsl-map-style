const program = require("commander");
const split = require("./split");
const render = require("./render");
const reorder = require("./reorder");
const extract_difference = require("./extract_difference");

module.exports = function() {
  program.version("1.0.0");

  program
    .command("split <file> <dir>")
    .description(
      "Split a style json file into distinct parts. Splits file into partials and writes them into dir. Dir will be created if it doesn't exist."
    )
    .action(split);

  program
    .command("render")
    .description(
      "Render a complete style.json from parts. Toggle partials in cli/render.js."
    )
    .action(render);

  program
    .command("matchorder <fileA> <fileB>")
    .description(
      "Match layer order between different style files. Rewrites fileA to have its layers in the same order as fileB."
    )
    .action(reorder);

  program
    .command("extract-diff <fileA> <fileB>")
    .description(
      "Move layers out from fileA that don't exist in fileB. Modifies fileA."
    )
    .action(extract_difference);

  program.parse(process.argv);
};
