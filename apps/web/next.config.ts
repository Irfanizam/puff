/**
 * apps/web/next.config.ts
 *
 * Next.js configuration for the Puff web app.
 *
 * Key decisions:
 * - turbopack.root: explicitly declares the monorepo root.
 * - transpilePackages: tells Next.js to compile our internal @puff/*
 *   packages from their TypeScript source.
 * - withSentryConfig: wraps the config to auto-upload source maps
 *   and tunnel Sentry traffic. Tunneling avoids ad-blockers that
 *   block sentry.io requests (a real production problem).
 */

import type { NextConfig } from "next";
import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  transpilePackages: ["@puff/ui", "@puff/types", "@puff/logger"],
};

/**
 * Sentry build-time configuration.
 *
 * Source maps:
 *   Uploaded to Sentry for unminified stack traces in production.
 *   Hidden from public bundles (not served to browsers).
 *
 * Tunnel route:
 *   Sentry events flow through /monitoring instead of sentry.io directly.
 *   Bypasses ad-blockers and content filters that would otherwise drop events.
 */
export default withSentryConfig(nextConfig, {
  // Sentry organization and project (from your Sentry account).
  // Read from env so different environments can point to different projects.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Silent unless build fails. Reduces noise in normal builds.
  silent: !process.env.CI,

  // Source map handling.
  widenClientFileUpload: true, // Upload source maps for all client routes.

  // Tunnel events through our own domain to avoid ad-blockers.
  tunnelRoute: "/monitoring",

  // Suppress source map upload errors when SENTRY_AUTH_TOKEN is missing.
  // Lets developers run builds without a Sentry account.
  disableLogger: true,
  automaticVercelMonitors: true,
});
