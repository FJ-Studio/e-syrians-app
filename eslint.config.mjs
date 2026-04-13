import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Block console.log from leaking to production. warn/error are
      // allowed because we use them for genuine runtime diagnostics.
      "no-console": ["error", { allow: ["warn", "error"] }],
      // Block `debugger` and `.only(...)` on test runners — these are
      // common debug artifacts that shouldn't reach main.
      "no-debugger": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='only'][object.name=/^(describe|it|test)$/]",
          message:
            "Remove the `.only(...)` focus modifier before committing — it silently skips the rest of your test suite.",
        },
      ],
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
  {
    // Build/tooling scripts legitimately use console.log for user-facing
    // success output — they aren't shipped to production.
    files: ["scripts/**/*.{js,mjs,cjs}"],
    rules: {
      "no-console": "off",
    },
  },
  prettier,
];

export default eslintConfig;
