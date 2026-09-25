import { CLASSI, SOTTOCLASSI, vuoleSottoclasse } from './archetypes'
import { MIN_PACKS_FOR_CLUE, WORD_PACKS } from './words'
import type {
  Archetype,
  ArchetypeCard,
  GameState,
  Player,
  PlayerId,
  PlayerRole,
  Settings,
  VoteMode,
  VoteOutcome,
} from './types'

export type Rng = () => number

/**
 * Sotto i quattro giocatori la partita è una votazione sola: se i due normali non
 * indovinano subito restano in due contro l'impostore e hanno già perso.
 */
export const MIN_PLAYERS = 4
export const MAX_PLAYERS = 12

/** Per quanti giri si estrae in anticipo il tipo di votazione. */
const VOTE_MODE_ROUNDS = 20

/**
 * Quanto resta aperta la carta di ogni giocatore, uguale per tutti. Serve a togliere
 * di mezzo un indizio che non c'entra niente con il gioco: chi ci mette più tempo a
 * leggere sembra l'impostore anche quando non lo è. Perché funzioni il conto alla
 * rovescia non si deve poter saltare, altrimenti chi chiude prima si tradisce
 * lo stesso, e deve bastare anche alla carta più lunga: quella di un impostore che
 * oltre al suo indizio legge i nomi dei complici e i due archetipi.
 */
export const REVEAL_SECONDS = 20

/**
 * Quanto tempo si ha per dire la propria parola prima di prendere un cartellino
 * giallo. Scaduto il tempo la parola si dice lo stesso, con comodo: il cartellino
 * è la penalità, non il silenzio.
 */
export const ANSWER_SECONDS = 15

/** Al secondo cartellino il giallo diventa rosso e il giocatore esce. */
export const RED_CARD_AT = 2

/**
 * Il tempo della carta è un'impostazione e non una costante perché si può spegnere,
 * ma chi la spegne deve sapere che riapre il buco: senza conto alla rovescia il
 * tempo di lettura torna a essere un indizio, e chi legge piano sembra l'impostore.
 */
export function revealSeconds(settings: Settings): number {
  return Math.max(0, settings.revealSeconds)
}

/** Vero quando il tempo di lettura può di nuovo tradire chi legge lentamente. */
export function revealTimerIsOff(settings: Settings): boolean {
  return revealSeconds(settings) === 0
}

/**
 * Il tempo per dire la propria parola. A zero non si prendono cartellini: il tempo
 * per leggere la carta e il tempo per dire la parola fanno due cose opposte di
 * proposito. Leggere è privato e non deve dire niente agli altri, quindi lì il
 * conto alla rovescia serve a nascondere. Parlare è pubblico e fa parte del gioco,
 * quindi lì il tempo è una penalità dichiarata invece di un sospetto sussurrato.
 */
export function answerSeconds(settings: Settings): number {
  return Math.max(0, settings.answerSeconds)
}

