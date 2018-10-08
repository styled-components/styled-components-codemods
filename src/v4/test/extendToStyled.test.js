"use strict";

const pluginTester = require("babel-plugin-tester");
const extendToStyled = require("../extendToStyled");
const prettier = require("prettier");

const tests = [
  {
    title: "TaggedTemplateExpression case",
    code: `
    StyledComponent.extend\`\`
    
    StyledComponent.extend\`color: red;\`
    `
  },
  {
    title: "CallExpression case",
    code: `
    StyledComponent.extend({ color: "red" })
    `
  },
  {
    title: "MemberExpression case",
    code: `
    StyledComponent.extend
    
    StyledComponent.extend\`\`.extend
    
    StyledComponent.extend({ color: red }).extend
    
    StyledComponent.withComponent('div').extend
    `
  },
  {
    title: "Chaining cases regular",
    code: `
    styled.div\`\`.extend\`\`
    
    styled.div\`color: red;\`.extend\`color: blue;\`
    
    styled.div({ color: "red"}).extend({ color: "blue"})
    `
  },
  {
    title: "Chaining cases withComponent",
    code: `
    StyledComponent.withComponent('div').extend\`\`
    
    StyledComponent.withComponent('div').extend\`color: red;\`
    
    StyledComponent.withComponent('div').extend()
    
    StyledComponent.withComponent('div').extend({ color: red })
    `
  },
  {
    title: "Crazy stupid chaining",
    code: `
    StyledComponent.extend().extend().extend().extend\`\`
    
    StyledComponent.extend\`\`.extend().extend\`\`.extend\`\`
    `
  },
  {
    title: "Adds styled function import if extend is present",
    code: `
    StyledComponent.extend\`\`
    `
  },
  {
    title: "Adds styled function to existing styled-components import",
    code: `
    import { css } from 'styled-components'    
    StyledComponent.extend\`\`
    `
  },
  {
    title: "Ignores adding styled import if extend function is not present",
    code: `
    foo()
    `
  },
  {
    title:
      "Ignores adding another import if extend function is present and styled import is present",
    code: `
    import styled from 'styled-components'
    StyledComponent.extend\`\`
    `
  },
  {
    title:
      "Ignores adding styled default import if extend function is not present but styled-component import is",
    code: `
    import { css } from 'styled-components'
    foo()
    `
  },
  {
    title:
      "Ignores adding styled function to existing styled-components import with styled default and { css } named import",
    code: `
    import styled, { css } from 'styled-components'    
    StyledComponent.extend\`\`
    `
  }
];

pluginTester({
  pluginName: "styled-components-v3-to-v4-styled",
  plugin: extendToStyled,
  snapshot: true,
  formatResult: output =>
    prettier.format(output, {
      semi: true,
      singleQuote: true,
      parser: "babylon"
    }),
  tests: [...tests]
});
