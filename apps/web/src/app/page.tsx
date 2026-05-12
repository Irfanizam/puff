/**
 * apps/web/src/app/page.tsx
 *
 * Phase 1 home page — intentionally minimal.
 *
 * The purpose of this page is to PROVE the monorepo plumbing works:
 * - It imports a component from @puff/ui (cross-package import)
 * - It imports a type from @puff/types (cross-package type)
 * - It uses Tailwind classes (toolchain wired)
 *
 * Real design work happens in Phase 2. Resist the urge to make this pretty.
 */

import { Button } from "@puff/ui";
import type { Result } from "@puff/types";

// Demonstrate that a type from @puff/types is usable here.
// (This variable exists only to prove the import resolves at type-check time.)
const _exampleResult: Result<string> = { ok: true, value: "Phase 1 monorepo verified" };

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">Puff</h1>
      <p className="text-sm text-gray-500">AI Engineering Ecosystem — Phase 1 foundation</p>
      <Button variant="primary" className="rounded-md border px-4 py-2">
        Cross-package import works
      </Button>
    </main>
  );
}
