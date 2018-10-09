#!/usr/bin/env node
"use strict";

const program = require("commander");
const pkg = require("../package.json");
const { registerCodemods } = require("./utils");

/**
 * Add the version-specific codemods here.
 */
const codemods = {
  v4: ["extendToStyled", "injectGlobalToCreateGlobalStyle"]
};

program.version(pkg.version);

registerCodemods(codemods, program);

// must be before .parse() since node's emit() is immediate
program.on("--help", function() {
  console.log("");
  console.log("Examples:");
  console.log("");
  console.log(
    "  $ styled-components-codemods v4-extendToStyled src/components/Box.js src/components/Button.js"
  );
  console.log(
    "  $ styled-components-codemods v4 src/**/*.js (this will only work if your terminal expands globs)"
  );
});

program.parse(process.argv);
