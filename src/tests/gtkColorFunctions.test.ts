import { parseCalc } from "parseCalc";
import { parseColor } from "../parseColor";
import { gtkAlpha } from "../processColor";
import { runParser } from "./runParser";

describe("test alpha function", () => {
  test("alpha with one does not change color", async () => {
    expect(runParser("alpha(rgb(20,50,90), 1)")).toRoughlyEqual({
      type: "rgb",
      red: 20,
      green: 50,
      blue: 90,
      alpha: 1,
    });
    expect(runParser("alpha(hsl(20,50%,90%), 1)")).toRoughlyEqual({
      type: "hsl",
      hue: "20",
      saturation: "50%",
      lightness: "90%",
      alpha: "1",
    });
  });

  test("alpha does adjust the alpha value", async () => {
    expect(runParser("alpha(rgb(20,50,90), 0.5)")).toRoughlyEqual({
      type: "rgb",
      red: 20,
      green: 50,
      blue: 90,
      alpha: 0.5,
    });
    expect(runParser("alpha(rgba(20,50,90,0.5), 0.5)")).toRoughlyEqual({
      type: "rgb",
      red: 20,
      green: 50,
      blue: 90,
      alpha: 0.25,
    });
  });

  test("alpha does not produce invalid alpha values", async () => {
    expect(runParser("alpha(rgb(20,50,90), -1)")).toRoughlyEqual({
      type: "rgb",
      red: 20,
      green: 50,
      blue: 90,
      alpha: 0,
    });
    expect(runParser("alpha(rgba(20,50,90,0.5), 5)")).toRoughlyEqual({
      type: "rgb",
      red: 20,
      green: 50,
      blue: 90,
      alpha: 1,
    });
  });

  test("alpha throws on invalid factors", async () => {
    expect(() => runParser("alpha(rgb(20,50,90), nans)")).toThrow();
    expect(() => runParser("alpha(rgb(20,50,90), )")).toThrow();
    expect(() => runParser("alpha(rgb(20,50,90))")).toThrow();
    expect(() => runParser("alpha(rgb(20,50,90),beta)")).toThrow();
    expect(() => runParser("alpha(rgb(20,50,90) 5)")).toThrow();
  });

  test("alpha works with factor expressions", async () => {
    expect(runParser("alpha(rgb(20,50,90), var(--test))")).toRoughlyEqual({
      type: "rgb",
      red: 20,
      green: 50,
      blue: 90,
      alpha: "clamp(0,1,var(--test))",
    });
    expect(
      runParser("alpha(rgb(20,50,90), calc(0.5 + (0.5*0.5)))")
    ).toRoughlyEqual({
      type: "rgb",
      red: 20,
      green: 50,
      blue: 90,
      alpha: 0.75,
    });
  });
});

describe("test mix function", () => {
  test("mix with 1 returns second color", async () => {
    expect(runParser("mix(#000,#fff,1)")).toRoughlyEqual({
      type: "rgb",
      red: 255,
      green: 255,
      blue: 255,
      alpha: 1,
    });
  });

  test("mix with 0 returns first color", async () => {
    expect(runParser("mix(#000,#fff,0)")).toRoughlyEqual({
      type: "rgb",
      red: 0,
      green: 0,
      blue: 0,
      alpha: 1,
    });
  });

  test("mix with 0.5 returns middle color", async () => {
    expect(runParser("mix(#000,#fff,0.5)")).toRoughlyEqual({
      type: "rgb",
      red: 127.5,
      green: 127.5,
      blue: 127.5,
      alpha: 1,
    });
  });

  test.skip("mixing with hsl colors is supported", async () => {
    expect(runParser("mix(hsl(0,0,0),#fff,0.5)")).toRoughlyEqual({
      type: "rgb",
      red: 127.5,
      green: 127.5,
      blue: 127.5,
      alpha: 1,
    });
  });

  test("mix with vars works", async () => {
    expect(runParser("mix(@a,@b,0.4)")).toRoughlyEqual({
      type: "rgb",
      red: "calc((0.4*var(--b-a)*var(--b-r) + 0.6*var(--a-a)*var(--a-r))/(0.4*var(--b-a) + 0.6*var(--a-a)))",
      green:
        "calc((0.4*var(--b-a)*var(--b-g) + 0.6*var(--a-a)*var(--a-g))/(0.4*var(--b-a) + 0.6*var(--a-a)))",
      blue: "calc((0.4*var(--b-a)*var(--b-b) + 0.6*var(--a-a)*var(--a-b))/(0.4*var(--b-a) + 0.6*var(--a-a)))",
      alpha: "calc(0.4*var(--b-a) + 0.6*var(--a-a))",
    });
  });
});
