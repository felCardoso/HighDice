import { describe, expect, it } from 'vitest'
import {
  createInitialRunState,
  deductStake,
  levelUp,
  MAX_LEVEL,
  STAKE_BASE,
  STAKE_GROWTH_RATE,
} from '../src/game/run'

describe('createInitialRunState', () => {
  it('starts at level 1 with a full stake, plays and rerolls', () => {
    const state = createInitialRunState()
    expect(state.level).toBe(1)
    expect(state.stakeMax).toBe(STAKE_BASE) // growth_rate^0 === 1
    expect(state.stake).toBe(state.stakeMax)
    expect(state.play).toBe(state.playMax)
    expect(state.reroll).toBe(state.rerollMax)
    expect(state.status).toBe('playing')
  })
})

describe('stake curve', () => {
  it('compounds by roughly the growth rate each level', () => {
    let state = createInitialRunState()
    for (let i = 0; i < 5; i++) {
      const prevStake = state.stakeMax
      state = levelUp(state)
      const ratio = state.stakeMax / prevStake
      expect(ratio).toBeGreaterThan(STAKE_GROWTH_RATE - 0.05)
      expect(ratio).toBeLessThan(STAKE_GROWTH_RATE + 0.05)
    }
  })

  it('grows exponentially rather than linearly by the late game', () => {
    let state = createInitialRunState()
    for (let i = 1; i < MAX_LEVEL; i++) state = levelUp(state)
    // The old linear curve (level*100 + 50*(level-1)) capped out at 3700.
    expect(state.stakeMax).toBeGreaterThan(3700)
  })
})

describe('levelUp', () => {
  it('increments the level and refills stake/plays/rerolls', () => {
    const state = createInitialRunState()
    const next = levelUp(state)
    expect(next.level).toBe(2)
    expect(next.stake).toBe(next.stakeMax)
    expect(next.play).toBe(next.playMax)
    expect(next.reroll).toBe(next.rerollMax)
  })

  it('grants an extra reroll and play every 5 levels', () => {
    let state = createInitialRunState()
    for (let i = 0; i < 4; i++) state = levelUp(state) // now at level 5
    expect(state.level).toBe(5)
    expect(state.rerollMax).toBe(4)
    expect(state.playMax).toBe(4)
  })

  it('marks the run as won instead of leveling past the max level', () => {
    let state = createInitialRunState()
    for (let i = 1; i < MAX_LEVEL; i++) state = levelUp(state)
    expect(state.level).toBe(MAX_LEVEL)
    expect(state.status).toBe('playing')

    const won = levelUp(state)
    expect(won.status).toBe('won')
    expect(won.level).toBe(MAX_LEVEL) // does not overflow past the max
  })
})

describe('deductStake', () => {
  it('subtracts from the stake without leveling up when stake remains', () => {
    const state = createInitialRunState()
    const { state: next, leveledUp } = deductStake(state, 50)
    expect(leveledUp).toBe(false)
    expect(next.stake).toBe(state.stake - 50)
    expect(next.level).toBe(1)
  })

  it('levels up and grants an upgrade when stake is fully depleted', () => {
    const state = createInitialRunState()
    const { state: next, leveledUp } = deductStake(state, state.stake)
    expect(leveledUp).toBe(true)
    expect(next.level).toBe(2)
    expect(next.upgradesAvailable).toBe(1)
  })

  it('levels up when the deduction overshoots the remaining stake', () => {
    const state = createInitialRunState()
    const { state: next, leveledUp } = deductStake(state, state.stake + 1000)
    expect(leveledUp).toBe(true)
    expect(next.level).toBe(2)
  })

  it('accumulates upgrade points across multiple level-ups', () => {
    let state = createInitialRunState()
    ;({ state } = deductStake(state, state.stake))
    ;({ state } = deductStake(state, state.stake))
    expect(state.upgradesAvailable).toBe(2)
  })
})
