import { stringify } from "postcss";
import { parseColor } from "../parseColor";
import { runParser } from "./runParser";

describe("test parser with normal css color string", () => {
  test("empty string is not valid", async () => {
    expect(() => runParser("")).toThrow();
    expect(() => runParser("calc()")).toThrow();
    expect(() => runParser("rgb()")).toThrow();
  });

  test("basic rgb colors work s", async () => {
    expect(() => runParser("rgb(255,0,0)")).not.toThrow();
  });

  test("basic rgb colors workb", async () => {
    expect(() => runParser("rgb(255,0,0)")).not.toThrow();
  });

  test("parsing a random string throws", async () => {
    expect(() => runParser("dsfasddfsadf")).toThrow();
  });

  test("parsing an invalid hex color throws", async () => {
    expect(() => runParser("#zzzzzz")).toThrow();
    expect(() => runParser("#00")).toThrow();
    expect(() => runParser("#00000")).toThrow();
    expect(() => runParser("#0000000")).toThrow();
    expect(() => runParser("#000000000")).toThrow();
  });

  test("hex notation with 6 letters does not crash", async () => {
    // Normal colors
    expect(runParser("#000000")).toRoughlyEqual({
      type: "rgb",
      red: 0,
      green: 0,
      blue: 0,
      alpha: 1,
    });
  });

  test("hex notation with 8 letters does not crash", async () => {
    expect(runParser("#00000000")).toRoughlyEqual({
      type: "rgb",
      red: 0,
      green: 0,
      blue: 0,
      alpha: 0,
    });
  });

  test("hex notation with 6 letters", async () => {
    expect(runParser("#5fabcd")).toRoughlyEqual({
      type: "rgb",
      red: 95,
      green: 171,
      blue: 205,
      alpha: 1,
    });
  });

  test("rgb works with values", async () => {
    expect(runParser("rgb(95, 171, 205)")).toRoughlyEqual({
      type: "rgb",
      red: 95,
      green: 171,
      blue: 205,
      alpha: 1,
    });
  });

  test("rgba works", async () => {
    expect(runParser("rgba(95, 171, 205, 0.5)")).toRoughlyEqual({
      type: "rgb",
      red: 95,
      green: 171,
      blue: 205,
      alpha: 0.5,
    });
  });

  test("hsl works", async () => {
    // expect(runParser("hsl(360, 100%, 50%)")).toRoughlyEqual({
    //   type: "rgb",
    //   red: 255,
    //   green: 0,
    //   blue: 0,
    //   alpha: 1,
    // });
    expect(runParser("hsl(360, 100%, 50%)")).toRoughlyEqual({
      type: "hsl",
      hue: 360,
      saturation: "100%",
      lightness: "50%",
      alpha: 1,
    });
  });

  test("hsl without commas works", async () => {
    // expect(runParser("hsl(360 100% 50%)")).toRoughlyEqual({
    //   red: 255,
    //   green: 0,
    //   blue: 0,
    //   alpha: 1,
    // });
    expect(runParser("hsl(360 100% 50% )")).toRoughlyEqual({
      type: "hsl",
      hue: 360,
      saturation: "100%",
      lightness: "50%",
      alpha: 1,
    });
  });

  test("hsla works", async () => {
    // expect(runParser("hsla(360 100% 50% / 0.5)")).toRoughlyEqual({
    //   red: 255,
    //   green: 0,
    //   blue: 0,
    //   alpha: 0.5,
    // });
    expect(runParser("hsla(360 100% 50% / 0.5)")).toRoughlyEqual({
      type: "hsl",
      hue: 360,
      saturation: "100%",
      lightness: "50%",
      alpha: 0.5,
    });
  });

  test("rgba with alpha 1 works", async () => {
    expect(runParser("rgba(95, 171, 205, 1)")).toRoughlyEqual({
      type: "rgb",
      red: 95,
      green: 171,
      blue: 205,
      alpha: 1,
    });
  });

  test("rgba with alpha 0.5", async () => {
    expect(runParser("rgba(95, 171, 205, 0.5)")).toRoughlyEqual({
      type: "rgb",
      red: 95,
      green: 171,
      blue: 205,
      alpha: 0.5,
    });
  });

  test("parsing rgb with complex values works", async () => {
    expect(() => runParser("rgb(0, (), 0)")).not.toThrow();
    expect(() => runParser("rgb(0, (4+4), 0)")).not.toThrow();
    expect(() => runParser("rgb(0, (4 + 4), 0)")).not.toThrow();
    expect(() => runParser("rgb(0, calc(4+4), 0)")).not.toThrow();
    expect(() => runParser("rgb(0, randomFunction(), 0)")).not.toThrow();
    expect(() => runParser("rgb(0, randomFunction(4+4), 0)")).not.toThrow();
    expect(() => runParser("rgb(0, randomFunction(4 + 4), 0)")).not.toThrow();
    expect(() => runParser("rgb(0, randomFunction(4,5,6,7), 0)")).not.toThrow();
    expect(() => runParser("rgb(0, randomFunction(4+(4)), 0)")).not.toThrow();
    expect(() => runParser("rgb(0, var(--toast), 0)")).not.toThrow();
  });

  test("parsing rgb with unbalanced complex value throws", async () => {
    expect(() => runParser("rgb(0, ), 0)")).toThrow();
    expect(() => runParser("rgb(0, (, 0)")).toThrow();
    expect(() => runParser("rgb(0, ()), 0)")).toThrow();
    expect(() => runParser("rgb(0, ((), 0)")).toThrow();
    expect(() => runParser("rgb(0, (4+(4), 0)")).toThrow();
    expect(() => runParser("rgb(0, (4+)4), 0)")).toThrow();
    expect(() => runParser('rgb(0, randomFunction("string)"), 0)')).toThrow();
  });

  test("parsing colors works 12", async () => {
    // Value substitution
    expect(runParser("@dark")).toRoughlyEqual({
      type: "rgb",
      red: "var(--dark-r)",
      green: "var(--dark-g)",
      blue: "var(--dark-b)",
      alpha: "var(--dark-a)",
    });
  });
});
