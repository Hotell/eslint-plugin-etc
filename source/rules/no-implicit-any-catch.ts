/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-etc
 */

import {
  AST_NODE_TYPES,
  TSESLint as eslint,
  TSESTree as es,
} from "@typescript-eslint/experimental-utils";
import {
  getTypeServices,
  hasTypeAnnotation,
  isArrowFunctionExpression,
  isFunctionExpression,
  isMemberExpression,
} from "eslint-etc";
import { ruleCreator } from "../utils";

const defaultOptions: {
  allowExplicitAny?: boolean;
}[] = [];

const rule = ruleCreator({
  defaultOptions,
  meta: {
    docs: {
      category: "Best Practices",
      description:
        "Forbids implicit `any` error parameters in promise rejections.",
      recommended: false,
      suggestion: true,
    },
    fixable: "code",
    messages: {
      explicitAny: "Explicit any in promise rejection.",
      implicitAny: "Implicit any in promise rejection.",
      suggestExplicitUnknown:
        "Use `unknown` instead, this will force you to explicitly and safely assert the type is correct.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowExplicitAny: {
            type: "boolean",
          },
        },
        type: "object",
      },
    ],
    type: "suggestion",
  },
  name: "no-implicit-any-catch",
  create: (context, unused: typeof defaultOptions) => {
    const { couldBeType } = getTypeServices(context);
    const [config = {}] = context.options;
    const { allowExplicitAny = false } = config;

    function checkRejectionCallback(callback: es.Node) {
      if (
        !isArrowFunctionExpression(callback) &&
        !isFunctionExpression(callback)
      ) {
        return;
      }
      const [param] = callback.params;
      if (hasTypeAnnotation(param)) {
        const { typeAnnotation } = param;
        const {
          typeAnnotation: { type },
        } = typeAnnotation;
        if (type === AST_NODE_TYPES.TSAnyKeyword && !allowExplicitAny) {
          function fix(fixer: eslint.RuleFixer) {
            return fixer.replaceText(typeAnnotation, ": unknown");
          }
          context.report({
            fix,
            messageId: "explicitAny",
            node: param,
            suggest: [
              {
                messageId: "suggestExplicitUnknown",
                fix,
              },
            ],
          });
        }
      } else {
        function fix(fixer: eslint.RuleFixer) {
          return fixer.insertTextAfter(param, ": unknown");
        }
        context.report({
          fix,
          messageId: "implicitAny",
          node: param,
          suggest: [
            {
              messageId: "suggestExplicitUnknown",
              fix,
            },
          ],
        });
      }
    }

    function isPromiseCall(callExpression: es.CallExpression) {
      const { callee } = callExpression;
      if (!isMemberExpression(callee)) {
        return false;
      }
      return couldBeType(callee.object, "Promise");
    }

    return {
      "CallExpression[callee.property.name='catch']": (
        callExpression: es.CallExpression
      ) => {
        if (!isPromiseCall(callExpression)) {
          return;
        }
        const [arg] = callExpression.arguments;
        if (arg) {
          checkRejectionCallback(arg);
        }
      },
      "CallExpression[callee.property.name='then']": (
        callExpression: es.CallExpression
      ) => {
        if (!isPromiseCall(callExpression)) {
          return;
        }
        const [, arg] = callExpression.arguments;
        if (arg) {
          checkRejectionCallback(arg);
        }
      },
    };
  },
});

export = rule;