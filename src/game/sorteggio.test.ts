import { describe, expect, it } from 'vitest'
import { createGame, maxImpostors, suggestedImpostors } from './engine'
import { DEFAULT_PACK_IDS } from './words'
import type { Player, Settings } from './types'

function settings(k: number): Settings {
  return {
    impostorCount: k,
    packIds: DEFAULT_PACK_IDS,
    archetypesEnabled: true,
    clueForImpostors: true,
    voteMode: 'misto',
    revealSeconds: 20,
    answerSeconds: 15,
  }
}
const giocatori = (n: number): Player[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `G${i}` }))

/**
 * Chi tocca fare l'impostore non deve dipendere da chi sei né da dove parli nel
 * giro: se il primo a parlare fosse impostore più spesso, dopo qualche partita al
 * tavolo se ne accorgerebbero e il gioco sarebbe rotto.
 */
describe('il sorteggio degli impostori', () => {
  it('capita a tutti con la stessa frequenza, e non dipende dal posto nel giro', () => {
  for (const [n, k] of [[4, 1], [6, 1], [8, 2], [12, 2]] as const) {
    const players = giocatori(n)
    const PARTITE = 40000
    const volte = new Array(n).fill(0)
    // Quante volte l'impostore si trova in ciascuna posizione dell'ordine di parola.
    const perPosizione = new Array(n).fill(0)
    let conteggioSbagliato = 0

    for (let i = 0; i < PARTITE; i++) {
      const g = createGame(players, settings(k))
      if (g.impostorIds.length !== Math.min(k, maxImpostors(n))) conteggioSbagliato++
      for (const id of g.impostorIds) {
        volte[players.findIndex((p) => p.id === id)]++
        perPosizione[g.baseOrder.indexOf(id)]++
      }
    }

    const atteso = (PARTITE * Math.min(k, maxImpostors(n))) / n
    const scartoRuolo = volte.map((v) => Math.abs(v - atteso) / atteso)
    const scartoPosizione = perPosizione.map((v) => Math.abs(v - atteso) / atteso)
    console.log(
      `${n}g/${k}i  atteso ${(100 / n * Math.min(k, maxImpostors(n))).toFixed(1)}% a testa  ` +
        `| per giocatore ${volte.map((v) => ((v / PARTITE) * 100).toFixed(1)).join(' ')}` +
        `| per posto nel giro ${perPosizione.map((v) => ((v / PARTITE) * 100).toFixed(1)).join(' ')}`,
    )
    expect(conteggioSbagliato, `${n}g/${k}i numero impostori`).toBe(0)
    expect(Math.max(...scartoRuolo), `${n}g/${k}i uniformità fra giocatori`).toBeLessThan(0.06)
    expect(Math.max(...scartoPosizione), `${n}g/${k}i indipendenza dall'ordine`).toBeLessThan(0.06)
  }
  }, 300000)

  it("propone e permette il numero di impostori previsto", () => {
  console.log('\ngiocatori | consigliati | massimo | quota del tavolo')
  for (let n = 4; n <= 12; n++) {
    const s = suggestedImpostors(n)
    console.log(
      `${String(n).padStart(8)}  |${String(s).padStart(12)} |${String(maxImpostors(n)).padStart(8)} |` +
        `  ${((s / n) * 100).toFixed(0)}% consigliato, ${((maxImpostors(n) / n) * 100).toFixed(0)}% al massimo`,
    )
  }
  }, 60000)
})
