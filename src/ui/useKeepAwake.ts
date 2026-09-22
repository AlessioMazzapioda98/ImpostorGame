import { useEffect } from 'react'

/**
 * Durante il giro il telefono resta sul tavolo mentre si parla: senza questo si
 * spegnerebbe lo schermo proprio nel mezzo della partita.
 */
export function useKeepAwake(attivo: boolean) {
  useEffect(() => {
    if (!attivo) return
    const lock = navigator as Navigator & {
      wakeLock?: { request: (tipo: 'screen') => Promise<{ release: () => Promise<void> }> }
    }
    if (!lock.wakeLock) return

    let sentinel: { release: () => Promise<void> } | null = null
    let annullato = false

    const chiedi = async () => {
      try {
        const nuovo = await lock.wakeLock!.request('screen')
        if (annullato) void nuovo.release()
        else sentinel = nuovo
      } catch {
        // Il browser può rifiutare: pazienza, lo schermo si spegnerà da solo.
      }
    }

    // Tornando sull'app dopo averla lasciata il blocco va richiesto di nuovo.
    const alRitorno = () => {
      if (document.visibilityState === 'visible') void chiedi()
    }

    void chiedi()
    document.addEventListener('visibilitychange', alRitorno)

    return () => {
      annullato = true
      document.removeEventListener('visibilitychange', alRitorno)
      void sentinel?.release().catch(() => {})
    }
  }, [attivo])
}
