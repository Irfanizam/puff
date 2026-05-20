/**
 * Root-level ESLint flat config.
 *
 * Used by lint-staged and other tools invoked from the repo root.
 * ESLint v9 flat config resolves the config relative to the cwd,
 * so we need a root config that scopes rules by file path.
 *
 * Per-workspace configs still exist (and are used when ESLint runs
 * inside a workspace, e.g. `pnpm --filter @puff/web lint`). This root
 * config replicates the same composition for root-level invocations.
 */

import puffBase from "@puff/config/eslint.base.mjs";
import codebaseRules from "@puff/config/eslint.codebase-rules.mjs";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/dist/**",
    "**/build/**",
    "**/next-env.d.ts",
    "**/*.tsbuildinfo",
  ]),

  // ── Internal packages — use the shared base config ──
  {
    files: ["packages/**/*.{ts,tsx,js,jsx,mjs}"],
    extends: [...puffBase],
  },

  // ── Web app — Next.js defaults + codebase rules + prettier ──
  {
    files: ["apps/web/**/*.{ts,tsx,js,jsx,mjs}"],
    extends: [...nextVitals, ...nextTs, codebaseRules, prettierConfig],
  },
]);
