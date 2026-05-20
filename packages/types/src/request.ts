/**
 * Request-related types shared across the Puff ecosystem.
 *
 * These types describe the shape of request metadata that flows through
 * middleware, route handlers, and observability layers.
 */

import type { Brand } from "./common";

/**
 * Branded type for request IDs. Prevents accidentally using a generic
 * string where a request ID is expected (e.g. passing a user ID by mistake).
 *
 * Format: `req_` + ULID (e.g. "req_01HZX8Y7N3KQM5JR2VPDFGW4HC")
 */
export type RequestId = Brand<string, "RequestId">;

/**
 * Standard header name for request IDs across services.
 * We use lowercase per HTTP/2 convention (HTTP/2 normalizes headers to lowercase).
 */
export const REQUEST_ID_HEADER = "x-request-id";

/**
 * Validate that a string is a well-formed request ID.
 *
 * Useful when accepting client-provided request IDs — we trust them only
 * if they match our format. Reduces risk of log injection or strange chars.
 *
 * @param value - Candidate ID string from a header
 * @returns true if value matches "req_" + 26 ULID chars
 */
export function isValidRequestId(value: string): value is RequestId {
  return /^req_[0-9A-HJKMNP-TV-Z]{26}$/.test(value);
}
