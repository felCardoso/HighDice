import type { Die, DieValue } from './types'

type Rng = () => number

export function rollValue(sides = 6, rng: Rng = Math.random): DieValue {
  return (Math.floor(rng() * sides) + 1) as DieValue
}

export function createDie(id: number, rng: Rng = Math.random): Die {
  return { id, value: rollValue(6, rng), selected: false }
}

export function createDiceSet(count = 5, rng: Rng = Math.random): Die[] {
  return Array.from({ length: count }, (_, i) => createDie(i, rng))
}

/** Rolls every die and clears selection. */
export function rollAll(dice: Die[], rng: Rng = Math.random): Die[] {
  return dice.map((d) => ({ ...d, value: rollValue(6, rng), selected: false }))
}

/**
 * Rerolls the selected dice. If nothing is selected, rerolls all dice
 * (mirrors the original game's reroll behavior).
 */
export function rerollSelected(dice: Die[], rng: Rng = Math.random): Die[] {
  const anySelected = dice.some((d) => d.selected)
  if (!anySelected) return rollAll(dice, rng)
  return dice.map((d) =>
    d.selected ? { ...d, value: rollValue(6, rng), selected: false } : d,
  )
}

export function toggleDie(dice: Die[], id: number): Die[] {
  return dice.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
}
