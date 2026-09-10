import { create } from 'zustand'
import {
  createDiceSet,
  rerollSelected as rerollDice,
  rollAll,
  toggleDie as toggleDieAt,
} from '../game/dice'
import {
  computeUpgradeOptions,
  createDefaultHandLevels,
  HAND_NAMES,
} from '../game/hands'
import { createInitialRunState, deductStake, type RunState } from '../game/run'
import { checkScore, type ScoreResult } from '../game/scoring'
import type { Die, HandLevels, HandType } from '../game/types'
import { usePlayerStore } from './playerStore'

export interface LogEntry {
  id: number
  message: string
  timestamp: number
}

interface RunStoreState {
  run: RunState
  dice: Die[]
  handLevels: HandLevels
  upgradeOptions: HandType[]
  lastScore: ScoreResult | null
  log: LogEntry[]

  toggleDie: (id: number) => void
  reroll: () => void
  playHand: () => void
  upgradeHand: (hand: HandType) => void
  resetRun: () => void
}

let nextLogId = 0
function withLog(log: LogEntry[], message: string): LogEntry[] {
  return [{ id: nextLogId++, message, timestamp: Date.now() }, ...log]
}

function formatScoreLog(score: ScoreResult): string {
  const { hand, handScore, diceScore, level, result } = score
  const [base, mult] = handScore
  if (level === 1) {
    return `${HAND_NAMES[hand]} | (${base} + ${diceScore}) * ${mult} = ${result}`
  }
  const levelBonus = 5 * (level - 1)
  return `${HAND_NAMES[hand]} | (${base} + ${diceScore} (+${levelBonus})) * (${mult} + ${level - 1}) = ${result}`
}

function freshDiceAndLevels() {
  return { dice: createDiceSet(5), handLevels: createDefaultHandLevels() }
}

export const useRunStore = create<RunStoreState>((set, get) => ({
  run: createInitialRunState(),
  ...freshDiceAndLevels(),
  upgradeOptions: [],
  lastScore: null,
  log: withLog([], 'High Dice — new run started.'),

  toggleDie: (id) => set((state) => ({ dice: toggleDieAt(state.dice, id) })),

  reroll: () => {
    const { run, dice, log } = get()
    if (run.status !== 'playing' || run.reroll <= 0) {
      set({ log: withLog(log, 'Out of rerolls.') })
      return
    }
    set({
      dice: rerollDice(dice),
      run: { ...run, reroll: run.reroll - 1 },
      log: withLog(log, 'Rerolled selected dice.'),
    })
  },

  playHand: () => {
    const { run, dice, handLevels, log } = get()
    if (run.status !== 'playing' || run.play <= 0) return

    const score = checkScore(
      dice.map((d) => d.value),
      handLevels,
    )
    const { state: nextRun, leveledUp } = deductStake(
      { ...run, play: run.play - 1 },
      score.result,
    )

    usePlayerStore.getState().recordScore(score.result)

    let nextLog = withLog(log, formatScoreLog(score))
    let upgradeOptions = get().upgradeOptions
    let finalRun = nextRun

    if (nextRun.status === 'won') {
      nextLog = withLog(nextLog, `You beat level ${nextRun.maxLevel}!`)
    } else if (leveledUp) {
      upgradeOptions = computeUpgradeOptions()
      nextLog = withLog(nextLog, `Level ${nextRun.level}.`)
      nextLog = withLog(nextLog, 'Rerolls and plays reset.')
    } else if (nextRun.play === 0) {
      finalRun = { ...nextRun, status: 'gameover' }
      nextLog = withLog(nextLog, 'Game Over!')
    }

    const shouldRollDice = finalRun.status !== 'gameover'

    set({
      run: finalRun,
      dice: shouldRollDice ? rollAll(dice) : dice,
      lastScore: score,
      upgradeOptions,
      log: nextLog,
    })
  },

  upgradeHand: (hand) => {
    const { run, handLevels, log } = get()
    if (run.upgradesAvailable <= 0) {
      set({ log: withLog(log, 'No upgrades available.') })
      return
    }
    const nextLevels = { ...handLevels, [hand]: handLevels[hand] + 1 }
    set({
      handLevels: nextLevels,
      run: { ...run, upgradesAvailable: run.upgradesAvailable - 1 },
      log: withLog(
        log,
        `${HAND_NAMES[hand]} upgraded to lv. ${nextLevels[hand]}.`,
      ),
    })
  },

  resetRun: () => {
    usePlayerStore.getState().resetScore()
    set({
      run: createInitialRunState(),
      ...freshDiceAndLevels(),
      upgradeOptions: [],
      lastScore: null,
      log: withLog([], 'Game reset!'),
    })
  },
}))
