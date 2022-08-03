import { processColor, stringifyColor } from "./processColor";

const stringifyReplaceRootNode = (node: RootNode): string => {
  const replacementStrings = Object.entries(node.colors).map(
    ([key, node]) => [key, stringifyColor(processColor(node))] as const
  );
  const safeKeys = new Array(replacementStrings.length).fill(0).map(() =>
    new Array(20)
      .fill(0)
      .map(() => Math.random().toString(36)[2])
      .join("")
  );
  const safeTemplate = Object.keys(node.colors).reduce(
    (template, string, index) => template.replaceAll(string, safeKeys[index]),
    node.text
  );
  const result = replacementStrings
    .map(([key, text], index) => [safeKeys[index], text])
    .reduce(
      (template, [key, text]) => template.replaceAll(key, text),
      safeTemplate
    );
  return result;
};

export const parseColor = (
  input: string,
  parserFunction: (input: string) => any
) => {
  const ast: Color = parserFunction(input);

  return processColor(ast);
};

export const parseColorRoot = (
  input: string,
  parserFunction: (input: string) => any
) => {
  const ast: RootNode = parserFunction(input);

  const colors = Object.entries(ast.colors).map(
    ([key, value]) => [key, processColor(value)] as const
  );

  let resultString = colors.reduce((result, [name, color]) => {
    return result.replaceAll(name, stringifyColor(color));
  }, ast.text);

  return resultString;
};

export type Color =
  | RgbColor
  | HslColor
  | MixColor
  | ShadeColor
  | AlphaColor
  | LighterColor
  | DarkerColor
  | DefinedColor
  | CurrentColor
  | NamedColor
  | InheritColor;
export type RgbColor = {
  type: "rgb";
  red: string;
  green: string;
  blue: string;
  alpha: string;
};
export type HslColor = {
  type: "hsl";
  hue: string;
  saturation: string;
  lightness: string;
  alpha: string;
};
export type MixColor = { type: "mix"; a: Color; b: Color; factor: string };
export type ShadeColor = { type: "shade"; color: Color; factor: string };
export type AlphaColor = { type: "alpha"; color: Color; factor: string };
export type LighterColor = { type: "lighter"; color: Color };
export type DarkerColor = { type: "darker"; color: Color };
export type DefinedColor = { type: "defined"; name: string };
export type CurrentColor = { type: "current" };
export type InheritColor = { type: "inherit" };
export type NamedColor = { type: "named"; name: string };
export type RootNode = {
  type: "root";
  text: string;
  colors: Record<string, Color>;
};
