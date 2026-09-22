export type PlayerId = string

export interface Player {
  id: PlayerId
  name: string
}

export interface WordPack {
  id: string
  /** Il nome della categoria: è anche l'indizio che legge l'impostore. */
  name: string
  entries: string[]
}

/** Come si vota in un giro. */
export type VoteMode = 'segreto' | 'palese'

/** Cosa si sceglie all'inizio: una delle due, oppure lascia scegliere alla sorte. */
export type VoteModeSetting = VoteMode | 'misto'

export interface Archetype {
  id: string
  name: string
  /** Il vincolo, scritto rivolgendosi al giocatore. */
  rule: string
  emoji: string
}

export interface Settings {
  impostorCount: number
  packIds: string[]
  archetypesEnabled: boolean
  /** Se falso, l'impostore vede solo "sei l'impostore", senza sapere la categoria. */
  clueForImpostors: boolean
  voteMode: VoteModeSetting
}

/** Quello che un singolo giocatore legge quando gli passano il telefono. */
export interface PlayerRole {
  playerId: PlayerId
  isImpostor: boolean
  /** La parola segreta, oppure null per l'impostore. */
  word: string | null
  /** La categoria della parola, l'indizio dell'impostore. Null per i normali. */
  category: string | null
  /** Gli altri impostori, visibili solo agli impostori. */
  fellowImpostorNames: string[]
  archetype: Archetype | null
}

export type Phase =
  | 'setup'
  | 'reveal'
  | 'round'
  | 'vote'
  | 'voteResult'
  | 'guess'
  | 'gameOver'

export type Winner = 'crew' | 'impostors'

export interface VoteOutcome {
  /** Chi è stato eliminato, oppure null in caso di pareggio. */
  eliminatedId: PlayerId | null
  tie: boolean
  tally: Record<PlayerId, number>
}

export interface GameState {
  phase: Phase
  players: Player[]
  settings: Settings
  /** La parola segreta della partita. */
  word: string
  /** La categoria da cui è stata pescata: l'indizio dell'impostore. */
  category: string
  impostorIds: PlayerId[]
  archetypeByPlayer: Record<PlayerId, Archetype>
  eliminatedIds: PlayerId[]
  /** Indice del giocatore a cui tocca leggere la carta, durante la consegna. */
  revealIndex: number
  round: number
  /** Ordine di parola estratto a inizio partita, tutti i giocatori. */
  baseOrder: PlayerId[]
  /** Ordine di parola del giro corrente, solo giocatori ancora in gioco. */
  turnOrder: PlayerId[]
  lastVote: VoteOutcome | null
  /** L'impostore appena eliminato che può tentare di indovinare. */
  guessingImpostorId: PlayerId | null
  /** Come si vota, giro per giro: estratto a inizio partita quando è "misto". */
  voteModeByRound: VoteMode[]
  winner: Winner | null
  /** Perché la partita è finita, in una frase. */
  endReason: string | null
}
