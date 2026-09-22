import { useEffect, useState } from 'react'
import {
  advanceReveal,
  applyVote,
  continueFromVoteResult,
  createGame,
  startVote,
  submitGuess,
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

const STORAGE_KEY = 'impostor-setup-v1'

const DEFAULT_SETTINGS: Settings = {
  impostorCount: 1,
  packIds: DEFAULT_PACK_IDS,
  archetypesEnabled: true,
  clueForImpostors: true,
  voteMode: 'misto',
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
  const [game, setGame] = useState<GameState | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ players, settings }))
    } catch {
      // Se il telefono non ci fa salvare nulla, pazienza: si riparte da zero.
    }
  }, [players, settings])

  const start = () => setGame(createGame(players, settings))

  if (!game) {
    return (
      <div className="app">
        <SetupScreen
          players={players}
          settings={settings}
          onPlayersChange={setPlayers}
          onSettingsChange={setSettings}
          onStart={start}
        />
      </div>
    )
  }

  const handleVotes = (votes: Record<PlayerId, PlayerId>) => setGame(applyVote(game, votes))

  return (
    <div className="app">
      {game.phase === 'reveal' && (
        <RevealScreen state={game} onNext={() => setGame(advanceReveal(game))} />
      )}
      {game.phase === 'round' && (
        <RoundScreen state={game} onVote={() => setGame(startVote(game))} />
      )}
      {game.phase === 'vote' && <VoteScreen state={game} onDone={handleVotes} />}
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
  )
}
