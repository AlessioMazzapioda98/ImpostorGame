/**
 * Preferenze di interfaccia, tenute separate dalle impostazioni di gioco: non
 * cambiano le regole, cambiano solo come si usa il telefono. Il tempo della carta
 * non sta qui: cambia quale informazione trapela dal tavolo, quindi è una regola
 * e vive in `Settings.revealSeconds`.
 */
export interface UiPrefs {
  /** Se vero la carta segreta si vede solo finché tieni premuto il dito. */
  tieniPremuto: boolean
  vibrazioni: boolean
}

export const UI_PREFS_DEFAULT: UiPrefs = {
  tieniPremuto: true,
  vibrazioni: true,
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
