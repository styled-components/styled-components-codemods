"use strict";

const pluginTester = require("babel-plugin-tester");
const { injectGlobalToCreateGlobalStyle } = require("..");
const prettier = require("prettier");

const tests = [
  {
    title: "TaggedTemplateExpression case",
    code: `
    import { injectGlobalStyle } from 'styled-components';
    injectGlobalStyle\`\`
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
