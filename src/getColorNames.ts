export const getColorNames = (name: string) => {
  const sanitizedName =
    "--" + name.toLowerCase().replaceAll("@", "").trim().replaceAll("_", "-");
  if (sanitizedName == "--" || sanitizedName.includes(" ")) {
    throw new Error(`Failed to convert name "${name}" to CSS variable`);
  }
  return {
    red: `${sanitizedName}-r`,
    green: `${sanitizedName}-g`,
    blue: `${sanitizedName}-b`,
    alpha: `${sanitizedName}-a`,
  };
};
