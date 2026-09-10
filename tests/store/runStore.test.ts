import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialRunState } from '../../src/game/run'
import { createDefaultHandLevels } from '../../src/game/hands'
import type { Die } from '../../src/game/types'
import { useRunStore } from '../../src/store/runStore'
import { usePlayerStore } from '../../src/store/playerStore'

function dice(values: number[]): Die[] {
  return values.map((value, id) => ({
    id,
    value: value as Die['value'],
    selected: false,
  }))
}

beforeEach(() => {
  useRunStore.setState({
    run: createInitialRunState(),
    dice: dice([1, 2, 3, 4, 6]), // High Dice hand, sum = 16
    handLevels: createDefaultHandLevels(),
    upgradeOptions: [],
    lastScore: null,
    log: [],
  })
  usePlayerStore.setState({ score: 0, highScore: 0 })
})

describe('toggleDie', () => {
  it('flips only the targeted die', () => {
    useRunStore.getState().toggleDie(2)
    const die = useRunStore.getState().dice.find((d) => d.id === 2)
    expect(die?.selected).toBe(true)
  })
})

describe('reroll', () => {
  it('consumes a reroll and logs the action', () => {
    const before = useRunStore.getState().run.reroll
    useRunStore.getState().reroll()
    expect(useRunStore.getState().run.reroll).toBe(before - 1)
    expect(useRunStore.getState().log[0].message).toMatch(/rerolled/i)
  })

  it('refuses to reroll when out of rerolls', () => {
    useRunStore.setState((s) => ({ run: { ...s.run, reroll: 0 } }))
    useRunStore.getState().reroll()
    expect(useRunStore.getState().run.reroll).toBe(0)
    expect(useRunStore.getState().log[0].message).toMatch(/out of rerolls/i)
  })
})

describe('playHand', () => {
  it('scores the hand, deducts stake, and rolls a fresh set of dice', () => {
    const { run } = useRunStore.getState()
    useRunStore.setState({ run: { ...run, stake: 10_000 } })

    useRunStore.getState().playHand()

    const state = useRunStore.getState()
    expect(state.lastScore?.hand).toBe('HD')
    expect(state.run.play).toBe(run.playMax - 1)
    expect(state.run.stake).toBeLessThan(10_000)
    expect(state.run.status).toBe('playing')
    expect(state.dice).toHaveLength(5)
    expect(usePlayerStore.getState().score).toBe(state.lastScore?.result)
  })

  it('levels up and grants an upgrade when the stake is depleted', () => {
    const { run } = useRunStore.getState()
    useRunStore.setState({ run: { ...run, stake: 1 } })

    useRunStore.getState().playHand()

    const state = useRunStore.getState()
    expect(state.run.level).toBe(2)
    expect(state.run.upgradesAvailable).toBe(1)
    expect(state.upgradeOptions).toHaveLength(4)
    expect(state.log.some((l) => /level 2/i.test(l.message))).toBe(true)
  })

  it('ends the run when plays run out without leveling up', () => {
    const { run } = useRunStore.getState()
    useRunStore.setState({ run: { ...run, play: 1, stake: 10_000 } })
    const diceBefore = useRunStore.getState().dice

    useRunStore.getState().playHand()

    const state = useRunStore.getState()
    expect(state.run.play).toBe(0)
    expect(state.run.status).toBe('gameover')
    expect(state.dice).toBe(diceBefore) // dice are not rerolled after game over
  })

  it('does nothing once the run is already over', () => {
    const { run } = useRunStore.getState()
    useRunStore.setState({ run: { ...run, status: 'gameover' } })
    const before = useRunStore.getState()

    useRunStore.getState().playHand()

    expect(useRunStore.getState()).toEqual(before)
  })
})

describe('upgradeHand', () => {
  it('refuses to upgrade without an available upgrade point', () => {
    useRunStore.getState().upgradeHand('K2')
    expect(useRunStore.getState().handLevels.K2).toBe(1)
    expect(useRunStore.getState().log[0].message).toMatch(/no upgrades/i)
  })

  it('spends an upgrade point to raise a hand level', () => {
    const { run } = useRunStore.getState()
    useRunStore.setState({ run: { ...run, upgradesAvailable: 1 } })

    useRunStore.getState().upgradeHand('K2')

    const state = useRunStore.getState()
    expect(state.handLevels.K2).toBe(2)
    expect(state.run.upgradesAvailable).toBe(0)
  })
})

describe('resetRun', () => {
  it('restores the initial run state and clears the player score, keeping the high score', () => {
    usePlayerStore.setState({ score: 300, highScore: 300 })
    useRunStore.setState((s) => ({ run: { ...s.run, level: 5, stake: 0 } }))

    useRunStore.getState().resetRun()

    const state = useRunStore.getState()
    expect(state.run.level).toBe(1)
    expect(state.dice).toHaveLength(5)
    expect(usePlayerStore.getState().score).toBe(0)
    expect(usePlayerStore.getState().highScore).toBe(300)
  })

  it('reproduces the same dice sequence when given the same seed', () => {
    useRunStore.getState().resetRun('replay-me')
    const firstRoll = useRunStore.getState().dice.map((d) => d.value)
    useRunStore.getState().reroll()
    const afterReroll = useRunStore.getState().dice.map((d) => d.value)

    useRunStore.getState().resetRun('replay-me')
    const secondRoll = useRunStore.getState().dice.map((d) => d.value)
    useRunStore.getState().reroll()
    const secondAfterReroll = useRunStore.getState().dice.map((d) => d.value)

    expect(useRunStore.getState().seed).toBe('replay-me')
    expect(secondRoll).toEqual(firstRoll)
    expect(secondAfterReroll).toEqual(afterReroll)
  })

  it('picks a new random seed when none is given', () => {
    useRunStore.getState().resetRun('first-seed')
    const firstSeed = useRunStore.getState().seed
    useRunStore.getState().resetRun()
    expect(useRunStore.getState().seed).not.toBe(firstSeed)
  })
})
