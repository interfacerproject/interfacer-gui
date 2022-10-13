import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://65.109.11.42:10000/play",
  documents: ["./pages/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  generates: {
    "./lib/types/index.ts": {
      plugins: ["typescript", "typescript-operations"],
    },
  },
};

export default config;
