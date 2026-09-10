import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => setDeferredPrompt(null)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (!deferredPrompt || dismissed) return null

  const install = async () => {
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-[#1a5f94] bg-[#0b2a4a] px-3 py-2">
      <span className="text-sm">Install High Dice for offline play.</span>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={install}
          className="flex items-center gap-1 rounded-lg border border-[#12466f] bg-[#1e293b] px-2 py-1 text-xs"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Install
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install prompt"
          className="rounded-lg border border-[#12466f] bg-[#1e293b] p-1.5"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
