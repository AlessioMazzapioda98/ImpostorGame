import { CLASSI, SOTTOCLASSI } from './archetypes'
import { WORD_PACKS } from './words'
import type {
  Archetype,
  ArchetypeCard,
  GameState,
  Player,
  PlayerId,
  PlayerRole,
  Settings,
  VoteOutcome,
  WordEntry,
} from './types'

export type Rng = () => number

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 12

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Quanti impostori ha senso mettere: sempre meno della metà, così la partita parte. */
export function maxImpostors(playerCount: number): number {
  return Math.max(1, Math.floor(playerCount / 3))
}

function pickEntry(packIds: string[], rng: Rng): { entry: WordEntry; packName: string } {
  const packs = WORD_PACKS.filter((pack) => packIds.includes(pack.id))
  const usable = packs.length > 0 ? packs : WORD_PACKS
  const pool = usable.flatMap((pack) =>
    pack.entries.map((entry) => ({ entry, packName: pack.name })),
  )
  return pool[Math.floor(rng() * pool.length)]
}

/**
 * Una classe e una sottoclasse a testa, pescate da due mazzi mescolati e basta:
 * nessun bilanciamento, nessun tetto. Le classi che nominano qualcuno ricevono un
 * bersaglio sorteggiato fra gli altri giocatori.
 */
function assignArchetypeCards(
  players: Player[],
  rng: Rng,
): Record<PlayerId, ArchetypeCard> {
  const cards: Record<PlayerId, ArchetypeCard> = {}
  let classi = shuffle(CLASSI, rng)
  let sottoclassi = shuffle(SOTTOCLASSI, rng)

  for (const player of players) {
    // Con più giocatori che archetipi si rimescola e si ricomincia.
    if (classi.length === 0) classi = shuffle(CLASSI, rng)
    if (sottoclassi.length === 0) sottoclassi = shuffle(SOTTOCLASSI, rng)

    const classe = classi.pop() as Archetype
    const sottoclasse = sottoclassi.pop() as Archetype
    cards[player.id] = {
      classe,
      sottoclasse,
      targetName: classe.needsTarget ? pickTargetName(players, player.id, rng) : null,
    }
  }

  return cards
}

/** Il bersaglio di una classe: un altro giocatore a caso, mai te stesso. */
function pickTargetName(players: Player[], playerId: PlayerId, rng: Rng): string | null {
  const others = players.filter((player) => player.id !== playerId)
  if (others.length === 0) return null
  return others[Math.floor(rng() * others.length)].name
}

export function createGame(players: Player[], settings: Settings, rng: Rng = Math.random): GameState {
  const impostorCount = Math.min(
    Math.max(1, settings.impostorCount),
    maxImpostors(players.length),
  )
  const impostorIds = shuffle(players, rng)
    .slice(0, impostorCount)
    .map((player) => player.id)
  const { entry, packName } = pickEntry(settings.packIds, rng)
  const baseOrder = shuffle(players, rng).map((player) => player.id)

  return {
    phase: 'reveal',
    players,
    settings: { ...settings, impostorCount },
    entry,
    packName,
    impostorIds,
    archetypesByPlayer: settings.archetypesEnabled ? assignArchetypeCards(players, rng) : {},
    eliminatedIds: [],
    revealIndex: 0,
    round: 1,
    baseOrder,
    turnOrder: baseOrder,
    lastVote: null,
    guessingImpostorId: null,
    winner: null,
    endReason: null,
  }
}

export function isImpostor(state: GameState, playerId: PlayerId): boolean {
  return state.impostorIds.includes(playerId)
}

export function alivePlayers(state: GameState): Player[] {
  return state.players.filter((player) => !state.eliminatedIds.includes(player.id))
}

export function aliveImpostors(state: GameState): Player[] {
  return alivePlayers(state).filter((player) => isImpostor(state, player.id))
}

export function playerById(state: GameState, playerId: PlayerId): Player | undefined {
  return state.players.find((player) => player.id === playerId)
}

/** La carta che legge il giocatore di turno quando gli passano il telefono. */
export function roleFor(state: GameState, playerId: PlayerId): PlayerRole {
  const impostor = isImpostor(state, playerId)
  return {
    playerId,
    isImpostor: impostor,
    word: impostor ? null : state.entry.word,
    clue: impostor && state.settings.clueForImpostors ? state.entry.clue : null,
    fellowImpostorNames: impostor
      ? state.impostorIds
          .filter((id) => id !== playerId)
          .map((id) => playerById(state, id)?.name ?? '')
          .filter(Boolean)
      : [],
    archetypes: state.archetypesByPlayer[playerId] ?? null,
  }
}

