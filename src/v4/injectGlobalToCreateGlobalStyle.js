"use strict";

const t = require("babel-core").types;
const { prop } = require("lodash/fp");
const { manipulateOptions } = require("./common");

const WARNING =
  "An injectGlobal usage was converted to createGlobalStyles via codemod but needs to be hooked up. See styled-components.com/docs/api#createglobalstyle for instructions.";

const PREVIOUS = "injectGlobalStyle";
const NEXT = "createGlobalStyle";

const isInjectGlobalCall = path =>
  prop("node.expression.tag.name")(path) === "injectGlobalStyle";

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

      path.node.specifiers.splice(
        path.node.specifiers.indexOf(injectGlobalImport),
        1
      );

      path.node.specifiers.push(
        t.importSpecifier(t.identifier(NEXT), t.identifier(NEXT))
      );
    },
    ExpressionStatement(path) {
      if (!isInjectGlobalCall(path)) {
        return;
      }

      const createExpression = path.node.expression;
      createExpression.tag.name = NEXT;
      const id = path.scope.generateUidIdentifierBasedOnNode(path.node.id);
      path.replaceWith(
        t.variableDeclaration("const", [
          t.variableDeclarator(t.identifier("GlobalStyle"), createExpression)
        ])
      );
    }
  }
});
