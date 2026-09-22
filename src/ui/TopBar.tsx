import type { GameState } from '../game/types'

const ETICHETTE: Record<GameState['phase'], string> = {
  setup: 'Preparazione',
  reveal: 'Consegna delle carte',
  round: 'Giro di parole',
  vote: 'Votazione',
  voteResult: 'Risultato del voto',
  guess: 'Tentativo finale',
  gameOver: 'Fine partita',
}

/**
 * Una riga sottile in cima: dice a che punto è la partita e lascia sempre una
 * via d'uscita, perché una serata può finire nel mezzo di un giro.
 */
export function TopBar({ state, onEsci }: { state: GameState; onEsci: () => void }) {
  return (
    <div className="topbar">
      <span className="topbar-fase">
        {ETICHETTE[state.phase]}
        {state.phase === 'round' && ` · giro ${state.round}`}
      </span>
      <button type="button" className="topbar-esci" onClick={onEsci}>
        Esci
      </button>
    </div>
  )
}