/** Ordine di parola del giro: i vivi, ruotati di un posto a ogni giro. */
export function turnOrderForRound(state: GameState, round: number): PlayerId[] {
  const alive = state.baseOrder.filter((id) => !state.eliminatedIds.includes(id))
  if (alive.length === 0) return alive
  const offset = (round - 1) % alive.length
  return [...alive.slice(offset), ...alive.slice(0, offset)]
}

/** Passa la carta al giocatore successivo; finite le carte si comincia a parlare. */
export function advanceReveal(state: GameState): GameState {
  const next = state.revealIndex + 1
  if (next < state.players.length) {
    return { ...state, revealIndex: next }
  }
  return { ...state, revealIndex: state.players.length, phase: 'round' }
}

export function startVote(state: GameState): GameState {
  return { ...state, phase: 'vote' }
}

function settleAfterElimination(state: GameState): GameState {
  const impostorsLeft = aliveImpostors(state).length
  if (impostorsLeft === 0) {
    return {
      ...state,
      phase: 'gameOver',
      winner: 'crew',
      endReason: 'Tutti gli impostori sono stati scoperti.',
    }
  }
  const crewLeft = alivePlayers(state).length - impostorsLeft
  if (impostorsLeft >= crewLeft) {
    return {
      ...state,
      phase: 'gameOver',
      winner: 'impostors',
      endReason: 'Gli impostori sono rimasti in numero pari agli altri giocatori.',
    }
  }
  const round = state.round + 1
  return {
    ...state,
    phase: 'round',
    round,
    turnOrder: turnOrderForRound(state, round),
    lastVote: null,
  }
}

export function countVotes(votes: Record<PlayerId, PlayerId>): VoteOutcome {
  const tally: Record<PlayerId, number> = {}
  for (const targetId of Object.values(votes)) {
    tally[targetId] = (tally[targetId] ?? 0) + 1
  }
  const top = Math.max(0, ...Object.values(tally))
  const leaders = Object.keys(tally).filter((id) => tally[id] === top)
  const tie = top === 0 || leaders.length !== 1
  return { eliminatedId: tie ? null : leaders[0], tie, tally }
}

/** Applica il risultato della votazione e porta la partita allo stato successivo. */
export function applyVote(state: GameState, votes: Record<PlayerId, PlayerId>): GameState {
  const outcome = countVotes(votes)
  if (outcome.eliminatedId === null) {
    return { ...state, phase: 'voteResult', lastVote: outcome }
  }
  const eliminated = { ...state, eliminatedIds: [...state.eliminatedIds, outcome.eliminatedId] }
  return { ...eliminated, phase: 'voteResult', lastVote: outcome }
}

/** Dalla schermata del risultato: o l'impostore prova a indovinare, o si va avanti. */
export function continueFromVoteResult(state: GameState): GameState {
  const outcome = state.lastVote
  if (!outcome || outcome.eliminatedId === null) {
    const round = state.round + 1
    return {
      ...state,
      phase: 'round',
      round,
      turnOrder: turnOrderForRound(state, round),
      lastVote: null,
    }
  }
  if (isImpostor(state, outcome.eliminatedId)) {
    return { ...state, phase: 'guess', guessingImpostorId: outcome.eliminatedId }
  }
  return settleAfterElimination(state)
}

export function normalizeGuess(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function isCorrectGuess(state: GameState, guess: string): boolean {
  return normalizeGuess(guess) === normalizeGuess(state.entry.word) && normalizeGuess(guess) !== ''
}

/** Il tentativo dell'impostore eliminato: se indovina, vincono gli impostori. */
export function submitGuess(state: GameState, guess: string): GameState {
  if (isCorrectGuess(state, guess)) {
    const name = state.guessingImpostorId
      ? (playerById(state, state.guessingImpostorId)?.name ?? "L'impostore")
      : "L'impostore"
    return {
      ...state,
      phase: 'gameOver',
      winner: 'impostors',
      guessingImpostorId: null,
      endReason: `${name} è stato scoperto ma ha indovinato la parola segreta.`,
    }
  }
  return settleAfterElimination({ ...state, guessingImpostorId: null })
}
