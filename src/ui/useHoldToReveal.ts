import { useCallback, useEffect, useRef, useState } from 'react'
import { vibra } from './haptics'

/** Quanto bisogna tenere premuto perché un tocco per sbaglio non scopra la carta. */
const ATTESA_MS = 260

/**
 * Tenere premuto per vedere il segreto. Appena si stacca il dito la carta si
 * richiude da sola: è il modo più sicuro di leggere qualcosa mentre quattro
 * amici ti guardano, perché non resta niente sullo schermo se posi il telefono.
 */
export function useHoldToReveal(abilitato: boolean) {
  const [premuto, setPremuto] = useState(false)
  const [giaVisto, setGiaVisto] = useState(false)
  const timer = useRef<number | null>(null)

  const annullaTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  const inizia = useCallback(() => {
    if (premuto || timer.current !== null) return
    if (!abilitato) {
      // Senza tenere premuto la carta si apre e si chiude a tocchi alterni.
      setPremuto((valore) => !valore)
      setGiaVisto(true)
      vibra('rivelazione')
      return
    }
    timer.current = window.setTimeout(() => {
      timer.current = null
      setPremuto(true)
      setGiaVisto(true)
      vibra('rivelazione')
    }, ATTESA_MS)
  }, [abilitato, premuto])

  const finisci = useCallback(() => {
    annullaTimer()
    if (abilitato) setPremuto(false)
  }, [abilitato])

  /** Serve per richiudere la carta prima di passare il telefono al prossimo. */
  const chiudi = useCallback(() => {
    annullaTimer()
    setPremuto(false)
    setGiaVisto(false)
  }, [])

  useEffect(() => annullaTimer, [])

  return { premuto, giaVisto, inizia, finisci, chiudi }
}
