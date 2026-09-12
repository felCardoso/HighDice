import { Play, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useRunStore } from '../../store/runStore'

export function Controls() {
  const play = useRunStore((s) => s.run.play)
  const reroll = useRunStore((s) => s.run.reroll)
  const status = useRunStore((s) => s.run.status)
  const playHand = useRunStore((s) => s.playHand)
  const rerollAction = useRunStore((s) => s.reroll)

  const [isRerolling, setIsRerolling] = useState(false)
  const gameOver = status !== 'playing'

  const handleReroll = () => {
    setIsRerolling(true)
    rerollAction()
  }

  return (
    <section className="grid shrink-0 grid-cols-2 gap-1.5">
      <button
        type="button"
        onClick={playHand}
        disabled={gameOver || play <= 0}
        className="flex flex-col items-center rounded-xl border border-[#1f7a46] bg-[#0c4624] py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex items-center gap-1.5">
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          Play Hand
        </span>
        <div className="mt-0.5 text-xl font-bold">{play}</div>
      </button>
      <button
        type="button"
        onClick={handleReroll}
        onAnimationEnd={() => setIsRerolling(false)}
        disabled={gameOver || reroll <= 0}
        className="flex flex-col items-center rounded-xl border border-[#1a5f94] bg-[#0b2a4a] py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex items-center gap-1.5">
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRerolling ? 'animate-dice-spin' : ''}`}
            aria-hidden="true"
          />
          Reroll
        </span>
        <div className="mt-0.5 text-xl font-bold">{reroll}</div>
      </button>
    </section>
  )
}
