/**
 * @puff/config/eslint.base.mjs
 *
 * Shared ESLint flat config for Puff workspaces.
 *
 * What this provides:
 * - ESLint's recommended rules for JavaScript
 * - TypeScript-aware linting via typescript-eslint
 * - Prettier compatibility (disables conflicting style rules)
 *
 * What this DOESN'T provide:
 * - React/Next.js rules (added per-app in apps/web/eslint.config.mjs)
 * - Project-specific overrides (added per-package)
 *
 * Usage:
 *   import baseConfig from "@puff/config/eslint.base.mjs";
 *   export default [...baseConfig, ...yourOwnRules];
 */

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default [
  // ESLint's recommended rules for JavaScript
  js.configs.recommended,

  // TypeScript-recommended rules (without type-checking — that's a heavier opt-in)
  ...tseslint.configs.recommended,

  // Custom rule overrides for our codebase
  {
    rules: {
      // Allow unused variables if prefixed with underscore (intent: "intentionally unused")
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Require consistent use of type imports vs value imports
      // import type { Foo } from "..." vs import { Foo } from "..."
      // This helps bundlers tree-shake correctly.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // Allow `any` in tests and example files via override below.
      // In production code we want explicit types.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Prettier compatibility — MUST be last to override conflicting style rules.
  prettierConfig,
];
