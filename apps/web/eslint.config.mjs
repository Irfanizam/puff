/**
 * ESLint config for @puff/web.
 *
 * Layering order (last wins on conflicts):
 *   1. Next.js web vitals + TypeScript rules (eslint-config-next defaults)
 *   2. Codebase conventions from @puff/config (unused-vars, type imports,
 *      no console — applies uniformly across all Puff code)
 *   3. Prettier compatibility (disable style rules so Prettier handles them)
 *
 * We don't apply the full @puff/config base because Next.js already provides
 * a rich rule set. We apply the codebase rules directly so they reach this
 * app the same way they reach the internal packages.
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import codebaseRules from "@puff/config/eslint.codebase-rules.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Puff codebase conventions — single source of truth in @puff/config.
  codebaseRules,

  prettierConfig,
]);

export default eslintConfig;
