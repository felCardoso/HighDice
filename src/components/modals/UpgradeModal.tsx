import { HAND_NAMES } from '../../game/hands'
import { useRunStore } from '../../store/runStore'
import { Modal } from './Modal'

interface UpgradeModalProps {
  onClose: () => void
}

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const options = useRunStore((s) => s.upgradeOptions)
  const handLevels = useRunStore((s) => s.handLevels)
  const upgradesAvailable = useRunStore((s) => s.run.upgradesAvailable)
  const upgradeHand = useRunStore((s) => s.upgradeHand)

  return (
    <Modal>
      <h3 className="mb-1 text-lg font-bold">Hand Upgrade</h3>
      <p className="mb-2 text-sm text-slate-400">
        {upgradesAvailable} upgrade{upgradesAvailable === 1 ? '' : 's'}{' '}
        available
      </p>
      <div className="my-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((hand) => (
          <div
            key={hand}
            className="rounded-xl border border-[#12466f] bg-[#1e293b] p-3"
          >
            <div className="font-bold">{HAND_NAMES[hand]}</div>
            <div className="text-sm text-slate-400">lv. {handLevels[hand]}</div>
            <button
              type="button"
              onClick={() => upgradeHand(hand)}
              disabled={upgradesAvailable <= 0}
              className="mt-2 w-full rounded-lg border border-[#b98a14] bg-[#5a4306] px-6 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Upgrade
            </button>
          </div>
        ))}
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
