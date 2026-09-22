import { useRef, useState } from 'react'
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  REVEAL_SECONDS,
  clueIsUseful,
  maxImpostors,
  suggestedImpostors,
} from '../game/engine'
import { WORD_PACKS } from '../game/words'
import type { Player, Settings } from '../game/types'
import type { UiPrefs } from '../ui/preferences'
import { Avatar } from '../ui/Avatar'
import { Screen, ScreenActions, ScreenBody } from '../ui/Screen'
import { vibra } from '../ui/haptics'

interface Props {
  players: Player[]
  settings: Settings
  uiPrefs: UiPrefs
  onPlayersChange: (players: Player[]) => void
  onSettingsChange: (settings: Settings) => void
  onUiPrefsChange: (prefs: UiPrefs) => void
  onStart: () => void
}

let progressivo = 0
function creaGiocatore(name: string): Player {
  progressivo += 1
  return { id: `p${Date.now().toString(36)}${progressivo}`, name }
}

export function SetupScreen({
  players,
  settings,
  uiPrefs,
  onPlayersChange,
  onSettingsChange,
  onUiPrefsChange,
  onStart,
}: Props) {
  const [bozza, setBozza] = useState('')
  const [errore, setErrore] = useState<string | null>(null)
  const campo = useRef<HTMLInputElement>(null)

  const aggiungi = () => {
    const name = bozza.trim()
    if (!name) return
    if (players.length >= MAX_PLAYERS) {
      setErrore(`Al massimo ${MAX_PLAYERS} giocatori.`)
      return
    }
    if (players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
      setErrore("C'è già un giocatore con questo nome.")
      return
    }
    onPlayersChange([...players, creaGiocatore(name)])
    setBozza('')
    setErrore(null)
    vibra('tocco')
    // Si aggiungono più nomi di fila: la tastiera deve restare aperta.
    campo.current?.focus()
  }

  const togli = (id: string) => {
    onPlayersChange(players.filter((player) => player.id !== id))
    setErrore(null)
  }

  const cambiaCategoria = (packId: string) => {
    const packIds = settings.packIds.includes(packId)
      ? settings.packIds.filter((id) => id !== packId)
      : [...settings.packIds, packId]
    if (packIds.length === 0) return
    vibra('tocco')
    onSettingsChange({ ...settings, packIds })
  }

  const limite = maxImpostors(players.length)
  const scelteImpostori = Array.from({ length: Math.max(1, limite) }, (_, i) => i + 1)
  const consigliati = suggestedImpostors(players.length)
  const abbastanza = players.length >= MIN_PLAYERS
  // L'indizio è la categoria: con una categoria sola la sanno già tutti.
  const indizioServe = clueIsUseful(settings)

  return (
    <Screen>
      <ScreenBody>
        <header className="stack titolo">
          <h1 className="logo">Impostor</h1>
          <p className="muted">
            Un solo telefono che gira di mano in mano. Tutti leggono la parola segreta tranne gli
            impostori, che ricevono solo un indizio.
          </p>
        </header>

        <section className="card stack">
          <div className="row">
            <h2 className="grow">Giocatori</h2>
            <span className="progress">
              {players.length} / {MAX_PLAYERS}
            </span>
          </div>

          <div className="row">
            <input
              ref={campo}
              type="text"
              value={bozza}
              placeholder="Nome del giocatore"
              autoComplete="off"
              autoCorrect="off"
              enterKeyHint="done"
              onChange={(event) => setBozza(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') aggiungi()
              }}
            />
            <button type="button" className="btn btn-inline" onClick={aggiungi}>
              Aggiungi
            </button>
          </div>
          {errore && <p className="error">{errore}</p>}

          <div className="stack">
            {players.map((player) => (
              <div key={player.id} className="player-row">
                <Avatar nome={player.name} dimensione="sm" />
                <span className="player-nome">{player.name}</span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Togli ${player.name}`}
                  onClick={() => togli(player.id)}
                >
                  ✕
                </button>
              </div>
            ))}
            {players.length === 0 && (
              <p className="muted">Aggiungi almeno {MIN_PLAYERS} giocatori per cominciare.</p>
            )}
          </div>
        </section>

        <section className="card stack">
          <h2>Impostori</h2>
          <div className="chips">
            {scelteImpostori.map((quanti) => (
              <button
                key={quanti}
                type="button"
                className="chip"
                aria-pressed={settings.impostorCount === quanti}
                onClick={() => {
                  vibra('tocco')
                  onSettingsChange({ ...settings, impostorCount: quanti })
                }}
              >
                {quanti}
              </button>
            ))}
          </div>
          <p className="muted">
            Con {players.length || '—'} giocatori puoi arrivare a {limite}{' '}
            {limite === 1 ? 'impostore' : 'impostori'}, e{' '}
            {consigliati === 1 ? 'ne basta uno' : 'ne consigliamo due'}. Più impostori
            non aiutano mai il tavolo: votano compatti e la partita si allunga.
          </p>
        </section>

        <section className="card stack">
          <h2>Categorie</h2>
          <div className="chips">
            {WORD_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                className="chip"
                aria-pressed={settings.packIds.includes(pack.id)}
                onClick={() => cambiaCategoria(pack.id)}
              >
                {pack.name}
              </button>
            ))}
          </div>
        </section>

        <section className="card stack">
          <h2>Tempo per dire la parola</h2>
          <div className="chips">
            {([10, 15, 20, 30, 0] as const).map((quanti) => (
              <button
                key={quanti}
                type="button"
                className="chip"
                aria-pressed={settings.answerSeconds === quanti}
                onClick={() => {
                  vibra('tocco')
                  onSettingsChange({ ...settings, answerSeconds: quanti })
                }}
              >
                {quanti === 0 ? 'Nessun limite' : `${quanti}s`}
              </button>
            ))}
          </div>
          <p className="muted">
            Se il tempo finisce prima che tu abbia detto la parola prendi un cartellino giallo, poi
            puoi dirla con calma. Al secondo cartellino sei fuori. Senza limite non ci sono
            cartellini.
          </p>
        </section>

        <section className="card stack">
          <h2>Come si vota</h2>
          <div className="chips">
            {(
              [
                ['misto', 'A sorte'],
                ['segreto', 'Sempre segreto'],
                ['palese', 'Sempre palese'],
              ] as const
            ).map(([modo, etichetta]) => (
              <button
                key={modo}
                type="button"
                className="chip"
                aria-pressed={settings.voteMode === modo}
                onClick={() => {
                  vibra('tocco')
                  onSettingsChange({ ...settings, voteMode: modo })
                }}
              >
                {etichetta}
              </button>
            ))}
          </div>
          <p className="muted">
            {settings.voteMode === 'misto'
              ? 'Ogni votazione esce segreta o a mano alzata, ma la prima è sempre segreta: a mano alzata, senza ancora nessun indizio, ci si accoderebbe al primo che parla.'
              : settings.voteMode === 'segreto'
                ? 'Il telefono gira e ognuno vota da solo, coperto.'
                : 'Il telefono resta in mezzo e si vota davanti a tutti.'}
          </p>
        </section>

        <Interruttore
          acceso={settings.archetypesEnabled}
          titolo="Archetipi"
          nota="Ogni giocatore riceve una classe, che vincola come si comporta, e una sottoclasse, che vincola le parole che può dire."
          onCambia={() =>
            onSettingsChange({ ...settings, archetypesEnabled: !settings.archetypesEnabled })
          }
        />

        <details className="altre">
          <summary>Altre impostazioni</summary>
          <div className="stack">
            <Interruttore
              acceso={settings.clueForImpostors}
              titolo="Indizio per gli impostori"
              nota={
                indizioServe
                  ? "L'impostore legge la categoria della parola. Spegnilo per una partita più difficile: non saprà nulla."
                  : "L'indizio è la categoria della parola, quindi con una categoria sola non dice niente a nessuno: accendine almeno due."
              }
              onCambia={() =>
                onSettingsChange({ ...settings, clueForImpostors: !settings.clueForImpostors })
              }
            />
            <Interruttore
              acceso={uiPrefs.tieniPremuto}
              titolo="Scopri tenendo premuto"
              nota="La carta resta visibile solo finché tieni il dito sullo schermo. Spegnilo per aprirla e chiuderla con un tocco."
              onCambia={() => onUiPrefsChange({ ...uiPrefs, tieniPremuto: !uiPrefs.tieniPremuto })}
            />
            <Interruttore
              acceso={settings.revealSeconds > 0}
              titolo={`Tempo fisso per la carta, ${REVEAL_SECONDS} secondi`}
              nota="Tutti tengono il telefono per lo stesso tempo, così chi legge più a lungo non si tradisce. Spegnendolo il tempo di lettura torna a essere un indizio."
              onCambia={() =>
                onSettingsChange({
                  ...settings,
                  revealSeconds: settings.revealSeconds > 0 ? 0 : REVEAL_SECONDS,
                })
              }
            />
            <Interruttore
              acceso={uiPrefs.vibrazioni}
              titolo="Vibrazione"
              nota="Un colpetto quando scopri la carta, confermi un voto o arriva un verdetto."
              onCambia={() => onUiPrefsChange({ ...uiPrefs, vibrazioni: !uiPrefs.vibrazioni })}
            />
          </div>
        </details>
      </ScreenBody>

      <ScreenActions>
        <button
          type="button"
          className="btn"
          disabled={!abbastanza}
          onClick={() => {
            vibra('conferma')
            onStart()
          }}
        >
          {abbastanza ? 'Comincia la partita' : `Servono almeno ${MIN_PLAYERS} giocatori`}
        </button>
      </ScreenActions>
    </Screen>
  )
}

function Interruttore({
  acceso,
  titolo,
  nota,
  onCambia,
}: {
  acceso: boolean
  titolo: string
  nota: string
  onCambia: () => void
}) {
  return (
    <button
      type="button"
      className="toggle"
      aria-pressed={acceso}
      onClick={() => {
        vibra('tocco')
        onCambia()
      }}
    >
      <span className="toggle-mark" aria-hidden="true">
        {acceso ? '✓' : ''}
      </span>
      <span className="toggle-testo">
        <strong>{titolo}</strong>
        <span className="muted">{nota}</span>
      </span>
    </button>
  )
}
