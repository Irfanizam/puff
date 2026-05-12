/**
 * @puff/types
 *
 * Shared TypeScript types for Puff workspaces.
 *
 * Export domain types from this barrel file so consumers can import:
 *   import type { Result } from "@puff/types"
 *
 * Conventions:
 * - Types describing domain concepts live here
 * - Types tightly coupled to a single feature live with the feature
 * - Never put runtime code in this package (types only)
 */

export type { Brand, ISODateString, Result } from "./common";