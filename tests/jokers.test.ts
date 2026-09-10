import { describe, expect, it } from 'vitest'
import { applyJokerBonuses, type Joker } from '../src/game/jokers'
import type { DieValue } from '../src/game/types'

const v = (...values: number[]) => values as DieValue[]

const flatBaseJoker: Joker = {
  id: 'test-flat-base',
  name: 'Flat Base',
  description: '',
  cost: 1,
  effect: { kind: 'flatBase', amount: 10 },
}

const flatMultJoker: Joker = {
  id: 'test-flat-mult',
  name: 'Flat Mult',
  description: '',
  cost: 1,
  effect: { kind: 'flatMult', amount: 3 },
}

const handBaseJoker: Joker = {
  id: 'test-hand-base',
  name: 'Hand Base',
  description: '',
  cost: 1,
  effect: { kind: 'handBase', hand: 'ST', amount: 25 },
}

const handMultJoker: Joker = {
  id: 'test-hand-mult',
  name: 'Hand Mult',
  description: '',
  cost: 1,
  effect: { kind: 'handMult', hand: 'FH', amount: 4 },
}

const faceBaseJoker: Joker = {
  id: 'test-face-base',
  name: 'Face Base',
  description: '',
  cost: 1,
  effect: { kind: 'faceBase', face: 1, amount: 5 },
}

const faceMultJoker: Joker = {
  id: 'test-face-mult',
  name: 'Face Mult',
  description: '',
  cost: 1,
  effect: { kind: 'faceMult', face: 6, amount: 2 },
}

const coinsJoker: Joker = {
  id: 'test-coins',
  name: 'Coins',
  description: '',
  cost: 1,
  effect: { kind: 'coinsPerPlay', amount: 2 },
}

describe('applyJokerBonuses', () => {
  it('returns zero bonuses with no jokers', () => {
    expect(applyJokerBonuses(v(1, 2, 3, 4, 5), 'ST', [])).toEqual({
      base: 0,
      mult: 0,
      coins: 0,
    })
  })

  it('applies flat base/mult bonuses regardless of hand or dice', () => {
    const bonus = applyJokerBonuses(v(1, 2, 3, 4, 6), 'HD', [
      flatBaseJoker,
      flatMultJoker,
    ])
    expect(bonus).toEqual({ base: 10, mult: 3, coins: 0 })
  })

  it('only applies hand-specific bonuses when the hand matches', () => {
    const matching = applyJokerBonuses(v(1, 2, 3, 4, 5), 'ST', [handBaseJoker])
    expect(matching.base).toBe(25)

    const notMatching = applyJokerBonuses(v(1, 1, 2, 3, 4), 'K2', [
      handBaseJoker,
    ])
    expect(notMatching.base).toBe(0)
  })

  it('applies hand-mult bonuses only for the matching hand', () => {
    const matching = applyJokerBonuses(v(3, 3, 3, 5, 5), 'FH', [handMultJoker])
    expect(matching.mult).toBe(4)

    const notMatching = applyJokerBonuses(v(1, 2, 3, 4, 6), 'HD', [
      handMultJoker,
    ])
    expect(notMatching.mult).toBe(0)
  })

  it('scales face-based bonuses by how many dice show that face', () => {
    const bonus = applyJokerBonuses(v(1, 1, 1, 2, 3), 'K3', [faceBaseJoker])
    expect(bonus.base).toBe(15) // 3 ones * 5

    const noMatch = applyJokerBonuses(v(2, 3, 4, 5, 6), 'HD', [faceBaseJoker])
    expect(noMatch.base).toBe(0)
  })

  it('scales face-mult bonuses by how many dice show that face', () => {
    const bonus = applyJokerBonuses(v(6, 6, 1, 2, 3), 'K2', [faceMultJoker])
    expect(bonus.mult).toBe(4) // 2 sixes * 2
  })

  it('accumulates coinsPerPlay across owned jokers', () => {
    const bonus = applyJokerBonuses(v(1, 2, 3, 4, 5), 'ST', [
      coinsJoker,
      coinsJoker,
    ])
    expect(bonus.coins).toBe(4)
  })

  it('combines multiple different jokers in one pass', () => {
    const bonus = applyJokerBonuses(v(6, 6, 6, 1, 1), 'FH', [
      flatBaseJoker,
      handMultJoker,
      faceMultJoker,
      coinsJoker,
    ])
    expect(bonus).toEqual({ base: 10, mult: 4 + 6, coins: 2 })
  })
})
