import { describe, expect, it } from 'vitest'
import { MAX_PLAYERS, MIN_PLAYERS, maxImpostors, suggestedImpostors } from './engine'
import { TAVOLO_MEDIO, misura, misuraConsigliata } from './bilanciamento'

/**
 * Questi test non provano che il codice funzioni: provano che le regole stiano
 * dentro i bersagli che ci siamo dati. Se cambiano le regole e uno di questi
 * si rompe, il gioco si è sbilanciato.
 */
describe('equilibrio delle configurazioni consigliate', () => {
  /**
   * La soglia bassa è al 25 e non al 40 per un motivo che vale la pena ricordare:
   * in dodici, con due impostori, i normali vincono circa il 28% delle volte. Più
   * gente c'è, più parole si dicono prima di votare, e più la parola arriva da sola
   * all'impostore. Finché la partita non si accorcia, quello squilibrio resta.
   */
  it('nessuna configurazione consigliata è una vittoria annunciata', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      const m = misuraConsigliata(n)
      expect(m.vittorieNormali, `${n} giocatori`).toBeGreaterThan(0.25)
      expect(m.vittorieNormali, `${n} giocatori`).toBeLessThan(0.75)
    }
  })

  it('la partita resta corta: non più di cinque votazioni in media', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      expect(misuraConsigliata(n).votazioniMedie, `${n} giocatori`).toBeLessThan(5)
    }
  })

  it('essere più bravi a tavola fa vincere di più', () => {
    for (const n of [5, 8, 12]) {
      const scarsi = misura(n, suggestedImpostors(n), { ...TAVOLO_MEDIO, bravura: 1.4 })
      const attenti = misura(n, suggestedImpostors(n), { ...TAVOLO_MEDIO, bravura: 3.8 })
      expect(attenti.vittorieNormali - scarsi.vittorieNormali, `${n} giocatori`).toBeGreaterThan(
        0.12,
      )
    }
  })

  it('nessuna configurazione permessa scende sotto una vittoria su cinque', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      for (let k = 1; k <= maxImpostors(n); k++) {
        expect(misura(n, k).vittorieNormali, `${n} giocatori, ${k} impostori`).toBeGreaterThan(0.19)
      }
    }
  })

  it('la partita finisce sempre: lo stallo non esiste nei fatti', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      expect(misuraConsigliata(n).esiti.stallo, `${n} giocatori`).toBeLessThan(0.001)
    }
  })
})
