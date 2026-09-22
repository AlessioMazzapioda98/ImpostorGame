import { alivePlayers, playerById } from '../game/engine'
import type { GameState } from '../game/types'

interface Props {
  state: GameState
  onVote: () => void
}

export function RoundScreen({ state, onVote }: Props) {
  const out = state.players.filter((player) => state.eliminatedIds.includes(player.id))

  return (
    <div className="stack-lg">
      <header className="stack">
        <p className="eyebrow">Giro {state.round}</p>
        <h1>A turno, una parola sola</h1>
        <p className="muted">
          Seguite quest'ordine. Ognuno dice una parola collegata alla parola segreta, rispettando il
          proprio archetipo. Chi ripete una parola già detta perde il turno.
        </p>
      </header>

      <div className="turn-list">
        {state.turnOrder.map((playerId, index) => (
          <div key={playerId} className="turn-item">
            <span className="turn-number">{index + 1}</span>
            <span>{playerById(state, playerId)?.name}</span>
          </div>
        ))}
      </div>

      {out.length > 0 && (
        <div className="card stack">
          <p className="eyebrow">Fuori dal gioco</p>
          <p className="muted">{out.map((player) => player.name).join(', ')}</p>
        </div>
      )}

      <button type="button" className="btn" onClick={onVote}>
        Finito il giro, si vota
      </button>
      <p className="muted center">
        In gioco: {alivePlayers(state).length} giocatori
      </p>
    </div>
  )
}
