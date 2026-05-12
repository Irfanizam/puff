/**
 * ESLint config for @puff/types.
 *
 * Extends the shared base — no package-specific rules needed
 * because this package is pure type definitions.
 */

import baseConfig from "@puff/config/eslint.base.mjs";

export default [...baseConfig];
