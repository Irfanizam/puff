/**
 * ESLint config for @puff/web.
 *
 * Layering order (last wins on conflicts):
 *   1. Next.js web vitals + TypeScript rules (eslint-config-next defaults)
 *   2. Codebase conventions from @puff/config (underscore-prefix for
 *      intentionally-unused vars, consistent type imports, etc.)
 *   3. Prettier compatibility (disable style rules so Prettier handles them)
 *
 * We don't apply the full @puff/config base because Next.js already provides
 * a rich rule set. We only override the specific conventions we want to
 * apply uniformly across the codebase (the underscore-prefix rule, for now).
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Codebase conventions that apply to all Puff packages, including this app.
  // Kept inline (not imported from @puff/config) because we only want a
  // narrow subset of our shared rules here.
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  prettierConfig,
]);

export default eslintConfig;
