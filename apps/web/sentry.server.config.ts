/**
 * apps/web/sentry.server.config.ts
 *
 * Sentry initialization for the Node.js server runtime.
 * Loaded automatically by @sentry/nextjs for server components,
 * API route handlers, and server actions.
 *
 * Architectural notes:
 *   - DSN read from env. If SENTRY_DSN is not set, Sentry is disabled
 *     (Sentry.init handles this gracefully — no errors, no events sent).
 *     This keeps the repo runnable without a Sentry account.
 *   - tracesSampleRate controls performance trace volume.
 *     1.0 = trace every request (fine for portfolio scale).
 *     Production at scale would set this lower (e.g. 0.1 = 10%).
 *   - Source maps are uploaded at build time (configured in next.config.ts).
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Capture 100% of transactions for tracing.
  // In production at scale, lower this (e.g. 0.1) to control cost.
  tracesSampleRate: 1.0,

  // Environment tag — appears on every event for filtering in Sentry UI.
  environment: process.env.NODE_ENV ?? "development",

  // Disable Sentry in development by default unless explicitly enabled.
  // Prevents dev errors flooding your Sentry quota.
  enabled: process.env.SENTRY_ENABLED === "true" || process.env.NODE_ENV === "production",

  // Adds a few categories of useful debug info.
  // Worth keeping on; cost is negligible.
  integrations: [],

  // Tag events with the deployed git commit SHA if available.
  // Vercel sets VERCEL_GIT_COMMIT_SHA automatically on deploys.
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
