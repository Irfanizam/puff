# Puff — Claude Context

> Paste this file at the start of every Claude conversation about Puff.
> Update it whenever something significant changes.

## Current phase

Phase 1 — Foundation. Steps 1–5 complete. Step 6 (observability) next.

## What's built

- Monorepo: pnpm workspaces + Turborepo, 4 packages
- `@puff/config`: shared TypeScript + ESLint configurations
- `@puff/types`: branded types, `Result<T,E>`, ISODateString
- `@puff/ui`: seed Button component (will expand in Phase 2)
- `apps/web`: Next.js 16 App Router app with cross-package imports verified at typecheck, runtime, and build layers
- Prettier configured workspace-wide
- ESLint flat config: shared base + per-app layering, zero-warning policy
- VSCode workspace settings: format-on-save, ESLint integration, workspace TypeScript
- Husky pre-commit hooks: lint-staged + typecheck + commitlint
- Conventional Commits enforced via commitlint
- GitHub Actions CI: format/lint/typecheck/build on every push and PR
- Branch protection on `main`: PR required, CI must pass, bypass prevented

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
- GitHub Actions for CI

## Stack (planned)

- shadcn/ui (Phase 2)
- MDX content collections (Phase 2)
- Sentry + Pino for observability (Phase 1, Step 6)
- Vercel deployment (Phase 1, Step 7)
- Vercel AI SDK, OpenAI, Anthropic (Phase 3)
- PostgreSQL + Prisma + pgvector (Phase 4)
- LangChain primitives + LangGraph + MCP (Phase 5)

## Architectural invariants

1. Apps consume packages. Packages never consume apps.
2. No secrets in code. Environment validated at boot.
3. Structured logger only — no `console.log` in production paths.
4. No `any` types. Use `unknown` and narrow, or proper types.
5. Every API route: rate limit + auth check + error boundary.
6. Every architectural decision becomes an ADR before merge.
7. `main` is always deployable. CI red = fix or revert immediately.
8. Direct push to `main` is impossible. PRs only.

## Toolchain decisions encoded

- pnpm 10 (not 11) due to subprocess workspace-root resolution bug in pnpm 11.0.9
- TypeScript 6 (latest stable as of install)
- Internal packages export TypeScript source directly (no build step); consumers transpile via Next.js's `transpilePackages`
- Workspace protocol (`workspace:*`) for all internal package references
- `onlyBuiltDependencies` allowlist for supply-chain defense (currently: sharp, unrs-resolver)
- Conventional Commits with relaxed subject-case rule

## ADRs written

None yet. Backlog from journey so far:

- ADR-001: Monorepo with pnpm workspaces + Turborepo
- ADR-002: Pin pnpm to 10.x (pnpm 11 subprocess bug)
- ADR-003: Folder structure (apps/, packages/, docs/)
- ADR-004: TypeScript shared config pattern
- ADR-005: Internal packages export source (no build step)
- ADR-006: Three-layer quality gates (editor, pre-commit, CI)
- ADR-007: Branch protection with bypass prevention

To be written at the end of Phase 1, before deployment.

## Currently working on

Phase 1, Step 6 — observability (Sentry, Pino, request IDs).

## Workflow notes

- Working in WSL2 Ubuntu via VSCode Remote
- Repo lives at `~/code/puff` (Linux filesystem, not Windows mount)
- SSH for GitHub
- Branch + PR + squash-merge workflow (direct pushes to main blocked)
- `git config --global pull.ff only` (fail-loud on divergence)

## Last updated

End of Phase 1, Step 5 — quality gates and branch protection complete.
