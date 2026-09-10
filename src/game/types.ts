export type DieValue = 1 | 2 | 3 | 4 | 5 | 6

export interface Die {
  id: number
  value: DieValue
  selected: boolean
}

export type HandType = 'K5' | 'ST' | 'K4' | 'FH' | 'K3' | 'P2' | 'K2' | 'HD'

export interface HandCheck {
  hand: HandType
  /** Face values relevant to the hand (e.g. the triple/pair faces of a Full House). */
  values: number[]
}

export type HandLevels = Record<HandType, number>
