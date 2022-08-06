import { get } from "color-string";
import convert, { rgb } from "color-convert";
import { getColorNames } from "./getColorNames";
import { RGB } from "color-convert/conversions";
import {
  Color,
  CurrentColor,
  DefinedColor,
  HslColor,
  InheritColor,
  NamedColor,
  RgbColor,
} from "parseColor";
import minifyCSSCalc from "minify-css-calc";

const transition = (start: string, end: string, progress: string) => {
  return minifyCSSCalc(`calc(${start} + ( ${end} - ${start} ) * ${progress} )`);
};

export const gtkMix = (a: RgbColor, b: RgbColor, factor: string): RgbColor => {
  const alpha = transition(a.alpha, b.alpha, factor);

  const red = minifyCSSCalc(
    `calc(${transition(
      `calc(${a.red} * ${a.alpha})`,
      `calc(${b.red} * ${b.alpha})`,
      factor
    )} / ${alpha})`
  );
  const green = minifyCSSCalc(
    `calc(${transition(
      `calc(${a.green} * ${a.alpha})`,
      `calc(${b.green} * ${b.alpha})`,
      factor
    )} / ${alpha})`
  );
  const blue = minifyCSSCalc(
    `calc(${transition(
      `calc(${a.blue} * ${a.alpha})`,
      `calc(${b.blue} * ${b.alpha})`,
      factor
    )} / ${alpha})`
  );

  return { type: "rgb" as const, red, green, blue, alpha };
};

/** Convert the RGB values to calc statements for HSL */
export const gtkHsla = (color: RgbColor): HslColor => {
  const red = `calc(${color.red}/255)`;
  const green = `calc(${color.green}/255)`;
  const blue = `calc(${color.blue}/255)`;
  const alpha = color.alpha;
  const max = `max(${red}, ${green}, ${blue})`;
  const min = `min(${red}, ${green}, ${blue})`;
  const lightness = `calc( ( ${max} + ${min} ) / 2 )`;

  const minDifferentFromMax = `clamp(0, calc( ( ${max} - ${min} ) * 10e99 ), 1)`;

  const lightnessMoreThenHalf = `clamp( 0, calc( ( ${lightness} - 0.5 ) * 1e30 ), 1 )`;
  const lightnessLessThenHalf = `clamp( 0, calc( ( 0.5 - ${lightness} + 10e-30 ) * 1e30 ), 1 )`;
  // const saturation = `calc( ${minDifferentFromMax} * ( ( ${max} - ${min} ) / ( ( ${lightnessLessThenHalf} * ( ${max} + ${min} ) ) + ( ${lightnessMoreThenHalf} * ( 2 - ${max} - ${min} ) ) ) ) )`
  const saturation = `calc( ${minDifferentFromMax} * ( ( ${max} - ${min} ) / ( ( ${lightnessLessThenHalf} * ( ${max} + ${min} + 10e-30 ) ) + ( ${lightnessMoreThenHalf} * ( 2 - ${max} - ${min} + 10e-20 ) ) ) ) )`;

  const delta = `calc( ${max} - ${min} + 10e-30 )`;
  const redIsMax = `clamp(0, calc( ( ${red} - ${max} + 10e-10 ) * 10e30 ), 1)`;
  const greenIsMax = `clamp(0, calc( ( ${green} - ${max} + 10e-10 ) * 10e30 ), 1)`;
  const blueIsMax = `clamp(0, calc( ( ${blue} - ${max} + 10e-10 ) * 10e30 ), 1)`;

  const redHue = `calc( ${redIsMax} * ( ( ${green} - ${blue} ) / ${delta} ) )`;
  const greenHue = `calc( ${greenIsMax} * ( 2 + ( ( ${blue} - ${red} ) / ${delta} ) ) )`;
  const blueHue = `calc( ${blueIsMax} * ( 4 + ( ( ${red} - ${green} ) / ${delta} ) ) )`;
  const fixedRedHue = `calc( ( clamp(0, calc( ${redHue} * -10e30 ) , 1 ) * 6 ) + ${redHue} )`;

  //max to only take one
  const hue = `calc( ${minDifferentFromMax} * ( 60 * ( max( ${fixedRedHue}, ${greenHue}, ${blueHue} ) ) ) )`;
  // const hue = `calc( 60 * ( max( ${redHue}, ${greenHue}, ${blueHue} ) + ( min( ${redHue}, ${greenHue}, ${blueHue} ) + 6 ) - ( clamp(0, calc( ( min( ${redHue}, ${greenHue}, ${blueHue} , 0) * 10e50 ) + 6 ) , 6 ) ) ) )`

  return { type: "hsl" as const, hue, saturation, lightness, alpha };
};

