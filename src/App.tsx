import { Dices, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controls } from './components/hud/Controls'
import { DiceGrid } from './components/dice/DiceGrid'
import { EventLog } from './components/log/EventLog'
import { GameOverModal } from './components/modals/GameOverModal'
import { Hud } from './components/hud/Hud'
import { JokerTray } from './components/jokers/JokerTray'
import { InstallPrompt } from './components/pwa/InstallPrompt'
import { UpdateToast } from './components/pwa/UpdateToast'
import { SeedBar } from './components/hud/SeedBar'
import { ShopModal } from './components/modals/ShopModal'
import { WinModal } from './components/modals/WinModal'
import { usePlayerStore } from './store/playerStore'
import { useRunStore } from './store/runStore'

function App() {
  const status = useRunStore((s) => s.run.status)
  const level = useRunStore((s) => s.run.level)
  const resetRun = useRunStore((s) => s.resetRun)
  const abbreviation = usePlayerStore((s) => s.abbreviation)

  const [shopOpen, setShopOpen] = useState(false)
  const prevLevel = useRef(level)

  useEffect(() => {
    if (level > prevLevel.current && status === 'playing') {
      setShopOpen(true)
    }
    prevLevel.current = level
  }, [level, status])

  useEffect(() => {
    if (status !== 'playing') setShopOpen(false)
  }, [status])

  const handleRestart = () => {
    setShopOpen(false)
    resetRun()
  }

  const handleStartWithSeed = (seed: string) => {
    setShopOpen(false)
    resetRun(seed)
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#0f172a] text-slate-100">
      <header className="flex shrink-0 items-center justify-between border-b border-[#0b2a4a] bg-[#0b1220] px-3 py-1.5 pt-[max(6px,env(safe-area-inset-top))]">
        <h1 className="flex items-center gap-1.5 text-sm font-bold">
          <Dices className="h-4 w-4 text-sky-400" aria-hidden="true" />
          High Dice
        </h1>
        <span className="rounded bg-sky-400 px-1.5 py-0.5 text-[10px] font-bold text-[#082f49]">
          {abbreviation}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-[980px] flex-1 flex-col gap-1.5 overflow-hidden px-2.5 py-1.5">
        <InstallPrompt />
        <Hud />
        <SeedBar onStartWithSeed={handleStartWithSeed} />
        <JokerTray />
        <DiceGrid />
        <Controls />
        <EventLog />
        <button
          type="button"
          onClick={handleRestart}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#b31e1e] bg-[#5f0b0b] py-1.5 pb-[max(6px,env(safe-area-inset-bottom))] text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset Game
        </button>
      </main>

      {shopOpen && status === 'playing' && (
        <ShopModal onClose={() => setShopOpen(false)} />
      )}
      {status === 'gameover' && <GameOverModal onRestart={handleRestart} />}
      {status === 'won' && <WinModal onRestart={handleRestart} />}

      <UpdateToast />
    </div>
  )
}

export default App
