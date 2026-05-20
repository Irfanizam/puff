/**
 * @puff/config/eslint.codebase-rules.mjs
 *
 * Codebase-wide ESLint rules. The single source of truth for conventions
 * that apply to every line of Puff code, regardless of framework.
 *
 * Why this file is separate from eslint.base.mjs:
 *   - The base config is for non-framework workspaces (packages/*).
 *   - The Next.js app uses its own config layered on eslint-config-next.
 *   - Both need the same codebase conventions, but neither should swallow
 *     the other's framework-specific rules.
 *   - Pulling these rules into their own module means a single place to
 *     change them, with multiple consumers that compose as needed.
 *
 * Usage:
 *   import codebaseRules from "@puff/config/eslint.codebase-rules.mjs";
 *   export default [...otherConfigs, codebaseRules, ...laterConfigs];
 *
 * The exact placement matters: it must come AFTER framework configs
 * (so we override their settings) and BEFORE prettier (so prettier
 * gets the last word on style).
 */

export default {
  rules: {
    // ── Unused variables ────────────────────────────────────────────
    // Allow unused variables if prefixed with underscore.
    // Convention: leading underscore = "intentionally unused".
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],

    // ── Type imports ────────────────────────────────────────────────
    // Require type-only imports to be marked with `import type { Foo }`.
    // Helps bundlers tree-shake and reduces runtime cost of unused imports.
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],

    // ── `any` types ────────────────────────────────────────────────
    // Allow `any` but warn. Useful for transitional code; production
    // should use `unknown` and narrow.
    "@typescript-eslint/no-explicit-any": "warn",

    // ── Console usage ───────────────────────────────────────────────
    // Architectural invariant: structured logger only (@puff/logger).
    // Routine logging must go through Pino. Emergency channels (warn/error)
    // remain for cases where the logger may not be available.
    //
    // To bypass with justification:
    //   // eslint-disable-next-line no-console
    //   console.log("...");
    "no-console": [
      "error",
      {
        allow: ["warn", "error"],
      },
    ],
  },
};
