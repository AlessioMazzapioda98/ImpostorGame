import { describe, expect, it } from 'vitest'
import { ARCHETYPES, CLASSI, SOTTOCLASSI, archetypeRule } from './archetypes'
import {
  ANSWER_SECONDS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  RED_CARD_AT,
  REVEAL_SECONDS,
  alivePlayers,
  applyVote,
  continueFromVoteResult,
  countVotes,
  createGame,
  isCorrectGuess,
  maxImpostors,
  roleFor,
  continueFromWheel,
  drawFromWheel,
  spinWheel,
  submitGuess,
  suggestedImpostors,
  turnOrderForRound,
  cardsAreOff,
  clueIsUseful,
  giveYellowCard,
  isOnLastWarning,
  revealTimerIsOff,
  voteModeForRound,
  yellowCardsOf,
} from './engine'
import type { Player, Settings } from './types'

const PLAYERS: Player[] = ['Alessio', 'Bea', 'Carlo', 'Dana', 'Enzo', 'Fabio'].map((name, i) => ({
  id: `p${i}`,
  name,
}))

const SETTINGS: Settings = {
  impostorCount: 2,
  packIds: ['cibo'],
  archetypesEnabled: true,
  clueForImpostors: true,
  voteMode: 'misto',
  revealSeconds: REVEAL_SECONDS,
  answerSeconds: ANSWER_SECONDS,
}

/** Random prevedibile, così le partite di prova sono sempre identiche. */
function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function newGame() {
  return createGame(PLAYERS, SETTINGS, seeded(7))
}

describe('creazione della partita', () => {
  it('assegna il numero di impostori richiesto', () => {
    const state = newGame()
    expect(state.impostorIds).toHaveLength(2)
    expect(new Set(state.impostorIds).size).toBe(2)
  })

  it('non assegna mai metà o più dei giocatori come impostori', () => {
    for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count++) {
      expect(maxImpostors(count)).toBeLessThan(count / 2)
      expect(maxImpostors(count)).toBeGreaterThanOrEqual(1)
    }
  })

  it('consiglia un numero di impostori che non supera mai il massimo', () => {
    for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count++) {
      expect(suggestedImpostors(count)).toBeLessThanOrEqual(maxImpostors(count))
      expect(suggestedImpostors(count)).toBeGreaterThanOrEqual(1)
    }
    expect(suggestedImpostors(6)).toBe(1)
    expect(suggestedImpostors(9)).toBe(2)
    expect(suggestedImpostors(12)).toBe(2)
  })

  it('riduce gli impostori se ne sono stati chiesti troppi', () => {
    const state = createGame(PLAYERS.slice(0, 3), { ...SETTINGS, impostorCount: 3 }, seeded(1))
    expect(state.impostorIds).toHaveLength(1)
  })

  it('dà un archetipo a ogni giocatore quando sono attivi', () => {
    const state = newGame()
    expect(Object.keys(state.archetypesByPlayer)).toHaveLength(PLAYERS.length)
  })

  it('non dà archetipi quando sono spenti', () => {
    const state = createGame(PLAYERS, { ...SETTINGS, archetypesEnabled: false }, seeded(7))
    expect(state.archetypesByPlayer).toEqual({})
  })
})

describe('la carta di ogni giocatore', () => {
  it("dà la parola ai normali e l'indizio agli impostori", () => {
    const state = newGame()
    const impostorId = state.impostorIds[0]
    const crewId = PLAYERS.map((p) => p.id).find((id) => !state.impostorIds.includes(id))!

    const impostorRole = roleFor(state, impostorId)
    expect(impostorRole.word).toBeNull()
    expect(impostorRole.category).toBe(state.category)

    const crewRole = roleFor(state, crewId)
    expect(crewRole.word).toBe(state.word)
    expect(crewRole.category).toBeNull()
  })

  it('mostra a un impostore chi sono gli altri impostori, e solo a lui', () => {
    const state = newGame()
    const [first, second] = state.impostorIds
    const crewId = PLAYERS.map((p) => p.id).find((id) => !state.impostorIds.includes(id))!

    expect(roleFor(state, first).fellowImpostorNames).toEqual([
      PLAYERS.find((p) => p.id === second)!.name,
    ])
    expect(roleFor(state, crewId).fellowImpostorNames).toEqual([])
  })

  it("nasconde l'indizio quando l'impostazione è spenta", () => {
    const state = createGame(PLAYERS, { ...SETTINGS, clueForImpostors: false }, seeded(7))
    expect(roleFor(state, state.impostorIds[0]).category).toBeNull()
  })
})

