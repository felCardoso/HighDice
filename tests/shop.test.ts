import { describe, expect, it } from 'vitest'
import { JOKER_CATALOG } from '../src/game/jokers'
import { buyJoker, generateShopOffers } from '../src/game/shop'

describe('generateShopOffers', () => {
  it('returns the requested number of offers from the catalog', () => {
    const offers = generateShopOffers(JOKER_CATALOG, [], () => 0.5, 3)
    expect(offers).toHaveLength(3)
    const ids = new Set(offers.map((j) => j.id))
    expect(ids.size).toBe(3)
  })

  it('never offers a joker the player already owns', () => {
    const owned = [JOKER_CATALOG[0], JOKER_CATALOG[1]]
    const offers = generateShopOffers(JOKER_CATALOG, owned, () => 0, 8)
    const ids = new Set(offers.map((j) => j.id))
    expect(ids.has(owned[0].id)).toBe(false)
    expect(ids.has(owned[1].id)).toBe(false)
  })

  it('returns fewer offers than requested if the catalog is nearly exhausted', () => {
    const owned = JOKER_CATALOG.slice(0, JOKER_CATALOG.length - 1)
    const offers = generateShopOffers(JOKER_CATALOG, owned, () => 0, 3)
    expect(offers).toHaveLength(1)
  })
})

describe('buyJoker', () => {
  const joker = JOKER_CATALOG[0]

  it('succeeds when there are enough coins and free slots', () => {
    const result = buyJoker(joker.cost + 10, [], joker, 5)
    expect(result.success).toBe(true)
    expect(result.coins).toBe(10)
    expect(result.owned).toEqual([joker])
  })

  it('fails without enough coins', () => {
    const result = buyJoker(joker.cost - 1, [], joker, 5)
    expect(result.success).toBe(false)
    expect(result.owned).toEqual([])
  })

  it('fails when all joker slots are full', () => {
    const owned = JOKER_CATALOG.slice(1, 6) // 5 jokers, different from `joker`
    const result = buyJoker(1000, owned, joker, 5)
    expect(result.success).toBe(false)
    expect(result.owned).toBe(owned)
  })

  it('fails when the joker is already owned', () => {
    const result = buyJoker(1000, [joker], joker, 5)
    expect(result.success).toBe(false)
  })
})
