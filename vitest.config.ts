import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    // Don't fail CI when no test files exist yet — lets the test job stay
    // green while the suite is being built out. Remove once the first real
    // test is in place if you want "no tests" to be treated as a failure.
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.stories.{ts,tsx}",
        "src/**/__mocks__/**",
        "src/middleware.ts",
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
        "src/app/**/not-found.tsx",
        "src/app/**/error.tsx",
        "src/app/**/loading.tsx",
      ],
    },
  },
});
