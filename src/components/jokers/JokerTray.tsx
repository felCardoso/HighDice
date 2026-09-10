import { Sparkles } from 'lucide-react'
import { MAX_JOKER_SLOTS, useRunStore } from '../../store/runStore'

export function JokerTray() {
  const jokers = useRunStore((s) => s.jokers)

  return (
    <section className="mb-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
        <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
        Jokers ({jokers.length}/{MAX_JOKER_SLOTS})
      </h2>
      <div className="flex min-h-[52px] flex-wrap gap-2 rounded-xl border border-[#0b2a4a] bg-[#1e293b] p-3">
        {jokers.length === 0 && (
          <p className="text-sm text-slate-500">
            No jokers yet — buy some in the shop after leveling up.
          </p>
        )}
        {jokers.map((joker) => (
          <span
            key={joker.id}
            title={joker.description}
            className="flex cursor-help items-center gap-1.5 rounded-lg border border-[#b98a14] bg-[#5a4306] px-2 py-1 text-sm font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {joker.name}
          </span>
        ))}
      </div>
    </section>
  )
}
