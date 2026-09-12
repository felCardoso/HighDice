import { describe, expect, it } from 'vitest'
import { JOKER_CATALOG, toOwnedJoker } from '../src/game/jokers'
import { buyJoker, generateShopOffers, sellJoker } from '../src/game/shop'

const own = (...jokers: typeof JOKER_CATALOG) => jokers.map(toOwnedJoker)

describe('generateShopOffers', () => {
  it('returns the requested number of offers from the catalog', () => {
    const offers = generateShopOffers(JOKER_CATALOG, [], () => 0.5, 3)
    expect(offers).toHaveLength(3)
    const ids = new Set(offers.map((j) => j.id))
    expect(ids.size).toBe(3)
  })

  it('never offers a joker the player already owns', () => {
    const owned = own(JOKER_CATALOG[0], JOKER_CATALOG[1])
    const offers = generateShopOffers(JOKER_CATALOG, owned, () => 0, 8)
    const ids = new Set(offers.map((j) => j.id))
    expect(ids.has(owned[0].id)).toBe(false)
    expect(ids.has(owned[1].id)).toBe(false)
  })

  it('returns fewer offers than requested if the catalog is nearly exhausted', () => {
    const owned = own(...JOKER_CATALOG.slice(0, JOKER_CATALOG.length - 1))
    const offers = generateShopOffers(JOKER_CATALOG, owned, () => 0, 3)
    expect(offers).toHaveLength(1)
  })

  it('offers legendary jokers less often than commons over many draws', () => {
    let legendaryCount = 0
    let commonCount = 0
    for (let i = 0; i < 200; i++) {
      const rng = (() => {
        let seed = i + 1
        return () => {
          seed = (seed * 9301 + 49297) % 233280
          return seed / 233280
        }
      })()
      const [offer] = generateShopOffers(JOKER_CATALOG, [], rng, 1)
      if (offer.rarity === 'legendary') legendaryCount++
      if (offer.rarity === 'common') commonCount++
    }
    expect(commonCount).toBeGreaterThan(legendaryCount)
  })
})

describe('buyJoker', () => {
  const joker = JOKER_CATALOG[0]

  it('succeeds when there are enough coins and free slots', () => {
    const result = buyJoker(joker.cost + 10, [], joker, 5)
    expect(result.success).toBe(true)
    expect(result.coins).toBe(10)
    expect(result.owned).toEqual([{ ...joker, level: 1, progress: 0 }])
  })

  it('fails without enough coins', () => {
    const result = buyJoker(joker.cost - 1, [], joker, 5)
    expect(result.success).toBe(false)
    expect(result.owned).toEqual([])
  })

  it('fails when all joker slots are full', () => {
    const owned = own(...JOKER_CATALOG.slice(1, 6)) // 5 jokers, different from `joker`
    const result = buyJoker(1000, owned, joker, 5)
    expect(result.success).toBe(false)
    expect(result.owned).toBe(owned)
  })

  it('fails when the joker is already owned', () => {
    const result = buyJoker(1000, own(joker), joker, 5)
    expect(result.success).toBe(false)
  })
})

describe('sellJoker', () => {
  const joker = JOKER_CATALOG[0] // cost 4 -> refund 2

  it('refunds half the cost (rounded down) and frees the slot', () => {
    const owned = own(joker)
    const result = sellJoker(0, owned, joker.id)
    expect(result.success).toBe(true)
    expect(result.refund).toBe(Math.floor(joker.cost * 0.5))
    expect(result.coins).toBe(result.refund)
    expect(result.owned).toEqual([])
  })

  it('fails when the joker is not owned', () => {
    const result = sellJoker(0, [], joker.id)
    expect(result.success).toBe(false)
    expect(result.refund).toBe(0)
  })
})
