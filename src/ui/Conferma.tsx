interface Props {
  titolo: string
  testo: string
  conferma: string
  annulla: string
  onConferma: () => void
  onAnnulla: () => void
}

/** Una domanda secca prima di buttare via una partita in corso. */
export function Conferma({ titolo, testo, conferma, annulla, onConferma, onAnnulla }: Props) {
  return (
    <div className="velo" role="dialog" aria-modal="true" aria-label={titolo}>
      <div className="foglio stack">
        <h2>{titolo}</h2>
        <p className="muted">{testo}</p>
        <button type="button" className="btn btn-danger" onClick={onConferma}>
          {conferma}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onAnnulla}>
          {annulla}
        </button>
      </div>
    </div>
  )
}
