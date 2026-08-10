# ADR-004: Shared Structured Logger Built on Pino

**Status:** Accepted
**Date:** 2026-05-18
**Deciders:** Solo

## Context

Every subsystem in Puff will eventually need to log — the Next.js app logs page renders and API calls, the future Python ingestion service logs document processing, agent workers log tool invocations and decision steps. If each subsystem chooses its own logging library and format, correlating events across services becomes archaeology. When a user reports "the chatbot failed at 2:47pm," you need to trace their request across every service that touched it. That trace only works when every service speaks the same log format.

Beyond format consistency, three specific requirements shape the logger design:

1. **Structured fields over strings.** `log.info("user 123 logged in")` cannot be queried later; `log.info({ userId: 123, event: "login" })` can. Modern log aggregators (Datadog, Better Stack, Axiom) are structured databases, not text files. Emitting logs in a way they can index is the difference between "grep and pray" and "SELECT \* WHERE user_id = 123."

2. **Secret redaction at the source.** Engineers accidentally log entire request bodies. When those bodies contain tokens, passwords, or personal data, they become breaches the moment logs leave the machine. Redaction has to happen at the logger level, not per-call, because per-call redaction relies on the engineer remembering — and engineers don't remember at 3am during an incident.

3. **Edge runtime compatibility.** Next.js runs some code in the Edge runtime (V8 isolates, no Node.js APIs). Our middleware and edge route handlers must be able to log the same way as our Node.js code, using the same format, without crashing.

## Decision

Build a shared `@puff/logger` package as a workspace dependency, exporting a configured Pino instance. All Puff subsystems import from this package; none configure Pino independently.

The package exports two primary functions:

- `createLogger(name)` — factory returning a Pino logger scoped to a service or module name. The name appears in every log line, making it trivial to filter by service.
- `withContext(logger, fields)` — creates a child logger with bound fields. Used by request-scoped code to attach the request ID to every subsequent log line automatically.

Key implementation choices:

- Log level defaults are environment-aware: `debug` in development, `info` in production, `silent` in test.
- Output format is environment-aware: `pino-pretty` for human-readable dev output, structured JSON in production (ready for log aggregators) and in CI (consistent with production).
- Field-level redaction is applied by Pino to a curated list of paths (`password`, `token`, `apiKey`, `authorization` headers, etc.). Sensitive fields are replaced with `[REDACTED]` before the log line is emitted.
- Error objects use Pino's built-in serializer so `log.error({ err }, "failed")` produces properly formatted stack traces instead of `{ err: {} }`.

## Alternatives considered

- **Winston.** The historically dominant Node.js logger with more built-in transports. Rejected because Pino is significantly faster in benchmarks, Winston's edge runtime compatibility is weaker, and the ecosystem has increasingly consolidated around Pino for production Node.js applications.

- **Bunyan.** JSON-first logger similar in design to Pino, but with less active maintenance and a smaller current ecosystem. Rejected as a losing bet on maintenance trajectory.

- **`console.log` with a wrapper.** The simplest option — write a small utility that formats console output. Rejected because building our own logger would require re-implementing structured field handling, log levels, redaction, and serialization. All of these already exist in Pino and are battle-tested by production systems.

- **A remote logging service SDK (Datadog Agent, Better Stack SDK).** Would send logs to a service directly, bypassing local output entirely. Rejected because it couples the codebase to a vendor and eliminates local debug output. Better to log via Pino and pipe to a service at the transport level when we scale.

- **Per-subsystem logger with a shared type contract.** Each subsystem configures its own logger, but they all export the same interface. Rejected because "shared contract enforced by discipline" is exactly what ADR-003 argues against; if we can share configuration in a package, we should.

## Consequences

### Positive

- One log format across the entire Puff ecosystem, current and future. When Phase 4 adds a Python service, it also writes logs in a format that composes with the Node.js side.
- Sensitive field redaction is a structural guarantee, not a per-call habit. Engineers cannot forget to redact because they never had to remember.
- Child loggers via `withContext` make request-scoped logging trivial. Bind the request ID once, every subsequent log line inherits it. This unlocks the correlation pattern in ADR-005.
- Pino's performance overhead is near-zero. In benchmarks, Pino processes hundreds of thousands of log lines per second per core, so we never think about logging as a bottleneck.
- Log level can be tuned via environment variable at runtime (`LOG_LEVEL=debug pnpm dev`) without code changes, useful for debugging specific incidents.

### Negative

- The convention of "structured fields first, message second" (`log.info({ field: value }, "message")`) is unusual for developers coming from `console.log` style. Documentation and code review are needed to establish the habit.
- Adding a shared package increases the workspace's package count. In our case this is fine because `packages/` is small, but a very large monorepo could complicate this pattern.
- Pino's redaction is path-based. A field with a nonstandard name (like `x_secret_token`) won't be redacted unless the path is added explicitly. This is a maintenance burden as new sensitive fields are added.

### Neutral

- Log output is JSON in production, which is unreadable without a viewer. Local development uses `pino-pretty` to translate on the fly. This is standard practice for production Node.js and worth the tradeoff.
- The logger is initialized once per module (`const log = createLogger("module-name")` at file scope). This is the recommended Pino pattern and has negligible overhead, but is worth mentioning as an architectural convention.

## Validation

The decision is working when:

- Any code path in Puff can call `createLogger` and get a properly configured logger without additional setup.
- Log output in production is valid line-delimited JSON, parseable by any log aggregator.
- Request-scoped log lines include the request ID (via child loggers), enabling per-request correlation.
- A deliberately logged sensitive field (like a request body containing `password`) appears as `[REDACTED]` in the output.
- Adding a new subsystem requires zero decisions about logging library, format, or configuration.

The decision is failing if:

- Subsystems adopt their own logging conventions despite the shared package existing.
- Redaction paths lag behind actual sensitive field names, allowing secrets to leak into logs.
- Log output volume grows unmanageably because log levels aren't respected (everything logs at `debug`).
- Performance becomes noticeable, requiring per-service optimization.

If these signals appear, the response is to enforce the shared logger via lint rule (similar to the `no-console` rule in ADR-003) and to add redaction paths as sensitive fields are discovered.

## References

- Implementation: [`633a910`](https://github.com/Irfanizam/puff/commit/633a910) (add @puff/logger).
- Package location: `packages/logger/src/index.ts`.
- [Pino documentation](https://getpino.io/)
- [Pino redaction guide](https://getpino.io/#/docs/redaction)
- ADR-005 (ULID request IDs) — uses this logger's `withContext` for correlation.
