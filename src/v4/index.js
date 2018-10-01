"use strict";

const t = require("babel-core").types;
const _ = require("lodash");

let isExtendInScope = false;

module.exports = function() {
  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("asyncGenerators");
      parserOpts.plugins.push("classProperties");
      parserOpts.plugins.push("decorators");
      parserOpts.plugins.push("doExpressions");
      parserOpts.plugins.push("dynamicImport");
      parserOpts.plugins.push("flow");
      parserOpts.plugins.push("functionBind");
      parserOpts.plugins.push("functionSent");
      parserOpts.plugins.push("jsx");
      parserOpts.plugins.push("objectRestSpread");
      parserOpts.plugins.push("exportDefaultFrom");
      parserOpts.plugins.push("exportNamespaceFrom");
    },
    visitor: {
      Program(path) {
        isExtendInScope = false;
        path.traverse({
          Identifier(path) {
            if (path.node.name === "extend") {
              isExtendInScope = true;
            }
          }
        });

        if (!isExtendInScope) {
          return;
        }
        let isStyledComponentsImportInScope = false;
        let isStyledComponentsDefaultImportInScope = false;
        let styledComponentImportNode = null;

        // some for short circuit execution
        path.node.body.some(node => {
          if (t.isImportDeclaration(node)) {
            isStyledComponentsImportInScope =
              node.source.value === "styled-components";
            styledComponentImportNode = isStyledComponentsImportInScope
              ? node
              : false;
            isStyledComponentsDefaultImportInScope = node.specifiers.some(
              it =>
                t.isImportDefaultSpecifier(it) &&
                it.local.name === "styled" &&
                isStyledComponentsImportInScope
            );
            return isStyledComponentsDefaultImportInScope;
          }
          return false;
        });

        const shouldAddStyledImport =
          !isStyledComponentsImportInScope && isExtendInScope;

        const shouldModifyStyledComponentsImport =
          isStyledComponentsImportInScope &&
          !isStyledComponentsDefaultImportInScope &&
          isExtendInScope;

        if (shouldModifyStyledComponentsImport) {
          styledComponentImportNode.specifiers.unshift(
            t.importDefaultSpecifier(t.identifier("styled"))
          );
        } else if (shouldAddStyledImport) {
          path.node.body.unshift(
            t.ImportDeclaration(
              [t.ImportDefaultSpecifier(t.identifier("styled"))],
              t.StringLiteral("styled-components")
            )
          );
        }
      },
      CallExpression(path) {
        if (!isExtendInScope) {
          path.stop();
        }
        if (_.get(path, "node.callee.property.name") === "extend") {
          // We unpack MemberExpression left part "styled.div()" removing extend,
          // then we wrap this expression "styled(styled.div)"
          // but we also need to call it so we wrap it again in anonymous call
          // passing down arguments from .extend call
          const callExpression = t.CallExpression(
            t.CallExpression(t.Identifier("styled"), [path.node.callee.object]),
            path.node.arguments
          );
          path.replaceWith(callExpression);
        }
      },
      TaggedTemplateExpression(path) {
        if (!isExtendInScope) {
          path.stop();
        }
        if (_.get(path, "node.tag.property.name") === "extend") {
          const quasi = path.node.quasi;
          const copyOfTemplateLiteral = t.TemplateLiteral(
            quasi.quasis,
            quasi.expressions
          );
          const callExpression = t.CallExpression(t.Identifier("styled"), [
            path.node.tag.object
          ]);

          const newTemplate = t.TaggedTemplateExpression(
            callExpression,
            copyOfTemplateLiteral
          );
          path.replaceWith(newTemplate);
        }
      },
      MemberExpression(path) {
        if (_.get(path, "node.property.name") === "extend") {
          const callExpression = t.CallExpression(t.Identifier("styled"), [
            path.node.object
          ]);
          path.replaceWith(callExpression);
        }
      }
    }
  };
};
