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
    rule: 'Nessun obbligo, nemmeno quello della tua sottoclasse: parla, vota e di’ quello che ti pare.',
    emoji: '🃏',
    kind: 'classe',
  },
  {
    id: 'accusatore',
    name: "L'Accusatore",
    rule: 'Devi accusare {bersaglio} in ogni discussione, e votare sempre {bersaglio}.',
    emoji: '👉',
    kind: 'classe',
    needsTarget: true,
  },
  {
    id: 'avvocato',
    name: "L'Avvocato",
    rule: 'Devi difendere {bersaglio} in ogni discussione, e non puoi votare {bersaglio} per nessun motivo.',
    emoji: '🛡️',
    kind: 'classe',
    needsTarget: true,
  },
  {
    id: 'testimone',
    name: 'Il Testimone',
    rule: 'Devi tenere d’occhio {bersaglio}: prima di ogni votazione dici ad alta voce se secondo te {bersaglio} è innocente o colpevole.',
    emoji: '👁️',
    kind: 'classe',
    needsTarget: true,
  },
  {
    id: 'voltagabbana',
    name: 'Il Voltagabbana',
    rule: 'A ogni votazione devi votare una persona diversa da quella che hai votato prima.',
    emoji: '🔄',
    kind: 'classe',
  },
  {
    id: 'silenzioso',
    name: 'Il Silenzioso',
    rule: 'Non puoi parlare per tutta la partita: dici la tua parola quando tocca a te e poi più niente.',
    emoji: '🤐',
    kind: 'classe',
  },
  {
    id: 'doppiogiochista',
    name: 'Il Doppiogiochista',
    rule: 'Prima di ogni votazione devi annunciare ad alta voce chi voterai, e poi votare qualcun altro.',
    emoji: '🎭',
    kind: 'classe',
  },
  {
    id: 'leale',
    name: 'Il Leale',
    rule: 'Prima di ogni votazione devi annunciare ad alta voce chi voterai, e poi votare davvero lui.',
    emoji: '🤝',
    kind: 'classe',
  },
  {
    id: 'capobranco',
    name: 'Il Capobranco',
    rule: 'In ogni discussione devi essere il primo ad accusare qualcuno.',
    emoji: '👑',
    kind: 'classe',
  },
  {
    id: 'gregario',
    name: 'Il Gregario',
    rule: 'Non puoi accusare nessuno per primo: puoi solo appoggiare un’accusa già fatta da un altro.',
    emoji: '🐑',
    kind: 'classe',
  },
  {
    id: 'muro',
    name: 'Il Muro',
    rule: 'Non puoi difenderti: se ti accusano puoi solo rispondere «non sono io», e nient’altro.',
    emoji: '😐',
    kind: 'classe',
  },
  {
    id: 'sospettoso',
    name: 'Il Sospettoso',
    rule: 'Ogni volta che un giocatore finisce di parlare devi fargli una domanda.',
    emoji: '🕵️',
    kind: 'classe',
  },
  {
    id: 'democratico',
    name: 'Il Democratico',
    rule: 'Devi votare la persona che durante la discussione si è presa più accuse.',
    emoji: '🗳️',
    kind: 'classe',
  },

  // ----------------------------------------------------------- sottoclassi ---
  // Vincolano com'è fatta la parola, e il tavolo può verificarlo dopo.
  {
    id: 'poeta',
    name: 'Il Poeta',
    rule: 'La tua parola deve fare rima con quella detta dal giocatore prima di te. Se apri tu il giro, sei libero.',
    emoji: '🪶',
    kind: 'sottoclasse',
  },
  {
    id: 'omonimo',
    name: "L'Omonimo",
    rule: 'Tutte le tue parole, in ogni giro, devono iniziare con la stessa lettera del tuo nome.',
    emoji: '🅰️',
    kind: 'sottoclasse',
  },
  {
    id: 'minimalista',
    name: 'Il Minimalista',
    rule: 'La tua parola non può superare le cinque lettere.',
    emoji: '🔹',
    kind: 'sottoclasse',
  },
  {
    id: 'grandioso',
    name: 'Il Grandioso',
    rule: 'La tua parola deve essere lunga almeno nove lettere.',
    emoji: '🗿',
    kind: 'sottoclasse',
  },
  {
    id: 'raddoppio',
    name: 'Il Raddoppio',
    rule: 'La tua parola deve contenere una doppia, come in nonno o in pizza.',
    emoji: '🔁',
    kind: 'sottoclasse',
  },
  {
    id: 'azione',
    name: "L'Uomo d'Azione",
    rule: "La tua parola deve essere un verbo all'infinito.",
    emoji: '🏃',
    kind: 'sottoclasse',
  },
  {
    id: 'straniero',
    name: 'Lo Straniero',
    rule: "Devi dire la tua parola in una lingua che non è l'italiano.",
    emoji: '🌍',
    kind: 'sottoclasse',
  },
  // Vincolano cosa può significare la parola, e sporcano la deduzione.
  {
    id: 'salterino',
    name: 'Il Salterino',
    rule: 'Il collegamento con la parola segreta deve essere lungo: ci devono volere almeno due passaggi per arrivarci.',
    emoji: '🦘',
    kind: 'sottoclasse',
  },
  {
    id: 'basico',
    name: 'Il Basico',
    rule: 'La tua parola deve essere la più scontata possibile, la prima che verrebbe in mente a chiunque.',
    emoji: '🥱',
    kind: 'sottoclasse',
  },
  {
    id: 'fuoriluogo',
    name: 'Il Fuoriluogo',
    rule: 'La tua parola deve essere fuori luogo: volgare, imbarazzante, di quelle che a tavola fanno calare il silenzio.',
    emoji: '🙊',
    kind: 'sottoclasse',
  },
  {
    id: 'goloso',
    name: 'Il Goloso',
    rule: 'La tua parola deve avere a che fare con il cibo, qualunque sia la parola segreta.',
    emoji: '🍝',
    kind: 'sottoclasse',
  },
  {
    id: 'astratto',
    name: "L'Astratto",
    rule: 'La tua parola non può essere una cosa che si tocca: solo idee, sentimenti, stati d’animo.',
    emoji: '☁️',
    kind: 'sottoclasse',
  },
  {
    id: 'concreto',
    name: 'Il Concreto',
    rule: 'La tua parola deve essere una cosa che si può toccare.',
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
