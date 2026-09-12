import type { Joker, JokerRarity, OwnedJoker } from './jokers'
import { toOwnedJoker } from './jokers'

const RARITY_WEIGHT: Record<JokerRarity, number> = {
  common: 5,
  rare: 2,
  legendary: 1,
}

/**
 * Picks a random subset of jokers not already owned, to offer in the shop.
 * Weighted by rarity so legendaries show up far less often than commons.
 */
export function generateShopOffers(
  catalog: Joker[],
  owned: OwnedJoker[],
  rng: () => number = Math.random,
  count = 3,
): Joker[] {
  const ownedIds = new Set(owned.map((j) => j.id))
  const pool = catalog.filter((j) => !ownedIds.has(j.id))
  const result: Joker[] = []

  const n = Math.min(count, pool.length)
  for (let i = 0; i < n; i++) {
    const totalWeight = pool.reduce(
      (sum, j) => sum + RARITY_WEIGHT[j.rarity],
      0,
    )
    let r = rng() * totalWeight
    let idx = 0
    for (; idx < pool.length - 1; idx++) {
      r -= RARITY_WEIGHT[pool[idx].rarity]
      if (r <= 0) break
    }
    result.push(pool[idx])
    pool.splice(idx, 1)
  }

  return result
}

export interface BuyJokerResult {
  coins: number
  owned: OwnedJoker[]
  success: boolean
}

export function buyJoker(
  coins: number,
  owned: OwnedJoker[],
  joker: Joker,
  maxSlots: number,
): BuyJokerResult {
  const alreadyOwned = owned.some((j) => j.id === joker.id)
  if (alreadyOwned || owned.length >= maxSlots || coins < joker.cost) {
    return { coins, owned, success: false }
  }
  return {
    coins: coins - joker.cost,
    owned: [...owned, toOwnedJoker(joker)],
    success: true,
  }
}

export const SELL_REFUND_RATE = 0.5

export interface SellJokerResult {
  coins: number
  owned: OwnedJoker[]
  success: boolean
  refund: number
}

/** Sells an owned joker back for a fraction of its cost, freeing its slot. */
export function sellJoker(
  coins: number,
  owned: OwnedJoker[],
  jokerId: string,
): SellJokerResult {
  const joker = owned.find((j) => j.id === jokerId)
  if (!joker) return { coins, owned, success: false, refund: 0 }

  const refund = Math.floor(joker.cost * SELL_REFUND_RATE)
  return {
    coins: coins + refund,
    owned: owned.filter((j) => j.id !== jokerId),
    success: true,
    refund,
  }
}
