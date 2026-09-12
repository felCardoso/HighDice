export const MAX_LEVEL = 25
export const INITIAL_REROLL_MAX = 3
export const INITIAL_PLAY_MAX = 3
export const STAKE_BASE = 100
export const STAKE_GROWTH_RATE = 1.2

export type RunStatus = 'playing' | 'gameover' | 'won'

export interface RunState {
  level: number
  maxLevel: number
  stakeMax: number
  stake: number
  reroll: number
  rerollMax: number
  play: number
  playMax: number
  status: RunStatus
}

/**
 * Exponential stake curve: stays close to the old linear curve for the
 * first few levels, then compounds past it — countering how joker/upgrade
 * bonuses make score grow multiplicatively as a run progresses.
 */
function stakeForLevel(level: number): number {
  return Math.round(STAKE_BASE * STAKE_GROWTH_RATE ** (level - 1))
}

export function createInitialRunState(): RunState {
  const level = 1
  const stakeMax = stakeForLevel(level)
  return {
    level,
    maxLevel: MAX_LEVEL,
    stakeMax,
    stake: stakeMax,
    reroll: INITIAL_REROLL_MAX,
    rerollMax: INITIAL_REROLL_MAX,
    play: INITIAL_PLAY_MAX,
    playMax: INITIAL_PLAY_MAX,
    status: 'playing',
  }
}

/** Advances to the next level, or marks the run as won at the max level. */
export function levelUp(state: RunState): RunState {
  if (state.level >= state.maxLevel) {
    return { ...state, status: 'won' }
  }

  const level = state.level + 1
  const grantsExtraResource = level % 5 === 0
  const rerollMax = state.rerollMax + (grantsExtraResource ? 1 : 0)
  const playMax = state.playMax + (grantsExtraResource ? 1 : 0)
  const stakeMax = stakeForLevel(level)

  return {
    ...state,
    level,
    rerollMax,
    playMax,
    stakeMax,
    stake: stakeMax,
    reroll: rerollMax,
    play: playMax,
  }
}

export interface DeductStakeResult {
  state: RunState
  leveledUp: boolean
}

/** Subtracts `amount` from the stake; levels up if it hits zero. */
export function deductStake(
  state: RunState,
  amount: number,
): DeductStakeResult {
  if (state.stake - amount <= 0) {
    return { state: levelUp({ ...state, stake: 0 }), leveledUp: true }
  }
  return { state: { ...state, stake: state.stake - amount }, leveledUp: false }
}