/** Changes the lightness of Color. The number ranges from 0 for black to 2 for white. */
export const gtkShade = (
  color: RgbColor | HslColor,
  factor: string
): HslColor => {
  const hslColor = color.type === "rgb" ? gtkHsla(color) : color;
  const lightness = `clamp(0, calc( ${hslColor.lightness} * ${factor} ), 1)`;
  const saturation = `clamp(0, calc( ${hslColor.saturation} * ${factor} ), 1)`;
  const shaded = { ...hslColor, lightness, saturation };
  return shaded;
};

/** Produces a darker variant of Color */
export const gtkDarker = (color: RgbColor | HslColor) => {
  return gtkShade(color, "0.8");
};

/** Produces a brigher variant of Color */
export const gtkLighter = (color: RgbColor | HslColor) => {
  return gtkShade(color, "0.8");
};

//

/** Replaces the alpha value of color with number (between 0 and 1)
 *
 * The code from the gtk4 repo does not replace the number, but multiplies the previous number with it.
 *
 * The gtk documentation says that the alpha value will be replaced
 *
 * Code: https://gitlab.gnome.org/GNOME/gtk/-/blob/main/gtk/gtkcsscolorvalue.c#L298
 *
 * Documentation: https://docs.gtk.org/gtk4/css-properties.html#colors
 */
export function gtkAlpha(color: RgbColor, factor: string): RgbColor;
export function gtkAlpha(color: HslColor, factor: string): HslColor;
export function gtkAlpha(color: RgbColor | HslColor, factor: string): HslColor;
export function gtkAlpha(
  color: RgbColor | HslColor,
  factor: string
): RgbColor | HslColor {
  const alpha = minifyCSSCalc(
    `clamp(0, calc( ${color.alpha} * ${factor} ), 1 )`
  );
  return { ...color, alpha };
}

/** Add the correct var names for red green and blue colors */
const definedToVar = (color: DefinedColor): RgbColor => {
  const variableNames = getColorNames(color.name);
  return {
    type: "rgb" as const,
    red: `var(${variableNames.red})`,
    green: `var(${variableNames.green})`,
    blue: `var(${variableNames.blue})`,
    alpha: `var(${variableNames.alpha})`,
  };
};

export const getFallbackForCurrentColor = (
  color: RgbColor | HslColor | CurrentColor | InheritColor,
  warnLocation: string,
  fallback: RgbColor | HslColor = {
    type: "rgb",
    red: "0",
    green: "0",
    blue: "0",
    alpha: "1",
  }
): RgbColor | HslColor => {
  if (color.type === "inherit") {
    // console.warn(
    //   `${warnLocation} with color inherit is not supported. Using ${stringifyColor(
    //     fallback
    //   )} as a fallback`
    // );
    return fallback;
  }
  if (color.type === "current") {
    // console.warn(
    //   `${warnLocation} with currentColor is not supported. Using ${stringifyColor(
    //     fallback
    //   )} as a fallback`
    // );
    return fallback;
  }
  return color;
};

const resolveNamedColor = (color: NamedColor): RgbColor => {
  const colorDescriptor = get(color.name);
  if (colorDescriptor?.model !== "rgb") {
    throw new Error(`${color.name} is not an rgb color`);
  }
  return {
    type: "rgb",
    red: "" + colorDescriptor.value[0],
    green: "" + colorDescriptor.value[1],
    blue: "" + colorDescriptor.value[2],
    alpha: "" + colorDescriptor.value[3],
  };
};

