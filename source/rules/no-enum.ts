/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-etc
 */

import { TSESTree as es } from "@typescript-eslint/experimental-utils";
import { getLoc, getParserServices } from "eslint-etc";
import * as ts from "typescript";
import { ruleCreator } from "../utils";

const rule = ruleCreator({
  defaultOptions: [],
  meta: {
    docs: {
      category: "Best Practices",
      description: "Forbids the use of `enum`.",
      recommended: false,
    },
    fixable: null,
    messages: {
      forbidden: "`enum` is forbidden.",
    },
    schema: null,
    type: "problem",
  },
  name: "no-enum",
  create: (context) => ({
    TSEnumDeclaration: (node: es.Node) => {
      const { esTreeNodeToTSNodeMap } = getParserServices(context);
      const enumDeclaration = esTreeNodeToTSNodeMap.get(
        node
      ) as ts.EnumDeclaration;
      context.report({
        messageId: "forbidden",
        loc: getLoc(enumDeclaration.name),
      });
    },
  }),
});

export = rule;
