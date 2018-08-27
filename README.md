# styled-components-v3-to-v4-codemod

[![npm version](https://badge.fury.io/js/styled-components-v3-to-v4-codemod.svg)](https://badge.fury.io/js/styled-components-v3-to-v4-codemod)

Codemod to for `styled-components` to migrate from `v3`to `v4`.

In version 4 of `styled-components` the `.extends` API will be removed.
This codemod helps replace all of `.extends` usages to equivalent
with `styled()` call instead.
Also imports will be added if `styled` import is not present.

Before:
```javascript
StyledComponent.extend``

StyledComponent.extend`color: red;`

StyledComponent.extend({ color: "red" })

StyledComponent.extend

StyledComponent.extend``.extend

StyledComponent.extend({ color: red }).extend

styled.div``.extend``

styled.div`color: red;`.extend`color: blue;`

styled.div({ color: "red"}).extend({ color: "blue"})

StyledComponent.withComponent('div').extend``

StyledComponent.withComponent('div').extend`color: red;`

StyledComponent.withComponent('div').extend()

StyledComponent.withComponent('div').extend({ color: red })

StyledComponent.extend().extend().extend().extend``

StyledComponent.extend``.extend().extend``.extend``
```

After:
```jsx harmony
import styled, { css } from 'styled-components'

styled(StyledComponent)``

styled(StyledComponent)`
  color: red;
`

styled(StyledComponent)({ color: 'red' })

styled(StyledComponent)

styled(styled(StyledComponent)``)

styled(styled(StyledComponent)({ color: red }))

styled(styled.div``)``

styled(
  styled.div`
    color: red;
  `
)`
  color: blue;
`

styled(styled.div({ color: 'red' }))({ color: 'blue' })

styled(StyledComponent.withComponent('div'))``

styled(StyledComponent.withComponent('div'))`
  color: red;
`

styled(StyledComponent.withComponent('div'))()

styled(StyledComponent.withComponent('div'))({ color: red })

styled(styled(styled(styled(StyledComponent)())())())``

styled(styled(styled(styled(StyledComponent)``)())``)``
```

## Usage

Install [babel-codemod](https://github.com/square/babel-codemod) `npm i -g babel-codemod`

Then install in root of your project `npm install styled-components-v3-to-v4-codemod`

Run it like that from `node_modules` hence:

```
codemod --plugin ./node_modules/styled-components-v3-to-v4-codemod/src/index.js ./src
```

Also you may like to pretty print it using `prettier` instead of `recast`

```
codemod --plugin ./node_modules/styled-components-v3-to-v4-codemod/src/index.js ./src --printer prettier
```

Remove `styled-components-v3-to-v4-codemod` from `package.json`

If there is any issues, let me know in the issues tab here at GitHub.

## Limitations

There is no way to distinct from AST whether `.extend` identifier is related to `styled-components`
or any other library/prototype etc. So if you know that there is some
`.extend` function in your project that is not related to `styled-components` be aware
and revert such changes manually diffing your code afterwards.

## Integration with WebStorm/VS Code to do migration file by file

Preconditions:

```
npm i -g babel-core babel-codemod styled-components-v3-to-v4-codemod
```

### WebStorm:

1.  Go to Preferences -> External Tools -> Click plus to add tool.
2.  Config:

```
Name: h to JSX
Program: codemod
Arguments: -p /usr/local/lib/node_modules/styled-components-v3-to-v4-codemod/src/index.js$FilePathRelativeToProjectRoot$
Working directory: $ProjectFileDir$

In advanced settings:
Tick on: Sync file after execution
```

3.  Open file you want to transform
    `Right Click -> External Tools -> h to JSX -> Apply prettier/code formatting -> Enjoy`
4.  For even better experience go to.
    `Preferences -> Keymap -> External Tools -> External Tools -> h to JSX -> Attach some key combination`

### VS Code:

1.  Open command pallete
2.  `>Tasks: Configure Task`
3.  Press Up -> Select: `Task from tasks.json template` (or something like that)
4.  Copy and paste this:

```
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "SC v3 to V4",
            "type": "shell",
            "command": "codemod -p /usr/local/lib/node_modules/styled-components-v3-to-v4-codemod/src/index.js ${file}"
        }
    ]
}
```

5.  Open command pallete and ask it to open `keybindings.json`
6.  Add this:

```
    {
        "key": "cmd+e",
        "command": "workbench.action.tasks.runTask",
        "args": "H to JSX"
    }
```

7.  Open any file and press cmd+e to apply codemod on file.
8.  Or if you don't want to bloat your `keybindings.json` just open Command pallete and type.
    `Run task -> Enter -> Find in the list "H to JSX" -> Enter` (Usually will be on top)
9.  Apply formatting and enjoy
