const path = require("path");

module.exports = {
  // Type check TypeScript files
  "**/*.(ts|tsx)": () => "pnpm check-types",

  // Lint & Prettify TS and JS files
  "**/*.(ts|tsx|js|jsx)": filenames => [
    `next lint --fix --file ${filenames.map(f => path.relative(process.cwd(), f)).join(" --file ")}`,
    `prettier --write ${filenames.join(" ")}`,
  ],

  // Prettify only Markdown and JSON files
  "**/*.(md|json)": filenames => `pnpm prettier --write ${filenames.join(" ")}`,
};
