import { Sparkles } from 'lucide-react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useRef, useState } from 'react'
import { SELL_REFUND_RATE } from '../../game/shop'
import { MAX_JOKER_SLOTS, useRunStore } from '../../store/runStore'
import { RARITY_BG, RARITY_BORDER } from './rarityStyles'

const HOLD_MS = 450
const DRAG_THRESHOLD_PX = 8

export function JokerTray() {
  const jokers = useRunStore((s) => s.jokers)
  const reorderJokers = useRunStore((s) => s.reorderJokers)
  const sellJoker = useRunStore((s) => s.sellJoker)

  const [order, setOrder] = useState<string[]>(() => jokers.map((j) => j.id))
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [sellId, setSellId] = useState<string | null>(null)

  const chipRefs = useRef(new Map<string, HTMLDivElement>())
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const holdTimer = useRef<number | undefined>(undefined)
  const dragStartedRef = useRef(false)
  const draggingIdRef = useRef<string | null>(null)

  const byId = new Map(jokers.map((j) => [j.id, j]))
  // While dragging, use the locally-reordered id list; otherwise mirror the store.
  const displayIds = draggingId ? order : jokers.map((j) => j.id)

  const clearHoldTimer = () => {
    if (holdTimer.current !== undefined) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = undefined
    }
  }

  const handlePointerDown = (
    e: ReactPointerEvent<HTMLDivElement>,
    jokerId: string,
  ) => {
    if (sellId === jokerId) {
      setSellId(null)
      return
    }
    if (sellId) setSellId(null)

    e.currentTarget.setPointerCapture(e.pointerId)
    pointerStart.current = { x: e.clientX, y: e.clientY }
    dragStartedRef.current = false
    draggingIdRef.current = null
    clearHoldTimer()
    holdTimer.current = window.setTimeout(() => {
      setSellId(jokerId)
    }, HOLD_MS)
  }

  const handlePointerMove = (
    e: ReactPointerEvent<HTMLDivElement>,
    jokerId: string,
  ) => {
    if (!pointerStart.current) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y

    if (!dragStartedRef.current && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      dragStartedRef.current = true
      draggingIdRef.current = jokerId
      clearHoldTimer()
      setSellId(null)
      setOrder(jokers.map((j) => j.id))
      setDraggingId(jokerId)
    }

    if (dragStartedRef.current && draggingIdRef.current) {
      let targetId: string | null = null
      let bestDist = Infinity
      for (const [id, el] of chipRefs.current) {
        if (id === draggingIdRef.current) continue
        const rect = el.getBoundingClientRect()
        const center = rect.left + rect.width / 2
        const dist = Math.abs(e.clientX - center)
        if (dist < bestDist) {
          bestDist = dist
          targetId = id
        }
      }
      if (targetId) {
        const draggedId = draggingIdRef.current
        setOrder((prev) => {
          const from = prev.indexOf(draggedId)
          const to = prev.indexOf(targetId!)
          if (from === -1 || to === -1 || from === to) return prev
          const next = [...prev]
          next.splice(from, 1)
          next.splice(to, 0, draggedId)
          return next
        })
      }
    }
  }

  const handlePointerUp = () => {
    clearHoldTimer()
    if (dragStartedRef.current && draggingIdRef.current) {
      reorderJokers(order)
    }
    setDraggingId(null)
    draggingIdRef.current = null
    pointerStart.current = null
    dragStartedRef.current = false
  }

  return (
    <section className="flex shrink-0 items-center gap-1.5 overflow-x-auto rounded-lg border border-[#0b2a4a] bg-[#1e293b] px-2 py-1">
      <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
        <Sparkles className="h-3 w-3 text-amber-300" aria-hidden="true" />
        {jokers.length}/{MAX_JOKER_SLOTS}
      </span>
      {jokers.length === 0 && (
        <p className="truncate text-xs text-slate-500">
          No jokers yet — buy some in the shop.
        </p>
      )}
      {displayIds.map((id) => {
        const joker = byId.get(id)
        if (!joker) return null
        const isSelling = sellId === joker.id
        const refund = Math.floor(joker.cost * SELL_REFUND_RATE)

        return (
          <div
            key={joker.id}
            ref={(el) => {
              if (el) chipRefs.current.set(joker.id, el)
              else chipRefs.current.delete(joker.id)
            }}
            onPointerDown={(e) => handlePointerDown(e, joker.id)}
            onPointerMove={(e) => handlePointerMove(e, joker.id)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            title={joker.description}
            className={`flex shrink-0 touch-none select-none items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-semibold ${RARITY_BORDER[joker.rarity]} ${RARITY_BG[joker.rarity]} ${draggingId === joker.id ? 'cursor-grabbing opacity-60' : 'cursor-grab'}`}
          >
            {isSelling ? (
              <span className="flex items-center gap-1">
                <span className="text-[10px] font-normal">
                  Sell for {refund}?
                </span>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    sellJoker(joker.id)
                    setSellId(null)
                  }}
                  className="rounded bg-red-700 px-1.5 py-0.5 text-[10px]"
                >
                  Sell
                </button>
              </span>
            ) : (
              <>
                {joker.name}
                {joker.evolution && (
                  <span className="text-[9px] font-normal text-slate-300">
                    Lv.{joker.level} ({joker.progress}/{joker.evolution.every})
                  </span>
                )}
              </>
            )}
          </div>
        )
      })}
    </section>
  )
}
