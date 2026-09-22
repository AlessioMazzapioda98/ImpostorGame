import { describe, expect, it } from 'vitest'
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  alivePlayers,
  applyVote,
  continueFromVoteResult,
  countVotes,
  createGame,
  isCorrectGuess,
  maxImpostors,
  roleFor,
  submitGuess,
  suggestedImpostors,
  turnOrderForRound,
  clueIsUseful,
  revealTimerIsOff,
  voteModeForRound,
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
  revealSeconds: 15,
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
    expect(Object.keys(state.archetypeByPlayer)).toHaveLength(PLAYERS.length)
  })

  it('non dà archetipi quando sono spenti', () => {
    const state = createGame(PLAYERS, { ...SETTINGS, archetypesEnabled: false }, seeded(7))
    expect(state.archetypeByPlayer).toEqual({})
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

  it('non elimina nessuno in caso di pareggio', () => {
    const outcome = countVotes({ p0: 'p1', p1: 'p0' })
    expect(outcome.tie).toBe(true)
    expect(outcome.eliminatedId).toBeNull()
  })

  it('in caso di pareggio si passa al giro successivo senza eliminazioni', () => {
    const state = newGame()
    const voted = applyVote(state, { p0: 'p1', p1: 'p0' })
    expect(voted.eliminatedIds).toHaveLength(0)
    const next = continueFromVoteResult(voted)
    expect(next.phase).toBe('round')
    expect(next.round).toBe(2)
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
