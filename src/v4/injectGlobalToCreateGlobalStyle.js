"use strict";

const t = require("babel-core").types;
const { prop, set } = require("lodash/fp");
const { manipulateOptions } = require("./common");

const WARNING =
  "An injectGlobal usage was converted to createGlobalStyles via codemod but needs to be hooked up. See styled-components.com/docs/api#createglobalstyle for instructions.";
const PREVIOUS = "injectGlobalStyle";
const NEXT = "createGlobalStyle";
const COMPONENT_ID = t.identifier("GlobalStyle");
const NEXT_ID = t.identifier(NEXT);

const isInjectGlobalCall = path =>
  prop("node.expression.tag.name")(path) === PREVIOUS;

let shouldAddWarning = false;

module.exports = () => ({
  manipulateOptions,
  visitor: {
    Program(path) {
      path.traverse({
        ExpressionStatement(path) {
          if (isInjectGlobalCall(path)) {
            shouldAddWarning = true;
          }
        }
      });

      if (shouldAddWarning) {
        path.node.body.push(
          t.throwStatement(
            t.newExpression(t.identifier("Error"), [t.stringLiteral(WARNING)])
          )
        );
      }
    },
    ImportDeclaration(path) {
      if (prop("node.source.value")(path) !== "styled-components") {
        return;
      }

      const injectGlobalImport = path.node.specifiers.find(specifier => {
        if (t.isImportDefaultSpecifier(specifier)) {
          return false;
        }
        return specifier.imported.name === PREVIOUS;
      });

      if (!injectGlobalImport) {
        return;
      }

      // Remove existing named import
      path.node.specifiers.splice(
        path.node.specifiers.indexOf(injectGlobalImport),
        1
      );

      // Push new one in.
      path.node.specifiers.push(t.importSpecifier(NEXT_ID, NEXT_ID));
    },
    ExpressionStatement(path) {
      if (!isInjectGlobalCall(path)) {
        return;
      }

      const expression = prop("node.expression")(path);

      // Wrap existing TemplateExpression with a Variable Declaration, update its name.
      path.replaceWith(
        t.variableDeclaration("const", [
          t.variableDeclarator(COMPONENT_ID, set("tag.name", NEXT)(expression))
        ])
      );
    }
  }
});
