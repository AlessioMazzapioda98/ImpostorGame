import { useState } from 'react'
import { playerById } from '../game/engine'
import type { GameState } from '../game/types'
import { Avatar } from '../ui/Avatar'
import { Screen, ScreenActions, ScreenBody } from '../ui/Screen'
import { vibra } from '../ui/haptics'

interface Props {
  state: GameState
  onGuess: (guess: string) => void
}

export function GuessScreen({ state, onGuess }: Props) {
  const [tentativo, setTentativo] = useState('')
  const impostore = state.guessingImpostorId ? playerById(state, state.guessingImpostorId) : null
  const pronto = tentativo.trim().length > 0

  const invia = () => {
    if (!pronto) return
    vibra('colpo')
    onGuess(tentativo)
  }

  return (
    <Screen center>
      <ScreenBody>
        <div className="stack center">
          <Avatar nome={impostore?.name ?? ''} dimensione="lg" />
          <p className="eyebrow">Ultima occasione</p>
          <h1>{impostore?.name}, qual era la parola?</h1>
          <p className="muted">
            Se la indovini vincono gli impostori, comunque vada. Se sbagli, la partita continua
            senza di te.
          </p>
        </div>

        <input
          type="text"
          value={tentativo}
          placeholder="Scrivi la parola segreta"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onChange={(event) => setTentativo(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') invia()
          }}
        />
      </ScreenBody>

      <ScreenActions>
        <button type="button" className="btn" disabled={!pronto} onClick={invia}>
          Questa è la mia risposta
        </button>
      </ScreenActions>
    </Screen>
  )
}
