# Puff — Claude Context

> Paste this file at the start of every Claude conversation about Puff.
> Update it whenever something significant changes.

## Current phase

**Phase 1 complete.** Phase 2 (Content & UI system) starts next.

## What's built

### Monorepo & build

- pnpm workspaces + Turborepo, 5 packages total
- `@puff/config`: shared TypeScript and ESLint configurations
- `@puff/types`: branded types, Result, RequestId, header constants, validators
- `@puff/ui`: seed Button component (Phase 2 will expand)
- `@puff/logger`: structured logger built on Pino, with redaction
- `apps/web`: Next.js 16 App Router app

### Quality gates (three layers)

- Editor: format-on-save with Prettier, ESLint with red squiggles
- Pre-commit: lint-staged + typecheck + commitlint (Conventional Commits)
- CI: GitHub Actions runs format/lint/typecheck/build on push and PR
- Branch protection on main: PR required, CI must pass, bypass prevented

### Observability foundation

- `@puff/logger` shared across all workspaces
- Field-level redaction for passwords, tokens, auth headers
- Request ID middleware: ULID-based correlation, propagated via headers
- Sentry integration: server + client + edge runtimes
- ESLint rule enforces structured logger (no console.log; warn/error allowed)

### Deployment

- Live at https://puff-puce.vercel.app
- Automatic deploys from main branch via Vercel
- Preview URLs on every PR (Vercel bot comments with link)

### Documentation

- 5 ADRs written for the most defensible Phase 1 decisions
- README.md rewritten for public consumption
- `docs/adr/README.md` and `_template.md` document ADR conventions

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
- GitHub Actions for CI, Vercel for deployment

## Stack (planned)

- shadcn/ui (Phase 2)
- MDX content collections (Phase 2)
- Vercel AI SDK, OpenAI, Anthropic (Phase 3)
- Python + FastAPI service (Phase 3 for GenAI credibility)
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

## ADRs written

| ADR | Title                                              |
| --- | -------------------------------------------------- |
| 001 | Monorepo with pnpm workspaces + Turborepo          |
| 002 | Pin pnpm to 10.x via Corepack                      |
| 003 | Three-layer quality gates (editor, pre-commit, CI) |
| 004 | Shared structured logger built on Pino             |
| 005 | ULID-based request IDs for full-stack correlation  |

Additional ADR candidates (write when we encounter new decisions):

- Folder structure (apps/, packages/, docs/)
- Shared TypeScript configuration pattern
- Internal packages export source (no build step)
- Branch protection with bypass prevention
- Sentry across three Next.js runtimes
- Codebase ESLint rules as a separate composable module

## Currently working on

**Phase 2 — Content & UI system.** Next steps to plan:

- shadcn/ui integration
- MDX blog with content collections
- Portfolio home page redesign
- OG image generation

## Workflow notes

- Working in WSL2 Ubuntu via VSCode Remote
- Repo lives at `~/code/puff` (Linux filesystem, not Windows mount)
- SSH for GitHub
- Branch + PR + squash-merge workflow (direct pushes to main blocked)
- `git config --global pull.ff only` (fail-loud on divergence)
- Pre-commit hooks run: lint-staged (Prettier + ESLint) + typecheck +
  commitlint on the message
- Vercel deploys automatically from main; preview deploys on every PR

## Merged PRs

Phase 1 PR history:

| #   | Title                                                            |
| --- | ---------------------------------------------------------------- |
| 1-3 | Initial documentation setup                                      |
| 4   | Add @puff/logger shared logging package                          |
| 5   | Add request ID middleware with ULID-based correlation            |
| 6   | Integrate Sentry for error tracking and performance traces       |
| 7   | Enforce no console.log via shared codebase rules                 |
| 8   | Refresh CLAUDE_CONTEXT.md after Step 6 completion                |
| 9   | Set proper page metadata for portfolio                           |
| 10  | Write ADRs 001-005 for Phase 1 foundational decisions            |
| 11  | Close Phase 1: README, final CLAUDE_CONTEXT.md refresh (this PR) |

## Last updated

**End of Phase 1** — foundation complete. Public deployment, five documented
ADRs, three-layer quality gates, and observability infrastructure all in place.
Ready to begin Phase 2.
