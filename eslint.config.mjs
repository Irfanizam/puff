/**
 * Root-level ESLint flat config.
 *
 * Why this exists:
 *   ESLint v9 flat config resolves the config file relative to the
 *   *current working directory*, not relative to the file being linted.
 *   When `lint-staged` invokes `eslint <file>` from the repo root, it
 *   can't find per-workspace configs in apps/* and packages/*.
 *
 *   This root config aggregates the per-workspace configs and applies
 *   them by file path. ESLint v9 supports config segments scoped by
 *   the `files` glob.
 *
 * How it works:
 *   - Each workspace's config is imported
 *   - We apply each config block with a `files` pattern matching its workspace
 *   - ESLint composes them per-file at lint time
 *
 *   This file replaces the need for per-workspace eslint.config.mjs files
 *   to be picked up automatically. The per-workspace files still exist for
 *   when you run lint *inside* the workspace (e.g. `pnpm --filter @puff/web lint`).
 */

import puffBase from "@puff/config/eslint.base.mjs";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

export default defineConfig([
  // Ignore patterns that apply globally
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/dist/**",
    "**/build/**",
    "**/next-env.d.ts",
    "**/*.tsbuildinfo",
  ]),

  // ── Internal packages (config, types, ui, logger) ──────────────────
  // These use the shared base config: TypeScript rules + Prettier compat.
  {
    files: ["packages/**/*.{ts,tsx,js,jsx,mjs}"],
    extends: [...puffBase],
  },

  // ── Web app (apps/web) ─────────────────────────────────────────────
  // Layers: Next.js defaults → Puff convention overrides → Prettier compat.
  {
    files: ["apps/web/**/*.{ts,tsx,js,jsx,mjs}"],
    extends: [
      ...nextVitals,
      ...nextTs,
      // Codebase convention: underscore-prefix means intentionally unused.
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
    ],
  },
]);
