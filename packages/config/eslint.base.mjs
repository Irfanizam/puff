/**
 * @puff/config/eslint.base.mjs
 *
 * Shared ESLint flat config for non-framework workspaces (packages/*).
 *
 * Composition:
 *   1. ESLint recommended (vanilla JS)
 *   2. TypeScript-ESLint recommended (TS-aware)
 *   3. Codebase rules (Puff conventions — single source of truth)
 *   4. Prettier compatibility (style rules off)
 *
 * Order matters. Codebase rules go after the recommended sets so they
 * override defaults. Prettier goes last so it has the final say on style.
 *
 * Usage:
 *   import baseConfig from "@puff/config/eslint.base.mjs";
 *   export default [...baseConfig, ...yourOwnRules];
 */

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import codebaseRules from "./eslint.codebase-rules.mjs";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  codebaseRules,
  prettierConfig,
];
