import {
  Coins,
  RefreshCw,
  ShoppingCart,
  Store,
  TrendingUp,
  X,
} from 'lucide-react'
import { HAND_NAMES, handUpgradeCost } from '../../game/hands'
import {
  RARITY_BG,
  RARITY_BORDER,
  RARITY_LABEL,
  RARITY_TEXT,
} from '../jokers/rarityStyles'
import { MAX_JOKER_SLOTS, REROLL_COST, useRunStore } from '../../store/runStore'
import { Modal } from './Modal'

interface ShopModalProps {
  onClose: () => void
}

export function ShopModal({ onClose }: ShopModalProps) {
  const offers = useRunStore((s) => s.shopOffers)
  const coins = useRunStore((s) => s.coins)
  const jokers = useRunStore((s) => s.jokers)
  const buyJoker = useRunStore((s) => s.buyJoker)
  const rerollShop = useRunStore((s) => s.rerollShop)
  const upgradeOptions = useRunStore((s) => s.upgradeOptions)
  const handLevels = useRunStore((s) => s.handLevels)
  const upgradeHand = useRunStore((s) => s.upgradeHand)

  const slotsFull = jokers.length >= MAX_JOKER_SLOTS

  return (
    <Modal>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-lg font-bold">
          <Store className="h-5 w-5 text-sky-400" aria-hidden="true" />
          Shop
        </h3>
        <span className="flex items-center gap-1 text-sm font-bold text-amber-200">
          <Coins className="h-4 w-4" aria-hidden="true" />
          {coins}
        </span>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-300">
          Jokers ({jokers.length}/{MAX_JOKER_SLOTS})
        </h4>
        <button
          type="button"
          onClick={rerollShop}
          disabled={coins < REROLL_COST}
          className="flex items-center gap-1 rounded-md border border-[#1a5f94] bg-[#0b2a4a] px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Reroll ({REROLL_COST})
        </button>
      </div>
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {offers.length === 0 && (
          <p className="text-sm text-slate-500">No offers this time.</p>
        )}
        {offers.map((joker) => {
          const disabled = slotsFull || coins < joker.cost
          return (
            <div
              key={joker.id}
              className={`rounded-xl border bg-[#1e293b] p-3 ${RARITY_BORDER[joker.rarity]}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold">{joker.name}</div>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${RARITY_BG[joker.rarity]} ${RARITY_TEXT[joker.rarity]}`}
                >
                  {RARITY_LABEL[joker.rarity]}
                </span>
              </div>
              <div className="text-sm text-slate-400">{joker.description}</div>
              <button
                type="button"
                onClick={() => buyJoker(joker.id)}
                disabled={disabled}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#1f7a46] bg-[#0c4624] px-6 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Buy — {joker.cost} coins
              </button>
            </div>
          )
        })}
      </div>

      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
        <TrendingUp className="h-4 w-4 text-amber-400" aria-hidden="true" />
        Hand Upgrades
      </h4>
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {upgradeOptions.map((hand) => {
          const cost = handUpgradeCost(handLevels[hand])
          return (
            <div
              key={hand}
              className="rounded-xl border border-[#12466f] bg-[#1e293b] p-3"
            >
              <div className="font-bold">{HAND_NAMES[hand]}</div>
              <div className="text-sm text-slate-400">
                lv. {handLevels[hand]}
              </div>
              <button
                type="button"
                onClick={() => upgradeHand(hand)}
                disabled={coins < cost}
                className="mt-2 w-full rounded-lg border border-[#b98a14] bg-[#5a4306] px-6 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Upgrade — {cost} coins
              </button>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-1.5 rounded-lg border border-[#12466f] bg-[#0b2a4a] px-3 py-2 text-sm"
      >
        <X className="h-4 w-4" aria-hidden="true" />
        Close
      </button>
    </Modal>
  )
}
