import type { Die } from '../../game/types'

interface DieButtonProps {
  die: Die
  onToggle: (id: number) => void
}

export function DieButton({ die, onToggle }: DieButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(die.id)}
      aria-pressed={die.selected}
      className={`flex flex-col items-center justify-center rounded-xl border-2 bg-[#1e293b] p-4 transition hover:-translate-y-0.5 sm:p-5 ${
        die.selected
          ? 'border-sky-400 shadow-[0_0_0_3px_rgba(56,189,248,0.2)]'
          : 'border-[#0b2a4a]'
      }`}
    >
      <span className="text-2xl font-extrabold sm:text-[28px]">
        {die.value}
      </span>
      <span className="mt-1 text-xs text-slate-400">{die.id + 1}</span>
    </button>
  )
}
