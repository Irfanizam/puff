/**
 * Common primitive types used across the Puff ecosystem.
 */

/**
 * A branded ID type. Forces type-safety even though the underlying value is a string.
 *
 * Usage:
 *   type UserId = Brand<string, "UserId">;
 *   type ProjectId = Brand<string, "ProjectId">;
 *
 * A UserId can no longer be accidentally passed where a ProjectId is expected.
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

/**
 * ISO 8601 timestamp string (e.g. "2026-05-11T07:00:00Z").
 * Use this instead of `string` whenever a value is semantically a timestamp.
 */
export type ISODateString = Brand<string, "ISODateString">;

/**
 * Discriminated union helper for API results.
 *
 * Usage:
 *   const result: Result<User, "NotFound" | "Forbidden"> = ...
 *   if (result.ok) { use(result.value) } else { handle(result.error) }
 */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };
