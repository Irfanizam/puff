/**
 * apps/web/sentry.client.config.ts
 *
 * Sentry initialization for the browser runtime.
 * Loaded into client-side bundle.
 *
 * Note: NEXT_PUBLIC_ prefix exposes the DSN to the browser, which is fine —
 * DSNs are designed to be publishable. They identify the project, not authorize it.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  environment: process.env.NODE_ENV ?? "development",

  enabled:
    process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true" || process.env.NODE_ENV === "production",

  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Filter common noise to keep signal high.
  // These errors are almost always not actionable.
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",

    // Network issues — user offline, not our bug
    "NetworkError",
    "Failed to fetch",
    "Load failed",

    // Chunk load errors after deploys — expected, recoverable on refresh
    "ChunkLoadError",
    "Loading chunk",
    "Loading CSS chunk",
  ],

  // Filter URL patterns we don't care about
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Other browsers
    /^moz-extension:\/\//i,
    /^safari-extension:\/\//i,
  ],
});
