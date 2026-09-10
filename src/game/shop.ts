import type { Joker } from './jokers'

/** Picks a random subset of jokers not already owned, to offer in the shop. */
export function generateShopOffers(
  catalog: Joker[],
  owned: Joker[],
  rng: () => number = Math.random,
  count = 3,
): Joker[] {
  const ownedIds = new Set(owned.map((j) => j.id))
  const pool = catalog.filter((j) => !ownedIds.has(j.id))

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, Math.min(count, pool.length))
}

export interface BuyJokerResult {
  coins: number
  owned: Joker[]
  success: boolean
}

export function buyJoker(
  coins: number,
  owned: Joker[],
  joker: Joker,
  maxSlots: number,
): BuyJokerResult {
  const alreadyOwned = owned.some((j) => j.id === joker.id)
  if (alreadyOwned || owned.length >= maxSlots || coins < joker.cost) {
    return { coins, owned, success: false }
  }
  return { coins: coins - joker.cost, owned: [...owned, joker], success: true }
}
