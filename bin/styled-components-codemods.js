#!/usr/bin/env node
'use strict';

const path = require('path');
const program = require('commander');
const { spawn } = require('child_process');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .command('v4 [files...]')
  .action((files) => {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Please provide a list of files to run the codemod on.');
    } 

    console.log('Running v4 codemods...\n')
    const child = spawn(path.resolve(path.join(__dirname, '../node_modules/.bin/codemod')), ['--plugin', path.resolve(path.join(__dirname, '../src/v4/index.js')), ...files])

    child.stdout.on('data', chunk => {
      console.log(chunk.toString())
    })
    // since these are streams, you can pipe them elsewhere
    child.stderr.on('data', chunk => {
      console.error(chunk.toString());
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('Finished running codemods!')
      }
    });
  });

// must be before .parse() since node's emit() is immediate
program.on('--help', function(){
  console.log('')
  console.log('Examples:');
  console.log('  $ styled-components-codemods v4 src/components/Box.js src/components/Button.js');
  console.log('  $ styled-components-codemods v4 src/**/*.js (this will only work if your terminal expands globs)');
});

program.parse(process.argv);
