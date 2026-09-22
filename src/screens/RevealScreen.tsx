import { useState } from 'react'
import { archetypeRule } from '../game/archetypes'
import { roleFor } from '../game/engine'
import type { GameState } from '../game/types'

interface Props {
  state: GameState
  onNext: () => void
}

export function RevealScreen({ state, onNext }: Props) {
  const [open, setOpen] = useState(false)
  const player = state.players[state.revealIndex]
  const role = roleFor(state, player.id)
  const isLast = state.revealIndex === state.players.length - 1

  const hideAndContinue = () => {
    setOpen(false)
    onNext()
  }

  if (!open) {
    return (
      <div className="stack-lg grow" style={{ justifyContent: 'center' }}>
        <div className="center stack">
          <p className="eyebrow">
            Carta {state.revealIndex + 1} di {state.players.length}
          </p>
          <h1>Passa il telefono a {player.name}</h1>
          <p className="muted">
            Gli altri non devono guardare lo schermo. Quando sei pronto, scopri la tua carta.
          </p>
        </div>
        <button type="button" className="btn" onClick={() => setOpen(true)}>
          Sono {player.name}, scopri
        </button>
      </div>
    )
  }

  return (
    <div className="stack-lg grow" style={{ justifyContent: 'center' }}>
      <div className={role.isImpostor ? 'secret impostor' : 'secret'}>
        {role.isImpostor ? (
          <>
            <p className="eyebrow">Sei un impostore</p>
            {role.clue ? (
              <>
                <p className="muted" style={{ marginTop: 10 }}>
                  Il tuo unico indizio
                </p>
                <p className="secret-word">{role.clue}</p>
              </>
            ) : (
              <p className="secret-word">Nessun indizio</p>
            )}
            {role.fellowImpostorNames.length > 0 && (
              <p className="muted" style={{ marginTop: 14 }}>
                Con te ci {role.fellowImpostorNames.length === 1 ? 'è' : 'sono'}{' '}
                <strong style={{ color: 'var(--text)' }}>
                  {role.fellowImpostorNames.join(', ')}
                </strong>
              </p>
            )}
          </>
        ) : (
          <>
            <p className="eyebrow">La parola segreta</p>
            <p className="secret-word">{state.entry.word}</p>
            <p className="muted" style={{ marginTop: 10 }}>
              Categoria: {state.packName}
            </p>
          </>
        )}
      </div>

      {role.archetypes && (
        <div className="archetype stack">
          <p className="eyebrow">La tua classe</p>
          <p className="archetype-name">
            {role.archetypes.classe.emoji} {role.archetypes.classe.name}
          </p>
          <p className="muted">
            {archetypeRule(role.archetypes.classe, role.archetypes.targetName)}
          </p>
          <p className="eyebrow" style={{ marginTop: 14 }}>
            La tua sottoclasse
          </p>
          <p className="archetype-name">
            {role.archetypes.sottoclasse.emoji} {role.archetypes.sottoclasse.name}
          </p>
          <p className="muted">{role.archetypes.sottoclasse.rule}</p>
        </div>
      )}

      <button type="button" className="btn" onClick={hideAndContinue}>
        {isLast ? 'Ho capito, si comincia' : 'Ho capito, nascondi'}
      </button>
    </div>
  )
}
