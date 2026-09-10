import { describe, expect, it } from 'vitest'
import { createSeededRng, generateRandomSeed, hashSeed } from '../src/game/rng'

describe('createSeededRng', () => {
  it('produces the same sequence for the same numeric seed', () => {
    const a = createSeededRng(42)
    const b = createSeededRng(42)
    const seqA = Array.from({ length: 10 }, () => a())
    const seqB = Array.from({ length: 10 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('produces different sequences for different seeds', () => {
    const a = createSeededRng(1)
    const b = createSeededRng(2)
    expect(a()).not.toBe(b())
  })

  it('always returns values in [0, 1)', () => {
    const rng = createSeededRng(12345)
    for (let i = 0; i < 100; i++) {
      const value = rng()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('hashSeed', () => {
  it('is deterministic for the same string', () => {
    expect(hashSeed('replay-me')).toBe(hashSeed('replay-me'))
  })

  it('produces different hashes for different strings (spot check)', () => {
    expect(hashSeed('seed-a')).not.toBe(hashSeed('seed-b'))
  })

  it('round-trips into a fully reproducible rng sequence', () => {
    const rngA = createSeededRng(hashSeed('my-seed'))
    const rngB = createSeededRng(hashSeed('my-seed'))
    expect(rngA()).toBe(rngB())
    expect(rngA()).toBe(rngB())
  })
})

describe('generateRandomSeed', () => {
  it('returns a short, uppercase alphanumeric string', () => {
    const seed = generateRandomSeed()
    expect(seed).toMatch(/^[A-Z0-9]+$/)
    expect(seed.length).toBeGreaterThan(0)
  })
})
