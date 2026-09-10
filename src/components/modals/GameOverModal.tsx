import { RotateCcw, Skull } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { useRunStore } from '../../store/runStore'
import { Modal } from './Modal'

interface GameOverModalProps {
  onRestart: () => void
}

export function GameOverModal({ onRestart }: GameOverModalProps) {
  const level = useRunStore((s) => s.run.level)
  const score = usePlayerStore((s) => s.score)
  const highScore = usePlayerStore((s) => s.highScore)

  return (
    <Modal>
      <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
        <Skull className="h-6 w-6 text-red-400" aria-hidden="true" />
        Game Over
      </h2>
      <p className="mb-4 text-center leading-relaxed">
        Lost at level {level}!
        <br />
        <br />
        Run Score: {score.toLocaleString()}
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
