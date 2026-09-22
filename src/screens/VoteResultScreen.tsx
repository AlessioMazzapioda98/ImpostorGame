import { isImpostor, playerById } from '../game/engine'
import type { GameState } from '../game/types'

interface Props {
  state: GameState
  onContinue: () => void
}

export function VoteResultScreen({ state, onContinue }: Props) {
  const outcome = state.lastVote
  if (!outcome) return null

  const eliminated = outcome.eliminatedId ? playerById(state, outcome.eliminatedId) : null
  const wasImpostor = outcome.eliminatedId ? isImpostor(state, outcome.eliminatedId) : false
  const ranking = state.players
    .filter((player) => outcome.tally[player.id])
    .sort((a, b) => outcome.tally[b.id] - outcome.tally[a.id])

  return (
    <div className="stack-lg">
      <header className="stack center">
        <p className="outcome">{outcome.tie ? '🤷' : wasImpostor ? '🎯' : '😬'}</p>
        {outcome.tie ? (
          <>
            <h1>Pareggio</h1>
            <p className="muted">Nessuno viene eliminato, si va avanti con un altro giro.</p>
          </>
        ) : (
          <>
            <h1>{eliminated?.name} è fuori</h1>
            <p className="muted">
              {wasImpostor
                ? 'Era davvero un impostore. Ora può tentare di indovinare la parola.'
                : 'Non era un impostore. Gli impostori sono ancora in gioco.'}
            </p>
          </>
        )}
      </header>

      <div className="card stack">
        <p className="eyebrow">I voti</p>
        {ranking.map((player) => (
          <div key={player.id} className="recap-row">
            <span className="name">{player.name}</span>
            <span className="tally">
              {outcome.tally[player.id]} {outcome.tally[player.id] === 1 ? 'voto' : 'voti'}
            </span>
          </div>
        ))}
      </div>

      <button type="button" className="btn" onClick={onContinue}>
        {wasImpostor ? 'Tenta di indovinare' : 'Avanti'}
      </button>
    </div>
  )
}
