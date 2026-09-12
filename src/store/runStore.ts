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
  HAND_ORDER,
  handUpgradeCost,
} from '../game/hands'
import {
  advanceJokerEvolutions,
  applyJokerBonuses,
  JOKER_CATALOG,
  type Joker,
  type OwnedJoker,
} from '../game/jokers'
import { createInitialRunState, deductStake, type RunState } from '../game/run'
import {
  createSeededRng,
  generateRandomSeed,
  hashSeed,
  type Rng,
} from '../game/rng'
import { checkScore, type ScoreResult } from '../game/scoring'
import {
  buyJoker as buyJokerLogic,
  generateShopOffers,
  sellJoker as sellJokerLogic,
} from '../game/shop'
import type { Die, HandLevels, HandType } from '../game/types'
import { usePlayerStore } from './playerStore'

export const MAX_JOKER_SLOTS = 5
export const LEVEL_UP_COINS = 8
export const REROLL_COST = 3

export interface LogEntry {
  id: number
  message: string
  timestamp: number
}

interface RunStoreState {
  run: RunState
  seed: string
  rng: Rng
  dice: Die[]
  handLevels: HandLevels
  upgradeOptions: HandType[]
  lastScore: ScoreResult | null
  log: LogEntry[]
  coins: number
  jokers: OwnedJoker[]
  shopOffers: Joker[]

  toggleDie: (id: number) => void
  reroll: () => void
  playHand: () => void
  upgradeHand: (hand: HandType) => void
  buyJoker: (jokerId: string) => void
  sellJoker: (jokerId: string) => void
  rerollShop: () => void
  reorderJokers: (order: string[]) => void
  /** Starts a fresh run. Pass a seed to reproduce a specific run's dice sequence. */
  resetRun: (seed?: string) => void
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

function createRunSeed(seed?: string): { seed: string; rng: Rng } {
  const finalSeed = seed?.trim() ? seed.trim() : generateRandomSeed()
  return { seed: finalSeed, rng: createSeededRng(hashSeed(finalSeed)) }
}

function freshDiceAndLevels(rng: Rng) {
  return { dice: createDiceSet(5, rng), handLevels: createDefaultHandLevels() }
}

const initialSeed = createRunSeed()

export const useRunStore = create<RunStoreState>((set, get) => ({
  run: createInitialRunState(),
  seed: initialSeed.seed,
  rng: initialSeed.rng,
  ...freshDiceAndLevels(initialSeed.rng),
  upgradeOptions: [],
  lastScore: null,
  log: withLog([], `High Dice — new run started. Seed: ${initialSeed.seed}`),
  coins: 0,
  jokers: [],
  shopOffers: [],

  toggleDie: (id) => set((state) => ({ dice: toggleDieAt(state.dice, id) })),

  reroll: () => {
    const { run, dice, log, rng } = get()
    if (run.status !== 'playing' || run.reroll <= 0) {
      set({ log: withLog(log, 'Out of rerolls.') })
      return
    }
    set({
      dice: rerollDice(dice, rng),
      run: { ...run, reroll: run.reroll - 1 },
      log: withLog(log, 'Rerolled selected dice.'),
    })
  },

  playHand: () => {
    const { run, dice, handLevels, log, jokers, coins, rng } = get()
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

    const { jokers: evolvedJokers, leveledUp: jokerLevelUps } =
      advanceJokerEvolutions(jokers)

    let nextLog = withLog(log, formatScoreLog(score))
    for (const evo of jokerLevelUps) {
      nextLog = withLog(nextLog, `${evo.name} reached level ${evo.newLevel}!`)
    }

    let upgradeOptions = get().upgradeOptions
    let shopOffers = get().shopOffers
    let finalRun = nextRun
    let nextCoins = coins + jokerBonus.coins

    if (nextRun.status === 'won') {
      nextLog = withLog(nextLog, `You beat level ${nextRun.maxLevel}!`)
    } else if (leveledUp) {
      upgradeOptions = computeUpgradeOptions(handLevels, HAND_ORDER, rng)
      shopOffers = generateShopOffers(JOKER_CATALOG, evolvedJokers, rng)
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
      dice: shouldRollDice ? rollAll(dice, rng) : dice,
      jokers: evolvedJokers,
      lastScore: score,
      upgradeOptions,
      shopOffers,
      coins: nextCoins,
      log: nextLog,
    })
  },

  upgradeHand: (hand) => {
    const { handLevels, coins, log } = get()
    const cost = handUpgradeCost(handLevels[hand])
    if (coins < cost) {
      set({ log: withLog(log, 'Not enough coins.') })
      return
    }
    const nextLevels = { ...handLevels, [hand]: handLevels[hand] + 1 }
    set({
      handLevels: nextLevels,
      coins: coins - cost,
      log: withLog(
        log,
        `${HAND_NAMES[hand]} upgraded to lv. ${nextLevels[hand]} (-${cost} coins).`,
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

  sellJoker: (jokerId) => {
    const { coins, jokers, log } = get()
    const result = sellJokerLogic(coins, jokers, jokerId)
    if (!result.success) return

    const sold = jokers.find((j) => j.id === jokerId)
    set({
      coins: result.coins,
      jokers: result.owned,
      log: withLog(
        log,
        `Sold ${sold?.name ?? 'joker'} for +${result.refund} coins.`,
      ),
    })
  },

  rerollShop: () => {
    const { coins, jokers, log, rng } = get()
    if (coins < REROLL_COST) {
      set({ log: withLog(log, 'Not enough coins to reroll.') })
      return
    }
    set({
      coins: coins - REROLL_COST,
      shopOffers: generateShopOffers(JOKER_CATALOG, jokers, rng),
      log: withLog(log, `Rerolled the shop (-${REROLL_COST} coins).`),
    })
  },

  reorderJokers: (order) => {
    const { jokers } = get()
    const byId = new Map(jokers.map((j) => [j.id, j]))
    const reordered = order
      .map((id) => byId.get(id))
      .filter((j): j is OwnedJoker => j !== undefined)
    const missing = jokers.filter((j) => !order.includes(j.id))
    set({ jokers: [...reordered, ...missing] })
  },

  resetRun: (seed) => {
    usePlayerStore.getState().resetScore()
    const nextSeed = createRunSeed(seed)
    set({
      run: createInitialRunState(),
      seed: nextSeed.seed,
      rng: nextSeed.rng,
      ...freshDiceAndLevels(nextSeed.rng),
      upgradeOptions: [],
      lastScore: null,
      coins: 0,
      jokers: [],
      shopOffers: [],
      log: withLog([], `Game reset! Seed: ${nextSeed.seed}`),
    })
  },
}))
