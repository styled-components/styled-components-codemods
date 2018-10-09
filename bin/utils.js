"use strict";

const { spawnSync } = require("child_process");
const { curry } = require("lodash/fp");
const path = require("path");

const runCodemod = curry((version, files, mod) => {
  // Account for both splat & single file
  files = files.filter(f => typeof f === "string");

  const pluginPath = path.resolve(
    path.join(__dirname, "..", "src", version, `${mod}.js`)
  );
  console.log(`Running ${mod} at ${pluginPath} on ${files.length} files.`);

  if (typeof files !== "string" && !Array.isArray(files)) {
    throw new Error("No files provided");
  }

  spawnSync(
    path.resolve(path.join(__dirname, "../node_modules/.bin/codemod")),
    ["--plugin", pluginPath, ...files]
  );
  console.log(`Finished running ${mod}`);
});

const runCodemods = (version, mods) => {
  return (...files) => {
    mods.forEach(runCodemod(version, files));
  };
};

exports.registerCodemods = curry((mods, program) => {
  Object.keys(mods).forEach(version => {
    program
      .command(`${version} [...files]`)
      .description(`Run all ${version} codemods`)
      .action(runCodemods(version, mods[version]));

    mods[version].forEach(mod => {
      program
        .command(`${version}-${mod} [...files]`)
        .description(`Run just the ${mod} codemod`)
        .action((...files) => runCodemod(version, files, mod));
    });
  });
});
