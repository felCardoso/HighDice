import { ScrollText } from 'lucide-react'
import { useRunStore } from '../../store/runStore'

export function EventLog() {
  const log = useRunStore((s) => s.log)

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <h2 className="mb-1 flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-300">
        <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
        Console Log
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-[#0b2a4a] bg-[#1e293b] p-2 font-mono text-xs">
        {log.map((entry) => (
          <div key={entry.id}>
            <span className="font-semibold">
              [{new Date(entry.timestamp).toLocaleTimeString()}]
            </span>{' '}
            {entry.message}
          </div>
        ))}
      </div>
    </section>
  )
}
