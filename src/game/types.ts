export type PlayerId = string

export interface Player {
  id: PlayerId
  name: string
}

export interface WordEntry {
  /** La parola segreta che conoscono i giocatori normali. */
  word: string
  /** L'indizio che legge l'impostore al posto della parola. */
  clue: string
}

export interface WordPack {
  id: string
  name: string
  entries: WordEntry[]
}

/** Su cosa mette le mani un archetipo. */
export type ArchetypeCategory = 'forma' | 'voce' | 'senso' | 'tavolo'

/**
 * Quanto un archetipo ti mette nei guai:
 * 1 fa solo ridere, 2 ti complica la parola, 3 può farti sembrare l'impostore.
 */
export type ArchetypeLevel = 1 | 2 | 3

export interface Archetype {
  id: string
  name: string
  /** Il vincolo, scritto rivolgendosi al giocatore. */
  rule: string
  emoji: string
  category: ArchetypeCategory
  level: ArchetypeLevel
  /** Vero se la regola guarda la parola detta dal giocatore precedente. */
  dependsOnPrevious?: boolean
}

export interface Settings {
  impostorCount: number
  packIds: string[]
  archetypesEnabled: boolean
  /** Fin dove si spinge la cattiveria degli archetipi. Se manca, valgono tutti. */
  maxArchetypeLevel?: ArchetypeLevel
  /** Se falso, l'impostore vede solo "sei l'impostore" senza indizio. */
  clueForImpostors: boolean
}

/** Quello che un singolo giocatore legge quando gli passano il telefono. */
export interface PlayerRole {
  playerId: PlayerId
  isImpostor: boolean
  /** La parola segreta, oppure null per l'impostore. */
  word: string | null
  /** L'indizio, oppure null per i giocatori normali. */
  clue: string | null
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
  entry: WordEntry
  packName: string
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
  /** L'impostore appena eliminato che sta tentando di indovinare. */
  guessingImpostorId: PlayerId | null
  winner: Winner | null
  /** Perché la partita è finita, in una frase. */
  endReason: string | null
}
