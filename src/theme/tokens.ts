/** Spacing and touch targets — keep layouts consistent across screens. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Minimum tap area (Apple HIG / Material guidance). */
export const touch = {
  minHeight: 48,
  minWidth: 44,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  pill: 20,
} as const;
