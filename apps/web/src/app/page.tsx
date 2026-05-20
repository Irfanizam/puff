/**
 * apps/web/src/app/page.tsx
 *
 * Phase 1 home page.
 *
 * Demonstrates the observability foundation working end-to-end:
 *   - Cross-package import from @puff/ui (Button)
 *   - Cross-package type import from @puff/types (Result, REQUEST_ID_HEADER)
 *   - Logger import from @puff/logger
 *   - Reading the request ID injected by middleware
 *   - Logging a structured event with the request ID bound
 *
 * In Phase 2 this page will be replaced with the real portfolio home.
 * For now it proves the infrastructure is real.
 */

import { headers } from "next/headers";
import { Button } from "@puff/ui";
import { type Result, REQUEST_ID_HEADER } from "@puff/types";
import { createLogger, withContext } from "@puff/logger";

// Module-level logger. Created once when the module is loaded.
// Route-scoped logging uses child loggers (see below).
const log = createLogger("web-home");

// Demonstrate that a type from @puff/types is usable here.
// (This variable exists only to prove the import resolves at type-check time.)
const _exampleResult: Result<string> = { ok: true, value: "Phase 1 infrastructure verified" };

export default async function HomePage() {
  // Read the request ID injected by middleware. Always present because
  // middleware runs before this page renders.
  const reqHeaders = await headers();
  const requestId = reqHeaders.get(REQUEST_ID_HEADER) ?? "unknown";

  // Bind the request ID to a child logger. All subsequent log calls
  // from this child automatically include `requestId` as a structured field.
  const reqLog = withContext(log, { requestId });
  reqLog.info("rendering home page");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">Puff</h1>
      <p className="text-sm text-gray-500">AI Engineering Ecosystem — Phase 1 foundation</p>
      <p className="font-mono text-xs text-gray-400">request: {requestId}</p>
      <Button variant="primary" className="rounded-md border px-4 py-2">
        Infrastructure verified
      </Button>
    </main>
  );
}
