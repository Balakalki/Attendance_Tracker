const js = require("@eslint/js");
const globals = require("globals");

// ESLint v9 "flat config". This tells the linter our backend is Node.js
// CommonJS code and which rules to enforce.
module.exports = [
  {
    ignores: ["node_modules/", ".serverless/", "dist/"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Warn (don't fail) on unused vars, but ignore args prefixed with "_".
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off",
    },
  },
];
