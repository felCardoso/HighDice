import { useEffect, useRef, useState } from 'react'
import type { Die } from '../../game/types'
import { DicePips } from './DicePips'

interface DieButtonProps {
  die: Die
  onToggle: (id: number) => void
}

export function DieButton({ die, onToggle }: DieButtonProps) {
  const [isRolling, setIsRolling] = useState(false)
  const prevValue = useRef(die.value)

  useEffect(() => {
    if (prevValue.current !== die.value) {
      setIsRolling(true)
    }
    prevValue.current = die.value
  }, [die.value])

  return (
    <button
      type="button"
      onClick={() => onToggle(die.id)}
      onAnimationEnd={() => setIsRolling(false)}
      aria-pressed={die.selected}
      className={`flex flex-col items-center justify-center rounded-xl border-2 bg-[#1e293b] p-2 transition hover:-translate-y-0.5 sm:p-3 ${
        die.selected
          ? 'border-sky-400 shadow-[0_0_0_3px_rgba(56,189,248,0.2)]'
          : 'border-[#0b2a4a]'
      } ${isRolling ? 'animate-dice-roll' : ''}`}
    >
      <DicePips value={die.value} />
      <span className="mt-0.5 text-[10px] text-slate-400">{die.id + 1}</span>
    </button>
  )
}
