The bug is not about the package being genuinely missing — `pnpm m ls` from the repo root correctly listed all five workspace packages. The bug is that pnpm 11.0.9's `runDepsStatusCheck` subprocess fails to walk up the directory tree to find `pnpm-workspace.yaml` when invoked from a subdirectory. It treats the current working directory as the workspace root and only sees the single package living there.

This breaks the entire Turbo-orchestrated task graph, which is the mechanism our monorepo uses to run typecheck, lint, and build across packages efficiently. Without a working orchestrator, we lose the primary reason to have adopted the monorepo structure in the first place.

## Decision

Pin pnpm to version **10.18.0** via the `packageManager` field in the root `package.json`:

```json
{
  "packageManager": "pnpm@10.18.0+sha512.e804f889..."
}
```

Corepack reads this field and activates the specified pnpm version automatically whenever anyone runs `pnpm` in this repo. CI uses the same mechanism (GitHub Actions' `pnpm/action-setup` reads the `packageManager` field), so local dev and CI use identical pnpm binaries.

## Alternatives considered

- **Configure around the bug on pnpm 11.** Attempted `verify-deps-before-run=false` in `.npmrc`, which turned out not to be a valid pnpm 11 config key. Explored clearing Turbo caches, pnpm store, and node_modules. None of these addressed the root cause because the bug lives in pnpm 11's code path, not in cached state. Rejected because we chased symptoms rather than the actual regression.

- **Wait for a pnpm 11 patch release.** Legitimate long-term solution, but blocks all Turbo-orchestrated work indefinitely. The project can't stall on an upstream fix schedule that isn't in our control. Rejected because velocity matters more than living on the latest major.

- **Pin pnpm via a shell script or `.nvmrc`-style file.** Would work but bypasses Corepack, which is Node.js's built-in, actively-maintained mechanism for pinning package manager versions. Rejected because Corepack is the modern standard and avoids inventing our own convention.

- **Switch to npm or yarn workspaces.** Would sidestep the pnpm bug entirely but requires rewriting `workspace:*` references, losing pnpm's strict node_modules layout (which catches phantom dependencies), and losing performance. Rejected because the underlying pnpm ecosystem is where we want to be; we're just avoiding one bad version.

## Consequences

### Positive

- Reproducible builds. Anyone cloning the repo — including CI and future teammates — gets pnpm 10.18.0 automatically via Corepack. No "works on my machine" version drift.
- Turbo orchestration works reliably. `pnpm typecheck`, `pnpm lint`, and `pnpm build` all succeed both from the repo root and from within workspaces.
- The pin is minimally invasive. It's one line in `package.json`, not a fork, not a patch, not a workaround in every consumer.
- Corepack handles the install transparently. `pnpm install` triggers Corepack to download the pinned version if it isn't cached.

### Negative

- We are one major version behind. Any pnpm 11 features and performance improvements are unavailable to us until we upgrade.
- Manual action is required to upgrade. When pnpm patches the subprocess bug, we have to explicitly bump the `packageManager` field, run `corepack use pnpm@X`, verify all gates pass, and merge the change.
- The pin is fragile if pnpm 10 itself receives a security patch. We'd want to bump to the latest 10.x, which still requires an explicit action.

### Neutral

- pnpm 10 and pnpm 11 share the same lockfile format, so the eventual upgrade is a one-line change in `package.json` followed by `pnpm install`.
- Most pnpm features Puff relies on (workspace protocol, `onlyBuiltDependencies`, `pnpm-workspace.yaml` structure) exist identically in both versions. The pin doesn't cost us any functionality we actually use.

## Validation

The decision is working when Turbo-orchestrated tasks succeed consistently:

- `pnpm typecheck` runs across all workspaces without `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`.
- `pnpm build` produces a valid Next.js production output.
- CI (which uses the same `packageManager` field via `pnpm/action-setup`) passes green on every PR.
- New contributors can `git clone && pnpm install` and immediately have a working environment.

The decision is safe to reverse when:

- pnpm's release notes explicitly mention fixing subprocess workspace resolution (search terms: "runDepsStatusCheck", "ERR_PNPM_WORKSPACE_PKG_NOT_FOUND").
- Running the failing scenario in a test branch (`chore/try-pnpm-11-upgrade`) succeeds end-to-end.

Upgrade procedure when the fix ships:

1. In a branch, change `packageManager` to the target pnpm 11.x version.
2. Run `corepack use pnpm@<version>` to activate it locally.
3. Run all four gates: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm build`.
4. Push, verify CI green on the PR, merge.

If gates fail on upgrade, revert the `packageManager` change and file an upstream issue.

## References

- Symptom encountered during Phase 1, Step 4 monorepo scaffolding.
- Implementation commit: [`93e266c`](https://github.com/Irfanizam/puff/commit/93e266c) (scaffold Next.js app; also introduced the pin).
- [Corepack documentation](https://nodejs.org/api/corepack.html) — the standard mechanism for pinning package managers.
- [pnpm changelog](https://github.com/pnpm/pnpm/releases) — check here for future fixes to subprocess workspace resolution.
  EOFs
