import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const HOUR_MS = 60 * 60 * 1000

export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // The game is a long-lived single page — poll for a new build periodically.
      setInterval(() => void registration.update(), HOUR_MS)
    },
  })

  const dismiss = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-[#12466f] bg-[#0b1220] p-3 shadow-lg">
      <p className="text-sm">
        {needRefresh
          ? 'A new version is available.'
          : 'High Dice is ready to work offline.'}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        {needRefresh && (
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="flex items-center gap-1 rounded-lg border border-[#1a5f94] bg-[#0b2a4a] px-2 py-1 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Reload
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="rounded-lg border border-[#12466f] bg-[#0b2a4a] p-1.5"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
