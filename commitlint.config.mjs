/**
 * Commitlint configuration.
 *
 * Enforces Conventional Commits format:
 *   <type>(<scope>): <description>
 *
 * Examples:
 *   feat: add recruiter chatbot endpoint
 *   fix(ui): button focus ring color
 *   chore(deps): bump next from 16.2.6 to 16.2.7
 *   docs: explain RAG architecture in ADR 005
 *
 * Allowed types:
 *   feat     — new feature
 *   fix      — bug fix
 *   chore    — maintenance, build, deps
 *   docs     — documentation only
 *   refactor — code restructure, no behavior change
 *   test     — adding or updating tests
 *   ci       — CI/CD configuration changes
 *   perf     — performance improvement
 *   style    — style-only changes (rare, since Prettier auto-formats)
 *   revert   — reverting a previous commit
 */

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "docs",
        "refactor",
        "test",
        "ci",
        "perf",
        "style",
        "revert",
      ],
    ],
    // Subject case: don't enforce. Allow "feat: Add X" or "feat: add X".
    // Disabled because too pedantic for solo dev velocity.
    "subject-case": [0],
    // Subject max length: warn at 100 chars, error at 120.
    "header-max-length": [2, "always", 120],
  },
};
