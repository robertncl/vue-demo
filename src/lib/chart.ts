/**
 * Rounds a chart maximum up to a clean value, close enough that the data fills
 * most of the plot. Every step halves cleanly for the midpoint tick.
 */
export function niceMax(value: number): number {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const scaled = value / magnitude
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((candidate) => scaled <= candidate) ?? 10
  return step * magnitude
}
