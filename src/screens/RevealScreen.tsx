import { useState } from 'react'
import { roleFor } from '../game/engine'
import type { GameState } from '../game/types'
import { Avatar } from '../ui/Avatar'
import { Handoff } from '../ui/Handoff'
import { SecretCard } from '../ui/SecretCard'
import { Screen, ScreenActions, ScreenBody } from '../ui/Screen'
import { useHoldToReveal } from '../ui/useHoldToReveal'
import { vibra } from '../ui/haptics'

interface Props {
  state: GameState
  tieniPremuto: boolean
  onNext: () => void
}

export function RevealScreen({ state, tieniPremuto, onNext }: Props) {
  const [consegnato, setConsegnato] = useState(false)
  const { premuto, giaVisto, inizia, finisci, chiudi } = useHoldToReveal(tieniPremuto)

  const player = state.players[state.revealIndex]
  const role = roleFor(state, player.id)
  const ultimo = state.revealIndex === state.players.length - 1
  // L'indizio può essere una frase oppure una sola categoria: la frase va
  // rimpicciolita, la parola corta merita lo stesso corpo della parola segreta.
  const indizioCorto = (role.clue?.length ?? 0) <= 22
  const passo = `Carta ${state.revealIndex + 1} di ${state.players.length}`

  if (!consegnato) {
    return (
      <Handoff
        nome={player.name}
        passo={passo}
        nota="Gli altri non devono guardare lo schermo. Quando ce l'hai in mano tu, scopri la tua carta."
        azione="scopri"
        onPronto={() => setConsegnato(true)}
      />
    )
  }

  const chiudiEProsegui = () => {
    vibra('conferma')
    chiudi()
    setConsegnato(false)
    onNext()
  }

  return (
    <Screen>
      <ScreenBody>
        <div className="carta-intestazione">
          <Avatar nome={player.name} dimensione="sm" />
          <span className="carta-nome">{player.name}</span>
          <span className="progress">{passo}</span>
        </div>

        <SecretCard
          premuto={premuto}
          tieniPremuto={tieniPremuto}
          variante={role.isImpostor ? 'impostore' : 'parola'}
          inizia={inizia}
          finisci={finisci}
        >
          {role.isImpostor ? (
            <>
              <p className="eyebrow">Sei un impostore</p>
              {role.clue ? (
                <>
                  <p className={indizioCorto ? 'segreto-parola' : 'segreto-parola segreto-indizio'}>
                    {role.clue}
                  </p>
                  <p className="muted">È tutto quello che sai: è il tuo unico indizio.</p>
                </>
              ) : (
                <>
                  <p className="segreto-parola">Nessun indizio</p>
                  <p className="muted">Vai a sentimento e ascolta bene gli altri.</p>
                </>
              )}
              {role.fellowImpostorNames.length > 0 && (
                <div className="complici">
                  <p className="eyebrow">
                    {role.fellowImpostorNames.length === 1 ? 'Il tuo complice' : 'I tuoi complici'}
                  </p>
                  <div className="complici-lista">
                    {role.fellowImpostorNames.map((nome) => (
                      <span key={nome} className="complice">
                        <Avatar nome={nome} dimensione="sm" />
                        {nome}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="eyebrow">La parola segreta</p>
              <p className="segreto-parola">{state.entry.word}</p>
              <p className="muted">Categoria: {state.packName}</p>
            </>
          )}

          {role.archetype && (
            <div className="archetipo">
              <p className="eyebrow">Il tuo archetipo</p>
              <p className="archetipo-nome">
                <span className="archetipo-emoji">{role.archetype.emoji}</span>
                {role.archetype.name}
              </p>
              <p className="archetipo-regola">{role.archetype.rule}</p>
            </div>
          )}
        </SecretCard>
      </ScreenBody>

      <ScreenActions>
        {giaVisto ? (
          <button type="button" className="btn" onClick={chiudiEProsegui}>
            {ultimo ? 'Ho capito, si comincia' : 'Ho capito, passa al prossimo'}
          </button>
        ) : (
          <p className="suggerimento">
            {tieniPremuto
              ? 'Quando stacchi il dito la carta si richiude da sola'
              : 'Tocca di nuovo la carta per richiuderla'}
          </p>
        )}
      </ScreenActions>
    </Screen>
  )
}
