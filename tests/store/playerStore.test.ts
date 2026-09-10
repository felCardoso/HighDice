import { beforeEach, describe, expect, it } from 'vitest'
import { usePlayerStore } from '../../src/store/playerStore'

const initialState = usePlayerStore.getState()

beforeEach(() => {
  usePlayerStore.setState(initialState, true)
  localStorage.clear()
})

describe('playerStore', () => {
  it('starts with a zero score and high score', () => {
    const state = usePlayerStore.getState()
    expect(state.score).toBe(0)
    expect(state.highScore).toBe(0)
  })

  it('accumulates score across recordScore calls', () => {
    usePlayerStore.getState().recordScore(100)
    usePlayerStore.getState().recordScore(50)
    expect(usePlayerStore.getState().score).toBe(150)
  })

  it('raises the high score as the cumulative score grows', () => {
    usePlayerStore.getState().recordScore(100)
    expect(usePlayerStore.getState().highScore).toBe(100)
    usePlayerStore.getState().recordScore(200)
    expect(usePlayerStore.getState().highScore).toBe(300)
  })

  it('keeps the high score after resetScore drops the current score', () => {
    usePlayerStore.getState().recordScore(500)
    usePlayerStore.getState().resetScore()
    expect(usePlayerStore.getState().score).toBe(0)
    expect(usePlayerStore.getState().highScore).toBe(500)
  })

  it('does not lower the high score on a worse run', () => {
    usePlayerStore.getState().recordScore(500)
    usePlayerStore.getState().resetScore()
    usePlayerStore.getState().recordScore(10)
    expect(usePlayerStore.getState().highScore).toBe(500)
  })
})
