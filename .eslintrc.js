module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "next/core-web-vitals",
    // "eslint:recommended",
    // "plugin:@typescript-eslint/eslint-recommended",
    // "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  overrides: [],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  //   parser: "@typescript-eslint/parser",
  plugins: ["react", "prettier"],
  rules: {
    "@next/next/no-img-element": "off",
    // Disable prop-types as we use TypeScript for type checking
    // "react/prop-types": "off",
    // needed for NextJS's jsx without react import
    // "react/react-in-jsx-scope": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
