import { isImpostor } from '../game/engine'
import type { GameState } from '../game/types'

interface Props {
  state: GameState
  onPlayAgain: () => void
  onNewGame: () => void
}

export function GameOverScreen({ state, onPlayAgain, onNewGame }: Props) {
  const impostorsWon = state.winner === 'impostors'

  return (
    <div className="stack-lg">
      <header className="stack center">
        <p className="outcome">{impostorsWon ? '🕵️' : '🎉'}</p>
        <h1>{impostorsWon ? 'Vincono gli impostori' : 'Vincono i giocatori'}</h1>
        {state.endReason && <p className="muted">{state.endReason}</p>}
      </header>

      <div className="secret">
        <p className="eyebrow">La parola era</p>
        <p className="secret-word">{state.entry.word}</p>
        <p className="muted" style={{ marginTop: 10 }}>
          Indizio degli impostori: {state.entry.clue}
        </p>
      </div>

      <div className="card stack">
        <p className="eyebrow">Come stavano le cose</p>
        {state.players.map((player) => {
          const impostor = isImpostor(state, player.id)
          const out = state.eliminatedIds.includes(player.id)
          const card = state.archetypesByPlayer[player.id]
          return (
            <div key={player.id} className="recap-row">
              <span className="name">
                {player.name}
                {card && (
                  <>
                    <br />
                    <span className="muted">
                      {card.classe.emoji} {card.classe.name}
                      {card.targetName ? ` (${card.targetName})` : ''} ·{' '}
                      {card.sottoclasse.emoji} {card.sottoclasse.name}
                    </span>
                  </>
                )}
              </span>
              {out && <span className="badge badge-out">eliminato</span>}
              <span className={impostor ? 'badge badge-impostor' : 'badge badge-crew'}>
                {impostor ? 'impostore' : 'innocente'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="stack">
        <button type="button" className="btn" onClick={onPlayAgain}>
          Un'altra partita, stessi giocatori
        </button>
        <button type="button" className="btn btn-secondary" onClick={onNewGame}>
          Cambia giocatori e impostazioni
        </button>
      </div>
    </div>
  )
}
