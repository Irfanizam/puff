/**
 * @puff/ui
 *
 * Shared UI components for Puff.
 *
 * Components are exported via this barrel for clean consumer imports:
 *   import { Button } from "@puff/ui"
 *
 * Conventions:
 * - Components are presentational and unopinionated about routing
 * - Styling uses Tailwind classes (will be wired in Phase 2)
 * - No business logic in this package
 */

export { Button } from "./button";
export type { ButtonProps } from "./button";
