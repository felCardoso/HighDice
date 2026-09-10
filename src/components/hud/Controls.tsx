import { useRunStore } from '../../store/runStore'

export function Controls() {
  const play = useRunStore((s) => s.run.play)
  const reroll = useRunStore((s) => s.run.reroll)
  const status = useRunStore((s) => s.run.status)
  const playHand = useRunStore((s) => s.playHand)
  const rerollAction = useRunStore((s) => s.reroll)

  const gameOver = status !== 'playing'

  return (
    <section className="mb-4 grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={playHand}
        disabled={gameOver || play <= 0}
        className="rounded-xl border border-[#1f7a46] bg-[#0c4624] py-5 text-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        Play Hand
        <div className="mt-2 text-3xl font-bold">{play}</div>
      </button>
      <button
        type="button"
        onClick={rerollAction}
        disabled={gameOver || reroll <= 0}
        className="rounded-xl border border-[#1a5f94] bg-[#0b2a4a] py-5 text-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        Reroll
        <div className="mt-2 text-3xl font-bold">{reroll}</div>
      </button>
    </section>
  )
}
