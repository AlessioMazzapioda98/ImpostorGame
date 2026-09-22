import { describe, expect, it } from 'vitest'
import { MAX_PLAYERS, MIN_PLAYERS, maxImpostors, suggestedImpostors } from './engine'
import { TAVOLO_MEDIO, misura, misuraConsigliata } from './bilanciamento'

/**
 * Questi test non provano che il codice funzioni: provano che le regole stiano
 * dentro i bersagli che ci siamo dati. Se cambiano le regole e uno di questi si
 * rompe, il gioco si è sbilanciato.
 *
 * Le soglie sono larghe di proposito. Il modello stima, non misura, quindi un test
 * tarato al punto percentuale si romperebbe per il motivo sbagliato: qui serve
 * accorgersi di uno scivolone, non certificare un numero.
 */
const SCARSI = { ...TAVOLO_MEDIO, fiutoIniziale: 0.04, fiutoPerGiro: 0.06 }
const ATTENTI = { ...TAVOLO_MEDIO, fiutoIniziale: 0.25, fiutoPerGiro: 0.3 }

describe('equilibrio delle configurazioni consigliate', () => {
  /**
   * La soglia bassa è al 15 perché due impostori restano più duri di uno in
   * qualunque numero di giocatori: i normali vincono intorno a una partita su
   * quattro. È una scelta di gusto, due impostori rendono la partita più viva, non
   * un equilibrio raggiunto. Con un impostore solo si sta fra il 37 e il 62%.
   */
  it('nessuna configurazione consigliata è una vittoria annunciata', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      const m = misuraConsigliata(n)
      expect(m.vittorieNormali, `${n} giocatori`).toBeGreaterThan(0.15)
      expect(m.vittorieNormali, `${n} giocatori`).toBeLessThan(0.75)
    }
  })

  it('la partita resta corta: non più di sei votazioni in media', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      expect(misuraConsigliata(n).votazioniMedie, `${n} giocatori`).toBeLessThan(6)
    }
  })

  it('essere più attenti a tavola fa vincere di più', () => {
    for (const n of [5, 8, 12]) {
      const k = suggestedImpostors(n)
      const scarsi = misura(n, k, SCARSI)
      const attenti = misura(n, k, ATTENTI)
      expect(attenti.vittorieNormali - scarsi.vittorieNormali, `${n} giocatori`).toBeGreaterThan(
        0.12,
      )
    }
  })

  it('nessuna configurazione permessa è disperata', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      for (let k = 1; k <= maxImpostors(n); k++) {
        expect(misura(n, k).vittorieNormali, `${n} giocatori, ${k} impostori`).toBeGreaterThan(0.12)
      }
    }
  })

  it('la partita finisce sempre: lo stallo non esiste nei fatti', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      expect(misuraConsigliata(n).esiti.stallo, `${n} giocatori`).toBeLessThan(0.001)
    }
  })
})

describe('cose che il tavolo si aspetta al contrario', () => {
  /**
   * Sembra che aggiungere impostori debba aiutare i giocatori normali, perché a ogni
   * giro si dicono meno parole vere e l'impostore ha meno da cui capire. Non è così,
   * e vale la pena che un test lo ricordi: servono più votazioni per scoprirli tutti,
   * quindi alla fine di parole vere ne sente di più, e intanto gli impostori votano
   * compatti su uno stesso innocente mentre i normali si sparpagliano.
   */
  it('un impostore in più non aiuta mai i giocatori normali', () => {
    for (let n = 6; n <= MAX_PLAYERS; n++) {
      const uno = misura(n, 1).vittorieNormali
      const due = misura(n, 2).vittorieNormali
      expect(due, `${n} giocatori`).toBeLessThan(uno)
    }
  })

  it('più gente c\'è, più la partita pende dalla parte degli impostori', () => {
    expect(misura(6, 1).vittorieNormali).toBeGreaterThan(misura(12, 1).vittorieNormali)
  })
})
