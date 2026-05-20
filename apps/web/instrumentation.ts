/**
 * apps/web/instrumentation.ts
 *
 * Next.js instrumentation entry point. Runs before any user code.
 *
 * Architecture:
 *   - Next.js calls `register()` once at startup for each runtime.
 *   - We branch on `NEXT_RUNTIME` to load the appropriate Sentry config.
 *   - `onRequestError` forwards request errors to Sentry, preserving
 *     the request context (URL, method, headers).
 */

import type { Instrumentation } from "next";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Called by Next.js when a request handler throws.
 * Captures the error and attaches request metadata for debugging.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  // Dynamically import Sentry so it stays out of bundles that don't need it.
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(err, request, context);
};
