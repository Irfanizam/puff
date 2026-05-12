# Puff — Claude Context

> Paste this file at the start of every Claude conversation about Puff.
> Update it as the project evolves.

## Current phase

Phase 1 — Foundation (Week 1)

## What's built

- Monorepo skeleton with pnpm workspaces and Turborepo
- Folder structure: apps/, packages/{ui,config,types}/, docs/adr/
- Git identity and SSH configured
- Root package.json, tsconfig.json, turbo.json

## Stack (current)

- Node 24, pnpm 11
- TypeScript with strict mode + noUncheckedIndexedAccess
- Turborepo for orchestration
- Git via SSH

## Stack (planned)

- Next.js 15 App Router (Phase 1 end)
- TailwindCSS + shadcn/ui (Phase 2)
- MDX content collections (Phase 2)
- Vercel AI SDK, OpenAI, Anthropic (Phase 3)
- PostgreSQL + Prisma + pgvector (Phase 4)
- LangGraph, MCP (Phase 5)

## Architectural invariants

1. Apps consume packages. Packages never consume apps.
2. No secrets in code. Environment validated at boot.
3. Structured logger only — no `console.log` in production paths.
4. No `any` types. Use `unknown` and narrow, or proper types.
5. Every API route: rate limit + auth check + error boundary.
6. Every architectural decision becomes an ADR before merge.
7. `main` is always deployable. CI red = fix or revert immediately.

## ADRs written

(none yet — coming end of Phase 1)

## Currently working on

Phase 1, Step 3: Monorepo skeleton

## Workflow notes

- Working in WSL2 Ubuntu via VSCode Remote
- Repo lives at ~/code/puff (Linux filesystem, not Windows mount)
- Using SSH for GitHub
