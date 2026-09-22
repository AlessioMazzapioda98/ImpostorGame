import type { Archetype, ArchetypeCategory } from './types'

/**
 * Gli archetipi vincolano quello che il giocatore può dire al proprio turno: valgono
 * allo stesso modo per i giocatori normali e per gli impostori, così non tradiscono
 * il ruolo.
 *
 * Nessun archetipo riguarda il tono o il modo di pronunciare la parola: cantare o
 * sussurrare fa ridere per due secondi e non cambia niente di quello che il tavolo
 * deve capire. Ogni archetipo qui dentro vincola la parola, il suo significato o il
 * voto.
 *
 * Oltre al testo ognuno dichiara due cose, che servono a distribuirli bene
 * (vedi `assignArchetypes` in engine.ts):
 * - `category`, cioè su cosa mette le mani;
 * - `trap`, vero se può farti sembrare l'impostore anche quando sei innocente.
 */
export const ARCHETYPES: Archetype[] = [
  // --- forma: vincolano com'è fatta la parola, e il tavolo può verificarlo dopo ---
  {
    id: 'poeta',
    name: 'Il Poeta',
    rule: 'La tua parola deve fare rima con quella detta dal giocatore prima di te.',
    emoji: '🪶',
    category: 'forma',
    trap: true,
    dependsOnPrevious: true,
  },
  {
    id: 'catena',
    name: 'La Catena',
    rule: "La tua parola deve iniziare con l'ultima lettera della parola detta prima di te.",
    emoji: '🔗',
    category: 'forma',
    dependsOnPrevious: true,
  },
  {
    id: 'omonimo',
    name: "L'Omonimo",
    rule: 'Tutte le tue parole, in ogni giro, devono iniziare con la stessa lettera del tuo nome.',
    emoji: '🅰️',
    category: 'forma',
  },
  {
    id: 'minimalista',
    name: 'Il Minimalista',
    rule: 'La tua parola non può superare le cinque lettere.',
    emoji: '🔹',
    category: 'forma',
  },
  {
    id: 'grandioso',
    name: 'Il Grandioso',
    rule: 'La tua parola deve essere lunga almeno nove lettere.',
    emoji: '🗿',
    category: 'forma',
  },
  {
    id: 'proibizionista',
    name: 'Il Proibizionista',
    rule: 'Nella tua parola non può comparire la lettera A.',
    emoji: '🚫',
    category: 'forma',
    trap: true,
  },
  {
    id: 'raddoppio',
    name: 'Il Raddoppio',
    rule: 'La tua parola deve contenere una doppia, come in nonno o in pizza.',
    emoji: '🔁',
    category: 'forma',
  },
  {
    id: 'azione',
    name: "L'Uomo d'Azione",
    rule: "La tua parola deve essere un verbo all'infinito.",
    emoji: '🏃',
    category: 'forma',
  },
  {
    id: 'logorroico',
    name: 'Il Logorroico',
    rule: 'Non ti basta una parola: devi dirne due, e devono stare bene insieme.',
    emoji: '💬',
    category: 'forma',
  },
  {
    id: 'straniero',
    name: 'Lo Straniero',
    rule: "Devi dire la tua parola in una lingua che non è l'italiano.",
    emoji: '🌍',
    category: 'forma',
  },
  {
    id: 'plurale',
    name: 'Il Plurale',
    rule: 'La tua parola deve essere al plurale.',
    emoji: '👥',
    category: 'forma',
  },

  // --- senso: vincolano cosa può significare la parola, e sporcano la deduzione ---
  {
    id: 'matto',
    name: 'Il Matto',
    rule: 'Nessuna regola. Puoi dire quello che ti pare, anche una parola che non azzecca niente.',
    emoji: '🃏',
    category: 'senso',
    trap: true,
  },
  {
    id: 'salterino',
    name: 'Il Salterino',
    rule: 'Il collegamento con la parola segreta deve essere lungo: ci devono volere almeno due passaggi per arrivarci.',
    emoji: '🦘',
    category: 'senso',
    trap: true,
  },
  {
    id: 'depistatore',
    name: 'Il Depistatore',
    rule: 'La tua parola deve portare gli altri fuori strada: collegata alla parola segreta solo alla lontana.',
    emoji: '🌫️',
    category: 'senso',
    trap: true,
  },
  {
    id: 'basico',
    name: 'Il Basico',
    rule: 'La tua parola deve essere la più scontata possibile, la prima che verrebbe in mente a chiunque.',
    emoji: '🥱',
    category: 'senso',
  },
  {
    id: 'fuoriluogo',
    name: 'Il Fuoriluogo',
    rule: 'La tua parola deve essere fuori luogo: volgare, imbarazzante, di quelle che a tavola fanno calare il silenzio.',
    emoji: '🙊',
    category: 'senso',
    trap: true,
  },
  {
    id: 'goloso',
    name: 'Il Goloso',
    rule: 'La tua parola deve avere a che fare con il cibo, qualunque sia la parola segreta.',
    emoji: '🍝',
    category: 'senso',
    trap: true,
  },
  {
    id: 'casalingo',
    name: 'Il Casalingo',
    rule: 'La tua parola deve essere qualcosa che hai in casa.',
    emoji: '🏠',
    category: 'senso',
    trap: true,
  },
  {
    id: 'astratto',
    name: "L'Astratto",
    rule: 'La tua parola non può essere una cosa che si tocca: solo idee, sentimenti, stati d’animo.',
    emoji: '☁️',
    category: 'senso',
    trap: true,
  },
  {
    id: 'concreto',
    name: 'Il Concreto',
    rule: 'La tua parola deve essere una cosa che si può toccare.',
    emoji: '🧱',
    category: 'senso',
  },
  {
    id: 'ottimista',
    name: "L'Ottimista",
    rule: 'La tua parola deve essere qualcosa di positivo, che mette di buon umore.',
    emoji: '☀️',
    category: 'senso',
  },
  {
    id: 'catastrofista',
    name: 'Il Catastrofista',
    rule: 'La tua parola deve essere qualcosa di brutto, che mette ansia.',
    emoji: '🌩️',
    category: 'senso',
  },
  {
    id: 'nostalgico',
    name: 'Il Nostalgico',
    rule: 'La tua parola deve riguardare il passato: qualcosa di vecchio o di quando eri bambino.',
    emoji: '📼',
    category: 'senso',
  },
  {
    id: 'futurista',
    name: 'Il Futurista',
    rule: 'La tua parola deve riguardare il futuro: qualcosa che deve ancora arrivare.',
    emoji: '🚀',
    category: 'senso',
  },

  // --- tavolo: non toccano la parola, spostano il voto ---
  {
    id: 'ossessionato',
    name: "L'Ossessionato",
    rule: 'Scegli adesso un giocatore: devi votare lui a ogni votazione, qualunque cosa succeda.',
    emoji: '🎯',
    category: 'tavolo',
    trap: true,
  },
  {
    id: 'rivale',
    name: 'Il Rivale',
    rule: 'Scegli adesso un giocatore: non puoi votarlo per nessun motivo, nemmeno se confessa.',
    emoji: '👊',
    category: 'tavolo',
    trap: true,
  },
  {
    id: 'silenzioso',
    name: 'Il Silenzioso',
    rule: 'Dopo la tua parola non puoi più parlare fino al voto.',
    emoji: '🤐',
    category: 'tavolo',
    trap: true,
  },
  {
    id: 'accusatore',
    name: "L'Accusatore",
    rule: 'Subito dopo la tua parola devi accusare qualcuno ad alta voce, anche senza motivo.',
    emoji: '👉',
    category: 'tavolo',
  },
  {
    id: 'avvocato',
    name: "L'Avvocato",
    rule: 'Prima del voto devi difendere un giocatore e spiegare perché è innocente.',
    emoji: '🛡️',
    category: 'tavolo',
  },
  {
    id: 'voltagabbana',
    name: 'Il Voltagabbana',
    rule: 'Non puoi votare la stessa persona che hai votato nel giro precedente.',
    emoji: '🔄',
    category: 'tavolo',
  },
]

/** Come chiamare le categorie quando si mostrano al giocatore. */
export const ARCHETYPE_CATEGORY_LABELS: Record<ArchetypeCategory, string> = {
  forma: 'Forma della parola',
  senso: 'Significato',
  tavolo: 'Verso gli altri',
}

/**
 * Gli archetipi che possono entrare in partita: senza trappole restano solo quelli
 * che ti complicano la parola, e nessuno rischia di farsi linciare da innocente.
 */
export function playableArchetypes(trapsEnabled: boolean): Archetype[] {
  return trapsEnabled ? ARCHETYPES : ARCHETYPES.filter((archetype) => !archetype.trap)
}
