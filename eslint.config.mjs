import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Prevent console statements from leaking to production
      "no-console": ["warn", { allow: ["warn"] }],
      // Discourage use of `any` type
      "@typescript-eslint/no-explicit-any": "warn",
      // Ensure unused variables are flagged (allow underscore prefix for intentionally unused)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
