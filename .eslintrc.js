module.exports = {
  extends: [
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  plugins: ["sort-destructure-keys"],
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    "no-var": "error",
    semi: "error",
    indent: ["error", 2, { SwitchCase: 1 }],
    "no-multi-spaces": "error",
    "space-in-parens": "error",
    "no-multiple-empty-lines": "error",
    "prefer-const": "error",
    "no-use-before-define": "error",
    "max-len": ["error", 150],
    "prefer-destructuring": ["error"],
    "prefer-template": "error",
    "object-shorthand": "warn",
    "newline-after-var": ["error", "always"],
    curly: "error",
  },
};
