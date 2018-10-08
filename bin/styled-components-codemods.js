#!/usr/bin/env node
"use strict";

const path = require("path");
const program = require("commander");
const { spawnSync } = require("child_process");
const { curry } = require("lodash");
const pkg = require("../package.json");

/**
 * Add the version-specific codemods here.
 */
const codemods = {
  v4: ["extendToStyled", "injectGlobalToCreateGlobalStyle"]
};

const runCodemod = curry((version, files, mod) => {
  if (typeof files !== "string" && !Array.isArray(files)) {
    throw new Error("doh!");
  }

  if (!Array.isArray(files)) {
    files = [files];
  }

  console.log(`Running codemod ${version} ${mod}`);

  spawnSync(
    path.resolve(path.join(__dirname, "../node_modules/.bin/codemod")),
    [
      "--plugin",
      path.resolve(path.join(__dirname, "..", "src", version, `${mod}.js`)),
      ...files
    ]
  );
});

program.version(pkg.version);

const runCodemods = curry((version, mods, files) => {
  mods.forEach(runCodemod(version, files));
});

const registerCodemods = curry((mods, program) => {
  Object.keys(mods).forEach(version => {
    program
      .command(version)
      .description(`Run all ${version} codemods`)
      .action(runCodemods(version, mods[version]));

    mods[version].forEach(mod => {
      program
        .command(`${version}-${mod}`)
        .description(`Run just the ${mod} command`)
        .action(files => runCodemod(version, files, mod));
    });
  });
});

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