describe('votazione', () => {
  it('elimina chi prende più voti', () => {
    const outcome = countVotes({ p0: 'p2', p1: 'p2', p2: 'p1' })
    expect(outcome.eliminatedId).toBe('p2')
    expect(outcome.tie).toBe(false)
  })

  it('il voto da solo non elimina nessuno in caso di pareggio', () => {
    const outcome = countVotes({ p0: 'p1', p1: 'p0' })
    expect(outcome.tie).toBe(true)
    expect(outcome.eliminatedId).toBeNull()
    expect(outcome.tiedIds.sort()).toEqual(['p0', 'p1'])
  })

  it('non fa tentare il primo impostore scoperto se ne restano altri in gioco', () => {
    const state = newGame()
    const impostorId = state.impostorIds[0]
    const voted = applyVote(state, Object.fromEntries(PLAYERS.map((p) => [p.id, impostorId])))
    expect(voted.eliminatedIds).toContain(impostorId)
    expect(continueFromVoteResult(voted).phase).toBe('round')
  })

  it("manda al tentativo quando cade l'ultimo impostore rimasto", () => {
    let state = newGame()
    const [first, second] = state.impostorIds
    state = continueFromVoteResult(
      applyVote(state, Object.fromEntries(alivePlayers(state).map((p) => [p.id, first]))),
    )
    const last = applyVote(
      state,
      Object.fromEntries(alivePlayers(state).map((p) => [p.id, second])),
    )
    const next = continueFromVoteResult(last)
    expect(next.phase).toBe('guess')
    expect(next.guessingImpostorId).toBe(second)
  })

  it('torna a giocare quando viene eliminato un giocatore normale', () => {
    const state = newGame()
    const crewId = PLAYERS.map((p) => p.id).find((id) => !state.impostorIds.includes(id))!
    const voted = applyVote(state, Object.fromEntries(PLAYERS.map((p) => [p.id, crewId])))
    const next = continueFromVoteResult(voted)
    expect(next.phase).toBe('round')
    expect(alivePlayers(next)).toHaveLength(PLAYERS.length - 1)
  })
})

describe('fine della partita', () => {
  it("gli impostori vincono se l'ultimo scoperto indovina la parola", () => {
    let state = createGame(PLAYERS, { ...SETTINGS, impostorCount: 1 }, seeded(7))
    const impostorId = state.impostorIds[0]
    const voted = applyVote(state, Object.fromEntries(PLAYERS.map((p) => [p.id, impostorId])))
    const guessing = continueFromVoteResult(voted)
    expect(guessing.phase).toBe('guess')
    const end = submitGuess(guessing, state.word)
    expect(end.phase).toBe('gameOver')
    expect(end.winner).toBe('impostors')
  })

  it('la parola si indovina anche senza accenti e maiuscole', () => {
    const state = newGame()
    expect(isCorrectGuess(state, ` ${state.word.toUpperCase()} `)).toBe(true)
    expect(isCorrectGuess(state, 'qualcosaltro')).toBe(false)
    expect(isCorrectGuess(state, '')).toBe(false)
  })

  it('i giocatori normali vincono quando cade anche il secondo impostore', () => {
    let state = newGame()
    for (const impostorId of state.impostorIds) {
      const votes = Object.fromEntries(
        alivePlayers(state).map((player) => [player.id, impostorId]),
      )
      state = continueFromVoteResult(applyVote(state, votes))
      if (state.phase === 'guess') state = submitGuess(state, 'parola sbagliata')
    }
    expect(state.phase).toBe('gameOver')
    expect(state.winner).toBe('crew')
  })

  it('gli impostori vincono quando restano in parità numerica', () => {
    let state = createGame(PLAYERS.slice(0, 5), { ...SETTINGS, impostorCount: 1 }, seeded(3))
    const crewIds = PLAYERS.slice(0, 5)
      .map((p) => p.id)
      .filter((id) => !state.impostorIds.includes(id))
    for (const crewId of crewIds.slice(0, 3)) {
      const votes = Object.fromEntries(alivePlayers(state).map((p) => [p.id, crewId]))
      state = continueFromVoteResult(applyVote(state, votes))
    }
    expect(state.phase).toBe('gameOver')
    expect(state.winner).toBe('impostors')
  })
})

