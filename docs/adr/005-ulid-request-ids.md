# ADR-005: ULID-Based Request IDs for Full-Stack Correlation

**Status:** Accepted
**Date:** 2026-05-19
**Deciders:** Solo

## Context

In a system with concurrent requests, log lines and error reports are meaningless without a way to answer the question: "which events belong to the same request?" A user reports a bug at 2:47pm. The logs show three events at 2:46, 2:47, and 2:48. Are those three events about the same user, the same request, the same browser session? Timestamps alone cannot answer this — many concurrent requests generate events with similar timestamps.

The industry-standard solution is a **request ID** — a unique identifier generated for each incoming request, propagated through every log line and error report for that request. When a user reports a bug and references `req_abc123`, an engineer can filter all logs for that ID and see the complete story of the failing request, across services, in order, with full context.

The design questions for a request ID system are:

1. **What ID format?** UUIDs, timestamps, nanoids, ULIDs — each has different tradeoffs.
2. **Where is it generated?** At the edge (middleware), inside the route handler, or on the client?
3. **How is it propagated?** Headers, query params, a per-request context object?
4. **What happens if the client already sent an ID?** Trust it, overwrite it, or validate it?

Each choice has downstream implications for debuggability, security, and cross-service correlation.

## Decision

Generate a unique request ID for every HTTP request in Next.js middleware, using **ULID** (Universally Unique Lexicographically Sortable Identifier) with a `req_` prefix. Propagate the ID via both request headers (for downstream route handlers) and response headers (so clients can reference it in bug reports). Bind the ID to a child logger via `withContext` so every log line for that request includes the ID automatically.

Format: `req_01HZX8Y7N3KQM5JR2VPDFGW4HC` — 26 characters, base32 (Crockford's alphabet), time-sortable.

Client-provided `X-Request-ID` headers are honored **only if they match our format**. This allows upstream services (or the browser) to provide a correlating ID, but rejects malformed or malicious values by falling back to a fresh generation.

Middleware skips static asset paths (`_next/static`, `_next/image`, favicons, common file extensions) to avoid tagging build artifacts and reducing log volume.

## Alternatives considered

- **UUIDv4 (`550e8400-e29b-41d4-a716-446655440000`).** The default choice for unique IDs. Rejected because UUIDv4 is not sortable, has verbose 36-character format, and lacks the readability of prefixed IDs. The randomness guarantees are equivalent to ULID's, but ULID adds sort order at no cost.

- **UUIDv7 (time-sortable UUIDs).** A newer UUID variant with embedded timestamps, providing similar sort properties to ULID. Rejected because ULID has better ecosystem maturity in Node.js and its base32 encoding is more human-readable than hex-encoded UUIDs. UUIDv7 is a legitimate alternative and may become the future default.

- **Nanoid.** Compact random IDs (default 21 characters), URL-safe alphabet. Rejected because nanoid is not time-sortable — two IDs generated seconds apart have no ordering relationship. Sorting logs by ID requires timestamp joins, defeating the purpose of a lexicographic identifier.

- **Timestamp + random suffix.** Simple to implement but requires explicit collision handling and doesn't have the standardized format that tools expect. Rejected because ULID provides the same properties with a battle-tested spec.

- **Generate the ID inside route handlers instead of middleware.** Would mean each route handler is responsible for generating and logging the ID. Rejected because it duplicates work, is easy to forget, and misses requests that fail before reaching a handler (redirects, 404s, edge errors). Middleware sees every request without exception.

- **Reject client-provided IDs entirely.** Would guarantee ID quality but breaks a real use case: an upstream service (like a browser client or another backend) generating an ID first and expecting the API to use the same one for correlation across the full stack. Rejected because trust-with-validation strikes a better balance than reject-everything.

## Consequences

### Positive

- Every log line for a request includes the request ID automatically (via `withContext` on the shared logger from ADR-004). Correlating events for a single request becomes a one-line query.
- ULID's time-sortable property means grep results appear in chronological order without needing timestamp joins. When investigating an incident, you see events in the order they happened, sorted by ID.
- The `req_` prefix makes IDs visually distinguishable from other identifiers. When you see `req_01HZ...` in a log line, you know instantly it's a request ID, not a user ID or a database key.
- The 26-character base32 format is short enough to appear cleanly in logs, URLs, and error messages. UUIDs at 36 characters wrap awkwardly and reduce readability.
- Response headers include the ID, so client-facing error UI can surface it to users. "Something went wrong. Reference: req_01HZ..." makes support requests actionable.
- Client-provided IDs (when valid) enable end-to-end correlation. A browser can generate an ID, include it in an API call, and both the client-side log and server-side log share the same identifier.
- Edge runtime compatibility. ULID generation uses only `crypto.getRandomValues`, which is available in all Next.js runtimes.

### Negative

- ULID is less familiar than UUID to engineers unfamiliar with the spec. Documentation is required so new contributors understand the format.
- Validating client-provided IDs adds a small amount of code and one more thing to keep in sync (the regex must match the actual generator's output).
- Static asset filtering via the middleware `matcher` config requires maintenance — new file extensions or paths must be added to the exclusion pattern.

### Neutral

- ULID's alphabet excludes characters that can be confused visually (I, L, O, U in Crockford base32). This is a feature for human readability but occasionally surprises engineers who expect random alphanumerics.
- The `req_` prefix adds four characters to every ID. In aggregate this is trivial, but purists may object to non-standard formats. The interview-defensible answer is that visual clarity in logs beats theoretical purity.

## Validation

The decision is working when:

- Every incoming HTTP request produces exactly one request ID.
- That ID appears in the request's response header (`x-request-id`), in every log line generated during the request, and in Sentry events for that request.
- Refreshing a page produces a different ID (proving middleware runs per-request, not once per session).
- A client-supplied `X-Request-ID` that matches our format is honored; a malformed one is replaced.
- Static asset requests (like favicon.ico) do NOT generate log lines with request IDs, keeping log volume manageable.

The decision is failing if:

- Requests slip through without an ID (indicates middleware isn't matching the route).
- Client-provided IDs cause security issues (log injection, XSS via ID field). Format validation must be strict enough to prevent this.
- Log volume becomes unmanageable due to static asset requests bypassing the matcher exclusions.

Manual verification procedure (used during Phase 1 verification):

1. Load the page. Note the ID displayed in the page body.
2. Open browser DevTools → Network tab. Find the request. Check response headers for `x-request-id`.
3. Confirm the two IDs match.
4. Check the server logs. Confirm the same ID appears in the "rendering home page" log entry.
5. Refresh the page. Confirm the ID changes.

## References

- Implementation: [`bd67510`](https://github.com/Irfanizam/puff/commit/bd67510) (add request ID middleware).
- Middleware location: `apps/web/src/middleware.ts`.
- Type definitions: `packages/types/src/request.ts`.
- [ULID specification](https://github.com/ulid/spec)
- [Next.js middleware documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- ADR-004 (shared logger) — provides the `withContext` mechanism used for correlation.
