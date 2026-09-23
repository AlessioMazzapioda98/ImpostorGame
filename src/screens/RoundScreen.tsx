import { useEffect, useState } from 'react'
import {
  alivePlayers,
  answerSeconds,
  giveYellowCard,
  isOnLastWarning,
  playerById,
  yellowCardsOf,
} from '../game/engine'
import type { GameState, PlayerId } from '../game/types'
import { Avatar } from '../ui/Avatar'
import { Screen, ScreenActions, ScreenBody } from '../ui/Screen'
import { vibra } from '../ui/haptics'

interface Props {
  state: GameState
  onState: (state: GameState) => void
  onVote: () => void
}

/**
 * Il giro delle parole. Qui il telefono sta sul tavolo e serve solo a ricordare
 * di chi è il turno: per questo il nome di turno è la cosa più grande dello
 * schermo, leggibile da chi sta dall'altra parte del divano.
 *
 * È anche l'unico posto dove nascono i cartellini: allo scadere del tempo per
 * dire la parola ne parte uno da solo, e da lì in poi quel giocatore parla con
 * calma, perché il cartellino l'ha già preso.
 *
 * Il cartellino parte da solo, ma al tavolo può capitare che uno dica la parola
 * in tempo e nessuno si ricordi di premere: per questo si può sempre togliere
 * subito dopo. Il secondo cartellino invece porta fuori un giocatore e può
 * chiudere il giro, e dopo non ci sarebbe più uno schermo su cui rimediare,
 * quindi quello si chiede prima di darlo.
 */
