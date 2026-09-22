import { describe, expect, it } from 'vitest'
import { ARCHETYPES, CLASSI, SOTTOCLASSI, archetypeRule } from './archetypes'
import {
  MAX_PLAYERS,
  alivePlayers,
  applyVote,
  continueFromVoteResult,
  countVotes,
  createGame,
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
