import { useEffect, useRef, useState } from 'react'
import { Controls } from './components/hud/Controls'
import { DiceGrid } from './components/dice/DiceGrid'
import { EventLog } from './components/log/EventLog'
import { GameOverModal } from './components/modals/GameOverModal'
import { Hud } from './components/hud/Hud'
import { JokerTray } from './components/jokers/JokerTray'
import { ShopModal } from './components/modals/ShopModal'
import { UpgradeModal } from './components/modals/UpgradeModal'
import { WinModal } from './components/modals/WinModal'
import { usePlayerStore } from './store/playerStore'
import { useRunStore } from './store/runStore'

type PostLevelUpStep = 'none' | 'shop' | 'upgrade'

function App() {
  const status = useRunStore((s) => s.run.status)
  const upgradesAvailable = useRunStore((s) => s.run.upgradesAvailable)
  const resetRun = useRunStore((s) => s.resetRun)
  const abbreviation = usePlayerStore((s) => s.abbreviation)

  const [postLevelUpStep, setPostLevelUpStep] =
    useState<PostLevelUpStep>('none')
  const prevUpgradesAvailable = useRef(upgradesAvailable)

  useEffect(() => {
    if (upgradesAvailable > prevUpgradesAvailable.current) {
      setPostLevelUpStep('shop')
    }
    prevUpgradesAvailable.current = upgradesAvailable
  }, [upgradesAvailable])

  useEffect(() => {
    if (status !== 'playing') setPostLevelUpStep('none')
  }, [status])

  const handleRestart = () => {
    setPostLevelUpStep('none')
    resetRun()
  }

  return (
    <div className="min-h-dvh bg-[#0f172a] text-slate-100">
      <header className="flex items-center justify-between border-b border-[#0b2a4a] bg-[#0b1220] px-5 py-4">
        <h1 className="text-lg font-bold">High Dice</h1>
        <span className="rounded bg-sky-400 px-1.5 py-0.5 text-xs font-bold text-[#082f49]">
          {abbreviation}
        </span>
      </header>

      <main className="mx-auto max-w-[980px] px-4 py-6">
        <Hud />
        <JokerTray />
        <DiceGrid />
        <Controls />
        <EventLog />
        <button
          type="button"
          onClick={handleRestart}
          className="w-full rounded-xl border border-[#b31e1e] bg-[#5f0b0b] py-2 text-sm"
        >
          Reset Game
        </button>
      </main>

      {postLevelUpStep === 'shop' && status === 'playing' && (
        <ShopModal onClose={() => setPostLevelUpStep('upgrade')} />
      )}
      {postLevelUpStep === 'upgrade' && status === 'playing' && (
        <UpgradeModal onClose={() => setPostLevelUpStep('none')} />
      )}
      {status === 'gameover' && <GameOverModal onRestart={handleRestart} />}
      {status === 'won' && <WinModal onRestart={handleRestart} />}
    </div>
  )
}

export default App
