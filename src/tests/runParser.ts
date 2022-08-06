import peggy from "peggy";
import fs from "fs";
import path from "path";
import { parseColor, parseColorRoot } from "../parseColor";

const grammar = fs.readFileSync(
  path.resolve(__dirname, "../parsers/gtkCssColorParser.peggy"),
  "utf8"
);

const cssColorParser = peggy.generate(grammar, {
  allowedStartRules: ["Color", "Root"],
});

export const runParser = (input: string) =>
  parseColor(input, cssColorParser.parse);

export const runRootParser = (input: string) =>
  parseColorRoot(input, (value: string) =>
    cssColorParser.parse(value, { startRule: "Root" })
  );
