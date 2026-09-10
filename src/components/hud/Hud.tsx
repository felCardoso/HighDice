import { Coins, Gem, Star, Trophy, type LucideIcon } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { useRunStore } from '../../store/runStore'

export function Hud() {
  const run = useRunStore((s) => s.run)
  const coins = useRunStore((s) => s.coins)
  const score = usePlayerStore((s) => s.score)
  const highScore = usePlayerStore((s) => s.highScore)

  const items: { label: string; value: string; icon: LucideIcon }[] = [
    {
      label: 'Level',
      value: `${String(run.level).padStart(2, '0')} / ${run.maxLevel}`,
      icon: Star,
    },
    { label: 'Stake', value: run.stake.toLocaleString(), icon: Gem },
    { label: 'Score', value: score.toLocaleString(), icon: Trophy },
    {
      label: 'High Score',
      value: highScore.toLocaleString(),
      icon: Trophy,
    },
  ]

  return (
    <section className="mb-4">
      <div className="mb-3 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border-2 border-[#0b2a4a] bg-[#1e293b] p-3 text-center"
          >
            <div className="mb-1 flex items-center justify-center gap-1 text-xs text-slate-400">
              <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {item.label}
            </div>
            <div className="text-xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl border-2 border-[#b98a14] bg-[#3a2c05] px-3 py-2">
        <span className="flex items-center gap-1.5 text-sm text-amber-200">
          <Coins className="h-4 w-4" aria-hidden="true" />
          Coins
        </span>
        <span className="text-lg font-bold text-amber-100">{coins}</span>
      </div>
    </section>
  )
}
