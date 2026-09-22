import { useEffect, useState } from 'react'

/**
 * Conto alla rovescia a tempo reale. Serve a dare a tutti lo stesso tempo con
 * la carta in mano: quanto ci metti a leggere è un indizio, e chi non ha la
 * parola tende a restare lì un secondo di troppo.
 */
export function useCountdown(attivo: boolean, durataMs: number) {
  const [rimastiMs, setRimastiMs] = useState(durataMs)

  useEffect(() => {
    if (!attivo || durataMs <= 0) {
      setRimastiMs(durataMs)
      return
    }
    const fine = Date.now() + durataMs
    setRimastiMs(durataMs)
    // Si guarda l'orologio invece di contare i tick: se il telefono rallenta o
    // l'app va in background il tempo resta quello vero.
    const id = window.setInterval(() => {
      const rimasti = Math.max(0, fine - Date.now())
      setRimastiMs(rimasti)
      if (rimasti === 0) window.clearInterval(id)
    }, 100)
    return () => window.clearInterval(id)
  }, [attivo, durataMs])

  return rimastiMs
}
