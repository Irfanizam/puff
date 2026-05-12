/**
 * Button component.
 *
 * This is a minimal seed component that proves the monorepo can resolve
 * cross-package imports. We'll replace this with a real design system
 * implementation in Phase 2 (using shadcn/ui and Tailwind).
 *
 * The architectural significance is more important than the implementation:
 * - Components live in @puff/ui, not in apps/web
 * - Consumers import via `@puff/ui` (workspace protocol)
 * - This boundary is enforced by structure, not discipline
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant — minimal for now, expanded in Phase 2 */
  variant?: "primary" | "secondary";
  /** Button content */
  children: ReactNode;
}

export function Button({
  variant = "primary",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button data-variant={variant} {...rest}>
      {children}
    </button>
  );
}
