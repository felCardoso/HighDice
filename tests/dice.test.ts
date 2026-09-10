import { describe, expect, it } from 'vitest'
import {
  createDiceSet,
  rerollSelected,
  rollAll,
  rollValue,
  toggleDie,
} from '../src/game/dice'

describe('rollValue', () => {
  it('respects a supplied rng', () => {
    expect(rollValue(6, () => 0)).toBe(1)
    expect(rollValue(6, () => 0.999)).toBe(6)
  })
})

describe('createDiceSet', () => {
  it('creates the requested number of unselected dice with sequential ids', () => {
    const dice = createDiceSet(5, () => 0)
    expect(dice).toHaveLength(5)
    expect(dice.map((d) => d.id)).toEqual([0, 1, 2, 3, 4])
    expect(dice.every((d) => !d.selected)).toBe(true)
  })
})

describe('toggleDie', () => {
  it('flips only the targeted die', () => {
    const dice = createDiceSet(3, () => 0)
    const toggled = toggleDie(dice, 1)
    expect(toggled.map((d) => d.selected)).toEqual([false, true, false])
    // original array is untouched (pure function)
    expect(dice.every((d) => !d.selected)).toBe(true)
  })
})

describe('rollAll', () => {
  it('rerolls every die and clears selection', () => {
    let dice = createDiceSet(5, () => 0)
    dice = toggleDie(dice, 0)
    const rolled = rollAll(dice, () => 0.999)
    expect(rolled.every((d) => d.value === 6)).toBe(true)
    expect(rolled.every((d) => !d.selected)).toBe(true)
  })
})

describe('rerollSelected', () => {
  it('rerolls only the selected dice when some are selected', () => {
    let dice = createDiceSet(5, () => 0) // all value 1
    dice = toggleDie(dice, 2)
    const result = rerollSelected(dice, () => 0.999) // would roll to 6
    expect(result[2].value).toBe(6)
    expect(result[2].selected).toBe(false)
    expect(result.filter((d) => d.id !== 2).every((d) => d.value === 1)).toBe(
      true,
    )
  })

  it('rerolls all dice when none are selected', () => {
    const dice = createDiceSet(5, () => 0) // all value 1
    const result = rerollSelected(dice, () => 0.999)
    expect(result.every((d) => d.value === 6)).toBe(true)
  })
})
