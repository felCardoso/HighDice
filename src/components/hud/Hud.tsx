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
      label: 'Lvl',
      value: `${String(run.level).padStart(2, '0')}/${run.maxLevel}`,
      icon: Star,
    },
    { label: 'Stake', value: run.stake.toLocaleString(), icon: Gem },
    { label: 'Score', value: score.toLocaleString(), icon: Trophy },
    { label: 'Best', value: highScore.toLocaleString(), icon: Trophy },
    { label: 'Coins', value: coins.toLocaleString(), icon: Coins },
  ]

  return (
    <section className="grid shrink-0 grid-cols-5 gap-1">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-[#0b2a4a] bg-[#1e293b] px-1 py-1 text-center"
        >
          <div className="flex items-center justify-center gap-0.5 text-[9px] leading-none text-slate-400">
            <item.icon className="h-2.5 w-2.5" aria-hidden="true" />
            {item.label}
          </div>
          <div className="truncate text-xs font-bold leading-tight sm:text-sm">
            {item.value}
          </div>
        </div>
      ))}
    </section>
  )
}
