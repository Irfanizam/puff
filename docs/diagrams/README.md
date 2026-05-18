# Architecture Diagrams

This folder holds visual architecture documentation for Puff — system diagrams, data flows, sequence diagrams, and component maps.

## Format

Diagrams are stored as **Mermaid** (`.mmd` or `.md` with mermaid blocks) where possible. Mermaid is text-based, diffable, and renders directly on GitHub.

For diagrams that can't be expressed in Mermaid (complex architecture, hand-drawn flows), use SVG with the source file kept alongside (`.excalidraw.svg`, `.drawio.svg`, etc.).

## When to add a diagram

Add a diagram when:

- A system has more than 3 components interacting
- A data flow is non-obvious from reading the code
- An ADR's text explanation would benefit from a picture
- Onboarding documentation is being written

Diagrams are NOT a substitute for clear code or good READMEs. They're a complement.

## File naming

`category-short-description.{mmd,svg}`

Examples:

- `system-overview.mmd` — high-level component map
- `data-flow-rag-ingestion.mmd` — RAG document ingestion pipeline
- `sequence-chat-stream.mmd` — chat streaming sequence
- `infra-deployment.svg` — deployment topology

## Linking from ADRs

ADRs can embed Mermaid blocks directly OR link to a file here:

```mermaid
graph LR
  A[Component] --> B[Component]
```

Or:

```markdown
See [diagrams/system-overview.mmd](../diagrams/system-overview.mmd).
```

## Index

(populated as diagrams are added)

| File | Description |
| ---- | ----------- |
| -    | -           |
