import type { ReactNode } from 'react'

interface Props {
  premuto: boolean
  tieniPremuto: boolean
  variante: 'parola' | 'impostore'
  inizia: () => void
  finisci: () => void
  children: ReactNode
}

/**
 * La carta segreta. Quando è chiusa il contenuto non viene proprio disegnato,
 * così nessuno può sbirciarlo di lato né ritrovarlo in uno screenshot: si vede
 * solo il dorso finché il dito resta appoggiato.
 */
export function SecretCard({ premuto, tieniPremuto, variante, inizia, finisci, children }: Props) {
  return (
    <button
      type="button"
      className={`carta carta-${variante}${premuto ? ' carta-aperta' : ''}`}
      aria-label={premuto ? 'Carta scoperta' : 'Tieni premuto per scoprire la tua carta'}
      onPointerDown={inizia}
      onPointerUp={finisci}
      onPointerCancel={finisci}
      onPointerLeave={finisci}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          inizia()
        }
      }}
      onKeyUp={(event) => {
        if (event.key === ' ' || event.key === 'Enter') finisci()
      }}
      onBlur={finisci}
    >
      {premuto ? (
        <div className="carta-contenuto">{children}</div>
      ) : (
        <div className="carta-dorso">
          <span className="carta-dorso-segno" aria-hidden="true">
            👁️
          </span>
          <span className="carta-dorso-testo">
            {tieniPremuto ? 'Tieni premuto' : 'Tocca per scoprire'}
          </span>
          <span className="carta-dorso-nota">Questa carta è solo tua</span>
        </div>
      )}
    </button>
  )
}
