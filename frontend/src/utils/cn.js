import { clsx } from "clsx";

/**
 * Utility to conditionally join class names.
 * In a real production app, we would combine this with tailwind-merge.
 */
export function cn(...inputs) {
  return clsx(inputs);
}
