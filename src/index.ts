import { getColorNames } from "./getColorNames";
import { decl, Declaration, PluginCreator, Rule } from "postcss";
import { runParser, runRootParser } from "./tests/runParser";
import { stringifyColor } from "./processColor";

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
      console.log(colors);

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

      // const classes = new Set<string>();

      // try {

      //   const cssFileName = root.source?.input.file;
      //   if (!cssFileName) throw root.error('file source is needed');

      //   buildFile(cssFileName, Array.from(classes));
      // } catch (error) {
      //   throw root.error(error);
      // }
    },
    // AtRule: {
    //   "define-color": atRule => {
    //     console.log("Visited at rule", atRule.name)
    //     atRule.assign({name: "toast"})
    //     // All @media at-rules
    //   }
    // }
    /*
    Root (root, postcss) {
      // Transform CSS AST here
    }
    */

    Declaration(decl, postcss) {
      const value = decl.value;
      const processedValue = runRootParser(value);
      decl.value = processedValue;
    },
  };
};

convertRule.postcss = true;
export default convertRule;
