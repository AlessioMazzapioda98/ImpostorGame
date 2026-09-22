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

/** Un archetipo vincola come ti comporti (classe) o cosa puoi dire (sottoclasse). */
export type ArchetypeKind = 'classe' | 'sottoclasse'

export interface Archetype {
  id: string
  name: string
  /**
   * Il vincolo, scritto rivolgendosi al giocatore. Con `needsTarget` contiene
   * `{bersaglio}`: usa `archetypeRule` per leggerla col nome vero.
   */
  rule: string
  emoji: string
  kind: ArchetypeKind
  /** Vero se il gioco deve sorteggiare un altro giocatore da nominare nella regola. */
  needsTarget?: boolean
}

/** Quello che un giocatore si ritrova sulla carta: una classe e una sottoclasse. */
export interface ArchetypeCard {
  classe: Archetype
  sottoclasse: Archetype
  /** Chi la classe ti dice di accusare, difendere o sorvegliare. */
  targetName: string | null
}

export interface Settings {
  impostorCount: number
  packIds: string[]
  archetypesEnabled: boolean
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
  /** Classe e sottoclasse del giocatore, con il bersaglio della classe. */
  archetypes: ArchetypeCard | null
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
  archetypesByPlayer: Record<PlayerId, ArchetypeCard>
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
