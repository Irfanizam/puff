# Puff

An AI engineering ecosystem — a personal flagship project demonstrating production-grade infrastructure for AI systems, built incrementally in public.

**Live:** [puff-puce.vercel.app](https://puff-puce.vercel.app)
**Author:** [Muhammad Irfan](https://github.com/Irfanizam)
**Status:** Phase 1 complete. Phase 2 (Content & UI) in progress.

## What Puff Is

Puff is a monorepo that will house a portfolio of interconnected AI systems: a portfolio platform with an AI-powered recruiter chatbot, a RAG knowledge base grounded in the author's engineering writing, multi-step agents for research and synthesis, and an engineering blog documenting the decisions behind them.

The goal is not to build a demo. The goal is to build a system that survives the same production concerns real AI teams face: observability, cost, security, evaluation, and disciplined iteration. Every decision is documented as an ADR; every commit ships through code review, CI gates, and preview deploys.

## Architecture (Phase 1 Foundation)

puff/
apps/
web/ Next.js 16 App Router app (deployed to Vercel)
packages/
config/ Shared TypeScript and ESLint configurations
types/ Shared domain types (Result, RequestId, branded types)
ui/ Design system components (expanding in Phase 2)
logger/ Structured logger built on Pino, with redaction
docs/
adr/ Architecture Decision Records
diagrams/ Architecture diagrams
.github/workflows/ GitHub Actions CI

**Toolchain:** Node 22+, pnpm 10.18.0 (pinned via Corepack), TypeScript 6, Turborepo 2.9, Next.js 16 with Turbopack.

## Engineering Discipline

The foundation was designed to reflect what a senior engineer would insist on before shipping any AI features:

- **Three-layer quality gates** — editor (Prettier + ESLint in VSCode), pre-commit (Husky + lint-staged + commitlint + typecheck), CI (GitHub Actions runs format/lint/typecheck/build on every push and PR). See [ADR-003](docs/adr/003-three-layer-quality-gates.md).
- **Branch protection with bypass prevention** — direct pushes to `main` are physically impossible. Every change goes through a PR with green CI.
- **Full-stack observability from day one** — structured logging with automatic secret redaction, ULID-based request IDs propagated through headers and logs for full-stack correlation, Sentry integrated across server/client/edge runtimes. See [ADR-004](docs/adr/004-shared-logger-with-redaction.md) and [ADR-005](docs/adr/005-ulid-request-ids.md).
- **Supply-chain awareness** — pnpm's `onlyBuiltDependencies` allowlist restricts which packages can execute install scripts, defending against supply-chain attacks.
- **Documented decisions** — every non-trivial architectural choice becomes an [ADR](docs/adr/) explaining context, alternatives considered, and tradeoffs accepted.

## Documentation

- [Architecture Decision Records](docs/adr/) — the "why" behind the code.
- [CLAUDE_CONTEXT.md](CLAUDE_CONTEXT.md) — living context document for AI-assisted development sessions.

## Roadmap

| Phase                  | Focus                                                           | Status      |
| ---------------------- | --------------------------------------------------------------- | ----------- |
| 1. Foundation          | Monorepo, tooling, observability, deploy                        | Complete    |
| 2. Content & UI        | Design system, MDX blog, portfolio pages                        | In progress |
| 3. AI Assistant        | Streaming chatbot, Vercel AI SDK, Python FastAPI service        | Planned     |
| 4. RAG Knowledge Base  | Ingestion pipeline, pgvector, hybrid search, evaluation harness | Planned     |
| 5. Agent Orchestration | LangGraph multi-step agents, MCP tool integration               | Planned     |
| 6. Production Polish   | Cost dashboard, eval CI, security hardening                     | Planned     |

## Local Development

Prerequisites: Node 22+, pnpm (Corepack will install the pinned version automatically).

```bash
git clone git@github.com:Irfanizam/puff.git
cd puff
pnpm install
pnpm dev
```

The web app runs at `http://localhost:3000`.

## License

UNLICENSED. Personal portfolio project — code is public for review, not for reuse.
