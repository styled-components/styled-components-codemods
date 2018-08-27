const babel = require("babel-core");
const prettier = require("prettier");

const result = babel.transform(`
import styled from 'styled-components'

StyledComponent.extend\`\`

StyledComponent.extend\`color: red;\`

StyledComponent.extend({ color: "red" })

StyledComponent.extend

StyledComponent.extend\`\`.extend

StyledComponent.extend({ color: red }).extend

styled.div\`\`.extend\`\`

styled.div\`color: red;\`.extend\`color: blue;\`

styled.div({ color: "red"}).extend({ color: "blue"})

StyledComponent.withComponent('div').extend\`\`

StyledComponent.withComponent('div').extend\`color: red;\`

StyledComponent.withComponent('div').extend()

StyledComponent.withComponent('div').extend({ color: red })

StyledComponent.extend().extend().extend().extend\`\`

StyledComponent.extend\`\`.extend().extend\`\`.extend\`\`
`, {
  plugins: [["./src/index.js"]]
}).code;

console.log(
  prettier.format(result, { semi: false, singleQuote: true, parser: "babylon" })
);