export function RoundScreen({ state, onState, onVote }: Props) {
  const [detti, setDetti] = useState(0)
  /** Chi ha già sforato in questo giro: non deve riprendere un cartellino. */
  const [sforati, setSforati] = useState<PlayerId[]>([])
  /** Chi ha sforato ma a cui il cartellino è stato tolto: niente conto, niente cartellino. */
  const [perdonati, setPerdonati] = useState<PlayerId[]>([])
  /** L'ultimo cartellino dato, con lo stato di prima da rimettere se era un errore. */
  const [annullabile, setAnnullabile] = useState<{ id: PlayerId; prima: GameState } | null>(null)
  /** Il cartellino rosso in attesa di un sì, perché eliminare non si annulla. */
  const [daConfermare, setDaConfermare] = useState<PlayerId | null>(null)
  const [scadenza, setScadenza] = useState<{ id: PlayerId; quando: number } | null>(null)
  const [ora, setOra] = useState(() => Date.now())

  const ordine = state.turnOrder
  const secondi = answerSeconds(state.settings)
  const aTempo = secondi > 0

  const finito = detti >= ordine.length
  const attuale = finito ? null : playerById(state, ordine[detti])
  const prossimo = detti + 1 < ordine.length ? playerById(state, ordine[detti + 1]) : null
  const fuori = state.players.filter((player) => state.eliminatedIds.includes(player.id))

  // Al giro nuovo si riparte dal primo della lista, e i cartellini del giro
  // scorso non contano più per il tempo.
  useEffect(() => {
    setDetti(0)
    setSforati([])
    setPerdonati([])
    setAnnullabile(null)
    setDaConfermare(null)
  }, [state.round])

  // La scadenza porta con sé di chi è, così il turno dopo non eredita per
  // sbaglio un conto già a zero.
  useEffect(() => {
    if (!aTempo || !attuale || sforati.includes(attuale.id)) {
      setScadenza(null)
      return
    }
    setScadenza({ id: attuale.id, quando: Date.now() + secondi * 1000 })
    setOra(Date.now())
    // sforati non sta fra le dipendenze di proposito: quando ci si aggiunge
    // qualcuno il conto dev'essere già finito, non ripartire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aTempo, secondi, attuale?.id, state.round])

  useEffect(() => {
    if (!scadenza) return
    const battito = window.setInterval(() => setOra(Date.now()), 100)
    return () => window.clearInterval(battito)
  }, [scadenza])

  const rimastiMs = scadenza ? Math.max(0, scadenza.quando - ora) : 0

  useEffect(() => {
    if (!scadenza || rimastiMs > 0) return
    const id = scadenza.id
    setScadenza(null)
    setSforati((prima) => (prima.includes(id) ? prima : [...prima, id]))
    vibra('colpo')
    if (isOnLastWarning(state, id)) {
      setDaConfermare(id)
      return
    }
    setAnnullabile({ id, prima: state })
    onState(giveYellowCard(state, id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scadenza, rimastiMs])

  const secondiRimasti = Math.ceil(rimastiMs / 1000)
  const haSforato = attuale ? sforati.includes(attuale.id) : false
  const perdonato = attuale ? perdonati.includes(attuale.id) : false
  const rossoInAttesa = attuale && daConfermare === attuale.id
  const daTogliere = attuale && annullabile?.id === attuale.id ? annullabile : null

  /** Rimette lo stato di prima del cartellino: il tempo resta finito, il cartellino no. */
  const togliCartellino = () => {
    if (!daTogliere) return
    vibra('tocco')
    onState(daTogliere.prima)
    setPerdonati((prima) => (prima.includes(daTogliere.id) ? prima : [...prima, daTogliere.id]))
    setAnnullabile(null)
  }

  const confermaRosso = () => {
    if (!daConfermare) return
    vibra('conferma')
    const dopo = giveYellowCard(state, daConfermare)
    // Il giocatore è fuori: il turno passa al prossimo.
    if (dopo.eliminatedIds.includes(daConfermare)) setDetti((valore) => valore + 1)
    setDaConfermare(null)
    onState(dopo)
  }

  const risparmiaRosso = () => {
    if (!daConfermare) return
    vibra('tocco')
    const id = daConfermare
    setDaConfermare(null)
    setPerdonati((prima) => (prima.includes(id) ? prima : [...prima, id]))
  }

  const avanti = () => {
    vibra('tocco')
    setAnnullabile(null)
    setDetti((valore) => Math.min(valore + 1, ordine.length))
  }

  const indietro = () => {
    vibra('tocco')
    setAnnullabile(null)
    setDetti((valore) => Math.max(valore - 1, 0))
  }

  const vota = () => {
    vibra('conferma')
    onVote()
  }

  return (
    <Screen>
      <ScreenBody>
        {attuale ? (
          <div className={haSforato ? 'turno-attuale turno-sforato' : 'turno-attuale'}>
            <Avatar nome={attuale.name} dimensione="lg" />
            <p className="eyebrow">Tocca a</p>
            <h1 className="turno-nome">{attuale.name}</h1>
            {aTempo && !haSforato ? (
              <p className={secondiRimasti <= 5 ? 'conto-grosso conto-scarso' : 'conto-grosso'}>
                {secondiRimasti}
              </p>
            ) : rossoInAttesa ? (
              <p className="avviso-rosso">
                Tempo finito, e per {attuale.name} sarebbe il secondo cartellino: quello rosso,
                che lo porta fuori. Dategli il rosso solo se la parola davvero non è arrivata.
              </p>
            ) : (
              <p className="muted">
                {perdonato
                  ? 'Tempo finito, ma niente cartellino.'
                  : haSforato
                    ? 'Cartellino preso: adesso puoi dirla con calma.'
                    : 'Una parola sola, collegata alla parola segreta e nello stile del tuo archetipo.'}
              </p>
            )}
            {prossimo && <p className="turno-prossimo">Poi tocca a {prossimo.name}</p>}
          </div>
        ) : (
          <div className="turno-attuale turno-finito">
            <p className="outcome">🗳️</p>
            <h1 className="turno-nome">Hanno parlato tutti</h1>
            <p className="muted">Discutete quanto volete, poi si vota.</p>
          </div>
        )}

        <div className="giro-testa">
          <p className="eyebrow">Ordine di parola</p>
          <span className="progress">{alivePlayers(state).length} in gioco</span>
        </div>

        <ol className="ordine">
          {ordine.map((playerId, index) => {
            const nome = playerById(state, playerId)?.name ?? ''
            const eliminato = state.eliminatedIds.includes(playerId)
            const gialli = yellowCardsOf(state, playerId)
            const stato = eliminato ? 'fatto' : index < detti ? 'fatto' : index === detti ? 'ora' : 'attesa'
            return (
              <li key={playerId} className={`ordine-riga ordine-${stato}`}>
                <span className="ordine-numero">{index < detti || eliminato ? '✓' : index + 1}</span>
                <Avatar nome={nome} dimensione="sm" spento={index < detti || eliminato} />
                <span className="ordine-nome">{nome}</span>
                {eliminato ? (
                  <span className="cartellino cartellino-rosso" title="Cartellino rosso" />
                ) : (
                  Array.from({ length: gialli }, (_, i) => (
                    <span key={i} className="cartellino cartellino-giallo" title="Cartellino giallo" />
                  ))
                )}
              </li>
            )
          })}
        </ol>

        {fuori.length > 0 && (
          <p className="muted center">
            Fuori dal gioco: {fuori.map((player) => player.name).join(', ')}
          </p>
        )}
      </ScreenBody>

      <ScreenActions>
        {finito ? (
          <button type="button" className="btn" onClick={vota}>
            Si vota
          </button>
        ) : rossoInAttesa ? (
          <>
            <button type="button" className="btn" onClick={risparmiaRosso}>
              Ha parlato in tempo, niente cartellino
            </button>
            <div className="azioni-minori">
              <button type="button" className="btn-ghost btn-rosso" onClick={confermaRosso}>
                Cartellino rosso, {attuale?.name} è fuori
              </button>
            </div>
          </>
        ) : (
          <>
            <button type="button" className="btn" onClick={avanti}>
              {attuale?.name} ha detto la sua
            </button>
            <div className="azioni-minori">
              {daTogliere && (
                <button type="button" className="btn-ghost" onClick={togliCartellino}>
                  Togli il cartellino
                </button>
              )}
              {detti > 0 && (
                <button type="button" className="btn-ghost" onClick={indietro}>
                  Torna indietro
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={vota}>
                Vota adesso
              </button>
            </div>
          </>
        )}
      </ScreenActions>
    </Screen>
  )
}
