import postcss, { Input } from "postcss";
import plugin from "../index";
// @ts-expect-error
import validateCss from "css-validator";
import { promises as fs } from "fs";

import { PluginCreator } from "postcss";
import { getColorNames } from "../getColorNames";

declare global {
  namespace jest {
    interface Matchers<R> {
      toRoughlyEqual(expected: unknown): CustomMatcherResult;
    }
  }
}

expect.extend({
  toRoughlyEqual(received, expected) {
    const numbersToStrings = (obj: unknown): unknown => {
      if (Array.isArray(obj)) {
        return obj.map(numbersToStrings);
      }

      switch (typeof obj) {
        case "object":
          return (
            obj &&
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key,
                numbersToStrings(value),
              ])
            )
          );

        case "number":
          return obj.toFixed(5);

        case "string":
          return !isNaN(+obj) ? (+obj).toFixed(5) : obj;

        default:
          return obj;
      }
    };

    expect(numbersToStrings(received)).toEqual(numbersToStrings(expected));

    return { pass: true, message: () => "passed" };
  },
});
