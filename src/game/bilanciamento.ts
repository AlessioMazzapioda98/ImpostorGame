import { maxImpostors, suggestedImpostors } from './engine'

/**
 * Uno strumento per misurare se le regole sono equilibrate, senza dover radunare
 * dieci amici ogni volta che si cambia qualcosa.
 *
 * Non simula le parole, che nessun modello sa imitare: simula le due cose che
 * decidono davvero la partita.
 *
 * 1. Il gruppo non vota a caso. Vota `bravura` volte meglio del caso, e con più
 *    impostori in gioco è più facile beccarne uno perché i sospetti veri sono di più.
 * 2. L'impostore impara. Ogni giro sente una parola da ciascun giocatore, quindi
 *    più la partita dura più gli è facile indovinare. È il motivo per cui una
 *    partita lunga è una partita che l'impostore ha già vinto.
 */
export interface ModelloTavolo {
  /** Quanto il gruppo vota meglio del caso: 1 è il caso puro, 4 è un gruppo molto attento. */
  bravura: number
  /** Quanto il gruppo migliora a ogni giro che passa. */
  bravuraPerGiro: number
  /** Quante votazioni finiscono in pareggio. */
  pareggi: number
  /** Probabilità che l'impostore indovini se viene scoperto al primo giro. */
  indovinaAlPrimoGiro: number
  /** Quanto cresce quella probabilità a ogni giro in più che sopravvive. */
  indovinaPerGiro: number
}

/** Un tavolo medio di amici: né distratto né campione del mondo. */
export const TAVOLO_MEDIO: ModelloTavolo = {
  bravura: 2.2,
  bravuraPerGiro: 0.5,
  pareggi: 0.12,
  indovinaAlPrimoGiro: 0.22,
  indovinaPerGiro: 0.14,
}

export type Esito =
  | 'scoperti'
  | 'parolaIndovinata'
  | 'paritaNumerica'
  | 'stallo'

export interface Partita {
  vinconoINormali: boolean
  votazioni: number
  esito: Esito
}

function seme(valore: number): () => number {
  let v = valore >>> 0
  return () => {
    v = (v * 1664525 + 1013904223) >>> 0
    return v / 4294967296
  }
}

/** Gioca una partita sola e dice com'è finita. */
export function giocaPartita(
  giocatori: number,
  impostori: number,
  m: ModelloTavolo,
  rng: () => number,
): Partita {
  let normali = giocatori - impostori
  let vivi = impostori
  let giro = 1

  while (giro <= 40) {
    if (rng() >= m.pareggi) {
      const bravura = m.bravura + m.bravuraPerGiro * (giro - 1)
      const prendeImpostore = Math.min(0.92, (vivi / (normali + vivi)) * bravura)
      if (rng() < prendeImpostore) {
        vivi--
        if (vivi === 0) {
          // Solo l'ultimo impostore scoperto può tentare la parola.
          const indovina = Math.min(0.9, m.indovinaAlPrimoGiro + m.indovinaPerGiro * (giro - 1))
          if (rng() < indovina) {
            return { vinconoINormali: false, votazioni: giro, esito: 'parolaIndovinata' }
          }
          return { vinconoINormali: true, votazioni: giro, esito: 'scoperti' }
        }
      } else {
        normali--
        if (vivi >= normali) {
          return { vinconoINormali: false, votazioni: giro, esito: 'paritaNumerica' }
        }
      }
    }
    giro++
  }
  return { vinconoINormali: false, votazioni: giro, esito: 'stallo' }
}

export interface Misura {
  vittorieNormali: number
  votazioniMedie: number
  esiti: Record<Esito, number>
  partite: number
}

/** Gioca tante partite e restituisce le percentuali. */
export function misura(
  giocatori: number,
  impostori: number,
  m: ModelloTavolo = TAVOLO_MEDIO,
  partite = 20000,
): Misura {
  const rng = seme(giocatori * 7919 + impostori * 104729 + 11)
  const esiti: Record<Esito, number> = {
    scoperti: 0,
    parolaIndovinata: 0,
    paritaNumerica: 0,
    stallo: 0,
  }
  let vittorie = 0
  let votazioni = 0
  for (let i = 0; i < partite; i++) {
    const p = giocaPartita(giocatori, impostori, m, rng)
    if (p.vinconoINormali) vittorie++
    votazioni += p.votazioni
    esiti[p.esito]++
  }
  return {
    vittorieNormali: vittorie / partite,
    votazioniMedie: votazioni / partite,
    esiti: {
      scoperti: esiti.scoperti / partite,
      parolaIndovinata: esiti.parolaIndovinata / partite,
      paritaNumerica: esiti.paritaNumerica / partite,
      stallo: esiti.stallo / partite,
    },
    partite,
  }
}

/** La misura della configurazione che l'app propone per quel numero di giocatori. */
export function misuraConsigliata(giocatori: number, m: ModelloTavolo = TAVOLO_MEDIO): Misura {
  return misura(giocatori, Math.min(suggestedImpostors(giocatori), maxImpostors(giocatori)), m)
}
