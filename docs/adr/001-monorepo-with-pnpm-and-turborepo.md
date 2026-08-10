# ADR-001: Monorepo with pnpm Workspaces and Turborepo

**Status:** Accepted
**Date:** 2026-05-11
**Deciders:** Solo

## Context

Puff is conceived as an ecosystem of related but distinct deployable units: a Next.js portfolio app, a future Python ingestion service, agent workers, an evaluation harness, and shared libraries (UI components, types, AI provider abstractions, logging). These units need to share code — design tokens, type definitions, provider clients — but also have independent build, test, and deploy lifecycles.

Two organizational patterns exist for this situation:

1. **Polyrepo**: each unit lives in its own Git repository, shares code via published npm packages.
2. **Monorepo**: all units live in one repository, share code via local file references.

For a solo developer building a flagship portfolio project, the tradeoffs lean heavily toward monorepo. Polyrepo's strengths (team isolation, independent versioning, CI granularity) require organizational scale that doesn't apply here. Polyrepo's weaknesses (cross-repo refactoring is impossible, shared code requires publish-or-copy, onboarding requires cloning many repos) directly hurt solo velocity.

## Decision

Use a monorepo structured with **pnpm workspaces** and orchestrated by **Turborepo**.

Workspace layout:
puff/
├── apps/ # Deployable units
│ └── web/ # Next.js portfolio app
│
├── packages/ # Shared, importable code
│ ├── config/ # TypeScript and ESLint configurations
│ ├── types/ # Shared TypeScript types
│ ├── ui/ # Design system components
│ └── logger/ # Structured logger built on Pino
│
├── package.json
├── turbo.json
├── pnpm-workspace.yaml
└── tsconfig.json
Workspace dependencies use the `workspace:*` protocol so internal packages always resolve to local sources rather than npm.

## Alternatives considered

- **Polyrepo with npm packages**: Each subsystem in its own repo, shared code published to a private npm registry. Rejected because solo development can't justify the publish-and-version overhead, and atomic cross-package changes become impossible.

- **Monorepo with npm workspaces (no Turborepo)**: pnpm + npm-style workspaces would work for installation, but lacks task orchestration. Without Turborepo, every "build everything" command rebuilds all packages from scratch. Rejected because incremental builds matter from day one.

- **Nx monorepo**: A more powerful alternative to Turborepo, with code generation, dependency graph analysis, and project boundaries. Rejected because Nx's complexity exceeds the project's current scale; reaching for it would be over-engineering. Turborepo is the right level of tool for a single-developer monorepo.

- **Lerna**: Historically the leading monorepo tool, now in maintenance mode. Rejected because the active maintenance community has moved to pnpm + Turborepo.

## Consequences

### Positive

- One `git clone` gives a new contributor the entire system.
- Cross-package refactors are atomic single PRs (change a type in `@puff/types`, every consumer is updated in the same commit).
- Shared code (UI, types, logger) costs zero overhead to share — direct imports via the workspace protocol.
- Turborepo's content-based caching makes repeated builds nearly instant. CI passes from 4 minutes to under 10 seconds when only documentation changes.
- pnpm's strict node_modules layout catches phantom dependencies — code that imports a package that isn't declared in its package.json refuses to resolve.
- Recruiters review a single repository to understand the full system, rather than navigating between five.

### Negative

- Initial tooling setup is heavier than a single Next.js app. The first day involves configuring Turborepo task graphs, pnpm workspace YAML, and shared TypeScript configs before any product code is written.
- All packages share the same Node.js and pnpm versions. Cross-language services (the planned Python ingestion service) need a separate strategy — Docker containers or a `services/` directory outside the pnpm workspace.
- Visibility scales poorly past ~50 packages. At that point, Nx's project graph or a split into multiple monorepos becomes warranted.

### Neutral

- The repository grows faster than separate repos would, because more code lives in fewer places. Git history remains useful at small to medium scale.
- Workspace protocols (`workspace:*`) are non-standard semver. They work in pnpm, Yarn, and npm 7+ but couldn't be published to npm directly — by design, since these packages are internal.

## Validation

The decision is working when:

- New contributors can clone the repo and run `pnpm install && pnpm build` to get a working environment.
- Adding a new package (e.g., `@puff/ai-providers` in Phase 3) requires creating one directory and one `package.json`, then importing it from any consumer without registry overhead.
- Turborepo's cache hits dominate CI runtime (typecheck and lint complete in under 100ms when no relevant files changed).
- Cross-package type changes propagate immediately at compile time, not after a publish step.

The decision is failing if:

- Build times grow non-linearly with package count.
- Package boundaries are routinely violated (apps importing from each other, packages depending on apps).
- The dependency graph becomes unclear and developers cannot reason about what depends on what.

If these signals appear, the next decision is whether to split into multiple monorepos or migrate to Nx.

## References

- [pnpm workspaces documentation](https://pnpm.io/workspaces)
- [Turborepo handbook](https://turbo.build/repo/docs)
- [Original repository setup PR](https://github.com/Irfanizam/puff/commit/263d8ff)
