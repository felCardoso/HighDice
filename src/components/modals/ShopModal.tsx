import { MAX_JOKER_SLOTS, useRunStore } from '../../store/runStore'
import { Modal } from './Modal'

interface ShopModalProps {
  onClose: () => void
}

export function ShopModal({ onClose }: ShopModalProps) {
  const offers = useRunStore((s) => s.shopOffers)
  const coins = useRunStore((s) => s.coins)
  const jokers = useRunStore((s) => s.jokers)
  const buyJoker = useRunStore((s) => s.buyJoker)

  const slotsFull = jokers.length >= MAX_JOKER_SLOTS

  return (
    <Modal>
      <h3 className="mb-1 text-lg font-bold">Shop</h3>
      <p className="mb-2 text-sm text-slate-400">
        {coins} coins · {jokers.length}/{MAX_JOKER_SLOTS} joker slots
      </p>
      <div className="my-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {offers.length === 0 && (
          <p className="text-sm text-slate-500">No offers this time.</p>
        )}
        {offers.map((joker) => {
          const disabled = slotsFull || coins < joker.cost
          return (
            <div
              key={joker.id}
              className="rounded-xl border border-[#12466f] bg-[#1e293b] p-3"
            >
              <div className="font-bold">{joker.name}</div>
              <div className="text-sm text-slate-400">{joker.description}</div>
              <button
                type="button"
                onClick={() => buyJoker(joker.id)}
                disabled={disabled}
                className="mt-2 w-full rounded-lg border border-[#1f7a46] bg-[#0c4624] px-6 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Buy — {joker.cost} coins
              </button>
            </div>
          )
        })}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-[#12466f] bg-[#0b2a4a] px-3 py-2 text-sm"
      >
        Close
      </button>
    </Modal>
  )
}
