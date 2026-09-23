import type { Archetype, ArchetypeCard } from './types'

/**
 * Ogni giocatore riceve due archetipi insieme alla propria carta, come in un gioco di
 * ruolo: una classe e una sottoclasse. Valgono allo stesso modo per i giocatori normali
 * e per gli impostori, così non tradiscono il ruolo.
 *
 * - La **classe** vincola come ti comporti durante la discussione e al voto.
 * - La **sottoclasse** vincola le parole che puoi dire al tuo turno.
 *
 * I nomi sono pensati per attaccarsi: classe più sottoclasse devono suonare come un
 * nome solo, perché è così che se ne parla dopo la partita ("mi è capitato il Testimone
 * Poeta"). Per questo il nome non contiene l'articolo, sta in `article` sulla classe,
 * ed è sempre una parola sola, maschile e singolare, che regge anche un seguito.
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
    name: 'Matto',
    article: 'il',
    rule: 'Nessuna regola, nemmeno la tua sottoclasse: fai quello che ti pare.',
    emoji: '🃏',
    kind: 'classe',
  },
  {
    id: 'accusatore',
    name: 'Accusatore',
    article: 'l’',
    rule: 'Accusa {bersaglio} a ogni discussione e vota sempre {bersaglio}.',
    emoji: '👉',
    kind: 'classe',
    needsTarget: true,
  },
  {
    id: 'avvocato',
    name: 'Avvocato',
    article: 'l’',
    rule: 'Difendi {bersaglio} a ogni discussione e non votare mai {bersaglio}.',
    emoji: '🛡️',
    kind: 'classe',
    needsTarget: true,
  },
  {
    id: 'testimone',
    name: 'Testimone',
    article: 'il',
    rule: 'Prima di ogni voto giudica {bersaglio} ad alta voce: innocente o colpevole.',
    emoji: '👁️',
    kind: 'classe',
    needsTarget: true,
  },
  {
    id: 'voltagabbana',
    name: 'Voltagabbana',
    article: 'il',
    rule: 'A ogni votazione vota una persona diversa dalla precedente.',
    emoji: '🔄',
    kind: 'classe',
  },
  {
    id: 'silenzioso',
    name: 'Silenzioso',
    article: 'il',
    rule: 'Dopo la tua parola non puoi più parlare, per tutta la partita.',
    emoji: '🤐',
    kind: 'classe',
  },
  {
    id: 'gregario',
    name: 'Gregario',
    article: 'il',
    rule: 'Appoggia sempre la prima accusa della discussione.',
    emoji: '🐑',
    kind: 'classe',
  },
  {
    id: 'democratico',
    name: 'Democratico',
    article: 'il',
    rule: 'Vota chi si è preso più accuse durante la discussione.',
    emoji: '🗳️',
    kind: 'classe',
  },
  {
    id: 'crocerossino',
    name: 'Crocerossino',
    article: 'il',
    rule: 'Difendi chi si è preso più accuse, e non votarlo.',
    emoji: '🥀',
    kind: 'classe',
  },
  {
    id: 'vendicativo',
    name: 'Vendicativo',
    article: 'il',
    rule: 'Vota chi ti ha accusato. Se nessuno ti accusa, vota come vuoi.',
    emoji: '😤',
    kind: 'classe',
  },
  {
    id: 'conservatore',
    name: 'Conservatore',
    article: 'il',
    rule: 'Vota sempre la stessa persona che hai votato la prima volta.',
    emoji: '⚓',
    kind: 'classe',
  },
  {
    id: 'codardo',
    name: 'Codardo',
    article: 'il',
    rule: 'Non accusare mai nessuno: puoi solo difendere.',
    emoji: '🐔',
    kind: 'classe',
  },
  {
    id: 'pentito',
    name: 'Pentito',
    article: 'il',
    rule: 'Prima della seconda votazione dichiara di essere l’impostore.',
    emoji: '🙏',
    kind: 'classe',
  },

  // ----------------------------------------------------------- sottoclassi ---
  {
    id: 'classico',
    name: 'Classico',
    rule: 'Nessun vincolo sulla parola: gioca come all’impostore normale.',
    emoji: '⚪',
    kind: 'sottoclasse',
  },
  // Vincolano com'è fatta la parola, e il tavolo può verificarlo dopo.
  {
    id: 'poeta',
    name: 'Poeta',
    rule: 'Fai rima con la parola detta prima di te. Se apri tu il giro, sei libero.',
    emoji: '🪶',
    kind: 'sottoclasse',
  },
  {
    id: 'omonimo',
    name: 'Omonimo',
    rule: 'Ogni tua parola inizia con la lettera del tuo nome.',
    emoji: '🅰️',
    kind: 'sottoclasse',
  },
  {
    id: 'minimalista',
    name: 'Minimalista',
    rule: 'Massimo cinque lettere.',
    emoji: '🔹',
    kind: 'sottoclasse',
  },
  {
    id: 'grandioso',
    name: 'Grandioso',
    rule: 'Almeno nove lettere.',
    emoji: '🗿',
    kind: 'sottoclasse',
  },
  {
    id: 'doppione',
    name: 'Doppione',
    rule: 'Serve una doppia dentro la parola, come in nonno o pizza.',
    emoji: '🔁',
    kind: 'sottoclasse',
  },
  {
    id: 'verbale',
    name: 'Verbale',
    rule: 'Deve essere un verbo all’infinito.',
    emoji: '🏃',
    kind: 'sottoclasse',
  },
  {
    id: 'straniero',
    name: 'Straniero',
    rule: 'In una lingua qualsiasi, tranne l’italiano.',
    emoji: '🌍',
    kind: 'sottoclasse',
  },
  // Vincolano cosa può significare la parola, e sporcano la deduzione.
  {
    id: 'salterino',
    name: 'Salterino',
    rule: 'Collegati alla parola segreta in due passaggi, mai in uno.',
    emoji: '🦘',
    kind: 'sottoclasse',
  },
  {
    id: 'basico',
    name: 'Basico',
    rule: 'La parola più scontata che esista, quella che direbbe chiunque.',
    emoji: '🥱',
    kind: 'sottoclasse',
  },
  {
    id: 'sam',
    name: 'S.A.M.',
    rule: 'Volgare o imbarazzante, di quelle che fanno calare il silenzio.',
    emoji: '🙊',
    kind: 'sottoclasse',
  },
  {
    id: 'goloso',
    name: 'Goloso',
    rule: 'Deve riguardare il cibo, qualunque sia la parola segreta.',
    emoji: '🍝',
    kind: 'sottoclasse',
  },
  {
    id: 'astratto',
    name: 'Astratto',
    rule: 'Solo cose che non si toccano: idee, sentimenti, stati d’animo.',
    emoji: '☁️',
    kind: 'sottoclasse',
  },
  {
    id: 'concreto',
    name: 'Concreto',
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

/** Il nome unico della carta: "Testimone Poeta". */
export function archetypeCardName(card: ArchetypeCard): string {
  return `${card.classe.name} ${card.sottoclasse.name}`
}

/** Lo stesso nome con l'articolo davanti, per scriverlo dentro una frase. */
export function archetypeCardWithArticle(card: ArchetypeCard): string {
  const articolo = card.classe.article ?? 'il'
  // L'articolo elidato sta attaccato alla parola, gli altri vogliono lo spazio.
  const stacco = articolo.endsWith('’') ? '' : ' '
  return `${articolo}${stacco}${archetypeCardName(card)}`
}
