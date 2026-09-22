import { useState } from 'react'
import { archetypeRule } from '../game/archetypes'
import { alivePlayers } from '../game/engine'
import type { GameState, PlayerId } from '../game/types'
import { Avatar } from '../ui/Avatar'
import { Handoff } from '../ui/Handoff'
import { Screen, ScreenActions, ScreenBody } from '../ui/Screen'
import { vibra } from '../ui/haptics'

/**
 * Come si raccoglie il voto. Cambia solo il modo di usare il telefono, non il
 * conteggio: in entrambi i casi l'app consegna lo stesso elenco di voti.
 * - segreto: il telefono gira e ognuno vota da solo, coperto.
 * - palese: il telefono resta in mezzo e si vota davanti a tutti.
 */
export type ModalitaVoto = 'segreto' | 'palese'

interface Props {
  state: GameState
  modalita?: ModalitaVoto
  onDone: (votes: Record<PlayerId, PlayerId>) => void
}

export function VoteScreen({ state, modalita = 'segreto', onDone }: Props) {
  const voters = alivePlayers(state)
  const [voterIndex, setVoterIndex] = useState(0)
  const [consegnato, setConsegnato] = useState(false)
  const [scelta, setScelta] = useState<PlayerId | null>(null)
  const [votes, setVotes] = useState<Record<PlayerId, PlayerId>>({})

  const segreto = modalita === 'segreto'
  const voter = voters[voterIndex]
  // Qui si ricorda solo la classe, che è quella che vincola come ti comporti e
  // chi puoi votare: la sottoclasse riguarda la parola e al voto non serve più.
  // Solo nel voto segreto, perché in quello palese la regola la leggerebbe
  // tutto il tavolo.
  const carta = state.archetypesByPlayer[voter.id]
  const classe = segreto ? carta?.classe : undefined
  const passo = `Voto ${voterIndex + 1} di ${voters.length}`

  const conferma = () => {
    if (!scelta) return
    vibra('conferma')
    const nuoviVoti = { ...votes, [voter.id]: scelta }
    setVotes(nuoviVoti)
    setScelta(null)
    setConsegnato(false)
    if (voterIndex === voters.length - 1) {
      onDone(nuoviVoti)
      return
    }
    setVoterIndex(voterIndex + 1)
  }

  // Nel voto palese il telefono non gira: si salta la schermata di passaggio.
  if (segreto && !consegnato) {
    return (
      <Handoff
        nome={voter.name}
        passo={passo}
        nota="Il voto è segreto: copri lo schermo con la mano mentre scegli."
        azione="vota"
        onPronto={() => setConsegnato(true)}
      />
    )
  }

  return (
    <Screen>
      <ScreenBody>
        <div className="giro-testa">
          <span className={segreto ? 'modo modo-segreto' : 'modo modo-palese'}>
            {segreto ? '🤫 Voto segreto' : '👀 Voto palese'}
          </span>
          <span className="progress">{passo}</span>
        </div>

        <div className="voto-testa">
          <Avatar nome={voter.name} dimensione="md" />
          <div>
            <h1>Chi è l'impostore?</h1>
            <p className="muted">
              {segreto
                ? `${voter.name}, scegli e conferma. Nessuno vedrà il tuo voto.`
                : `${voter.name}, scegli davanti a tutti. Questo voto è di tutti.`}
            </p>
          </div>
        </div>

        {classe && (
          <div className="promemoria">
            <p className="eyebrow">Ricorda la tua classe</p>
            <p className="promemoria-nome">
              <span className="archetipo-emoji">{classe.emoji}</span>
              {classe.name}
            </p>
            <p className="promemoria-regola">
              {archetypeRule(classe, carta?.targetName ?? null)}
            </p>
          </div>
        )}

        <div className="stack">
          {voters
            .filter((player) => player.id !== voter.id)
            .map((player) => (
              <button
                key={player.id}
                type="button"
                className="vote-option"
                aria-pressed={scelta === player.id}
                onClick={() => {
                  vibra('tocco')
                  setScelta(player.id)
                }}
              >
                <Avatar nome={player.name} dimensione="sm" />
                <span className="vote-nome">{player.name}</span>
                <span className="vote-segno" aria-hidden="true">
                  {scelta === player.id ? '✓' : ''}
                </span>
              </button>
            ))}
        </div>
      </ScreenBody>

      <ScreenActions>
        <button type="button" className="btn" disabled={!scelta} onClick={conferma}>
          {!scelta
            ? 'Scegli chi votare'
            : segreto
              ? 'Conferma e passa il telefono'
              : 'Conferma il voto'}
        </button>
      </ScreenActions>
    </Screen>
  )
}
