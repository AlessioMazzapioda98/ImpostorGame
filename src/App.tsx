import { useEffect, useState } from 'react'
import {
  advanceReveal,
  rerollArchetypes,
  applyVote,
  continueFromVoteResult,
  createGame,
  startVote,
  submitGuess,
  ANSWER_SECONDS,
  REVEAL_SECONDS,
  revealSeconds,
  voteModeForRound,
} from './game/engine'
import { DEFAULT_PACK_IDS } from './game/words'
import type { GameState, Player, PlayerId, Settings } from './game/types'
import { SetupScreen } from './screens/SetupScreen'
import { RevealScreen } from './screens/RevealScreen'
import { RoundScreen } from './screens/RoundScreen'
import { VoteScreen } from './screens/VoteScreen'
import { VoteResultScreen } from './screens/VoteResultScreen'
import { GuessScreen } from './screens/GuessScreen'
import { GameOverScreen } from './screens/GameOverScreen'
import { Conferma } from './ui/Conferma'
import { TopBar } from './ui/TopBar'
import { caricaUiPrefs, salvaUiPrefs, type UiPrefs } from './ui/preferences'
import { impostaVibrazioni } from './ui/haptics'
import { useKeepAwake } from './ui/useKeepAwake'

const STORAGE_KEY = 'impostor-setup-v1'

const DEFAULT_SETTINGS: Settings = {
  impostorCount: 1,
  packIds: DEFAULT_PACK_IDS,
  archetypesEnabled: true,
  clueForImpostors: true,
  voteMode: 'misto',
  revealSeconds: REVEAL_SECONDS,
  answerSeconds: ANSWER_SECONDS,
}

/** I giocatori e le impostazioni restano salvati, così la partita dopo parte subito. */
function loadSetup(): { players: Player[]; settings: Settings } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { players: [], settings: DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as { players?: Player[]; settings?: Partial<Settings> }
    return {
      players: Array.isArray(parsed.players) ? parsed.players : [],
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    }
  } catch {
    return { players: [], settings: DEFAULT_SETTINGS }
  }
}

export function App() {
  const [saved] = useState(loadSetup)
  const [players, setPlayers] = useState<Player[]>(saved.players)
  const [settings, setSettings] = useState<Settings>(saved.settings)
  const [uiPrefs, setUiPrefs] = useState<UiPrefs>(caricaUiPrefs)
  const [game, setGame] = useState<GameState | null>(null)
  const [chiedeUscita, setChiedeUscita] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ players, settings }))
    } catch {
      // Se il telefono non ci fa salvare nulla, pazienza: si riparte da zero.
    }
  }, [players, settings])

  useEffect(() => {
    salvaUiPrefs(uiPrefs)
    impostaVibrazioni(uiPrefs.vibrazioni)
  }, [uiPrefs])

  // A partita in corso lo schermo non deve spegnersi mentre si discute.
  useKeepAwake(game !== null)

  const start = () => setGame(createGame(players, settings))

  if (!game) {
    return (
      <div className="app">
        <SetupScreen
          players={players}
          settings={settings}
          uiPrefs={uiPrefs}
          onPlayersChange={setPlayers}
          onSettingsChange={setSettings}
          onUiPrefsChange={setUiPrefs}
          onStart={start}
        />
      </div>
    )
  }

  const handleVotes = (votes: Record<PlayerId, PlayerId>) => setGame(applyVote(game, votes))

  // La chiave fa ripartire l'animazione a ogni schermata nuova e, in consegna,
  // a ogni giocatore: così il passaggio del telefono si vede anche da lontano.
  const chiave = game.phase === 'reveal' ? `reveal-${game.revealIndex}` : game.phase

  return (
    <div className="app">
      <TopBar state={game} onEsci={() => setChiedeUscita(true)} />

      <div key={chiave} className="transizione">
        {game.phase === 'reveal' && (
          <RevealScreen
            state={game}
            tieniPremuto={uiPrefs.tieniPremuto}
            secondiCarta={revealSeconds(game.settings)}
            onNext={() => setGame(advanceReveal(game))}
            onReroll={() => setGame(rerollArchetypes(game, game.players[game.revealIndex].id))}
          />
        )}
        {game.phase === 'round' && (
          <RoundScreen state={game} onState={setGame} onVote={() => setGame(startVote(game))} />
        )}
        {game.phase === 'vote' && (
          <VoteScreen
            state={game}
            modalita={voteModeForRound(game, game.round)}
            onDone={handleVotes}
          />
        )}
        {game.phase === 'voteResult' && (
          <VoteResultScreen state={game} onContinue={() => setGame(continueFromVoteResult(game))} />
        )}
        {game.phase === 'guess' && (
          <GuessScreen state={game} onGuess={(guess) => setGame(submitGuess(game, guess))} />
        )}
        {game.phase === 'gameOver' && (
          <GameOverScreen state={game} onPlayAgain={start} onNewGame={() => setGame(null)} />
        )}
      </div>

      {chiedeUscita && (
        <Conferma
          titolo="Chiudere la partita?"
          testo="Il giro in corso va perso, ma i giocatori e le impostazioni restano al loro posto."
          conferma="Sì, chiudi la partita"
          annulla="No, torno a giocare"
          onConferma={() => {
            setChiedeUscita(false)
            setGame(null)
          }}
          onAnnulla={() => setChiedeUscita(false)}
        />
      )}
    </div>
  )
}
