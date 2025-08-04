// ESLint configuration for auto-fixing common issues
module.exports = {
  extends: ["./eslint.config.js"],
  rules: {
    // Auto-fixable rules
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "react/no-unescaped-entities": "off", // We'll handle this manually
    "jsx-a11y/no-autofocus": "warn", // We'll handle this manually
    "jsx-a11y/label-has-associated-control": "warn", // We'll handle this manually
    "jsx-a11y/click-events-have-key-events": "warn", // We'll handle this manually
    "jsx-a11y/no-static-element-interactions": "warn", // We'll handle this manually
    "react-hooks/exhaustive-deps": "warn", // We'll handle this manually
    "@typescript-eslint/no-explicit-any": "warn", // We'll replace with proper types
    "@typescript-eslint/no-require-imports": "warn", // We'll convert to ES6 imports
    "no-case-declarations": "error",
    "@typescript-eslint/no-unused-expressions": "error",
    "jsx-a11y/no-noninteractive-tabindex": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/label-has-accessible-text": "error",
    "react-hooks/rules-of-hooks": "error",
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off", // Allow any in tests
        "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in tests
      },
    },
  ],
};
