import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://zenflows-test.interfacer.dyne.org/play",
  documents: ["./lib/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  generates: {
    "./lib/types/index.ts": {
      plugins: ["typescript", "typescript-operations"],
    },
  },
};

export default config;
