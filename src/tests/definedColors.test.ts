import { stringify } from "postcss";
import { parseColor } from "../parseColor";
import { runParser } from "./runParser";
import { format, runPostcss } from "./runPostcss";

describe("parser works with defined colors", () => {
  test("basic test for defined vars", async () => {
    // Value substitution
    expect(runParser("@dark")).toRoughlyEqual({
      type: "rgb",
      red: "var(--dark-r)",
      green: "var(--dark-g)",
      blue: "var(--dark-b)",
      alpha: "var(--dark-a)",
    });
  });

  test("weird name works as well", async () => {
    expect(runParser("@dark-r")).toRoughlyEqual({
      type: "rgb",
      red: "var(--dark-r-r)",
      green: "var(--dark-r-g)",
      blue: "var(--dark-r-b)",
      alpha: "var(--dark-r-a)",
    });
  });

  test("converts define color", async () => {
    await expect(await runPostcss(`@define-color dark_2 #5e5c64;`)).toEqual(
      await format(
        `:root {--dark-2-r: 94;--dark-2-g: 92;--dark-2-b: 100;--dark-2-a: 1}`
      )
    );
  });

  test("defined colors supports rgb", async () => {
    await expect(
      runPostcss(`@define-color dark_2 #5e5c64;`)
    ).resolves.toBeTruthy();
  });

  test("defined colors supports named colors", async () => {
    await expect(
      runPostcss(`@define-color dark_2 purple;`)
    ).resolves.toBeTruthy();
  });

  test("defined colors does not support hsl", async () => {
    await expect(async () =>
      runPostcss(`@define-color dark_2 hsl(3,4,5);`)
    ).rejects.toThrow();
  });

  test("defined colors does not support currentColor", async () => {
    await expect(async () =>
      runPostcss(`@define-color dark_2 currentColor;`)
    ).rejects.toThrow();
  });

  test("defined colors does not support inherit", async () => {
    await expect(async () =>
      runPostcss(`@define-color dark_2 inherit;`)
    ).rejects.toThrow();
  });
});