/** Vero quando si gioca senza limite di tempo per parlare, e quindi senza cartellini. */
export function cardsAreOff(settings: Settings): boolean {
  return answerSeconds(settings) === 0
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Il massimo consentito, due. Aggiungere impostori non aiuta mai il tavolo, per due
 * motivi che si sommano: allungano la partita, e più la partita dura più parole
 * sente l'impostore, finché la parola gliela regala il tavolo; e soprattutto votano
 * compatti sullo stesso innocente, mentre i normali che non hanno ancora capito
 * niente si sparpagliano. Con tre impostori i giocatori normali vincono meno di una
 * partita su dieci, per questo tre non si possono scegliere.
 */
export function maxImpostors(playerCount: number): number {
  return playerCount <= 5 ? 1 : 2
}

/**
 * Quanti impostori conviene mettere davvero, il valore che l'app propone.
 * Fino a sette giocatori uno solo basta e la partita resta corta. Da otto in su
 * due tengono vivo il tavolo, al prezzo di un paio di votazioni in più.
 */
export function suggestedImpostors(playerCount: number): number {
  return playerCount <= 7 ? 1 : 2
}

/**
 * L'indizio è la categoria, quindi vale qualcosa solo se le categorie in gioco
 * sono almeno due: con una sola la sanno già tutti.
 */
export function clueIsUseful(settings: Settings): boolean {
  return settings.clueForImpostors && settings.packIds.length >= MIN_PACKS_FOR_CLUE
}

/**
 * Estrae come si vota giro per giro. Il primo voto è sempre segreto, perché a mano
 * alzata senza ancora nessun indizio ci si accoderebbe soltanto al primo che parla.
 */
function rollVoteModes(setting: Settings['voteMode'], rng: Rng): VoteMode[] {
  if (setting !== 'misto') return Array.from({ length: VOTE_MODE_ROUNDS }, () => setting)
  return Array.from({ length: VOTE_MODE_ROUNDS }, (_, i) =>
    i === 0 || rng() < 0.5 ? 'segreto' : 'palese',
  )
}

/** Come si vota nel giro indicato. */
export function voteModeForRound(state: GameState, round: number): VoteMode {
  return state.voteModeByRound[round - 1] ?? 'segreto'
}

function pickWord(packIds: string[], rng: Rng): { word: string; category: string } {
  const packs = WORD_PACKS.filter((pack) => packIds.includes(pack.id))
  const usable = packs.length > 0 ? packs : WORD_PACKS
  const pool = usable.flatMap((pack) =>
    pack.entries.map((word) => ({ word, category: pack.name })),
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
    // Il Matto non pesca: la sua carta resta senza sottoclasse.
    const sottoclasse = vuoleSottoclasse(classe) ? (sottoclassi.pop() as Archetype) : null
    cards[player.id] = {
      classe,
      sottoclasse,
      targetName: classe.needsTarget ? pickTargetName(players, player.id, rng) : null,
      rerolled: false,
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

/** Fra i candidati, evita quelli già in mano ad altri e quello che hai adesso. */
function pickDifferent(
  pool: Archetype[],
  attuale: Archetype | null,
  inUso: Set<string>,
  rng: Rng,
): Archetype {
  const diversi = pool.filter((a) => a.id !== attuale?.id)
  const liberi = diversi.filter((a) => !inUso.has(a.id))
  // A tavolo pieno può non restare niente di libero: allora basta che cambi.
  const candidati = liberi.length > 0 ? liberi : diversi
  if (candidati.length === 0) return attuale as Archetype
  return candidati[Math.floor(rng() * candidati.length)]
}

/**
 * Il cambio di carta, mentre il giocatore sta leggendo la propria: ripesca classe e
 * sottoclasse e, se serve, un nuovo bersaglio. Si può fare una volta sola, e la carta
 * nuova non è mai uguale alla vecchia né a quella di un altro, finché ce n'è.
 */
export function rerollArchetypes(
  state: GameState,
  playerId: PlayerId,
  rng: Rng = Math.random,
): GameState {
  const card = state.archetypesByPlayer[playerId]
  if (!card || card.rerolled) return state

  const altrui = Object.entries(state.archetypesByPlayer).filter(([id]) => id !== playerId)
  const classiInUso = new Set(altrui.map(([, altra]) => altra.classe.id))
  const sottoclassiInUso = new Set(
    altrui.flatMap(([, altra]) => (altra.sottoclasse ? [altra.sottoclasse.id] : [])),
  )

  const classe = pickDifferent(CLASSI, card.classe, classiInUso, rng)
  // Chi si ritrova il Matto perde la sottoclasse, chi lo lascia se la ritrova.
  const sottoclasse = vuoleSottoclasse(classe)
    ? pickDifferent(SOTTOCLASSI, card.sottoclasse, sottoclassiInUso, rng)
    : null

  return {
    ...state,
    archetypesByPlayer: {
      ...state.archetypesByPlayer,
      [playerId]: {
        classe,
        sottoclasse,
        targetName: classe.needsTarget ? pickTargetName(state.players, playerId, rng) : null,
        rerolled: true,
      },
    },
  }
}

export function createGame(players: Player[], settings: Settings, rng: Rng = Math.random): GameState {
  const impostorCount = Math.min(
    Math.max(1, settings.impostorCount),
    maxImpostors(players.length),
  )
  const impostorIds = shuffle(players, rng)
    .slice(0, impostorCount)
    .map((player) => player.id)
  const { word, category } = pickWord(settings.packIds, rng)
  const baseOrder = shuffle(players, rng).map((player) => player.id)

  return {
    phase: 'reveal',
    players,
    settings: { ...settings, impostorCount },
    word,
    category,
    impostorIds,
    archetypesByPlayer: settings.archetypesEnabled ? assignArchetypeCards(players, rng) : {},
    eliminatedIds: [],
    revealIndex: 0,
    round: 1,
    baseOrder,
    turnOrder: baseOrder,
    lastVote: null,
    guessingImpostorId: null,
    wheelPickedId: null,
    voteModeByRound: rollVoteModes(settings.voteMode, rng),
    yellowCards: {},
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
    word: impostor ? null : state.word,
    category: impostor && state.settings.clueForImpostors ? state.category : null,
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
  return {
    eliminatedId: tie ? null : leaders[0],
    tie,
    tally,
    tiedIds: tie ? leaders : [],
  }
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

/**
 * Cosa succede dopo che un giocatore è uscito, per voto o per cartellino rosso.
 * Le conseguenze sono le stesse: chi esce è uscito, e se era l'ultimo impostore
 * ha comunque il suo tentativo sulla parola.
 */
function resolveElimination(state: GameState, eliminatedId: PlayerId): GameState {
  if (isImpostor(state, eliminatedId) && aliveImpostors(state).length === 0) {
    return { ...state, phase: 'guess', guessingImpostorId: eliminatedId }
  }
  return settleAfterElimination(state)
}

/** Il giro successivo, quando la votazione non ha portato nessuno fuori. */
function nextRound(state: GameState): GameState {
  const round = state.round + 1
  return {
    ...state,
    phase: 'round',
    round,
    turnOrder: turnOrderForRound(state, round),
    lastVote: null,
    wheelPickedId: null,
  }
}

/**
 * Dalla schermata del risultato. Se qualcuno è stato votato si va avanti con lui;
 * se c'è stato un pareggio decide la ruota fra i pari merito. Un pareggio senza
 * nessun pari merito esiste solo se non ha votato nessuno, e lì non c'è niente da
 * estrarre.
 */
export function continueFromVoteResult(state: GameState): GameState {
  const outcome = state.lastVote
  if (!outcome) return nextRound(state)
  if (outcome.eliminatedId !== null) return resolveElimination(state, outcome.eliminatedId)
  if (outcome.tiedIds.length >= 2) return { ...state, phase: 'wheel', wheelPickedId: null }
  return nextRound(state)
}

/**
 * La ruota della fortuna: fra i pari merito ne esce uno a caso, e da lì la partita
 * prosegue come dopo una qualsiasi eliminazione.
 *
 * Toglie di mezzo il giro a vuoto che seguiva ogni pareggio, e quel giro a vuoto
 * era tutto a vantaggio degli impostori, perché un giro in più vuol dire altre
 * parole vere da cui capire la parola. In cambio il sorteggio pesca fra i pari
 * merito, che sono più spesso innocenti che impostori, semplicemente perché gli
 * innocenti sono di più.
 */
export function drawFromWheel(state: GameState, rng: Rng = Math.random): GameState {
  const candidati = state.lastVote?.tiedIds ?? []
  if (candidati.length === 0) return state
  return {
    ...state,
    wheelPickedId: candidati[Math.floor(rng() * candidati.length)],
  }
}

/**
 * Applica l'estrazione. È separata dal sorteggio perché la schermata deve poter
 * far girare la ruota sapendo già dove si fermerà: chi esce lo decide il motore,
 * l'animazione lo racconta e basta.
 */
export function continueFromWheel(state: GameState): GameState {
  const scelto = state.wheelPickedId
  if (!scelto) return nextRound(state)
  return resolveElimination(
    { ...state, eliminatedIds: [...state.eliminatedIds, scelto] },
    scelto,
  )
}

/** Sorteggio ed esito in un colpo solo, comodo fuori dalla schermata. */
export function spinWheel(state: GameState, rng: Rng = Math.random): GameState {
  const estratto = drawFromWheel(state, rng)
  if (!estratto.wheelPickedId) return nextRound(state)
  return continueFromWheel(estratto)
}

/** Quanti cartellini ha preso un giocatore. */
export function yellowCardsOf(state: GameState, playerId: PlayerId): number {
  return state.yellowCards[playerId] ?? 0
}

/** Vero se il prossimo cartellino di questo giocatore sarebbe quello rosso. */
export function isOnLastWarning(state: GameState, playerId: PlayerId): boolean {
  return yellowCardsOf(state, playerId) === RED_CARD_AT - 1
}

/**
 * Dà un cartellino a chi non ha detto la parola in tempo. Il secondo è rosso e porta
 * fuori il giocatore, con le stesse conseguenze di un'eliminazione per voto.
 *
 * Attenzione a quanto stretto si mette il tempo: l'impostore la parola se la deve
 * inventare partendo da un indizio, quindi ci mette di più, e un tempo corto lo
 * manda fuori da solo senza che il tavolo debba indovinare niente. Vale anche al
 * contrario per un innocente a cui è toccato un archetipo difficile.
 */
export function giveYellowCard(state: GameState, playerId: PlayerId): GameState {
  if (state.eliminatedIds.includes(playerId)) return state
  const cards = yellowCardsOf(state, playerId) + 1
  const withCard = { ...state, yellowCards: { ...state.yellowCards, [playerId]: cards } }
  if (cards < RED_CARD_AT) return withCard
  return resolveElimination(
    { ...withCard, eliminatedIds: [...withCard.eliminatedIds, playerId] },
    playerId,
  )
}

export function normalizeGuess(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function isCorrectGuess(state: GameState, guess: string): boolean {
  return normalizeGuess(guess) === normalizeGuess(state.word) && normalizeGuess(guess) !== ''
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
