import type { DieValue, HandCheck, HandLevels, HandType } from './types'

export const HAND_NAMES: Record<HandType, string> = {
  K5: 'Five of a Kind',
  ST: 'Straight',
  K4: 'Four of a Kind',
  FH: 'Full House',
  K3: 'Three of a Kind',
  P2: 'Two Pair',
  K2: 'Pair',
  HD: 'High Dice',
}

export const HAND_ORDER: HandType[] = (
  Object.keys(HAND_NAMES) as HandType[]
).sort()

export function createDefaultHandLevels(): HandLevels {
  return { K5: 1, ST: 1, K4: 1, FH: 1, K3: 1, P2: 1, K2: 1, HD: 1 }
}

function countValues(values: DieValue[]): Record<DieValue, number> {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<
    DieValue,
    number
  >
  for (const v of values) counts[v] += 1
  return counts
}

function checkStraight(values: DieValue[]): HandCheck | null {
  const sorted = [...values].sort((a, b) => a - b).join('')
  if (sorted === '12345') return { hand: 'ST', values: [5] }
  if (sorted === '23456') return { hand: 'ST', values: [6] }
  return null
}

/** Determines the poker-dice hand made by a set of 5 die values. */
export function checkHand(values: DieValue[]): HandCheck {
  const counts = countValues(values)
  const maxDice = Math.max(...values)

  const groups = (Object.entries(counts) as [string, number][])
    .filter(([, count]) => count > 0)
    .map(([face, count]) => ({ face: Number(face) as DieValue, count }))
    .sort((a, b) => b.count - a.count || b.face - a.face)

  const topCount = groups[0]?.count ?? 0
  const secondCount = groups[1]?.count ?? 0

  if (topCount === 5) return { hand: 'K5', values: [groups[0].face] }
  if (topCount === 4) return { hand: 'K4', values: [groups[0].face] }
  if (topCount === 3 && secondCount === 2) {
    return { hand: 'FH', values: [groups[0].face, groups[1].face] }
  }

  const straight = checkStraight(values)
  if (straight) return straight

  if (topCount === 3) return { hand: 'K3', values: [groups[0].face] }
  if (topCount === 2 && secondCount === 2) {
    const pairs = groups
      .filter((g) => g.count === 2)
      .map((g) => g.face)
      .sort((a, b) => a - b)
    return { hand: 'P2', values: pairs }
  }
  if (topCount === 2) return { hand: 'K2', values: [groups[0].face] }

  return { hand: 'HD', values: [maxDice] }
}

/**
 * Picks a 4-of-8 subset of hand types to offer as upgrade options, weighted
 * so hands at a lower level are more likely to come up than ones already
 * heavily upgraded (weight = 1 / current level).
 */
export function computeUpgradeOptions(
  handLevels: HandLevels,
  handOrder: HandType[] = HAND_ORDER,
  rng: () => number = Math.random,
  count = 4,
): HandType[] {
  const pool = handOrder.map((hand) => ({ hand, weight: 1 / handLevels[hand] }))
  const result: HandType[] = []

  const n = Math.min(count, pool.length)
  for (let i = 0; i < n; i++) {
    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0)
    let r = rng() * totalWeight
    let idx = 0
    for (; idx < pool.length - 1; idx++) {
      r -= pool[idx].weight
      if (r <= 0) break
    }
    result.push(pool[idx].hand)
    pool.splice(idx, 1)
  }

  return result
}

/** Coins needed to raise a hand from `currentLevel` to `currentLevel + 1`. */
export function handUpgradeCost(currentLevel: number): number {
  return 3 + 2 * (currentLevel - 1)
}
