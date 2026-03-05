'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

const SwRegister = (): null => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const register = async (): Promise<void> => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')

        // Notify user when a new SW version is available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.info('עדכון זמין — רענן את הדף כדי להחיל', {
                duration: 10000,
                action: { label: 'רענן', onClick: () => window.location.reload() },
              })
            }
          })
        })
      } catch {
        // SW registration failure is non-fatal (dev mode, unsupported browser)
      }
    }

    void register()

    // Toast when connection is restored
    const handleOnline = (): void => {
      toast.success('החיבור חזר — הנתונים יסונכרנו')
    }
    const handleOffline = (): void => {
      toast.warning('אתה במצב לא מקוון — הנתונים נשמרים מקומית')
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return null
}

export default SwRegister
