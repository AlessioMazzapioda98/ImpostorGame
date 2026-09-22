/**
 * Preferenze di interfaccia, tenute separate dalle impostazioni di gioco: non
 * cambiano le regole, cambiano solo come si usa il telefono.
 */
export interface UiPrefs {
  /** Se vero la carta segreta si vede solo finché tieni premuto il dito. */
  tieniPremuto: boolean
  vibrazioni: boolean
  /** Secondi uguali per tutti con la carta in mano. 0 spegne il tempo fisso. */
  secondiCarta: number
}

export const SECONDI_CARTA_DEFAULT = 20

export const UI_PREFS_DEFAULT: UiPrefs = {
  tieniPremuto: true,
  vibrazioni: true,
  secondiCarta: SECONDI_CARTA_DEFAULT,
}

const CHIAVE = 'impostor-ui-v1'

export function caricaUiPrefs(): UiPrefs {
  try {
    const raw = localStorage.getItem(CHIAVE)
    if (!raw) return UI_PREFS_DEFAULT
    return { ...UI_PREFS_DEFAULT, ...(JSON.parse(raw) as Partial<UiPrefs>) }
  } catch {
    return UI_PREFS_DEFAULT
  }
}

export function salvaUiPrefs(prefs: UiPrefs) {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(prefs))
  } catch {
    // Niente spazio o modalità privata: si riparte dai valori normali.
  }
}
