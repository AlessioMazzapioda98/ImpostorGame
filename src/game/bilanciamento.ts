import { maxImpostors, suggestedImpostors } from './engine'

/**
 * Uno strumento per misurare se le regole sono equilibrate, senza dover radunare
 * dieci amici ogni volta che si cambia qualcosa.
 *
 * Non simula le parole, che nessun modello sa imitare. Simula le due cose che
 * decidono davvero la partita.
 *
 * 1. Il voto, giocatore per giocatore e non con una probabilità sola, perché il
 *    punto è proprio il meccanismo: gli impostori sanno chi sono, quindi votano
 *    compatti su uno stesso innocente, mentre i giocatori normali che non hanno
 *    ancora capito niente si sparpagliano. Quel blocco di voti conta moltissimo,
 *    ed è il motivo per cui aggiungere impostori non aiuta mai i normali.
 * 2. Quello che l'impostore impara. Impara dalle parole dei giocatori normali, e
 *    solo da quelle: le parole degli altri impostori sono fuffa quanto la sua.
 *    Quindi conta il totale delle parole vere dette, cioè i normali ancora vivi
 *    moltiplicati per i giri giocati. È il motivo per cui una partita lunga, o un
 *    tavolo grande, è una partita che l'impostore ha già vinto.
 *
 * I valori del modello sono stime, non misure sul campo: presi da soli dicono poco,
 * ma il confronto fra una configurazione e l'altra regge.
 */
export interface OpzioniPartita {
  /** Con la ruota, un pareggio manda fuori uno dei pari merito invece di nessuno. */
  ruota: boolean
}

export const CON_RUOTA: OpzioniPartita = { ruota: true }

export interface ModelloTavolo {
  /** Quanto fiuto ha un giocatore normale alla prima votazione, quando sa poco. */
  fiutoIniziale: number
  /** Quanto cresce il fiuto a ogni votazione, man mano che si accumulano indizi. */
  fiutoPerGiro: number
  /**
   * Quanto ogni singola parola detta da un giocatore normale avvicina l'impostore
   * alla soluzione. Con questo valore chi sente cinque parole vere indovina circa
   * una volta su cinque, chi ne sente venti circa due su tre.
   */
  indovinaPerParola: number
}

/** Un tavolo medio di amici: né distratto né campione del mondo. */
export const TAVOLO_MEDIO: ModelloTavolo = {
  fiutoIniziale: 0.12,
  fiutoPerGiro: 0.16,
  indovinaPerParola: 0.049,
}

export type Esito = 'scoperti' | 'parolaIndovinata' | 'paritaNumerica' | 'stallo'

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

/**
 * Una votazione. I giocatori normali stanno in testa all'elenco e gli impostori in
 * coda, così l'esito si legge dall'indice di chi esce. In caso di pareggio non esce
 * nessuno, come nel gioco vero.
 */
function votazione(
  normali: number,
  impostori: number,
  fiuto: number,
  rng: () => number,
  ruota = true,
): number | null {
  const vivi = normali + impostori
  const voti = new Array<number>(vivi).fill(0)

  // Gli impostori si conoscono e votano compatti lo stesso innocente.
  voti[Math.floor(rng() * normali)] += impostori

  for (let i = 0; i < normali; i++) {
    if (rng() < fiuto) {
      voti[normali + Math.floor(rng() * impostori)]++
    } else {
      // Chi non ha sospetti tira a caso su qualcun altro, mai su sé stesso.
      let scelta = Math.floor(rng() * (vivi - 1))
      if (scelta >= i) scelta++
      voti[scelta]++
    }
  }

  const massimo = Math.max(...voti)
  const primi = voti.map((v, i) => [v, i] as const).filter(([v]) => v === massimo)
  if (primi.length === 1) return primi[0][1]
  // Pareggio: la ruota della fortuna ne estrae uno fra i pari merito.
  return ruota ? primi[Math.floor(rng() * primi.length)][1] : null
}

/** Gioca una partita sola e dice com'è finita. */
export function giocaPartita(
  giocatori: number,
  impostori: number,
  m: ModelloTavolo,
  rng: () => number,
  o: OpzioniPartita = CON_RUOTA,
): Partita {
  let normali = giocatori - impostori
  let vivi = impostori
  let giro = 1
  /** Le parole dette dai giocatori normali, le uniche da cui l'impostore impara. */
  let paroleVere = 0

  while (giro <= 40) {
    paroleVere += normali
    const fiuto = Math.min(0.85, m.fiutoIniziale + m.fiutoPerGiro * (giro - 1))
    const fuori = votazione(normali, vivi, fiuto, rng, o.ruota)

    if (fuori !== null) {
      if (fuori >= normali) {
        vivi--
        if (vivi === 0) {
          // Solo l'ultimo impostore scoperto può tentare la parola.
          const sa = Math.min(0.9, 1 - Math.pow(1 - m.indovinaPerParola, paroleVere))
          return rng() < sa
            ? { vinconoINormali: false, votazioni: giro, esito: 'parolaIndovinata' }
            : { vinconoINormali: true, votazioni: giro, esito: 'scoperti' }
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
  o: OpzioniPartita = CON_RUOTA,
): Misura {
  const rng = seme(giocatori * 7919 + impostori * 104729 + 11)
  const conteggio: Record<Esito, number> = {
    scoperti: 0,
    parolaIndovinata: 0,
    paritaNumerica: 0,
    stallo: 0,
  }
  let vittorie = 0
  let votazioni = 0
  for (let i = 0; i < partite; i++) {
    const p = giocaPartita(giocatori, impostori, m, rng, o)
    if (p.vinconoINormali) vittorie++
    votazioni += p.votazioni
    conteggio[p.esito]++
  }
  return {
    vittorieNormali: vittorie / partite,
    votazioniMedie: votazioni / partite,
    esiti: {
      scoperti: conteggio.scoperti / partite,
      parolaIndovinata: conteggio.parolaIndovinata / partite,
      paritaNumerica: conteggio.paritaNumerica / partite,
      stallo: conteggio.stallo / partite,
    },
    partite,
  }
}

/** La misura della configurazione che l'app propone per quel numero di giocatori. */
export function misuraConsigliata(giocatori: number, m: ModelloTavolo = TAVOLO_MEDIO): Misura {
  return misura(giocatori, Math.min(suggestedImpostors(giocatori), maxImpostors(giocatori)), m)
}
