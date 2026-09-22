/**
 * Piccole vibrazioni per dare peso ai momenti importanti: il telefono passa di
 * mano in mano, e un colpetto conferma che il tocco è andato a segno anche a chi
 * sta guardando gli amici invece dello schermo.
 */
export type Vibrazione = 'tocco' | 'conferma' | 'rivelazione' | 'colpo'

const SCHEMI: Record<Vibrazione, number | number[]> = {
  tocco: 8,
  conferma: 18,
  rivelazione: [0, 14, 60, 22],
  colpo: [0, 30, 70, 30, 70, 60],
}

let attive = true

/** Le vibrazioni si possono spegnere dalle impostazioni. */
export function impostaVibrazioni(valore: boolean) {
  attive = valore
}

export function vibra(tipo: Vibrazione) {
  if (!attive) return
  try {
    navigator.vibrate?.(SCHEMI[tipo])
  } catch {
    // Su desktop e su iOS non esiste: non è un problema, è solo un extra.
  }
}