describe('ordine di parola', () => {
  it('salta gli eliminati e cambia chi comincia a ogni giro', () => {
    const state = newGame()
    const eliminated = { ...state, eliminatedIds: [state.baseOrder[0]] }
    const order = turnOrderForRound(eliminated, 2)
    expect(order).not.toContain(state.baseOrder[0])
    expect(order).toHaveLength(PLAYERS.length - 1)
    expect(turnOrderForRound(eliminated, 1)[0]).not.toBe(order[0])
  })
})

describe("l'indizio della categoria", () => {
  it('non serve a niente quando è attiva una categoria sola', () => {
    expect(clueIsUseful({ ...SETTINGS, packIds: ['cibo'] })).toBe(false)
    expect(clueIsUseful({ ...SETTINGS, packIds: ['cibo', 'animali'] })).toBe(true)
  })

  it('resta spento se il gruppo lo ha spento', () => {
    expect(
      clueIsUseful({ ...SETTINGS, packIds: ['cibo', 'animali'], clueForImpostors: false }),
    ).toBe(false)
  })

  it("dà all'impostore la categoria da cui è uscita la parola", () => {
    const state = createGame(PLAYERS, { ...SETTINGS, packIds: ['cibo'] }, seeded(7))
    expect(roleFor(state, state.impostorIds[0]).category).toBe(state.category)
    expect(state.category).toBe('Cibo e bevande')
  })
})

describe('come si vota', () => {
  it('rispetta la scelta fissa del gruppo', () => {
    const palese = createGame(PLAYERS, { ...SETTINGS, voteMode: 'palese' }, seeded(7))
    for (let round = 1; round <= 5; round++) {
      expect(voteModeForRound(palese, round)).toBe('palese')
    }
  })

  it('con il misto tiene segreto il primo voto e poi cambia', () => {
    const misto = createGame(PLAYERS, { ...SETTINGS, voteMode: 'misto' }, seeded(7))
    expect(voteModeForRound(misto, 1)).toBe('segreto')
    const modes = new Set(
      Array.from({ length: 20 }, (_, i) => voteModeForRound(misto, i + 1)),
    )
    expect(modes.has('palese')).toBe(true)
  })

  it('resta lo stesso se si rilegge lo stesso giro', () => {
    const misto = createGame(PLAYERS, { ...SETTINGS, voteMode: 'misto' }, seeded(11))
    const first = Array.from({ length: 8 }, (_, i) => voteModeForRound(misto, i + 1))
    const second = Array.from({ length: 8 }, (_, i) => voteModeForRound(misto, i + 1))
    expect(second).toEqual(first)
  })
})

describe('il tempo della carta', () => {
  it('è uguale per tutti e si può spegnere', () => {
    expect(revealTimerIsOff(SETTINGS)).toBe(false)
    expect(revealTimerIsOff({ ...SETTINGS, revealSeconds: 0 })).toBe(true)
  })
})

