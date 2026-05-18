# Architecture Decision Records

This folder holds **ADRs** (Architecture Decision Records) — short documents that capture significant architectural decisions, why they were made, and what tradeoffs they accept.

## Why ADRs

Architecture decisions made today become "history" tomorrow. Six months later, when someone (often yourself) asks "why did we choose pnpm 10?", the ADR has the answer. Without ADRs, decisions are repeated, reversed, or forgotten.

ADRs are not documentation of how things work — that lives in code comments and READMEs. ADRs document **why things are the way they are**, especially when the alternatives weren't obviously worse.

## When to write one

Write an ADR when a decision:

- Affects multiple parts of the codebase
- Was non-trivial (multiple options considered)
- Will be expensive to reverse
- Future you or new teammates would reasonably question

Don't write an ADR for:

- Routine code organization (`function placement, naming`)
- Decisions where there was only one reasonable choice
- Library version bumps unless they involved a real choice

## File naming

`NNN-short-kebab-case-title.md`

- `NNN` is a zero-padded sequence: `001`, `002`, `003`
- Title is short, describes the decision, kebab-case

Examples:

- `001-monorepo-with-pnpm-and-turborepo.md`
- `002-pin-pnpm-to-10-x.md`
- `003-three-layer-quality-gates.md`

Numbers are **never reused**, even if an ADR is later superseded. The status field handles supersession.

## Template

See `_template.md` in this folder. Copy it as a starting point.

## Status values

Each ADR has a status:

- **Proposed** — written but not yet decided
- **Accepted** — decided and in effect
- **Deprecated** — no longer recommended but not yet replaced
- **Superseded by ADR-XXX** — replaced by a newer decision

## Index of decisions

(populated as ADRs are written)

| #   | Title | Status |
| --- | ----- | ------ |
| -   | -     | -      |
