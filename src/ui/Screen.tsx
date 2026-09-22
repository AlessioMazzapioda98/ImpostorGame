import type { ReactNode } from 'react'

/**
 * Tutte le schermate hanno la stessa forma: il contenuto scorre, i pulsanti
 * restano incollati in basso, dove arriva il pollice di chi tiene il telefono.
 */
export function Screen({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return <div className={center ? 'screen screen-center' : 'screen'}>{children}</div>
}

export function ScreenBody({ children }: { children: ReactNode }) {
  return <div className="screen-body">{children}</div>
}

export function ScreenActions({ children }: { children: ReactNode }) {
  return <div className="screen-actions">{children}</div>
}
