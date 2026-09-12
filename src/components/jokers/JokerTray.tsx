import { Sparkles } from 'lucide-react'
import { MAX_JOKER_SLOTS, useRunStore } from '../../store/runStore'

export function JokerTray() {
  const jokers = useRunStore((s) => s.jokers)

  return (
    <section className="flex shrink-0 items-center gap-1.5 overflow-x-auto rounded-lg border border-[#0b2a4a] bg-[#1e293b] px-2 py-1">
      <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
        <Sparkles className="h-3 w-3 text-amber-300" aria-hidden="true" />
        {jokers.length}/{MAX_JOKER_SLOTS}
      </span>
      {jokers.length === 0 ? (
        <p className="truncate text-xs text-slate-500">
          No jokers yet — buy some in the shop.
        </p>
      ) : (
        jokers.map((joker) => (
          <span
            key={joker.id}
            title={joker.description}
            className="flex shrink-0 cursor-help items-center gap-1 rounded-md border border-[#b98a14] bg-[#5a4306] px-1.5 py-0.5 text-xs font-semibold"
          >
            {joker.name}
          </span>
        ))
      )}
    </section>
  )
}
