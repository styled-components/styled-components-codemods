'use strict';

const { spawnSync } = require('child_process');
const glob = require('fast-glob');
const { curry } = require('lodash/fp');
const path = require('path');

const runCodemod = curry((version, files, mod) => {
  const pluginPath = path.resolve(path.join(__dirname, '..', 'src', version, `${mod}.js`));

  spawnSync(path.resolve(path.join(__dirname, '../node_modules/.bin/codemod')), [
    '--plugin',
    pluginPath,
    ...files,
  ]);
});

const runCodemods = (version, mods) => {
  return (...files) => {
    files = glob.sync(files.filter(f => typeof f === 'string'));

    if (typeof files !== 'string' && !Array.isArray(files)) {
      throw new Error('No files provided.');
    }

    console.log(`\nRunning the ${mods.join(', ')} codemods against the following files:\n`);
    console.log(files);

    mods.forEach(runCodemod(version, files));

    console.log('\nDone. Enjoy!\n');
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
