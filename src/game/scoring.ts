import { checkHand } from './hands'
import type { DieValue, HandLevels, HandType } from './types'

export const HAND_SCORE: Record<HandType, [base: number, mult: number]> = {
  K5: [30, 14],
  ST: [25, 10],
  K4: [25, 8],
  FH: [20, 6],
  K3: [15, 4],
  P2: [10, 3],
  K2: [5, 2],
  HD: [0, 1],
}

export interface ScoreResult {
  result: number
  hand: HandType
  diceScore: number
  handScore: [number, number]
  level: number
  jokerBonus: JokerScoreBonus
}

export interface JokerScoreBonus {
  base: number
  mult: number
}

const NO_JOKER_BONUS: JokerScoreBonus = { base: 0, mult: 0 }

export function checkScore(
  values: DieValue[],
  handLevels: HandLevels,
  jokerBonus: JokerScoreBonus = NO_JOKER_BONUS,
): ScoreResult {
  const diceScore = values.reduce((acc, v) => acc + v, 0)
  const { hand } = checkHand(values)
  const handScore = HAND_SCORE[hand]
  const level = handLevels[hand]
  const base = handScore[0] + 5 * (level - 1) + diceScore + jokerBonus.base
  const mult = handScore[1] + (level - 1) + jokerBonus.mult
  const result = base * mult

  return { result, hand, diceScore, handScore, level, jokerBonus }
}
