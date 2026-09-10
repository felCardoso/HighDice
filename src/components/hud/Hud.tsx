import { usePlayerStore } from '../../store/playerStore'
import { useRunStore } from '../../store/runStore'

export function Hud() {
  const run = useRunStore((s) => s.run)
  const coins = useRunStore((s) => s.coins)
  const score = usePlayerStore((s) => s.score)
  const highScore = usePlayerStore((s) => s.highScore)

  const items = [
    {
      label: 'Level',
      value: `${String(run.level).padStart(2, '0')} / ${run.maxLevel}`,
    },
    { label: 'Stake', value: run.stake.toLocaleString() },
    { label: 'Score', value: score.toLocaleString() },
    { label: 'High Score', value: highScore.toLocaleString() },
  ]

  return (
    <section className="mb-4">
      <div className="mb-3 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border-2 border-[#0b2a4a] bg-[#1e293b] p-3 text-center"
          >
            <div className="text-xs text-slate-400">{item.label}</div>
            <div className="text-xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl border-2 border-[#b98a14] bg-[#3a2c05] px-3 py-2">
        <span className="text-sm text-amber-200">Coins</span>
        <span className="text-lg font-bold text-amber-100">{coins}</span>
      </div>
    </section>
  )
}
