import { describe, expect, it } from 'vitest'
import {
  advanceJokerEvolutions,
  applyJokerBonuses,
  getEffectiveJokerEffect,
  toOwnedJoker,
  type Joker,
} from '../src/game/jokers'
import type { DieValue } from '../src/game/types'

const v = (...values: number[]) => values as DieValue[]

const flatBaseJoker: Joker = {
  id: 'test-flat-base',
  name: 'Flat Base',
  description: '',
  cost: 1,
  rarity: 'common',
  effect: { kind: 'flatBase', amount: 10 },
}

const flatMultJoker: Joker = {
  id: 'test-flat-mult',
  name: 'Flat Mult',
  description: '',
  cost: 1,
  rarity: 'common',
  effect: { kind: 'flatMult', amount: 3 },
}

const handBaseJoker: Joker = {
  id: 'test-hand-base',
  name: 'Hand Base',
  description: '',
  cost: 1,
  rarity: 'common',
  effect: { kind: 'handBase', hand: 'ST', amount: 25 },
}

const handMultJoker: Joker = {
  id: 'test-hand-mult',
  name: 'Hand Mult',
  description: '',
  cost: 1,
  rarity: 'common',
  effect: { kind: 'handMult', hand: 'FH', amount: 4 },
}

const faceBaseJoker: Joker = {
  id: 'test-face-base',
  name: 'Face Base',
  description: '',
  cost: 1,
  rarity: 'common',
  effect: { kind: 'faceBase', face: 1, amount: 5 },
}

const faceMultJoker: Joker = {
  id: 'test-face-mult',
  name: 'Face Mult',
  description: '',
  cost: 1,
  rarity: 'common',
  effect: { kind: 'faceMult', face: 6, amount: 2 },
}

const coinsJoker: Joker = {
  id: 'test-coins',
  name: 'Coins',
  description: '',
  cost: 1,
  rarity: 'common',
  effect: { kind: 'coinsPerPlay', amount: 2 },
}

const perJokerMultJoker: Joker = {
  id: 'test-per-joker',
  name: 'Per Joker',
  description: '',
  cost: 1,
  rarity: 'legendary',
  effect: { kind: 'perJokerMult', amount: 1 },
}

const perRarityMultJoker: Joker = {
  id: 'test-per-rarity',
  name: 'Per Rarity',
  description: '',
  cost: 1,
  rarity: 'legendary',
  effect: { kind: 'perRarityMult', amount: 2, rarity: 'legendary' },
}

const evolvingJoker: Joker = {
  id: 'test-evolving',
  name: 'Evolving',
  description: '',
  cost: 1,
  rarity: 'rare',
  effect: { kind: 'flatBase', amount: 5 },
  evolution: { every: 3, bonusBase: 4 },
}

const own = (...jokers: Joker[]) => jokers.map(toOwnedJoker)

