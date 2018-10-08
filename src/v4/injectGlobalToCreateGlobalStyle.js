"use strict";

const t = require("babel-core").types;
const { prop, set, has, flow, findIndex } = require("lodash/fp");
const { manipulateOptions } = require("./common");

const WARNING =
  "An injectGlobal usage was converted to createGlobalStyles via codemod but needs to be hooked up. See https://www.styled-components.com/docs/api#createglobalstyle for instructions.";
const PREVIOUS = "injectGlobal";
const NEXT = "createGlobalStyle";
const COMPONENT_ID = t.identifier("GlobalStyle");
const NEXT_ID = t.identifier(NEXT);
const EXPRESSION = "node.expression";

const paths = {
  global: "node.expression.tag.name",
  obj: "node.expression.tag.property.name"
};

const isInjectGlobalCall = path =>
  prop(paths.global)(path) === PREVIOUS || prop(paths.obj)(path) === PREVIOUS;
const isInjectGlobalProp = property =>
  property.shorthand === true && property.key.name === "injectGlobal";

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

      const target = has(paths.obj)(path) ? paths.obj : paths.global;
      const renamed = set(target.replace(`${EXPRESSION}.`, ""), NEXT)(
        prop(EXPRESSION)(path)
      );

      // Wrap existing TemplateExpression with a Variable Declaration, update its name.
      path.replaceWith(
        t.variableDeclaration("const", [
          t.variableDeclarator(COMPONENT_ID, renamed)
        ])
      );
    },
    // For rewriting destructured require call.
    VariableDeclarator(path) {
      // We don't care about non-function calls
      if (!t.isCallExpression(path.node.init)) {
        return;
      }
      // If we're requiring styled-components, carry on.
      const firstArg = prop("node.init.arguments[0]")(path);
      const isRequire = prop("node.init.callee.name")(path) === "require";

      if (firstArg.value !== "styled-components" && isRequire) {
        return;
      }

      // Find index for later use (splicing, yuck).
      const injectGlobalPropIndex = findIndex(isInjectGlobalProp)(
        path.node.id.properties
      );

      if (injectGlobalPropIndex === -1) {
        return;
      }

      const injectGlobalProp = path.node.id.properties[injectGlobalPropIndex];

      // Update key & value. Because it's marked as shorthand it'll be joined correctly.
      const createGlobalStyleProp = flow(
        set("key.name", NEXT),
        set("value.name", NEXT)
      )(injectGlobalProp);

      // Unsafe: mutates current scope.
      path.node.id.properties.splice(injectGlobalPropIndex, 1);
      path.node.id.properties.push(createGlobalStyleProp);
    }
  }
});
