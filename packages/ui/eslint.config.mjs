/**
 * ESLint config for @puff/ui.
 *
 * Extends the shared base. We don't add React rules here yet
 * because @puff/ui is a thin component library; if we need
 * React-specific lint rules (hooks rules, JSX a11y), we add
 * them in Phase 2 when the design system grows.
 */

import baseConfig from "@puff/config/eslint.base.mjs";

export default [...baseConfig];
