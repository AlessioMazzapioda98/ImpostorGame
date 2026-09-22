import { useState } from 'react'
import { alivePlayers } from '../game/engine'
import type { GameState, PlayerId } from '../game/types'

interface Props {
  state: GameState
  onDone: (votes: Record<PlayerId, PlayerId>) => void
}

export function VoteScreen({ state, onDone }: Props) {
  const voters = alivePlayers(state)
  const [voterIndex, setVoterIndex] = useState(0)
  const [handedOver, setHandedOver] = useState(false)
  const [choice, setChoice] = useState<PlayerId | null>(null)
  const [votes, setVotes] = useState<Record<PlayerId, PlayerId>>({})

  const voter = voters[voterIndex]

  const confirm = () => {
    if (!choice) return
    const nextVotes = { ...votes, [voter.id]: choice }
    setVotes(nextVotes)
    setChoice(null)
    setHandedOver(false)
    if (voterIndex === voters.length - 1) {
      onDone(nextVotes)
      return
    }
    setVoterIndex(voterIndex + 1)
  }

  if (!handedOver) {
    return (
      <div className="stack-lg grow" style={{ justifyContent: 'center' }}>
        <div className="center stack">
          <p className="eyebrow">
            Voto {voterIndex + 1} di {voters.length}
          </p>
          <h1>Passa il telefono a {voter.name}</h1>
          <p className="muted">Il voto è segreto: gli altri non devono vedere lo schermo.</p>
        </div>
        <button type="button" className="btn" onClick={() => setHandedOver(true)}>
          Sono {voter.name}, vota
        </button>
      </div>
    )
  }

  return (
    <div className="stack-lg">
      <header className="stack">
        <p className="eyebrow">{voter.name}, tocca a te</p>
        <h1>Chi è l'impostore?</h1>
      </header>

      <div className="stack">
        {voters
          .filter((player) => player.id !== voter.id)
          .map((player) => (
            <button
              key={player.id}
              type="button"
              className="vote-option"
              aria-pressed={choice === player.id}
              onClick={() => setChoice(player.id)}
            >
              <span>{player.name}</span>
              {choice === player.id && <span>✓</span>}
            </button>
          ))}
      </div>

      <button type="button" className="btn" disabled={!choice} onClick={confirm}>
        Conferma il voto
      </button>
    </div>
  )
}
