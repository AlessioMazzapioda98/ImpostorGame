import { useState } from 'react'
import { isImpostor, playerById } from '../game/engine'
import type { GameState } from '../game/types'
import { Avatar } from '../ui/Avatar'
import { Screen, ScreenActions, ScreenBody } from '../ui/Screen'
import { vibra } from '../ui/haptics'

interface Props {
  state: GameState
  onContinue: () => void
}

/**
 * Il risultato arriva in due tempi: prima chi è stato votato, poi, con un altro
 * tocco, se era davvero un impostore. È il momento più bello del gioco e
 * merita un secondo di attesa invece di finire tutto insieme.
 */
export function VoteResultScreen({ state, onContinue }: Props) {
  const [ruoloScoperto, setRuoloScoperto] = useState(false)
  const outcome = state.lastVote
  if (!outcome) return null

  const eliminato = outcome.eliminatedId ? playerById(state, outcome.eliminatedId) : null
  const eraImpostore = outcome.eliminatedId ? isImpostor(state, outcome.eliminatedId) : false
  const votiMax = Math.max(1, ...Object.values(outcome.tally))
  const classifica = state.players
    .filter((player) => outcome.tally[player.id])
    .sort((a, b) => outcome.tally[b.id] - outcome.tally[a.id])

  const scopri = () => {
    vibra('colpo')
    setRuoloScoperto(true)
  }

  const prosegui = () => {
    vibra('conferma')
    onContinue()
  }

  return (
    <Screen center>
      <ScreenBody>
        <header className="stack center">
          {outcome.tie ? (
            <>
              <p className="outcome">🤷</p>
              <h1>Pareggio</h1>
              <p className="muted">Nessuno viene eliminato. Si riparte con un altro giro.</p>
            </>
          ) : (
            <>
              <Avatar nome={eliminato?.name ?? ''} dimensione="lg" />
              <h1>{eliminato?.name} è fuori</h1>
              {ruoloScoperto ? (
                <>
                  <p className={eraImpostore ? 'verdetto verdetto-impostore' : 'verdetto verdetto-innocente'}>
                    {eraImpostore ? '🎯 Era un impostore' : '😬 Era innocente'}
                  </p>
                  <p className="muted">
                    {eraImpostore
                      ? 'Ora può tentare di indovinare la parola e ribaltare tutto.'
                      : 'Gli impostori sono ancora tutti in gioco.'}
                  </p>
                </>
              ) : (
                <p className="muted">Il gruppo ha deciso. Ma aveva ragione?</p>
              )}
            </>
          )}
        </header>

        <div className="card stack">
          <p className="eyebrow">I voti</p>
          {classifica.map((player) => (
            <div key={player.id} className="voto-riga">
              <Avatar nome={player.name} dimensione="sm" />
              <span className="voto-nome">{player.name}</span>
              <span
                className="voto-barra"
                style={{ ['--quota' as string]: `${(outcome.tally[player.id] / votiMax) * 100}%` }}
              />
              <span className="tally">{outcome.tally[player.id]}</span>
            </div>
          ))}
        </div>
      </ScreenBody>

      <ScreenActions>
        {!outcome.tie && !ruoloScoperto ? (
          <button type="button" className="btn" onClick={scopri}>
            Scopri chi era {eliminato?.name}
          </button>
        ) : (
          <button type="button" className="btn" onClick={prosegui}>
            {eraImpostore ? 'Tenta di indovinare' : 'Avanti'}
          </button>
        )}
      </ScreenActions>
    </Screen>
  )
}
