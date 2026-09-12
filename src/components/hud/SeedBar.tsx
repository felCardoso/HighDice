import { Check, Copy, Hash, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { useRunStore } from '../../store/runStore'

interface SeedBarProps {
  onStartWithSeed: (seed: string) => void
}

export function SeedBar({ onStartWithSeed }: SeedBarProps) {
  const seed = useRunStore((s) => s.seed)
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const copySeed = async () => {
    try {
      await navigator.clipboard.writeText(seed)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied — nothing we can do, the seed is still shown.
    }
  }

  const startWithSeed = () => {
    if (!input.trim()) return
    onStartWithSeed(input.trim())
    setInput('')
    setExpanded(false)
  }

  return (
    <section className="shrink-0 rounded-lg border border-[#0b2a4a] bg-[#1e293b] px-2 py-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-xs">
          <Hash
            className="h-3 w-3 shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <span className="truncate font-mono">{seed}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={copySeed}
            aria-label="Copy seed"
            className="rounded-md border border-[#12466f] bg-[#0b2a4a] p-1"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label="Start a run from a seed"
            className="rounded-md border border-[#1a5f94] bg-[#0b2a4a] p-1"
          >
            <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-1 flex gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Replay a seed…"
            className="min-w-0 flex-1 rounded-md border border-[#12466f] bg-[#0b1220] px-2 py-1 text-xs text-slate-100 placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={startWithSeed}
            disabled={!input.trim()}
            className="shrink-0 rounded-md border border-[#1a5f94] bg-[#0b2a4a] px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            Go
          </button>
        </div>
      )}
    </section>
  )
}
