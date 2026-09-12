import { describe, expect, it } from 'vitest'
import {
  checkHand,
  computeUpgradeOptions,
  createDefaultHandLevels,
  HAND_ORDER,
  handUpgradeCost,
} from '../src/game/hands'
import type { DieValue } from '../src/game/types'

const v = (...values: number[]) => values as DieValue[]

describe('checkHand', () => {
  it('detects Five of a Kind', () => {
    expect(checkHand(v(4, 4, 4, 4, 4))).toEqual({ hand: 'K5', values: [4] })
  })

  it('detects Four of a Kind', () => {
    expect(checkHand(v(2, 2, 2, 2, 6))).toEqual({ hand: 'K4', values: [2] })
  })

  it('detects Full House', () => {
    expect(checkHand(v(3, 3, 3, 5, 5))).toEqual({
      hand: 'FH',
      values: [3, 5],
    })
  })

  it('distinguishes Full House from Two Pair', () => {
    // 3+2 is a Full House, not a Two Pair even though it contains a pair.
    expect(checkHand(v(6, 6, 6, 1, 1)).hand).toBe('FH')
    // Two pairs plus an unrelated single is Two Pair, not Full House.
    expect(checkHand(v(6, 6, 1, 1, 3)).hand).toBe('P2')
  })

  it('detects the low straight (1-2-3-4-5)', () => {
    expect(checkHand(v(1, 2, 3, 4, 5))).toEqual({ hand: 'ST', values: [5] })
  })

  it('detects the high straight (2-3-4-5-6)', () => {
    expect(checkHand(v(2, 3, 4, 5, 6))).toEqual({ hand: 'ST', values: [6] })
  })

  it('does not misdetect a near-straight with a duplicate as a straight', () => {
    // 1,2,3,4,4 is not a straight — should fall through to Pair.
    const check = checkHand(v(1, 2, 3, 4, 4))
    expect(check.hand).not.toBe('ST')
    expect(check.hand).toBe('K2')
  })

  it('detects Three of a Kind', () => {
    expect(checkHand(v(5, 5, 5, 1, 2))).toEqual({ hand: 'K3', values: [5] })
  })

  it('detects a single Pair', () => {
    expect(checkHand(v(1, 1, 2, 3, 4))).toEqual({ hand: 'K2', values: [1] })
  })

  it('detects Two Pair with faces in ascending order', () => {
    expect(checkHand(v(5, 5, 2, 2, 6))).toEqual({
      hand: 'P2',
      values: [2, 5],
    })
  })

  it('falls back to High Dice when nothing else matches', () => {
    expect(checkHand(v(1, 2, 3, 4, 6))).toEqual({ hand: 'HD', values: [6] })
  })
})

describe('computeUpgradeOptions', () => {
  it('returns 4 distinct hand types out of the 8 available', () => {
    const options = computeUpgradeOptions(
      createDefaultHandLevels(),
      HAND_ORDER,
      () => 0.5,
    )
    expect(options).toHaveLength(4)
    expect(new Set(options).size).toBe(4)
    for (const hand of options) expect(HAND_ORDER).toContain(hand)
  })

  it('is deterministic for a given rng', () => {
    const rng = () => 0
    const levels = createDefaultHandLevels()
    expect(computeUpgradeOptions(levels, HAND_ORDER, rng)).toEqual(
      computeUpgradeOptions(levels, HAND_ORDER, rng),
    )
  })

  it('favors hands with a lower level over many draws', () => {
    const levels = { ...createDefaultHandLevels(), K5: 10 } // heavily leveled
    let k5Offered = 0
    for (let i = 0; i < 200; i++) {
      const rng = (() => {
        let seed = i + 1
        return () => {
          seed = (seed * 9301 + 49297) % 233280
          return seed / 233280
        }
      })()
      if (computeUpgradeOptions(levels, HAND_ORDER, rng).includes('K5')) {
        k5Offered++
      }
    }
    // With uniform odds it'd show up in ~half the draws (4-of-8); it should
    // be offered noticeably less than that since it's already at level 10.
    expect(k5Offered).toBeLessThan(60)
  })
})

describe('handUpgradeCost', () => {
  it('increases by 2 coins per level', () => {
    expect(handUpgradeCost(1)).toBe(3)
    expect(handUpgradeCost(2)).toBe(5)
    expect(handUpgradeCost(3)).toBe(7)
  })
})
