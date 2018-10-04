"use strict";

exports.manipulateOptions = function manipulateOptions(_, parserOpts) {
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
};
