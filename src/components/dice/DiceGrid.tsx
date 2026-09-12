import { useRunStore } from '../../store/runStore'
import { DieButton } from './DieButton'

export function DiceGrid() {
  const dice = useRunStore((s) => s.dice)
  const toggleDie = useRunStore((s) => s.toggleDie)

  return (
    <section className="grid shrink-0 grid-cols-5 gap-1.5 sm:gap-2">
      {dice.map((die) => (
        <DieButton key={die.id} die={die} onToggle={toggleDie} />
      ))}
    </section>
  )
}
