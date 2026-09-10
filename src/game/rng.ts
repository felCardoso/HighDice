export type Rng = () => number

/**
 * A small, fast, deterministic PRNG (mulberry32). Given the same numeric
 * seed it always produces the same sequence of numbers in [0, 1).
 */
export function createSeededRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Deterministically hashes a string seed into a 32-bit unsigned integer (FNV-1a). */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Generates a short, shareable random seed for a fresh run. */
export function generateRandomSeed(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}
