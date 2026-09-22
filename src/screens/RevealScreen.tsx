import { useEffect, useState } from 'react'
import { roleFor } from '../game/engine'
import type { GameState } from '../game/types'
import { Avatar } from '../ui/Avatar'
import { Handoff } from '../ui/Handoff'
import { SecretCard } from '../ui/SecretCard'
import { Screen, ScreenActions, ScreenBody } from '../ui/Screen'
import { useCountdown } from '../ui/useCountdown'
import { useHoldToReveal } from '../ui/useHoldToReveal'
import { vibra } from '../ui/haptics'

interface Props {
  state: GameState
  tieniPremuto: boolean
  /** Secondi uguali per tutti con la carta in mano. 0 = nessun tempo fisso. */
  secondiCarta: number
  onNext: () => void
}

export function RevealScreen({ state, tieniPremuto, secondiCarta, onNext }: Props) {
  const [consegnato, setConsegnato] = useState(false)
  const aTempo = secondiCarta > 0
  const durataMs = secondiCarta * 1000

  // Il conto parte alla prima apertura della carta, non quando si prende in
  // mano il telefono: armeggiare con lo schermo non deve rubare secondi.
  const [partito, setPartito] = useState(false)
  const rimastiMs = useCountdown(aTempo && partito, durataMs)
  const scaduto = aTempo && partito && rimastiMs === 0

  const { premuto, giaVisto, inizia, finisci, chiudi } = useHoldToReveal(tieniPremuto, scaduto)

  useEffect(() => {
    if (giaVisto) setPartito(true)
  }, [giaVisto])

  // Finché il tempo scorre il pulsante non c'è: così tutti tengono il telefono
  // per gli stessi secondi e non si capisce chi ha letto di corsa.
  const puoProseguire = giaVisto && (!aTempo || scaduto)
  const secondiRimasti = Math.ceil(rimastiMs / 1000)

  const player = state.players[state.revealIndex]
  const role = roleFor(state, player.id)
  const ultimo = state.revealIndex === state.players.length - 1
  // L'indizio è il nome della categoria: quando è lungo va rimpicciolito, altrimenti
  // merita lo stesso corpo della parola segreta.
  const indizioCorto = (role.category?.length ?? 0) <= 22
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
    setPartito(false)
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
          quotaTempo={aTempo && partito ? rimastiMs / durataMs : null}
          premuto={premuto}
          tieniPremuto={tieniPremuto}
          variante={role.isImpostor ? 'impostore' : 'parola'}
          inizia={inizia}
          finisci={finisci}
        >
          {role.isImpostor ? (
            <>
              <p className="eyebrow">Sei un impostore</p>
              {role.category ? (
                <>
                  <p className={indizioCorto ? 'segreto-parola' : 'segreto-parola segreto-indizio'}>
                    {role.category}
                  </p>
                  <p className="muted">La categoria della parola: è tutto il tuo indizio.</p>
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
              <p className="segreto-parola">{state.word}</p>
              <p className="muted">Solo tu e gli altri innocenti la conoscete.</p>
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
        {puoProseguire ? (
          <button type="button" className="btn" onClick={chiudiEProsegui}>
            {ultimo ? 'Ho capito, si comincia' : 'Ho capito, passa al prossimo'}
          </button>
        ) : giaVisto ? (
          <p className="suggerimento">
            Ancora <strong className="conto">{secondiRimasti}</strong>{' '}
            {secondiRimasti === 1 ? 'secondo' : 'secondi'}, uguali per tutti
          </p>
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
