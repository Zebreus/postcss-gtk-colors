import { getColorNames } from "../getColorNames";

test("name conversion works as expected", async () => {
  expect(getColorNames("demo")).toRoughlyEqual({
    red: "--demo-r",
    green: "--demo-g",
    blue: "--demo-b",
    alpha: "--demo-a",
  });
  expect(getColorNames("DeMo")).toRoughlyEqual({
    red: "--demo-r",
    green: "--demo-g",
    blue: "--demo-b",
    alpha: "--demo-a",
  });
  expect(getColorNames("dark_2")).toRoughlyEqual({
    red: "--dark-2-r",
    green: "--dark-2-g",
    blue: "--dark-2-b",
    alpha: "--dark-2-a",
  });
  expect(() => getColorNames("")).toThrow();
  expect(() => getColorNames("demo dark")).toThrow();
});
