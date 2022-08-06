import postcss, { Input } from "postcss";
import plugin from "../index";
import { PluginCreator } from "postcss";

const cleanRaws: PluginCreator<{}> = () => {
  return {
    postcssPlugin: "postcss-plugin-clean-raws",
    Root(root, postcss) {
      root.cleanRaws();
    },
  };
};

cleanRaws.postcss = true;

export const runPostcss = async (input: string, opts: any = {}) => {
  let result = await postcss([cleanRaws(), plugin(opts)]).process(input, {
    from: undefined,
  });
  return result.css;
};

export const format = async (input: string, opts: any = {}) => {
  let result = await postcss([cleanRaws()]).process(input, {
    from: undefined,
  });
  expect(result.warnings()).toHaveLength(0);
  return result.css;
};
