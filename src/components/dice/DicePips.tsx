import type { DieValue } from '../../game/types'

// 3x3 grid, row-major indices 0-8. Standard six-sided die pip layouts.
const PIP_POSITIONS: Record<DieValue, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

interface DicePipsProps {
  value: DieValue
}

export function DicePips({ value }: DicePipsProps) {
  const filled = new Set(PIP_POSITIONS[value])

  return (
    <div
      className="grid aspect-square w-10 grid-cols-3 grid-rows-3 gap-1 sm:w-12"
      role="img"
      aria-label={`Die showing ${value}`}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={`rounded-full ${filled.has(i) ? 'bg-slate-100' : 'bg-transparent'}`}
        />
      ))}
    </div>
  )
}
