// Lightweight className merger — no clsx/tailwind-merge dependency needed
// Filters falsy values, joins with space. Use for conditional class lists.

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
