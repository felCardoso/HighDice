import { useState } from 'react'
import { useRunStore } from '../../store/runStore'

interface SeedBarProps {
  onStartWithSeed: (seed: string) => void
}

export function SeedBar({ onStartWithSeed }: SeedBarProps) {
  const seed = useRunStore((s) => s.seed)
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
  }

  return (
    <section className="mb-4 rounded-xl border border-[#0b2a4a] bg-[#1e293b] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-slate-400">Seed</div>
          <div className="truncate font-mono text-sm">{seed}</div>
        </div>
        <button
          type="button"
          onClick={copySeed}
          className="shrink-0 rounded-lg border border-[#12466f] bg-[#0b2a4a] px-3 py-1.5 text-xs"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Replay a seed…"
          className="min-w-0 flex-1 rounded-lg border border-[#12466f] bg-[#0b1220] px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={startWithSeed}
          disabled={!input.trim()}
          className="shrink-0 rounded-lg border border-[#1a5f94] bg-[#0b2a4a] px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
        >
          New Run
        </button>
      </div>
    </section>
  )
}
