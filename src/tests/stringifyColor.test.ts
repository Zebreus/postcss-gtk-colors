import { stringify } from "postcss";
import { stringifyColor } from "../processColor";
import { parseColor } from "../parseColor";
import { runParser } from "./runParser";
import { format, runPostcss } from "./runPostcss";

describe("stringifying colors works", () => {
  test("stringifying hex rgb colors works", async () => {
    // Value substitution
    expect(
      stringifyColor({
        type: "rgb",
        red: "2",
        green: "3",
        blue: "4",
        alpha: "1",
      })
    ).toBe("#0203047f");
  });
  test("stringifying hex rgb colors with alpha works", async () => {
    // Value substitution
    expect(
      stringifyColor({
        type: "rgb",
        red: "0",
        green: "255",
        blue: "0",
        alpha: "0.5",
      })
    ).toBe("#00ff007f");
  });
  test("stringifying short hex colors works", async () => {
    // Value substitution
    expect(
      stringifyColor({
        type: "rgb",
        red: "0",
        green: "255",
        blue: "17",
        alpha: "1",
      })
    ).toBe("#0f1");
  });
  test("stringifying short hex rgb colors with alpha works", async () => {
    // Value substitution
    expect(
      stringifyColor({
        type: "rgb",
        red: "0",
        green: "255",
        blue: "0",
        alpha: "0.47",
      })
    ).toBe("#0f07");
  });
  test("stringifying currentcolor works", async () => {
    // Value substitution
    expect(
      stringifyColor({
        type: "current",
      })
    ).toBe("currentColor");
  });
  test("stringifying inherit works", async () => {
    // Value substitution
    expect(
      stringifyColor({
        type: "inherit",
      })
    ).toBe("inherit");
  });

  test("stringifying rgb colors with strings works", async () => {
    // Value substitution
    expect(
      stringifyColor({
        type: "rgb",
        red: "2",
        green: "3",
        blue: "var(--toaster)",
        alpha: "1",
      })
    ).toBe("rgb(2,3,var(--toaster))");
  });
  test("stringifying rgb colors with strings and alpha works", async () => {
    // Value substitution
    expect(
      stringifyColor({
        type: "rgb",
        red: "2",
        green: "3",
        blue: "var(--toaster)",
        alpha: "0.5",
      })
    ).toBe("rgba(2,3,var(--toaster),0.5)");
  });

  test("stringifying hsl colors works", async () => {
    // Value substitution
    expect(
      stringifyColor({
        type: "hsl",
        hue: "2",
        saturation: "100%",
        lightness: "50%",
        alpha: "1",
      })
    ).toBe("hsl(2,100%,50%)");
  });

  test("stringifying hsla colors works", async () => {
    // Value substitution
    expect(
      stringifyColor({
        type: "hsl",
        hue: "2",
        saturation: "100%",
        lightness: "50%",
        alpha: "0.5",
      })
    ).toBe("hsla(2,100%,50%,0.5)");
  });
});
