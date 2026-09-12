import type { DieValue, HandType } from './types'

export type JokerRarity = 'common' | 'rare' | 'legendary'

export type JokerEffect =
  | { kind: 'flatBase'; amount: number }
  | { kind: 'flatMult'; amount: number }
  | { kind: 'handBase'; hand: HandType; amount: number }
  | { kind: 'handMult'; hand: HandType; amount: number }
  | { kind: 'faceBase'; face: DieValue; amount: number }
  | { kind: 'faceMult'; face: DieValue; amount: number }
  | { kind: 'coinsPerPlay'; amount: number }
  /** Synergy: +amount mult for every OTHER joker owned. */
  | { kind: 'perJokerMult'; amount: number }
  /** Synergy: +amount mult for every owned joker of the given rarity (including itself). */
  | { kind: 'perRarityMult'; amount: number; rarity: JokerRarity }

/** How a joker grows the longer you keep it: +1 level every `every` hands played. */
export interface JokerEvolution {
  every: number
  bonusBase?: number
  bonusMult?: number
  bonusCoins?: number
}

export interface Joker {
  id: string
  name: string
  description: string
  cost: number
  rarity: JokerRarity
  effect: JokerEffect
  evolution?: JokerEvolution
}

/** A joker once purchased: tracks its level (from evolution) and progress toward the next one. */
export interface OwnedJoker extends Joker {
  level: number
  progress: number
}

export function toOwnedJoker(joker: Joker): OwnedJoker {
  return { ...joker, level: 1, progress: 0 }
}

export const JOKER_CATALOG: Joker[] = [
  // ── Common ──────────────────────────────────────────────────────────
  {
    id: 'steady-hand',
    name: 'Steady Hand',
    description: '+10 base score on every hand.',
    cost: 4,
    rarity: 'common',
    effect: { kind: 'flatBase', amount: 10 },
  },
  {
    id: 'sharp-shooter',
    name: 'Sharp Shooter',
    description: '+1 multiplier on every hand.',
    cost: 5,
    rarity: 'common',
    effect: { kind: 'flatMult', amount: 1 },
  },
  {
    id: 'snake-eyes',
    name: 'Snake Eyes',
    description: '+4 base score for each die showing 1.',
    cost: 4,
    rarity: 'common',
    effect: { kind: 'faceBase', face: 1, amount: 4 },
  },
  {
    id: 'sixes-wild',
    name: 'Sixes Wild',
    description: '+1 multiplier for each die showing 6.',
    cost: 5,
    rarity: 'common',
    effect: { kind: 'faceMult', face: 6, amount: 1 },
  },
  {
    id: 'pair-bonus',
    name: 'Pair Bonus',
    description: '+2 multiplier when you play a Pair.',
    cost: 3,
    rarity: 'common',
    effect: { kind: 'handMult', hand: 'K2', amount: 2 },
  },
  {
    id: 'coin-collector',
    name: 'Coin Collector',
    description: '+2 coins every time you play a hand.',
    cost: 5,
    rarity: 'common',
    effect: { kind: 'coinsPerPlay', amount: 2 },
  },

  // ── Rare ────────────────────────────────────────────────────────────
  {
    id: 'straight-shooter',
    name: 'Straight Shooter',
    description: '+25 base score when you play a Straight.',
    cost: 7,
    rarity: 'rare',
    effect: { kind: 'handBase', hand: 'ST', amount: 25 },
  },
  {
    id: 'full-pockets',
    name: 'Full Pockets',
    description: '+3 multiplier when you play a Full House.',
    cost: 8,
    rarity: 'rare',
    effect: { kind: 'handMult', hand: 'FH', amount: 3 },
  },
  {
    id: 'kind-hearted',
    name: 'Kind Hearted',
    description: '+2 multiplier when you play Three of a Kind.',
    cost: 7,
    rarity: 'rare',
    effect: { kind: 'handMult', hand: 'K3', amount: 2 },
  },
  {
    id: 'quad-damage',
    name: 'Quad Damage',
    description: '+3 multiplier when you play Four of a Kind.',
    cost: 8,
    rarity: 'rare',
    effect: { kind: 'handMult', hand: 'K4', amount: 3 },
  },
  {
    id: 'treasure-hunter',
    name: 'Treasure Hunter',
    description: '+4 coins every time you play a hand.',
    cost: 9,
    rarity: 'rare',
    effect: { kind: 'coinsPerPlay', amount: 4 },
  },
  {
    id: 'grindstone',
    name: 'Grindstone',
    description:
      '+5 base score, growing +3 more every 5 hands played (currently owned).',
    cost: 9,
    rarity: 'rare',
    effect: { kind: 'flatBase', amount: 5 },
    evolution: { every: 5, bonusBase: 3 },
  },

  // ── Legendary ───────────────────────────────────────────────────────
  {
    id: 'midas-touch',
    name: 'Midas Touch',
    description: '+1 multiplier for every other joker you own.',
    cost: 18,
    rarity: 'legendary',
    effect: { kind: 'perJokerMult', amount: 1 },
  },
  {
    id: 'rarity-cascade',
    name: 'Rarity Cascade',
    description: '+2 multiplier for every legendary joker you own.',
    cost: 20,
    rarity: 'legendary',
    effect: { kind: 'perRarityMult', amount: 2, rarity: 'legendary' },
  },
  {
    id: 'phoenix-feather',
    name: 'Phoenix Feather',
    description: '+6 multiplier when you play Five of a Kind.',
    cost: 16,
    rarity: 'legendary',
    effect: { kind: 'handMult', hand: 'K5', amount: 6 },
  },
  {
    id: 'ever-growing',
    name: 'Ever-Growing',
    description:
      '+5 base score, growing +5 more every 3 hands played (currently owned).',
    cost: 15,
    rarity: 'legendary',
    effect: { kind: 'flatBase', amount: 5 },
    evolution: { every: 3, bonusBase: 5 },
  },
  {
    id: 'jackpot',
    name: 'Jackpot',
    description:
      '+6 coins per hand, growing +2 more every 4 hands played (currently owned).',
    cost: 15,
    rarity: 'legendary',
    effect: { kind: 'coinsPerPlay', amount: 6 },
    evolution: { every: 4, bonusCoins: 2 },
  },
]

