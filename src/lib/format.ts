/** Mirrors `next-meddef` `formatConfidence` */
export function formatConfidence(p: number): string {
  return `${(p * 100).toFixed(2)}%`;
}
