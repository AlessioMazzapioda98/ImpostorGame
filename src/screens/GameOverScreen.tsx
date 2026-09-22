import { isImpostor } from '../game/engine'
import type { GameState } from '../game/types'
import { Avatar } from '../ui/Avatar'
import { Screen, ScreenActions, ScreenBody } from '../ui/Screen'
import { vibra } from '../ui/haptics'

interface Props {
  state: GameState
  onPlayAgain: () => void
  onNewGame: () => void
}

export function GameOverScreen({ state, onPlayAgain, onNewGame }: Props) {
  const vinconoImpostori = state.winner === 'impostors'

  return (
    <Screen>
      <ScreenBody>
        <header className={vinconoImpostori ? 'finale finale-impostori' : 'finale finale-innocenti'}>
          <p className="outcome">{vinconoImpostori ? '🕵️' : '🎉'}</p>
          <h1>{vinconoImpostori ? 'Vincono gli impostori' : 'Vincono i giocatori'}</h1>
          {state.endReason && <p className="muted">{state.endReason}</p>}
        </header>

        <div className="rivelazione-finale">
          <p className="eyebrow">La parola era</p>
          <p className="segreto-parola">{state.entry.word}</p>
          <p className="muted">Indizio degli impostori: {state.entry.clue}</p>
        </div>

        <div className="card stack">
          <p className="eyebrow">Come stavano le cose</p>
          {state.players.map((player) => {
            const impostore = isImpostor(state, player.id)
            const eliminato = state.eliminatedIds.includes(player.id)
            const archetipo = state.archetypeByPlayer[player.id]
            return (
              <div key={player.id} className="recap-row">
                <Avatar nome={player.name} dimensione="sm" spento={eliminato} />
                <span className="name">
                  {player.name}
                  {archetipo && (
                    <span className="recap-archetipo">
                      {archetipo.emoji} {archetipo.name}
                    </span>
                  )}
                </span>
                {eliminato && <span className="badge badge-out">eliminato</span>}
                <span className={impostore ? 'badge badge-impostor' : 'badge badge-crew'}>
                  {impostore ? 'impostore' : 'innocente'}
                </span>
              </div>
            )
          })}
        </div>
      </ScreenBody>

      <ScreenActions>
        <button
          type="button"
          className="btn"
          onClick={() => {
            vibra('conferma')
            onPlayAgain()
          }}
        >
          Un'altra partita, stessi giocatori
        </button>
        <button type="button" className="btn btn-secondary" onClick={onNewGame}>
          Cambia giocatori e impostazioni
        </button>
      </ScreenActions>
    </Screen>
  )
}
