import { useState } from 'react'
import { playerById } from '../game/engine'
import type { GameState } from '../game/types'

interface Props {
  state: GameState
  onGuess: (guess: string) => void
}

export function GuessScreen({ state, onGuess }: Props) {
  const [guess, setGuess] = useState('')
  const impostor = state.guessingImpostorId ? playerById(state, state.guessingImpostorId) : null

  return (
    <div className="stack-lg grow" style={{ justifyContent: 'center' }}>
      <header className="stack center">
        <p className="eyebrow">Ultima occasione</p>
        <h1>{impostor?.name}, qual era la parola?</h1>
        <p className="muted">
          Se la indovini vincono gli impostori, comunque vada. Se sbagli, la partita continua senza
          di te.
        </p>
      </header>

      <input
        type="text"
        value={guess}
        placeholder="Scrivi la parola segreta"
        autoComplete="off"
        autoCapitalize="none"
        onChange={(event) => setGuess(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && guess.trim()) onGuess(guess)
        }}
      />

      <button type="button" className="btn" disabled={!guess.trim()} onClick={() => onGuess(guess)}>
        Questa è la mia risposta
      </button>
    </div>
  )
}