export const processColor = (
  color: Color
): RgbColor | HslColor | CurrentColor | InheritColor => {
  const getNewColor = (
    color: Color
  ): RgbColor | HslColor | CurrentColor | InheritColor => {
    switch (color.type) {
      case "rgb":
      case "hsl":
      case "current":
      case "inherit":
        return color;
      case "mix":
        const a = getFallbackForCurrentColor(processColor(color.a), "mix");
        const b = getFallbackForCurrentColor(processColor(color.b), "mix");
        if (a.type === "hsl") {
          throw new Error("Mixing with HSL colors is not supported for now");
        }
        if (b.type === "hsl") {
          throw new Error("Mixing with HSL colors is not supported for now");
        }
        return gtkMix(a, b, color.factor);
      case "shade":
        return gtkShade(
          getFallbackForCurrentColor(processColor(color.color), "shade", {
            type: "hsl",
            hue: "0",
            saturation: "0",
            lightness: "0",
            alpha: "1",
          }),
          color.factor
        );
      case "alpha":
        return gtkAlpha(
          getFallbackForCurrentColor(processColor(color.color), "alpha"),
          color.factor
        );
      case "lighter":
        return gtkLighter(
          getFallbackForCurrentColor(processColor(color.color), "shade", {
            type: "hsl",
            hue: "0",
            saturation: "0",
            lightness: "0",
            alpha: "1",
          })
        );
      case "darker":
        return gtkDarker(
          getFallbackForCurrentColor(processColor(color.color), "shade", {
            type: "hsl",
            hue: "0",
            saturation: "0",
            lightness: "0",
            alpha: "1",
          })
        );
      case "named":
        return resolveNamedColor(color);
      case "defined":
        return definedToVar(color);
      default:
        const x: never = color;
        throw new Error(`Unknown color ${color}`);
    }
  };

  const newColor = getNewColor(color);

  const minifiedColor = Object.fromEntries(
    Object.entries(newColor).map(([key, value]) => [key, minifyCSSCalc(value)])
  ) as typeof newColor;

  return minifiedColor;
};

export const stringifyColor = (
  color: RgbColor | HslColor | CurrentColor | InheritColor
) => {
  if (color.type === "current") {
    return "currentColor";
  }

  if (color.type === "inherit") {
    return "inherit";
  }

  const opaque = !isNaN(+color.alpha) && +color.alpha >= 1;

  if (color.type === "hsl") {
    return opaque
      ? `hsl(${color.hue},${color.saturation},${color.lightness})`
      : `hsla(${color.hue},${color.saturation},${color.lightness},${color.alpha})`;
  }

  if (
    isNaN(+color.red) ||
    isNaN(+color.green) ||
    isNaN(+color.blue) ||
    isNaN(+color.alpha)
  ) {
    return opaque
      ? `rgb(${color.red},${color.green},${color.blue})`
      : `rgba(${color.red},${color.green},${color.blue},${color.alpha})`;
  }

  const red = +color.red;
  const green = +color.green;
  const blue = +color.blue;
  const alpha = +color.alpha;

  const redString = red.toString(16).padStart(2, "0");
  const greenString = green.toString(16).padStart(2, "0");
  const blueString = blue.toString(16).padStart(2, "0");
  const alphaString = Math.floor(alpha * 255)
    .toString(16)
    .padStart(2, "0");

  const shorthandPossible = (hexNumber: string) => {
    return hexNumber.length === 2 && hexNumber[0] === hexNumber[1];
  };

  if (
    shorthandPossible(redString) &&
    shorthandPossible(greenString) &&
    shorthandPossible(blueString) &&
    shorthandPossible(alphaString)
  ) {
    return opaque
      ? `#${redString[0]}${greenString[0]}${blueString[0]}`
      : `#${redString[0]}${greenString[0]}${blueString[0]}${alphaString[0]}`;
  }

  return opaque
    ? `#${redString}${greenString}${blueString}`
    : `#${redString}${greenString}${blueString}${alphaString}`;
};