describe('archetipi', () => {
  const MANY: Player[] = Array.from({ length: 12 }, (_, i) => ({
    id: `q${i}`,
    name: `Giocatore ${i + 1}`,
  }))

  function gamesOverSeeds(players: Player[], settings: Settings) {
    return Array.from({ length: 60 }, (_, seed) => createGame(players, settings, seeded(seed + 1)))
  }

  it('non ha archetipi con lo stesso id', () => {
    const ids = ARCHETYPES.map((archetype) => archetype.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('tiene classi e sottoclassi in numero pari', () => {
    expect(CLASSI.length).toBe(SOTTOCLASSI.length)
    expect(CLASSI.length + SOTTOCLASSI.length).toBe(ARCHETYPES.length)
  })

  it('ha abbastanza classi e sottoclassi per un tavolo pieno', () => {
    expect(CLASSI.length).toBeGreaterThanOrEqual(MAX_PLAYERS)
    expect(SOTTOCLASSI.length).toBeGreaterThanOrEqual(MAX_PLAYERS)
  })

  it('solo le classi possono avere un bersaglio', () => {
    expect(SOTTOCLASSI.every((archetype) => !archetype.needsTarget)).toBe(true)
  })

  it('scrive il segnaposto del bersaglio in tutte e sole le regole che ne hanno uno', () => {
    for (const archetype of ARCHETYPES) {
      expect(archetype.rule.includes('{bersaglio}')).toBe(Boolean(archetype.needsTarget))
    }
  })

  it('mette il nome del bersaglio nella regola, senza lasciare segnaposti', () => {
    const conBersaglio = CLASSI.filter((archetype) => archetype.needsTarget)
    for (const archetype of conBersaglio) {
      const regola = archetypeRule(archetype, 'Bea')
      expect(regola).toContain('Bea')
      expect(regola).not.toContain('{bersaglio}')
    }
  })

  it('dà a ogni giocatore una classe e una sottoclasse diverse dalle altre', () => {
    for (const state of gamesOverSeeds(MANY, SETTINGS)) {
      const carte = Object.values(state.archetypesByPlayer)
      expect(carte).toHaveLength(MANY.length)
      expect(new Set(carte.map((c) => c.classe.id)).size).toBe(MANY.length)
      expect(new Set(carte.map((c) => c.sottoclasse.id)).size).toBe(MANY.length)
      for (const carta of carte) {
        expect(carta.classe.kind).toBe('classe')
        expect(carta.sottoclasse.kind).toBe('sottoclasse')
      }
    }
  })

  it('sorteggia un bersaglio solo per le classi che lo chiedono, e mai te stesso', () => {
    for (const state of gamesOverSeeds(PLAYERS, SETTINGS)) {
      for (const player of state.players) {
        const carta = state.archetypesByPlayer[player.id]
        if (!carta.classe.needsTarget) {
          expect(carta.targetName).toBeNull()
          continue
        }
        expect(carta.targetName).not.toBeNull()
        expect(carta.targetName).not.toBe(player.name)
        expect(state.players.map((p) => p.name)).toContain(carta.targetName)
      }
    }
  })

  it('pesca a caso, quindi prima o poi escono tutti', () => {
    const usciti = new Set<string>()
    for (const state of gamesOverSeeds(MANY, SETTINGS)) {
      for (const carta of Object.values(state.archetypesByPlayer)) {
        usciti.add(carta.classe.id)
        usciti.add(carta.sottoclasse.id)
      }
    }
    expect(usciti.size).toBe(ARCHETYPES.length)
  })
})

describe('ruota della fortuna', () => {
  it('dopo un pareggio si va alla ruota invece che al giro successivo', () => {
    const state = newGame()
    const voted = applyVote(state, { p0: 'p1', p1: 'p0' })
    expect(voted.eliminatedIds).toHaveLength(0)
    const next = continueFromVoteResult(voted)
    expect(next.phase).toBe('wheel')
    expect(next.lastVote?.tiedIds.sort()).toEqual(['p0', 'p1'])
  })

  it("l'estrazione e l'esito sono due passi separati, così la schermata sa dove fermarsi", () => {
    const state = newGame()
    const alRuota = continueFromVoteResult(applyVote(state, { p0: 'p1', p1: 'p0' }))
    const estratto = drawFromWheel(alRuota, seeded(3))
    expect(estratto.phase).toBe('wheel')
    expect(estratto.eliminatedIds).toHaveLength(0)
    const dopo = continueFromWheel(estratto)
    expect(dopo.eliminatedIds).toEqual([estratto.wheelPickedId])
  })

  it('estrae uno fra i pari merito e lo manda fuori', () => {
    const state = newGame()
    const alRuota = continueFromVoteResult(applyVote(state, { p0: 'p1', p1: 'p0' }))
    const dopo = spinWheel(alRuota, seeded(3))
    expect(['p0', 'p1']).toContain(dopo.wheelPickedId!)
    expect(dopo.eliminatedIds).toEqual([dopo.wheelPickedId])
    expect(alivePlayers(dopo)).toHaveLength(PLAYERS.length - 1)
  })

  it('non estrae mai qualcuno che non era a pari merito', () => {
    const state = newGame()
    // Tre giocatori con un voto a testa: pari merito in tre.
    const alRuota = continueFromVoteResult(applyVote(state, { p0: 'p3', p1: 'p4', p2: 'p5' }))
    const pari = alRuota.lastVote!.tiedIds
    expect(pari.sort()).toEqual(['p3', 'p4', 'p5'])
    for (let s = 0; s < 40; s++) {
      expect(pari).toContain(spinWheel(alRuota, seeded(s)).wheelPickedId!)
    }
  })

  it("manda al tentativo se la ruota pesca l'ultimo impostore", () => {
    const state = createGame(PLAYERS, { ...SETTINGS, impostorCount: 1 }, seeded(7))
    const impostorId = state.impostorIds[0]
    const crewId = PLAYERS.map((p) => p.id).find((id) => id !== impostorId)!
    const alRuota = continueFromVoteResult(
      applyVote(state, { p0: impostorId, p1: crewId } as Record<string, string>),
    )
    expect(alRuota.phase).toBe('wheel')
    // Con due pari merito, uno dei due semi pesca l'impostore.
    const esiti = Array.from({ length: 20 }, (_, i) => spinWheel(alRuota, seeded(i)))
    const pescatoImpostore = esiti.find((e) => e.wheelPickedId === impostorId)
    expect(pescatoImpostore?.phase).toBe('guess')
    expect(pescatoImpostore?.guessingImpostorId).toBe(impostorId)
  })

  it('se non ha votato nessuno non c\'è niente da estrarre e si va avanti', () => {
    const state = newGame()
    const vuoto = applyVote(state, {})
    const next = continueFromVoteResult(vuoto)
    expect(next.phase).toBe('round')
    expect(next.round).toBe(2)
  })
})

describe('cartellini', () => {
  it('si spengono insieme al limite di tempo per parlare', () => {
    expect(cardsAreOff(SETTINGS)).toBe(false)
    expect(cardsAreOff({ ...SETTINGS, answerSeconds: 0 })).toBe(true)
  })

  it('il primo cartellino avverte e basta', () => {
    const state = newGame()
    const id = PLAYERS[0].id
    const dopo = giveYellowCard(state, id)
    expect(yellowCardsOf(dopo, id)).toBe(1)
    expect(isOnLastWarning(dopo, id)).toBe(RED_CARD_AT === 2)
    expect(dopo.eliminatedIds).not.toContain(id)
    expect(dopo.phase).toBe('reveal')
  })

  it('il secondo cartellino porta fuori il giocatore', () => {
    let state = newGame()
    const crewId = PLAYERS.map((p) => p.id).find((id) => !state.impostorIds.includes(id))!
    for (let i = 0; i < RED_CARD_AT; i++) state = giveYellowCard(state, crewId)
    expect(state.eliminatedIds).toContain(crewId)
    expect(alivePlayers(state)).toHaveLength(PLAYERS.length - 1)
  })

  it("l'ultimo impostore che esce per cartellino rosso può comunque tentare la parola", () => {
    let state = createGame(PLAYERS, { ...SETTINGS, impostorCount: 1 }, seeded(7))
    const impostorId = state.impostorIds[0]
    for (let i = 0; i < RED_CARD_AT; i++) state = giveYellowCard(state, impostorId)
    expect(state.phase).toBe('guess')
    expect(state.guessingImpostorId).toBe(impostorId)
  })

  it('i cartellini di un giocatore già fuori non contano', () => {
    let state = newGame()
    const crewId = PLAYERS.map((p) => p.id).find((id) => !state.impostorIds.includes(id))!
    for (let i = 0; i < RED_CARD_AT; i++) state = giveYellowCard(state, crewId)
    const invariato = giveYellowCard(state, crewId)
    expect(invariato).toBe(state)
  })

  it('i cartellini restano per tutta la partita, non si azzerano a ogni giro', () => {
    const state = newGame()
    const id = PLAYERS[0].id
    const dopoPrimo = giveYellowCard(state, id)
    const giroNuovo = { ...dopoPrimo, round: dopoPrimo.round + 1 }
    expect(yellowCardsOf(giroNuovo, id)).toBe(1)
  })
})