export interface JokerBonus {
  base: number
  mult: number
  coins: number
}

/** Applies a joker's evolution levels on top of its base effect. */
export function getEffectiveJokerEffect(joker: OwnedJoker): JokerEffect {
  if (!joker.evolution || joker.level <= 1) return joker.effect
  const levelBonus = joker.level - 1
  const effect = joker.effect
  switch (effect.kind) {
    case 'flatBase':
    case 'handBase':
    case 'faceBase':
      return {
        ...effect,
        amount: effect.amount + levelBonus * (joker.evolution.bonusBase ?? 0),
      }
    case 'flatMult':
    case 'handMult':
    case 'faceMult':
    case 'perJokerMult':
    case 'perRarityMult':
      return {
        ...effect,
        amount: effect.amount + levelBonus * (joker.evolution.bonusMult ?? 0),
      }
    case 'coinsPerPlay':
      return {
        ...effect,
        amount: effect.amount + levelBonus * (joker.evolution.bonusCoins ?? 0),
      }
  }
}

/** Aggregates every owned joker's (leveled) effect for the hand just played. */
export function applyJokerBonuses(
  values: DieValue[],
  hand: HandType,
  jokers: OwnedJoker[],
): JokerBonus {
  let base = 0
  let mult = 0
  let coins = 0

  for (const joker of jokers) {
    const effect = getEffectiveJokerEffect(joker)
    switch (effect.kind) {
      case 'flatBase':
        base += effect.amount
        break
      case 'flatMult':
        mult += effect.amount
        break
      case 'handBase':
        if (hand === effect.hand) base += effect.amount
        break
      case 'handMult':
        if (hand === effect.hand) mult += effect.amount
        break
      case 'faceBase':
        base += effect.amount * values.filter((v) => v === effect.face).length
        break
      case 'faceMult':
        mult += effect.amount * values.filter((v) => v === effect.face).length
        break
      case 'coinsPerPlay':
        coins += effect.amount
        break
      case 'perJokerMult':
        mult += effect.amount * (jokers.length - 1)
        break
      case 'perRarityMult':
        mult +=
          effect.amount *
          jokers.filter((j) => j.rarity === effect.rarity).length
        break
    }
  }

  return { base, mult, coins }
}

export interface JokerLevelUpEvent {
  jokerId: string
  name: string
  newLevel: number
}

/**
 * Advances every owned joker's evolution progress by one hand played,
 * leveling up (and resetting progress) any that crossed their threshold.
 */
export function advanceJokerEvolutions(jokers: OwnedJoker[]): {
  jokers: OwnedJoker[]
  leveledUp: JokerLevelUpEvent[]
} {
  const leveledUp: JokerLevelUpEvent[] = []
  const nextJokers = jokers.map((joker) => {
    if (!joker.evolution) return joker
    const progress = joker.progress + 1
    if (progress >= joker.evolution.every) {
      const newLevel = joker.level + 1
      leveledUp.push({ jokerId: joker.id, name: joker.name, newLevel })
      return { ...joker, progress: 0, level: newLevel }
    }
    return { ...joker, progress }
  })
  return { jokers: nextJokers, leveledUp }
}
