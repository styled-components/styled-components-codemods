"use strict";

const pluginTester = require("babel-plugin-tester");
const { injectGlobalToCreateGlobalStyle } = require("..");
const prettier = require("prettier");

const tests = [
  {
    title: "ES Import case",
    code: `
    import { injectGlobal } from 'styled-components';
    injectGlobal\`
      html { color: red; }
    \`;
    `
  },
  {
    title: "CommonJS, Non-destructured",
    code: `
    const styled = require('styled-components');
    styled.injectGlobal\`
      html { color: red; }
    \`;
    `
  },
  {
    title: "CommonJS, Destructured",
    code: `
    const { injectGlobal } = require('styled-components');

    injectGlobal\`
      html { color: red; }
    \`;
    `
  }
];

pluginTester({
  pluginName: "styled-components-v3-to-v4-global-style",
  plugin: injectGlobalToCreateGlobalStyle,
  snapshot: true,
  formatResult: output =>
    prettier.format(output, {
      semi: true,
      singleQuote: true,
      parser: "babylon"
    }),
  tests: [...tests]
});
