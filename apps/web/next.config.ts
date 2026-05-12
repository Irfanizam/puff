/**
 * apps/web/next.config.ts
 *
 * Next.js configuration for the Puff web app.
 *
 * Key decisions:
 * - turbopack.root: explicitly declares the monorepo root.
 *   Without this, Next.js infers the root by searching for lockfiles,
 *   which is fragile in monorepos. Explicit declaration = predictable builds.
 * - transpilePackages: tells Next.js to compile our internal @puff/* packages
 *   from their TypeScript source (rather than expecting pre-built JS).
 *   This is what enables our "no build step for internal packages" approach.
 */

import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Tell Next.js this is part of a monorepo and where the root is.
  // Resolves to ~/code/puff (two levels up from apps/web).
  turbopack: {
    root: path.join(__dirname, "../.."),
  },

  // Transpile internal workspace packages from their TypeScript source.
  // Without this, Next.js would expect a pre-built dist/ folder in each package.
  transpilePackages: ["@puff/ui", "@puff/types"],
};

export default nextConfig;
