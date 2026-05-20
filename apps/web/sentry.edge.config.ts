/**
 * apps/web/sentry.edge.config.ts
 *
 * Sentry initialization for the Edge runtime.
 * Loaded by middleware and edge route handlers.
 *
 * Edge runtime is constrained — no Node APIs, no filesystem.
 * Sentry's SDK has a separate edge build that works within these constraints.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: 1.0,

  environment: process.env.NODE_ENV ?? "development",

  enabled: process.env.SENTRY_ENABLED === "true" || process.env.NODE_ENV === "production",

  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
