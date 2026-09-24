import { useEffect, useState } from 'react'
import { playerById } from '../game/engine'
import type { GameState, PlayerId } from '../game/types'
import { Avatar } from '../ui/Avatar'
import { Screen, ScreenActions, ScreenBody } from '../ui/Screen'
import { vibra } from '../ui/haptics'

interface Props {
  state: GameState
  onContinue: () => void
}

/** Quanto dura il giro prima di fermarsi, e ogni quanto cambia il nome evidenziato. */
const DURATA_MS = 2600
const PASSO_INIZIALE_MS = 70
const PASSO_FINALE_MS = 420

/**
 * La ruota della fortuna: dopo un pareggio i nomi dei pari merito scorrono e
 * rallentano fino a fermarsi su uno.
 *
 * Chi esce lo ha già deciso il motore prima che la schermata si apra: qui si
 * racconta soltanto. Se fosse l'animazione a scegliere, il sorteggio dipenderebbe
 * da quanti fotogrammi riesce a fare il telefono.
 */
export function WheelScreen({ state, onContinue }: Props) {
  // In ordine di giocatore: i pari merito arrivano nell'ordine in cui sono stati
  // contati i voti, che sullo schermo sembra casuale.
  const pariSet = new Set(state.lastVote?.tiedIds ?? [])
  const pari = state.players.filter((p) => pariSet.has(p.id)).map((p) => p.id)
  const estratto = state.wheelPickedId
  const [indice, setIndice] = useState(0)
  const [fermo, setFermo] = useState(false)

  useEffect(() => {
    if (pari.length === 0 || !estratto) return
    // Una vibrazione a ogni scatto sarebbe decine di colpetti: si vibra all'arrivo.
    let annullato = false
    let trascorso = 0
    let passo = 0
    let timer: ReturnType<typeof setTimeout>

    const giraAncora = () => {
      if (annullato) return
      passo++
      setIndice(passo % pari.length)
      trascorso += PASSO_INIZIALE_MS

      // Verso la fine i passi si allungano, così la ruota sembra perdere slancio.
      const avanzamento = Math.min(1, trascorso / DURATA_MS)
      const attesa =
        PASSO_INIZIALE_MS + (PASSO_FINALE_MS - PASSO_INIZIALE_MS) * avanzamento * avanzamento

      if (avanzamento >= 1) {
        setIndice(pari.indexOf(estratto))
        setFermo(true)
        vibra('colpo')
        return
      }
      timer = setTimeout(giraAncora, attesa)
    }

    timer = setTimeout(giraAncora, PASSO_INIZIALE_MS)
    return () => {
      annullato = true
      clearTimeout(timer)
    }
  }, [estratto, pari.length])

  const nomeDi = (id: PlayerId) => playerById(state, id)?.name ?? ''
  const evidenziato = pari[indice]

  const prosegui = () => {
    vibra('conferma')
    onContinue()
  }

  return (
    <Screen center>
      <ScreenBody>
        <header className="stack center">
          <p className="outcome">🎡</p>
          <h1>{fermo ? `${nomeDi(estratto!)} è fuori` : 'Ruota della fortuna'}</h1>
          <p className="muted">
            {fermo
              ? 'Il pareggio lo ha deciso la sorte, non il gruppo.'
              : 'Pareggio: decide la sorte fra chi ha preso più voti.'}
          </p>
        </header>

        <div className="card stack" aria-live="polite">
          {pari.map((id) => {
            const acceso = id === evidenziato
            return (
              <div
                key={id}
                className={`ruota-riga${acceso ? ' ruota-riga-accesa' : ''}${
                  fermo && acceso ? ' ruota-riga-scelta' : ''
                }`}
              >
                <Avatar nome={nomeDi(id)} dimensione="sm" />
                <span className="voto-nome">{nomeDi(id)}</span>
                {fermo && acceso && <span aria-hidden="true">👈</span>}
              </div>
            )
          })}
        </div>
      </ScreenBody>

      <ScreenActions>
        <button type="button" className="btn" disabled={!fermo} onClick={prosegui}>
          {fermo ? 'Avanti' : 'La ruota sta girando…'}
        </button>
      </ScreenActions>
    </Screen>
  )
}
