import { describe, expect, it } from 'vitest'
import { createDefaultHandLevels } from '../src/game/hands'
import { checkScore, HAND_SCORE } from '../src/game/scoring'
import type { DieValue } from '../src/game/types'

const v = (...values: number[]) => values as DieValue[]

describe('checkScore', () => {
  it('computes the base formula at level 1', () => {
    const levels = createDefaultHandLevels()
    const values = v(5, 5, 5, 1, 2) // Three of a Kind, dice sum = 18
    const result = checkScore(values, levels)

    const [base, mult] = HAND_SCORE.K3
    expect(result.hand).toBe('K3')
    expect(result.diceScore).toBe(18)
    expect(result.level).toBe(1)
    expect(result.result).toBe((base + 18) * mult)
  })

  it('applies per-level bonuses (+5 base, +1 mult per level above 1)', () => {
    const levels = { ...createDefaultHandLevels(), K3: 3 }
    const values = v(5, 5, 5, 1, 2)
    const result = checkScore(values, levels)

    const [base, mult] = HAND_SCORE.K3
    const levelBonus = 5 * (3 - 1)
    const expected = (base + levelBonus + 18) * (mult + (3 - 1))
    expect(result.result).toBe(expected)
  })

  it('scores High Dice using only the dice sum and base multiplier', () => {
    const levels = createDefaultHandLevels()
    const values = v(1, 2, 3, 4, 6) // High Dice, sum = 16
    const result = checkScore(values, levels)

    expect(result.hand).toBe('HD')
    expect(result.result).toBe((0 + 16) * 1)
  })
})
