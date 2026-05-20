/**
 * @puff/types
 *
 * Shared TypeScript types for Puff workspaces.
 *
 * Export domain types from this barrel file so consumers can import:
 *   import type { Result, RequestId } from "@puff/types"
 *
 * Conventions:
 * - Types describing domain concepts live here
 * - Types tightly coupled to a single feature live with the feature
 * - Never put runtime code in this package (types only — but small
 *   helpers like `isValidRequestId` are acceptable as they're part
 *   of validating those types)
 */

export type { Brand, ISODateString, Result } from "./common";
export type { RequestId } from "./request";
export { REQUEST_ID_HEADER, isValidRequestId } from "./request";
