import { create } from 'zustand'
import {
  createDiceSet,
  rerollSelected as rerollDice,
  rollAll,
  toggleDie as toggleDieAt,
} from '../game/dice'
import {
  checkHand,
  computeUpgradeOptions,
  createDefaultHandLevels,
  HAND_NAMES,
} from '../game/hands'
import { applyJokerBonuses, JOKER_CATALOG, type Joker } from '../game/jokers'
import { createInitialRunState, deductStake, type RunState } from '../game/run'
import { checkScore, type ScoreResult } from '../game/scoring'
import { buyJoker as buyJokerLogic, generateShopOffers } from '../game/shop'
import type { Die, HandLevels, HandType } from '../game/types'
import { usePlayerStore } from './playerStore'

export const MAX_JOKER_SLOTS = 5
export const LEVEL_UP_COINS = 5

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
  coins: number
  jokers: Joker[]
  shopOffers: Joker[]

  toggleDie: (id: number) => void
  reroll: () => void
  playHand: () => void
  upgradeHand: (hand: HandType) => void
  buyJoker: (jokerId: string) => void
  resetRun: () => void
}

let nextLogId = 0
function withLog(log: LogEntry[], message: string): LogEntry[] {
  return [{ id: nextLogId++, message, timestamp: Date.now() }, ...log]
}

function formatScoreLog(score: ScoreResult): string {
  const { hand, handScore, diceScore, level, result, jokerBonus } = score
  const [base, mult] = handScore
  const jokerNote =
    jokerBonus.base || jokerBonus.mult
      ? ` [jokers: +${jokerBonus.base} base, +${jokerBonus.mult} mult]`
      : ''
  if (level === 1) {
    return `${HAND_NAMES[hand]} | (${base} + ${diceScore}) * ${mult} = ${result}${jokerNote}`
  }
  const levelBonus = 5 * (level - 1)
  return `${HAND_NAMES[hand]} | (${base} + ${diceScore} (+${levelBonus})) * (${mult} + ${level - 1}) = ${result}${jokerNote}`
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
  coins: 0,
  jokers: [],
  shopOffers: [],

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
    const { run, dice, handLevels, log, jokers, coins } = get()
    if (run.status !== 'playing' || run.play <= 0) return

    const diceValues = dice.map((d) => d.value)
    const { hand } = checkHand(diceValues)
    const jokerBonus = applyJokerBonuses(diceValues, hand, jokers)
    const score = checkScore(diceValues, handLevels, jokerBonus)

    const { state: nextRun, leveledUp } = deductStake(
      { ...run, play: run.play - 1 },
      score.result,
    )

    usePlayerStore.getState().recordScore(score.result)

    let nextLog = withLog(log, formatScoreLog(score))
    let upgradeOptions = get().upgradeOptions
    let shopOffers = get().shopOffers
    let finalRun = nextRun
    let nextCoins = coins + jokerBonus.coins

    if (nextRun.status === 'won') {
      nextLog = withLog(nextLog, `You beat level ${nextRun.maxLevel}!`)
    } else if (leveledUp) {
      upgradeOptions = computeUpgradeOptions()
      shopOffers = generateShopOffers(JOKER_CATALOG, jokers)
      nextCoins += LEVEL_UP_COINS
      nextLog = withLog(nextLog, `Level ${nextRun.level}.`)
      nextLog = withLog(nextLog, 'Rerolls and plays reset.')
      nextLog = withLog(nextLog, `+${LEVEL_UP_COINS} coins.`)
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
      shopOffers,
      coins: nextCoins,
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

  buyJoker: (jokerId) => {
    const { coins, jokers, shopOffers, log } = get()
    const joker = shopOffers.find((j) => j.id === jokerId)
    if (!joker) return

    const purchase = buyJokerLogic(coins, jokers, joker, MAX_JOKER_SLOTS)
    if (!purchase.success) {
      const reason =
        jokers.length >= MAX_JOKER_SLOTS
          ? 'No joker slots available.'
          : 'Not enough coins.'
      set({ log: withLog(log, reason) })
      return
    }

    set({
      coins: purchase.coins,
      jokers: purchase.owned,
      shopOffers: shopOffers.filter((j) => j.id !== jokerId),
      log: withLog(log, `Bought ${joker.name}.`),
    })
  },

  resetRun: () => {
    usePlayerStore.getState().resetScore()
    set({
      run: createInitialRunState(),
      ...freshDiceAndLevels(),
      upgradeOptions: [],
      lastScore: null,
      coins: 0,
      jokers: [],
      shopOffers: [],
      log: withLog([], 'Game reset!'),
    })
  },
}))
