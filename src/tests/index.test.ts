import postcss, { Input } from "postcss";
import plugin from "../index";
// @ts-expect-error
import validateCss from "css-validator";
import { promises as fs } from "fs";

import { PluginCreator } from "postcss";
import { getColorNames } from "../getColorNames";
import { processColor } from "../processColor";
import { runParser } from "./runParser";

const cleanRaws: PluginCreator<{}> = () => {
  return {
    postcssPlugin: "postcss-plugin-clean-raws",
    Root(root, postcss) {
      root.cleanRaws();
    },
  };
};

cleanRaws.postcss = true;

const readStyle = async (filename: string) => {
  const data = await fs.readFile("styles/" + filename + ".css", "binary");
  return Buffer.from(data).toString();
};

const validate = async (css: string) => {
  return new Promise<any>((resolve) => {
    validateCss({ text: css }, (err: any, data: any) => {
      resolve(data);
    });
  });
};

const checkForErrorType = async (
  css: string,
  errorMessage: string,
  options: { onlyErrors?: boolean }
) => {
  const result = (await validate(css)) as any;
  expect(Array.isArray(result.errors)).toEqual(true);
  expect(Array.isArray(result.warnings)).toEqual(true);
  const events = [
    ...result.errors,
    ...(options.onlyErrors ? [] : result.warnings),
  ];
  const errorMessages = events.map(
    (event) =>
      `${event.line}: ${event.message.replace(/[ \t\n]+/gm, " ").trim()}`
  );
  const relevantMessages = errorMessages.filter((message) =>
    message.includes(errorMessage)
  );
  return relevantMessages;
};

const run = async (input: string, output: string, opts: any = {}) => {
  let result = await postcss([cleanRaws(), plugin(opts)]).process(input, {
    from: undefined,
  });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
};

async function process(input: string, opts: any = {}) {
  let result = await postcss([cleanRaws(), plugin(opts)]).process(input, {
    from: undefined,
  });
  expect(result.warnings()).toHaveLength(0);
  return result.css;
}

async function format(input: string, opts: any = {}) {
  let result = await postcss([cleanRaws()]).process(input, {
    from: undefined,
  });
  expect(result.warnings()).toHaveLength(0);
  return result.css;
}

/* Write tests here

it('does something', async () => {
  await run('a{ }', 'a{ }', { })
})

*/

test.skip("has an invalid base stylesheet", async () => {
  const file = await readStyle("base");
  const result = await validate(file);
  expect(result.validity).toEqual(false);
});

test.skip("converts the input to a valid stylesheet", async () => {
  const file = await readStyle("base");
  const processed = await process(file, {});
  const result = await validate(processed);
  await fs.writeFile("processed2.css", processed);
  expect(result.errors).toHaveLength(0);
  expect(result.validity).toEqual(true);
}, 60000);

test.skip("fixes all @define-color errors", async () => {
  const file = await readStyle("base");
  const processed = await process(file, {});
  const errors = await checkForErrorType(
    processed,
    "Unrecognized at-rule “@define-color”",
    {}
  );
  expect(errors).toEqual([]);
});
