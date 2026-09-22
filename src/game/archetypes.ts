import type { Archetype } from './types'

/**
 * Ogni giocatore riceve due archetipi insieme alla propria carta, come in un gioco di
 * ruolo: una classe e una sottoclasse. Valgono allo stesso modo per i giocatori normali
 * e per gli impostori, così non tradiscono il ruolo.
 *
 * - La **classe** vincola come ti comporti durante la discussione e al voto.
 * - La **sottoclasse** vincola le parole che puoi dire al tuo turno.
 *
 * Nessuno dei due riguarda il tono o il modo di pronunciare: cantare o sussurrare fa
 * ridere per due secondi e non cambia niente di quello che il tavolo deve capire.
 *
 * Le classi con `needsTarget` nominano un altro giocatore, sorteggiato dal gioco: nella
 * regola sta scritto `{bersaglio}`, e `archetypeRule` ci mette il nome.
 */
export const ARCHETYPES: Archetype[] = [
  // ---------------------------------------------------------------- classi ---
  {
    id: 'matto',
    name: 'Il Matto',
    rule: 'Nessuna regola, nemmeno la tua sottoclasse: fai quello che ti pare.',
    emoji: '🃏',
    kind: 'classe',
  },
  {
    id: 'accusatore',
    name: "L'Accusatore",
    rule: 'Accusa {bersaglio} a ogni discussione e vota sempre {bersaglio}.',
    emoji: '👉',
    kind: 'classe',
    needsTarget: true,
  },
  {
    id: 'avvocato',
    name: "L'Avvocato",
    rule: 'Difendi {bersaglio} a ogni discussione e non votare mai {bersaglio}.',
    emoji: '🛡️',
    kind: 'classe',
    needsTarget: true,
  },
  {
    id: 'testimone',
    name: 'Il Testimone',
    rule: 'Prima di ogni voto giudica {bersaglio} ad alta voce: innocente o colpevole.',
    emoji: '👁️',
    kind: 'classe',
    needsTarget: true,
  },
  {
    id: 'voltagabbana',
    name: 'Il Voltagabbana',
    rule: 'A ogni votazione vota una persona diversa dalla precedente.',
    emoji: '🔄',
    kind: 'classe',
  },
  {
    id: 'silenzioso',
    name: 'Il Silenzioso',
    rule: 'Dopo la tua parola non puoi più parlare, per tutta la partita.',
    emoji: '🤐',
    kind: 'classe',
  },
  {
    id: 'doppiogiochista',
    name: 'Il Doppiogiochista',
    rule: 'Annuncia chi voterai, poi vota qualcun altro.',
    emoji: '🎭',
    kind: 'classe',
  },
  {
    id: 'leale',
    name: 'Il Leale',
    rule: 'Annuncia chi voterai, poi votalo davvero.',
    emoji: '🤝',
    kind: 'classe',
  },
  {
    id: 'capobranco',
    name: 'Il Capobranco',
    rule: 'In ogni discussione accusa qualcuno per primo.',
    emoji: '👑',
    kind: 'classe',
  },
  {
    id: 'gregario',
    name: 'Il Gregario',
    rule: 'Non accusare mai per primo: puoi solo appoggiare l’accusa di un altro.',
    emoji: '🐑',
    kind: 'classe',
  },
  {
    id: 'muro',
    name: 'Il Muro',
    rule: 'Non difenderti: se ti accusano rispondi solo «non sono io».',
    emoji: '😐',
    kind: 'classe',
  },
  {
    id: 'sospettoso',
    name: 'Il Sospettoso',
    rule: 'Fai una domanda a chiunque finisca di parlare.',
    emoji: '🕵️',
    kind: 'classe',
  },
  {
    id: 'democratico',
    name: 'Il Democratico',
    rule: 'Vota chi si è preso più accuse durante la discussione.',
    emoji: '🗳️',
    kind: 'classe',
  },

  // ----------------------------------------------------------- sottoclassi ---
  // Vincolano com'è fatta la parola, e il tavolo può verificarlo dopo.
  {
    id: 'poeta',
    name: 'Il Poeta',
    rule: 'Fai rima con la parola detta prima di te. Se apri tu il giro, sei libero.',
    emoji: '🪶',
    kind: 'sottoclasse',
  },
  {
    id: 'omonimo',
    name: "L'Omonimo",
    rule: 'Ogni tua parola inizia con la lettera del tuo nome.',
    emoji: '🅰️',
    kind: 'sottoclasse',
  },
  {
    id: 'minimalista',
    name: 'Il Minimalista',
    rule: 'Massimo cinque lettere.',
    emoji: '🔹',
    kind: 'sottoclasse',
  },
  {
    id: 'grandioso',
    name: 'Il Grandioso',
    rule: 'Almeno nove lettere.',
    emoji: '🗿',
    kind: 'sottoclasse',
  },
  {
    id: 'raddoppio',
    name: 'Il Raddoppio',
    rule: 'Serve una doppia dentro la parola, come in nonno o pizza.',
    emoji: '🔁',
    kind: 'sottoclasse',
  },
  {
    id: 'azione',
    name: "L'Uomo d'Azione",
    rule: 'Deve essere un verbo all’infinito.',
    emoji: '🏃',
    kind: 'sottoclasse',
  },
  {
    id: 'straniero',
    name: 'Lo Straniero',
    rule: 'In una lingua qualsiasi, tranne l’italiano.',
    emoji: '🌍',
    kind: 'sottoclasse',
  },
  // Vincolano cosa può significare la parola, e sporcano la deduzione.
  {
    id: 'salterino',
    name: 'Il Salterino',
    rule: 'Collegati alla parola segreta in due passaggi, mai in uno.',
    emoji: '🦘',
    kind: 'sottoclasse',
  },
  {
    id: 'basico',
    name: 'Il Basico',
    rule: 'La parola più scontata che esista, quella che direbbe chiunque.',
    emoji: '🥱',
    kind: 'sottoclasse',
  },
  {
    id: 'fuoriluogo',
    name: 'Il Fuoriluogo',
    rule: 'Volgare o imbarazzante, di quelle che fanno calare il silenzio.',
    emoji: '🙊',
    kind: 'sottoclasse',
  },
  {
    id: 'goloso',
    name: 'Il Goloso',
    rule: 'Deve riguardare il cibo, qualunque sia la parola segreta.',
    emoji: '🍝',
    kind: 'sottoclasse',
  },
  {
    id: 'astratto',
    name: "L'Astratto",
    rule: 'Solo cose che non si toccano: idee, sentimenti, stati d’animo.',
    emoji: '☁️',
    kind: 'sottoclasse',
  },
  {
    id: 'concreto',
    name: 'Il Concreto',
    rule: 'Solo cose che si possono toccare.',
    emoji: '🧱',
    kind: 'sottoclasse',
  },
]

/** Le classi: vincolano come ti comporti nella discussione e al voto. */
export const CLASSI = ARCHETYPES.filter((archetype) => archetype.kind === 'classe')

/** Le sottoclassi: vincolano le parole che puoi dire al tuo turno. */
export const SOTTOCLASSI = ARCHETYPES.filter((archetype) => archetype.kind === 'sottoclasse')

/** Il segnaposto che le classi con bersaglio usano nella regola. */
export const SEGNAPOSTO_BERSAGLIO = '{bersaglio}'

/**
 * La regola da mostrare al giocatore, col nome del bersaglio al posto del segnaposto.
 * Senza bersaglio resta una formula generica, così la regola si legge comunque.
 */
export function archetypeRule(archetype: Archetype, targetName: string | null): string {
  if (!archetype.needsTarget) return archetype.rule
  return archetype.rule.split(SEGNAPOSTO_BERSAGLIO).join(targetName ?? 'il giocatore indicato')
}
