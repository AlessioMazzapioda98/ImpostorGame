import { useEffect, useState } from 'react'
import { alivePlayers, playerById } from '../game/engine'
import type { GameState } from '../game/types'
import { Avatar } from '../ui/Avatar'
import { Screen, ScreenActions, ScreenBody } from '../ui/Screen'
import { vibra } from '../ui/haptics'

interface Props {
  state: GameState
  onVote: () => void
}

/**
 * Il giro delle parole. Qui il telefono sta sul tavolo e serve solo a ricordare
 * di chi è il turno: per questo il nome di turno è la cosa più grande dello
 * schermo, leggibile da chi sta dall'altra parte del divano.
 */
export function RoundScreen({ state, onVote }: Props) {
  const [detti, setDetti] = useState(0)
  const ordine = state.turnOrder

  // Al giro nuovo si riparte dal primo della lista.
  useEffect(() => setDetti(0), [state.round])

  const fuori = state.players.filter((player) => state.eliminatedIds.includes(player.id))
  const finito = detti >= ordine.length
  const attuale = finito ? null : playerById(state, ordine[detti])
  const prossimo = detti + 1 < ordine.length ? playerById(state, ordine[detti + 1]) : null

  const avanti = () => {
    vibra('tocco')
    setDetti((valore) => Math.min(valore + 1, ordine.length))
  }

  const indietro = () => {
    vibra('tocco')
    setDetti((valore) => Math.max(valore - 1, 0))
  }

  const vota = () => {
    vibra('conferma')
    onVote()
  }

  return (
    <Screen>
      <ScreenBody>
        {attuale ? (
          <div className="turno-attuale">
            <Avatar nome={attuale.name} dimensione="lg" />
            <p className="eyebrow">Tocca a</p>
            <h1 className="turno-nome">{attuale.name}</h1>
            <p className="muted">
              Una parola sola, collegata alla parola segreta e nello stile del tuo archetipo.
            </p>
            {prossimo && <p className="turno-prossimo">Poi tocca a {prossimo.name}</p>}
          </div>
        ) : (
          <div className="turno-attuale turno-finito">
            <p className="outcome">🗳️</p>
            <h1 className="turno-nome">Hanno parlato tutti</h1>
            <p className="muted">Discutete quanto volete, poi si vota.</p>
          </div>
        )}

        <div className="giro-testa">
          <p className="eyebrow">Ordine di parola</p>
          <span className="progress">{alivePlayers(state).length} in gioco</span>
        </div>

        <ol className="ordine">
          {ordine.map((playerId, index) => {
            const nome = playerById(state, playerId)?.name ?? ''
            const stato = index < detti ? 'fatto' : index === detti ? 'ora' : 'attesa'
            return (
              <li key={playerId} className={`ordine-riga ordine-${stato}`}>
                <span className="ordine-numero">{index < detti ? '✓' : index + 1}</span>
                <Avatar nome={nome} dimensione="sm" spento={index < detti} />
                <span className="ordine-nome">{nome}</span>
              </li>
            )
          })}
        </ol>

        {fuori.length > 0 && (
          <p className="muted center">
            Fuori dal gioco: {fuori.map((player) => player.name).join(', ')}
          </p>
        )}
      </ScreenBody>

      <ScreenActions>
        {finito ? (
          <button type="button" className="btn" onClick={vota}>
            Si vota
          </button>
        ) : (
          <>
            <button type="button" className="btn" onClick={avanti}>
              {attuale?.name} ha detto la sua
            </button>
            <div className="azioni-minori">
              {detti > 0 && (
                <button type="button" className="btn-ghost" onClick={indietro}>
                  Torna indietro
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={vota}>
                Vota adesso
              </button>
            </div>
          </>
        )}
      </ScreenActions>
    </Screen>
  )
}
