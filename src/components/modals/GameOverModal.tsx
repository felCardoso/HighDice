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
      <h2 className="mb-3 text-xl font-bold">Game Over</h2>
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
        className="w-full rounded-lg border border-[#1a5f94] bg-[#0b2a4a] px-6 py-3 text-lg"
      >
        Restart
      </button>
    </Modal>
  )
}
