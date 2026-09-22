import { describe, expect, it } from 'vitest'
import { ARCHETYPES, playableArchetypes } from './archetypes'
import {
  MAX_PLAYERS,
  alivePlayers,
  applyVote,
  continueFromVoteResult,
  countVotes,
  createGame,
  trapBudget,
  isCorrectGuess,
  maxImpostors,
  roleFor,
  submitGuess,
  turnOrderForRound,
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
    for (let count = 3; count <= 12; count++) {
      expect(maxImpostors(count)).toBeLessThan(count / 2)
      expect(maxImpostors(count)).toBeGreaterThanOrEqual(1)
    }
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
    expect(impostorRole.clue).toBe(state.entry.clue)

    const crewRole = roleFor(state, crewId)
    expect(crewRole.word).toBe(state.entry.word)
    expect(crewRole.clue).toBeNull()
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
    expect(roleFor(state, state.impostorIds[0]).clue).toBeNull()
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

  it('manda al tentativo di indovinare quando esce un impostore', () => {
    const state = newGame()
    const impostorId = state.impostorIds[0]
    const voted = applyVote(state, Object.fromEntries(PLAYERS.map((p) => [p.id, impostorId])))
    expect(voted.eliminatedIds).toContain(impostorId)
    expect(continueFromVoteResult(voted).phase).toBe('guess')
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
  it("gli impostori vincono se l'eliminato indovina la parola", () => {
    const state = newGame()
    const impostorId = state.impostorIds[0]
    const voted = applyVote(state, Object.fromEntries(PLAYERS.map((p) => [p.id, impostorId])))
    const guessing = continueFromVoteResult(voted)
    const end = submitGuess(guessing, state.entry.word)
    expect(end.phase).toBe('gameOver')
    expect(end.winner).toBe('impostors')
  })

  it('la parola si indovina anche senza accenti e maiuscole', () => {
    const state = newGame()
    expect(isCorrectGuess(state, ` ${state.entry.word.toUpperCase()} `)).toBe(true)
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

  it('non vincola mai il tono o il modo di pronunciare la parola', () => {
    // La categoria "voce" non esiste più: se torna, è una regressione voluta a mano.
    const categorie = new Set(ARCHETYPES.map((archetype) => archetype.category))
    expect([...categorie].sort()).toEqual(['forma', 'senso', 'tavolo'])
  })

  it('ha abbastanza archetipi senza trappole da coprire un tavolo pieno', () => {
    expect(playableArchetypes(false).length).toBeGreaterThanOrEqual(MAX_PLAYERS)
  })

  it('dà a ogni giocatore un archetipo diverso', () => {
    for (const state of gamesOverSeeds(MANY, SETTINGS)) {
      const assegnati = Object.values(state.archetypeByPlayer).map((a) => a.id)
      expect(assegnati).toHaveLength(MANY.length)
      expect(new Set(assegnati).size).toBe(MANY.length)
    }
  })

  it("non dà a chi apre il giro una regola che guarda la parola precedente", () => {
    for (const state of gamesOverSeeds(MANY, SETTINGS)) {
      const catena = state.baseOrder.map((id) => state.archetypeByPlayer[id])
      expect(catena[0].dependsOnPrevious).toBeFalsy()
      for (let i = 1; i < catena.length; i++) {
        const incatenati = catena[i].dependsOnPrevious && catena[i - 1].dependsOnPrevious
        expect(incatenati).toBeFalsy()
      }
    }
  })

  it('tiene le trappole entro il tetto previsto', () => {
    for (const players of [PLAYERS, MANY]) {
      for (const state of gamesOverSeeds(players, SETTINGS)) {
        const trappole = Object.values(state.archetypeByPlayer).filter((a) => a.trap)
        expect(trappole.length).toBeLessThanOrEqual(trapBudget(players.length))
      }
    }
  })

  it('con le trappole spente non ne lascia passare nessuna', () => {
    for (const state of gamesOverSeeds(MANY, { ...SETTINGS, trapsEnabled: false })) {
      for (const archetype of Object.values(state.archetypeByPlayer)) {
        expect(archetype.trap).toBeFalsy()
      }
    }
  })

  it('spalma le categorie invece di ammucchiarle', () => {
    for (const state of gamesOverSeeds(PLAYERS, SETTINGS)) {
      const categorie = new Set(Object.values(state.archetypeByPlayer).map((a) => a.category))
      // Sei giocatori, tre categorie: devono esserci tutte.
      expect(categorie.size).toBe(3)
    }
  })
})
