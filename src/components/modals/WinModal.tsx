import { PartyPopper, RotateCcw } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { Modal } from './Modal'

interface WinModalProps {
  onRestart: () => void
}

export function WinModal({ onRestart }: WinModalProps) {
  const score = usePlayerStore((s) => s.score)
  const highScore = usePlayerStore((s) => s.highScore)

  return (
    <Modal>
      <h2 className="mb-3 flex items-center justify-center gap-2 text-xl font-bold">
        <PartyPopper className="h-6 w-6 text-amber-300" aria-hidden="true" />
        You Win!
      </h2>
      <p className="mb-4 text-center leading-relaxed">
        Congratulations!
        <br />
        Final Score: {score.toLocaleString()}
        <br />
        High Score: {highScore.toLocaleString()}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1a5f94] bg-[#0b2a4a] px-6 py-3 text-lg"
      >
        <RotateCcw className="h-5 w-5" aria-hidden="true" />
        Restart
      </button>
    </Modal>
  )
}
