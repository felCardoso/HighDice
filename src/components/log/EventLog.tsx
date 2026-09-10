import { ScrollText } from 'lucide-react'
import { useRunStore } from '../../store/runStore'

export function EventLog() {
  const log = useRunStore((s) => s.log)

  return (
    <section className="mb-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
        <ScrollText className="h-4 w-4" aria-hidden="true" />
        Console Log
      </h2>
      <div className="max-h-[150px] min-h-[120px] overflow-y-auto rounded-xl border border-[#0b2a4a] bg-[#1e293b] p-3 font-mono text-sm">
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
