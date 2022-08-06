import { getColorNames } from "./getColorNames";
import { Declaration, PluginCreator, Rule } from "postcss";
import { runParser, runRootParser } from "./tests/runParser";

const convertRule: PluginCreator<{}> = (opts = {}) => {
  // Work with options here
  return {
    postcssPlugin: "postcss-plugin",
    Root: (root) => {
      const colors: Array<{ name: string; value: string }> = [];
      root.cleanRaws();
      root.walkAtRules("define-color", (atRule) => {
        colors.push({
          name: atRule.params.split(" ")[0],
          value: atRule.params.split(" ").slice(1).join(" "),
        });
        atRule.remove();
      });

      const declarations = colors.flatMap(({ name, value }) => {
        const names = getColorNames(name);
        const values = runParser(value);
        if (values.type !== "rgb") {
          throw new Error("Only RGB colors are supported for now");
        }
        return (
          Object.entries(names) as Array<[keyof typeof names, string]>
        ).map(([key, value]) => {
          return new Declaration({ prop: value, value: "" + values[key] });
        });
      });

      const rule = new Rule({ selector: ":root", nodes: declarations });

      root.append(rule);
    },

    Declaration(decl) {
      const value = decl.value;
      const processedValue = runRootParser(value);
      decl.value = processedValue;
    },
  };
};

convertRule.postcss = true;
export default convertRule;
