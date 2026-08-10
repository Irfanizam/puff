# ADR-003: Three-Layer Quality Gates (Editor, Pre-Commit, CI)

**Status:** Accepted
**Date:** 2026-05-18
**Deciders:** Solo

## Context

A codebase that relies on developer discipline to maintain quality erodes as time passes and pressure mounts. Formatting drifts, `console.log` calls creep into production paths, type errors slip past because someone forgot to run typecheck before committing, and eventually the `main` branch stops being trustworthy.

The failure mode is not lack of skill — it's absence of enforcement. Every senior engineer has at some point committed code they didn't intend to, missed a lint warning while tired, or shipped a change that broke on a different machine. The fix is not to demand more discipline; it is to make quality checks impossible to bypass without deliberate action.

For a solo portfolio project, this seems like over-engineering. Why enforce rules when the only person breaking them is me? The answer is that the enforcement itself is the artifact. A repository whose quality is guaranteed by tooling reads differently to a reviewer than one whose quality relies on a developer promising to be careful. The former is production-grade; the latter is hobby-grade. This distinction is the difference between resumes that get interviews and those that do not.

## Decision

Enforce quality via three sequential layers, each stricter and harder to bypass than the previous:

1. **Editor gate** — Prettier formats on save, ESLint highlights errors in real time via VSCode extensions. Settings committed in `.vscode/settings.json` so every contributor gets the same behavior.

2. **Pre-commit gate** — Husky runs `lint-staged` (Prettier + ESLint with `--fix` on staged files) followed by `pnpm typecheck` across the workspace. Commitlint validates the commit message against Conventional Commits format. All three must pass before the commit enters local Git history.

3. **CI gate** — GitHub Actions runs `format:check`, `lint`, `typecheck`, and `build` on every push and pull request, using `--frozen-lockfile` to catch dependency drift. Branch protection on `main` requires this workflow to pass before any pull request can merge, with bypass prevention enabled so admin overrides are impossible.

Each layer runs the same underlying tools (Prettier, ESLint, TypeScript) at a different time in the developer flow, catching different mistakes at increasingly expensive stages.

## Alternatives considered

- **Rely on CI alone.** Simple to set up, but pushes bugs to the network — developers only discover issues after pushing and waiting for CI to run. The feedback loop is 3-5 minutes instead of 3-5 seconds. Rejected because slow feedback becomes ignored feedback; developers stop reading CI output.

- **Rely on pre-commit hooks alone.** Faster feedback than CI but bypassable via `git commit --no-verify`. Also fails when the hook needs environmental information (like network access) that isn't available on all machines. Rejected because a single layer cannot address both local editor speed and enforcement guarantees.

- **Rely on editor integration alone.** Fastest possible feedback but assumes every contributor uses the same editor with the same extensions installed. Falls apart when a developer commits from the terminal, when extensions are disabled, or when new team members skip the setup. Rejected because editor integration should assist, not enforce.

- **Adopt a heavier tool like Nx or a monolithic linting solution.** More centralized configuration but requires learning a larger surface area for a solo project. Rejected because the three-tool composition (Prettier + ESLint + TypeScript) is standard and portable across future teams and jobs.

## Consequences

### Positive

- Every bug caught at an earlier layer is exponentially cheaper. An error the editor highlights is fixed while typing; an error CI catches costs a full workflow re-run cycle to fix.
- The `main` branch is guaranteed to be in a deployable state at all times. This is a structural property, not a promise.
- Configuration is shared and version-controlled. Every contributor gets identical behavior without setup instructions beyond `pnpm install`.
- Standards evolve visibly. Adding a new lint rule is a code change with a diff, not a Slack message. Future contributors can see when and why each rule was added.
- The pre-commit gate physically blocks bad commits from entering local history. Even if CI fails to run for infrastructure reasons, the local gate has already validated the change.
- Recruiters reviewing the repository see the quality apparatus and understand the discipline before evaluating any product code.

### Negative

- The initial setup cost is significant — an entire step of Phase 1 (Step 5) is dedicated to configuring these three layers before any feature work.
- Each layer adds seconds to the commit cycle. A pre-commit gate that runs typecheck adds 3-8 seconds per commit; multiplied across dozens of commits per day, this is real time.
- False positives from lint or format checks can block legitimate work. When they occur, the developer must either fix the issue, adjust the rule (with justification), or bypass with `--no-verify` (auditable but frowned upon).
- ESLint flat config, Husky, lint-staged, and commitlint each have their own configuration surfaces, meaning four separate places to reason about when something behaves unexpectedly.

### Neutral

- The gates enforce standards but do not choose them. Bad rules cause bad outcomes; the gates just enforce whatever we configure. Rule selection remains an ongoing responsibility.
- Bypass mechanisms exist at every layer (`--no-verify` for pre-commit, admin overrides for branch protection before we disabled them). The gates are protections, not prisons. This is intentional — auditable bypass is better than rigid enforcement.

## Validation

The decision is working when:

- The `main` branch has zero CI-red commits in its history.
- Commit history shows no `--no-verify` bypasses without a corresponding explanation in the commit message or PR.
- Pre-commit runs consistently in under 15 seconds, keeping the feedback loop tight enough that developers don't feel motivated to bypass.
- New rule additions (e.g., forbidding `console.log` in ADR-011's context) can be introduced by editing a single shared configuration file, and are enforced everywhere by the next commit.

The decision is failing if:

- Developers routinely bypass pre-commit hooks with `--no-verify`.
- CI runtime grows so long that developers stop reading its output.
- Rules accumulate faster than they can be maintained, and lint failures become noise rather than signal.
- The configuration surfaces drift out of sync (e.g., ESLint rules that exist in one workspace but not the shared base).

If these signals appear, the response is to consolidate configuration (ADR-011 was this consolidation for ESLint rules) or to prune rules that no longer earn their keep.

## References

- Implementation across commits `7f86c5a` (Prettier), `1fecbae` (ESLint), `34a85ac` (VSCode workspace settings), `767761a` (Husky and commitlint), `d6fe5ca` (GitHub Actions CI).
- [Prettier documentation](https://prettier.io/docs/en/)
- [ESLint flat config documentation](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Husky documentation](https://typicode.github.io/husky/)
- [Conventional Commits specification](https://www.conventionalcommits.org/)
- [GitHub branch protection documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
