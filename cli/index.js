const program = require("commander");
const split = require("./split");
const render = require("./render");
const reorder = require("./reorder");

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

  program.parse(process.argv);
};
