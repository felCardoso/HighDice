import { useRunStore } from '../../store/runStore'
import { DieButton } from './DieButton'

export function DiceGrid() {
  const dice = useRunStore((s) => s.dice)
  const toggleDie = useRunStore((s) => s.toggleDie)

  return (
    <section className="mb-4 grid grid-cols-5 gap-2 sm:gap-3">
      {dice.map((die) => (
        <DieButton key={die.id} die={die} onToggle={toggleDie} />
      ))}
    </section>
  )
}
