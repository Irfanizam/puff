/**
 * apps/web/src/middleware.ts
 *
 * Next.js middleware running on every request (subject to the `matcher` below).
 *
 * Responsibilities:
 *   1. Generate or honor a request ID (correlation across logs and services)
 *   2. Propagate the ID via request and response headers
 *   3. Skip static asset paths to avoid log noise
 *
 * Architectural notes:
 *   - Runs in the Edge runtime (V8 isolates, no Node.js APIs)
 *   - Uses ulid() for time-sortable, compact IDs
 *   - Honors client-provided X-Request-ID if it matches our format,
 *     so frontend and backend can share IDs for full-stack correlation
 *
 * Downstream code (route handlers, server components) reads the ID via:
 *   const requestId = request.headers.get(REQUEST_ID_HEADER);
 */

import { NextResponse, type NextRequest } from "next/server";
import { ulid } from "ulid";
import { REQUEST_ID_HEADER, isValidRequestId } from "@puff/types";

/**
 * Generate a new request ID with our `req_` prefix.
 *
 * Format: `req_` + 26-char ULID (base32, time-sortable).
 * Example: req_01HZX8Y7N3KQM5JR2VPDFGW4HC
 */
function generateRequestId(): string {
  return `req_${ulid()}`;
}

/**
 * Read a client-provided request ID from request headers, if present and valid.
 *
 * We accept the client's ID only when it matches our exact format. This:
 *   - Prevents log injection from malicious headers
 *   - Keeps log IDs visually consistent (greppable)
 *   - Still allows upstream services to correlate via X-Request-ID
 *
 * Returns null if no valid client ID is present (caller should generate one).
 */
function readClientRequestId(request: NextRequest): string | null {
  const fromHeader = request.headers.get(REQUEST_ID_HEADER);
  if (fromHeader && isValidRequestId(fromHeader)) {
    return fromHeader;
  }
  return null;
}

export function middleware(request: NextRequest): NextResponse {
  // Use client-provided ID if valid; otherwise generate a fresh one.
  const requestId = readClientRequestId(request) ?? generateRequestId();

  // Clone request headers so we can mutate them, then pass to NextResponse.
  // This makes the ID available to route handlers and server components.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  // Forward the modified request while also setting the response header
  // (so clients can reference the ID when reporting bugs).
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}

/**
 * Matcher: which paths the middleware runs on.
 *
 * We exclude:
 *   - /_next/static (build assets — no value in tagging them with IDs)
 *   - /_next/image (image optimization — high volume, low debug value)
 *   - /favicon.ico (browser noise)
 *   - common static file extensions
 *
 * If we need to instrument any of these later (e.g. tracking favicon 404s),
 * we add them back deliberately.
 *
 * The negative lookahead syntax is Next.js's matcher convention.
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/middleware#matcher
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)"],
};
