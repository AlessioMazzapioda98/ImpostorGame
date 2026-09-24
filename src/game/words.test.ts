import { describe, expect, it } from 'vitest'
import { MIN_PACKS_FOR_CLUE, WORD_PACKS } from './words'
import { normalizeGuess } from './engine'

const tutte = WORD_PACKS.flatMap((pack) => pack.entries)

/**
 * Questi test guardano le parole, non il codice. La categoria è l'indizio
 * dell'impostore, quindi una parola nel posto sbagliato non è un dettaglio: manda
 * fuori strada proprio chi dovrebbe aiutare.
 */
describe('le parole e le loro categorie', () => {
  it('nessuna parola sta in due categorie', () => {
    const doppie = tutte.filter((parola, i) => tutte.indexOf(parola) !== i)
    expect(doppie).toEqual([])
  })

  it('nessuna parola si confonde con un\'altra quando si scrive il tentativo', () => {
    const normalizzate = tutte.map(normalizeGuess)
    const doppie = normalizzate.filter((n, i) => normalizzate.indexOf(n) !== i)
    expect(doppie).toEqual([])
  })

  it('ogni parola resta indovinabile: nessuna sparisce una volta normalizzata', () => {
    for (const parola of tutte) {
      expect(normalizeGuess(parola), parola).not.toBe('')
    }
  })

  it('ogni categoria ha abbastanza parole da non svelare quasi niente', () => {
    for (const pack of WORD_PACKS) {
      expect(pack.entries.length, pack.name).toBeGreaterThanOrEqual(15)
    }
  })

  it('ci sono abbastanza categorie perché l\'indizio abbia senso', () => {
    expect(WORD_PACKS.length).toBeGreaterThanOrEqual(MIN_PACKS_FOR_CLUE)
    const nomi = WORD_PACKS.map((p) => p.name)
    expect(new Set(nomi).size, 'nomi ripetuti').toBe(nomi.length)
    const id = WORD_PACKS.map((p) => p.id)
    expect(new Set(id).size, 'id ripetuti').toBe(id.length)
  })

  it('nessuna parola è vuota o con spazi di troppo', () => {
    for (const parola of tutte) {
      expect(parola, `"${parola}"`).toBe(parola.trim())
      expect(parola.length, `"${parola}"`).toBeGreaterThan(1)
    }
  })

  it('le parole sono scritte con lettere nostre, non con caratteri che sembrano tali', () => {
    for (const parola of tutte) {
      // Fuori dal latino esteso ci finiscono le lettere di altri alfabeti che
      // sullo schermo sembrano identiche alle nostre, e che nessuno riuscirebbe
      // a digitare nel tentativo finale.
      const strane = [...parola].filter((c) => c.codePointAt(0)! > 0x24f)
      expect(strane, `"${parola}"`).toEqual([])
    }
  })
})
