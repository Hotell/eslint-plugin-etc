/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-etc
 */

import { stripIndent } from "common-tags";
import rule = require("../../source/rules/no-missing-dollar-expect");
import { ruleTester } from "../utils";

ruleTester({ types: true }).run("no-missing-dollar-expect", rule, {
  valid: [
    {
      code: stripIndent`
        const a = "a"; // $ExpectType string
        const b: number = "b"; // $ExpectError
      `
    }
  ],
  invalid: [
    {
      code: stripIndent`
        const a = "a"; // ExpectType string
        const b: number = "b"; // ExpectError
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 1,
          column: 16,
          endLine: 1,
          endColumn: 29
        },
        {
          messageId: "forbidden",
          line: 2,
          column: 24,
          endLine: 2,
          endColumn: 38
        }
      ]
    }
  ]
});
