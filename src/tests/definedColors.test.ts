import { stringify } from "postcss";
import { parseColor } from "../parseColor";
import { runParser } from "./runParser";

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
      red: "var(--dark-r)",
      green: "var(--dark-r-g)",
      blue: "var(--dark-r-b)",
      alpha: "var(--dark-r-a)",
    });
  });
});
