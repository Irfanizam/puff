# Puff — Claude Context

> Paste this file at the start of every Claude conversation about Puff.
> Update it whenever something significant changes.

## Current phase

Phase 1 — Foundation. Steps 1–6 complete. Step 7 (deploy + ADRs) next.

## What's built

### Monorepo & build

- pnpm workspaces + Turborepo, 5 packages total
- `@puff/config`: shared TypeScript and ESLint configurations
- `@puff/types`: branded types, Result, RequestId, header constants, validators
- `@puff/ui`: seed Button component (Phase 2 will expand)
- `@puff/logger`: structured logger built on Pino, with redaction
- `apps/web`: Next.js 16 App Router app

### Quality gates (3 layers)

- Editor: format-on-save with Prettier, ESLint with red squiggles
- Pre-commit: lint-staged + typecheck + commitlint (Conventional Commits)
- CI: GitHub Actions runs format/lint/typecheck/build on push and PR
- Branch protection on main: PR required, CI must pass, bypass prevented

### Observability foundation

- `@puff/logger` shared across all workspaces: structured JSON in prod, pretty in dev
- Field-level redaction for passwords, tokens, auth headers
- Request ID middleware: ULID-based correlation, propagated via headers
- Sentry integration: server + client + edge runtimes, source map upload,
  tunnel route to bypass ad-blockers, release tagging
- ESLint rule enforces structured logger (no console.log; console.warn/error allowed)

### Architectural conventions encoded

- Codebase ESLint rules live in `@puff/config/eslint.codebase-rules.mjs`
  as single source of truth
- Workspace dependencies use the workspace protocol (`workspace:*`)
- Root eslint.config.mjs supports lint-staged invocation patterns
- Conventional Commits enforced by commitlint

## Stack (current)

- Node 22+ (CI uses 22; local dev on 24)
- pnpm 10.18.0 (pinned via packageManager + Corepack)
- TypeScript 6.0.3 (strict mode, noUncheckedIndexedAccess)
- Turborepo 2.9.12
- Next.js 16.2.6 with Turbopack
- React 19.2.4
- Tailwind CSS 4
- ESLint 9.39 (flat config), Prettier 3.8
- Husky 9, lint-staged 16, commitlint 19
- Pino 9, pino-pretty 11
- @sentry/nextjs (server, client, edge runtimes)
- ulid for request IDs
- GitHub Actions for CI

## Stack (planned)

- shadcn/ui (Phase 2)
- MDX content collections (Phase 2)
- Vercel deployment (Phase 1, Step 7)
- Vercel AI SDK, OpenAI, Anthropic (Phase 3)
- PostgreSQL + Prisma + pgvector (Phase 4)
- LangChain primitives + LangGraph + MCP (Phase 5)

## Architectural invariants

1. Apps consume packages. Packages never consume apps.
2. No secrets in code. Environment validated at boot.
3. Structured logger only — no `console.log` in production paths.
   Enforced by ESLint rule, not just policy.
4. No `any` types. Use `unknown` and narrow, or proper types.
5. Every API route: rate limit + auth check + error boundary.
6. Every architectural decision becomes an ADR before merge.
7. `main` is always deployable. CI red = fix or revert immediately.
8. Direct push to `main` is impossible. PRs only.
9. Every HTTP request gets a unique ULID. The ID flows through request
   headers, response headers, and every log line for that request.

## Toolchain decisions encoded

- pnpm 10 (not 11) due to subprocess workspace-root resolution bug in pnpm 11.0.9
- TypeScript 6 (latest stable as of install)
- Internal packages export TypeScript source directly (no build step);
  consumers transpile via Next.js's `transpilePackages`
- Workspace protocol (`workspace:*`) for all internal package references
- `onlyBuiltDependencies` allowlist for supply-chain defense (currently:
  sharp, unrs-resolver)
- Conventional Commits with relaxed subject-case rule
- Pino selected over Winston for edge runtime compatibility and speed
- Sentry optional in dev (no DSN = inactive); required in production
- Codebase ESLint rules extracted into a separate module so apps and
  packages can compose them differently without rule drift

## ADRs written

None yet. Backlog from journey so far:

- ADR-001: Monorepo with pnpm workspaces + Turborepo
- ADR-002: Pin pnpm to 10.x (pnpm 11 subprocess bug)
- ADR-003: Folder structure (apps/, packages/, docs/)
- ADR-004: TypeScript shared config pattern
- ADR-005: Internal packages export source (no build step)
- ADR-006: Three-layer quality gates (editor, pre-commit, CI)
- ADR-007: Branch protection with bypass prevention
- ADR-008: Pino-based shared logger with redaction
- ADR-009: ULID request IDs with full-stack correlation
- ADR-010: Sentry across server/client/edge runtimes
- ADR-011: Codebase ESLint rules as a separate composable module

To be written at the end of Phase 1 (Step 7), before deployment.

## Currently working on

Phase 1, Step 7 — deploy to Vercel and write the ADRs.

## Workflow notes

- Working in WSL2 Ubuntu via VSCode Remote
- Repo lives at `~/code/puff` (Linux filesystem, not Windows mount)
- SSH for GitHub
- Branch + PR + squash-merge workflow (direct pushes to main blocked)
- `git config --global pull.ff only` (fail-loud on divergence)
- Pre-commit hooks run: lint-staged (Prettier + ESLint) + typecheck +
  commitlint on the message

## Merged PRs

| #   | Title                                                      | Phase / Step            |
| --- | ---------------------------------------------------------- | ----------------------- |
| 1   | Update CLAUDE_CONTEXT.md with step 5 completion            | Phase 1 / Step 5 (test) |
| 2   | Refresh CLAUDE_CONTEXT.md after Step 5 completion          | Phase 1 / Step 5        |
| 3   | Scaffold docs folders with ADR template and conventions    | Phase 1 / pre-Step 6    |
| 4   | Add @puff/logger shared logging package                    | Phase 1 / Step 6.1      |
| 5   | Add request ID middleware with ULID-based correlation      | Phase 1 / Step 6.2      |
| 6   | Integrate Sentry for error tracking and performance traces | Phase 1 / Step 6.3      |
| 7   | Enforce no console.log via shared codebase rules           | Phase 1 / Step 6.4      |

## Last updated

End of Phase 1, Step 6 — observability foundation complete.
