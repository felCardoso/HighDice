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
}

export function checkScore(
  values: DieValue[],
  handLevels: HandLevels,
): ScoreResult {
  const diceScore = values.reduce((acc, v) => acc + v, 0)
  const { hand } = checkHand(values)
  const handScore = HAND_SCORE[hand]
  const level = handLevels[hand]
  const result =
    (handScore[0] + 5 * (level - 1) + diceScore) * (handScore[1] + (level - 1))

  return { result, hand, diceScore, handScore, level }
}
