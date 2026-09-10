import type { DieValue, HandType } from './types'

export type JokerEffect =
  | { kind: 'flatBase'; amount: number }
  | { kind: 'flatMult'; amount: number }
  | { kind: 'handBase'; hand: HandType; amount: number }
  | { kind: 'handMult'; hand: HandType; amount: number }
  | { kind: 'faceBase'; face: DieValue; amount: number }
  | { kind: 'faceMult'; face: DieValue; amount: number }
  | { kind: 'coinsPerPlay'; amount: number }

export interface Joker {
  id: string
  name: string
  description: string
  cost: number
  effect: JokerEffect
}

export const JOKER_CATALOG: Joker[] = [
  {
    id: 'steady-hand',
    name: 'Steady Hand',
    description: '+15 base score on every hand.',
    cost: 4,
    effect: { kind: 'flatBase', amount: 15 },
  },
  {
    id: 'sharp-shooter',
    name: 'Sharp Shooter',
    description: '+2 multiplier on every hand.',
    cost: 5,
    effect: { kind: 'flatMult', amount: 2 },
  },
  {
    id: 'sixes-wild',
    name: 'Sixes Wild',
    description: '+2 multiplier for each die showing 6.',
    cost: 6,
    effect: { kind: 'faceMult', face: 6, amount: 2 },
  },
  {
    id: 'snake-eyes',
    name: 'Snake Eyes',
    description: '+5 base score for each die showing 1.',
    cost: 4,
    effect: { kind: 'faceBase', face: 1, amount: 5 },
  },
  {
    id: 'straight-shooter',
    name: 'Straight Shooter',
    description: '+25 base score when you play a Straight.',
    cost: 5,
    effect: { kind: 'handBase', hand: 'ST', amount: 25 },
  },
  {
    id: 'full-pockets',
    name: 'Full Pockets',
    description: '+3 multiplier when you play a Full House.',
    cost: 6,
    effect: { kind: 'handMult', hand: 'FH', amount: 3 },
  },
  {
    id: 'pair-bonus',
    name: 'Pair Bonus',
    description: '+2 multiplier when you play a Pair.',
    cost: 3,
    effect: { kind: 'handMult', hand: 'K2', amount: 2 },
  },
  {
    id: 'coin-collector',
    name: 'Coin Collector',
    description: '+2 coins every time you play a hand.',
    cost: 5,
    effect: { kind: 'coinsPerPlay', amount: 2 },
  },
]

export interface JokerBonus {
  base: number
  mult: number
  coins: number
}

/** Aggregates every owned joker's effect for the hand just played. */
export function applyJokerBonuses(
  values: DieValue[],
  hand: HandType,
  jokers: Joker[],
): JokerBonus {
  let base = 0
  let mult = 0
  let coins = 0

  for (const { effect } of jokers) {
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
    }
  }

  return { base, mult, coins }
}
