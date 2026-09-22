import { useState } from 'react'
import { MAX_PLAYERS, MIN_PLAYERS, maxImpostors } from '../game/engine'
import { WORD_PACKS } from '../game/words'
import type { Player, Settings } from '../game/types'

interface Props {
  players: Player[]
  settings: Settings
  onPlayersChange: (players: Player[]) => void
  onSettingsChange: (settings: Settings) => void
  onStart: () => void
}

let nextId = 0
function makePlayer(name: string): Player {
  nextId += 1
  return { id: `p${Date.now().toString(36)}${nextId}`, name }
}

export function SetupScreen({
  players,
  settings,
  onPlayersChange,
  onSettingsChange,
  onStart,
}: Props) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const addPlayer = () => {
    const name = draft.trim()
    if (!name) return
    if (players.length >= MAX_PLAYERS) {
      setError(`Al massimo ${MAX_PLAYERS} giocatori.`)
      return
    }
    if (players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
      setError("C'è già un giocatore con questo nome.")
      return
    }
    onPlayersChange([...players, makePlayer(name)])
    setDraft('')
    setError(null)
  }

  const removePlayer = (id: string) => {
    onPlayersChange(players.filter((player) => player.id !== id))
    setError(null)
  }

  const togglePack = (packId: string) => {
    const packIds = settings.packIds.includes(packId)
      ? settings.packIds.filter((id) => id !== packId)
      : [...settings.packIds, packId]
    if (packIds.length === 0) return
    onSettingsChange({ ...settings, packIds })
  }

  const limit = maxImpostors(players.length)
  const impostorChoices = Array.from({ length: Math.max(1, limit) }, (_, i) => i + 1)
  const enoughPlayers = players.length >= MIN_PLAYERS

  return (
    <div className="stack-lg">
      <header className="stack">
        <h1>Impostor</h1>
        <p className="muted">
          Un solo telefono, che gira di mano in mano. Tutti leggono la parola segreta tranne gli
          impostori, che ricevono solo un indizio.
        </p>
      </header>

      <section className="card stack">
        <div className="row">
          <h2 className="grow">Giocatori</h2>
          <span className="progress">{players.length}</span>
        </div>

        <div className="row">
          <input
            type="text"
            value={draft}
            placeholder="Nome del giocatore"
            autoComplete="off"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addPlayer()
            }}
          />
          <button
            type="button"
            className="btn"
            style={{ width: 'auto', padding: '14px 18px' }}
            onClick={addPlayer}
          >
            Aggiungi
          </button>
        </div>
        {error && <p className="error">{error}</p>}

        <div className="stack">
          {players.map((player) => (
            <div key={player.id} className="player-row">
              <span>{player.name}</span>
              <button
                type="button"
                className="icon-btn"
                aria-label={`Togli ${player.name}`}
                onClick={() => removePlayer(player.id)}
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
          {impostorChoices.map((count) => (
            <button
              key={count}
              type="button"
              className="chip"
              aria-pressed={settings.impostorCount === count}
              onClick={() => onSettingsChange({ ...settings, impostorCount: count })}
            >
              {count}
            </button>
          ))}
        </div>
        <p className="muted">
          Con {players.length || '—'} giocatori puoi arrivare a {limit}{' '}
          {limit === 1 ? 'impostore' : 'impostori'}.
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
              onClick={() => togglePack(pack.id)}
            >
              {pack.name}
            </button>
          ))}
        </div>
      </section>

      <section className="stack">
        <button
          type="button"
          className="toggle"
          aria-pressed={settings.archetypesEnabled}
          onClick={() =>
            onSettingsChange({ ...settings, archetypesEnabled: !settings.archetypesEnabled })
          }
        >
          <span className="toggle-mark">{settings.archetypesEnabled ? '✓' : ''}</span>
          <span>
            <strong>Archetipi</strong>
            <br />
            <span className="muted">
              Ogni giocatore riceve un ruolo che lo obbliga a parlare in un certo modo.
            </span>
          </span>
        </button>

        <button
          type="button"
          className="toggle"
          aria-pressed={settings.clueForImpostors}
          onClick={() =>
            onSettingsChange({ ...settings, clueForImpostors: !settings.clueForImpostors })
          }
        >
          <span className="toggle-mark">{settings.clueForImpostors ? '✓' : ''}</span>
          <span>
            <strong>Indizio per gli impostori</strong>
            <br />
            <span className="muted">
              Spegnilo per una partita più difficile: gli impostori non sapranno nulla.
            </span>
          </span>
        </button>
      </section>

      <button type="button" className="btn" disabled={!enoughPlayers} onClick={onStart}>
        {enoughPlayers ? 'Comincia la partita' : `Servono almeno ${MIN_PLAYERS} giocatori`}
      </button>
    </div>
  )
}
