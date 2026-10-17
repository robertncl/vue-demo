/** FNV-1a: a fast, well-spread 32-bit string hash. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** mulberry32: a tiny seeded PRNG returning floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A generator seeded from any mix of strings and numbers, so equal inputs replay. */
export function seeded(...parts: (string | number)[]): () => number {
  return mulberry32(hashString(parts.join('|')))
}

/** A value between `min` and `max`, drawn from `random`. */
export function between(random: () => number, min: number, max: number): number {
  return min + random() * (max - min)
}