describe('applyJokerBonuses', () => {
  it('returns zero bonuses with no jokers', () => {
    expect(applyJokerBonuses(v(1, 2, 3, 4, 5), 'ST', [])).toEqual({
      base: 0,
      mult: 0,
      coins: 0,
    })
  })

  it('applies flat base/mult bonuses regardless of hand or dice', () => {
    const bonus = applyJokerBonuses(
      v(1, 2, 3, 4, 6),
      'HD',
      own(flatBaseJoker, flatMultJoker),
    )
    expect(bonus).toEqual({ base: 10, mult: 3, coins: 0 })
  })

  it('only applies hand-specific bonuses when the hand matches', () => {
    const matching = applyJokerBonuses(
      v(1, 2, 3, 4, 5),
      'ST',
      own(handBaseJoker),
    )
    expect(matching.base).toBe(25)

    const notMatching = applyJokerBonuses(
      v(1, 1, 2, 3, 4),
      'K2',
      own(handBaseJoker),
    )
    expect(notMatching.base).toBe(0)
  })

  it('applies hand-mult bonuses only for the matching hand', () => {
    const matching = applyJokerBonuses(
      v(3, 3, 3, 5, 5),
      'FH',
      own(handMultJoker),
    )
    expect(matching.mult).toBe(4)

    const notMatching = applyJokerBonuses(
      v(1, 2, 3, 4, 6),
      'HD',
      own(handMultJoker),
    )
    expect(notMatching.mult).toBe(0)
  })

  it('scales face-based bonuses by how many dice show that face', () => {
    const bonus = applyJokerBonuses(v(1, 1, 1, 2, 3), 'K3', own(faceBaseJoker))
    expect(bonus.base).toBe(15) // 3 ones * 5

    const noMatch = applyJokerBonuses(
      v(2, 3, 4, 5, 6),
      'HD',
      own(faceBaseJoker),
    )
    expect(noMatch.base).toBe(0)
  })

  it('scales face-mult bonuses by how many dice show that face', () => {
    const bonus = applyJokerBonuses(v(6, 6, 1, 2, 3), 'K2', own(faceMultJoker))
    expect(bonus.mult).toBe(4) // 2 sixes * 2
  })

  it('accumulates coinsPerPlay across owned jokers', () => {
    const bonus = applyJokerBonuses(
      v(1, 2, 3, 4, 5),
      'ST',
      own(coinsJoker, coinsJoker),
    )
    expect(bonus.coins).toBe(4)
  })

  it('combines multiple different jokers in one pass', () => {
    const bonus = applyJokerBonuses(
      v(6, 6, 6, 1, 1),
      'FH',
      own(flatBaseJoker, handMultJoker, faceMultJoker, coinsJoker),
    )
    expect(bonus).toEqual({ base: 10, mult: 4 + 6, coins: 2 })
  })

  it('scales perJokerMult by the number of OTHER jokers owned', () => {
    // flatBaseJoker/handBaseJoker only contribute to `base`, keeping this
    // isolated to perJokerMult's own contribution to `mult`.
    const withTwoOthers = applyJokerBonuses(
      v(1, 2, 3, 4, 5),
      'ST',
      own(perJokerMultJoker, flatBaseJoker, handBaseJoker),
    )
    expect(withTwoOthers.mult).toBe(2)

    const alone = applyJokerBonuses(
      v(1, 2, 3, 4, 5),
      'ST',
      own(perJokerMultJoker),
    )
    expect(alone.mult).toBe(0)
  })

  it('scales perRarityMult by the count of owned jokers of that rarity', () => {
    const bonus = applyJokerBonuses(
      v(1, 2, 3, 4, 5),
      'ST',
      own(perRarityMultJoker, perJokerMultJoker, flatBaseJoker),
    )
    // 2 legendary jokers owned (perRarityMultJoker + perJokerMultJoker) * amount 2
    expect(bonus.mult).toBeGreaterThanOrEqual(4)
  })
})

describe('getEffectiveJokerEffect', () => {
  it('returns the base effect unchanged at level 1', () => {
    const owned = toOwnedJoker(evolvingJoker)
    expect(getEffectiveJokerEffect(owned)).toEqual(evolvingJoker.effect)
  })

  it('adds the per-level bonus once leveled up', () => {
    const owned = { ...toOwnedJoker(evolvingJoker), level: 3 }
    const effect = getEffectiveJokerEffect(owned)
    expect(effect).toEqual({ kind: 'flatBase', amount: 5 + 2 * 4 })
  })

  it('leaves non-evolving jokers untouched', () => {
    const owned = toOwnedJoker(flatBaseJoker)
    expect(getEffectiveJokerEffect(owned)).toEqual(flatBaseJoker.effect)
  })
})

describe('advanceJokerEvolutions', () => {
  it('increments progress without leveling up before the threshold', () => {
    const { jokers, leveledUp } = advanceJokerEvolutions(own(evolvingJoker))
    expect(jokers[0].progress).toBe(1)
    expect(jokers[0].level).toBe(1)
    expect(leveledUp).toEqual([])
  })

  it('levels up and resets progress once the threshold is reached', () => {
    let jokers = own(evolvingJoker)
    jokers = advanceJokerEvolutions(jokers).jokers
    jokers = advanceJokerEvolutions(jokers).jokers
    const result = advanceJokerEvolutions(jokers)
    expect(result.jokers[0].level).toBe(2)
    expect(result.jokers[0].progress).toBe(0)
    expect(result.leveledUp).toEqual([
      { jokerId: evolvingJoker.id, name: evolvingJoker.name, newLevel: 2 },
    ])
  })

  it('does not advance jokers without an evolution', () => {
    const { jokers, leveledUp } = advanceJokerEvolutions(own(flatBaseJoker))
    expect(jokers[0].progress).toBe(0)
    expect(jokers[0].level).toBe(1)
    expect(leveledUp).toEqual([])
  })
})
