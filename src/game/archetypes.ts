import type { Archetype, ArchetypeCategory } from './types'

/**
 * Gli archetipi vincolano il modo di dire la propria parola: valgono allo stesso
 * modo per i giocatori normali e per gli impostori, così non tradiscono il ruolo.
 *
 * Ogni archetipo dichiara due cose oltre al testo:
 * - `category`, cioè su cosa mette le mani (la parola, la voce, il significato, il tavolo);
 * - `level`, cioè quanto ti mette nei guai.
 * Servono a distribuirli bene, vedi `assignArchetypes` in engine.ts.
 */
export const ARCHETYPES: Archetype[] = [
  // --- forma: vincolano com'è fatta la parola, e il tavolo può verificarlo ---
  {
    id: 'poeta',
    name: 'Il Poeta',
    rule: 'La tua parola deve fare rima con quella detta dal giocatore prima di te.',
    emoji: '🪶',
    category: 'forma',
    level: 3,
    dependsOnPrevious: true,
  },
  {
    id: 'catena',
    name: 'La Catena',
    rule: "La tua parola deve iniziare con l'ultima lettera della parola detta prima di te.",
    emoji: '🔗',
    category: 'forma',
    level: 2,
    dependsOnPrevious: true,
  },
  {
    id: 'minimalista',
    name: 'Il Minimalista',
    rule: 'La tua parola non può superare le cinque lettere.',
    emoji: '🔹',
    category: 'forma',
    level: 2,
  },
  {
    id: 'grandioso',
    name: 'Il Grandioso',
    rule: 'La tua parola deve essere lunga almeno nove lettere.',
    emoji: '🗿',
    category: 'forma',
    level: 2,
  },
  {
    id: 'logorroico',
    name: 'Il Logorroico',
    rule: 'Non ti basta una parola: devi dirne due, e devono stare bene insieme.',
    emoji: '💬',
    category: 'forma',
    level: 1,
  },
  {
    id: 'straniero',
    name: 'Lo Straniero',
    rule: "Devi dire la tua parola in una lingua che non è l'italiano.",
    emoji: '🌍',
    category: 'forma',
    level: 2,
  },
  {
    id: 'omonimo',
    name: "L'Omonimo",
    rule: 'La tua parola deve iniziare con la stessa lettera del tuo nome.',
    emoji: '🅰️',
    category: 'forma',
    level: 2,
  },
  {
    id: 'raddoppio',
    name: 'Il Raddoppio',
    rule: 'La tua parola deve contenere una doppia, come in nonno o in pizza.',
    emoji: '🔁',
    category: 'forma',
    level: 2,
  },
  {
    id: 'azione',
    name: "L'Uomo d'Azione",
    rule: "La tua parola deve essere un verbo all'infinito.",
    emoji: '🏃',
    category: 'forma',
    level: 2,
  },
  {
    id: 'proibizionista',
    name: 'Il Proibizionista',
    rule: 'Nella tua parola non può comparire la lettera A.',
    emoji: '🚫',
    category: 'forma',
    level: 3,
  },
  {
    id: 'plurale',
    name: 'Il Plurale',
    rule: 'La tua parola deve essere al plurale.',
    emoji: '👥',
    category: 'forma',
    level: 1,
  },

  // --- voce: vincolano come la dici, non cambiano l'informazione che passa ---
  {
    id: 'cantante',
    name: 'Il Cantante',
    rule: 'Devi cantare la tua parola invece di dirla.',
    emoji: '🎤',
    category: 'voce',
    level: 1,
  },
  {
    id: 'robot',
    name: 'Il Robot',
    rule: 'Devi dire la tua parola scandendo le sillabe, con voce piatta.',
    emoji: '🤖',
    category: 'voce',
    level: 1,
  },
  {
    id: 'gesticolatore',
    name: 'Il Gesticolatore',
    rule: 'Devi accompagnare la tua parola con un gesto plateale.',
    emoji: '🙌',
    category: 'voce',
    level: 1,
  },
  {
    id: 'timido',
    name: 'Il Timido',
    rule: 'Devi dire la tua parola sussurrando, giusto abbastanza da farti sentire.',
    emoji: '🤫',
    category: 'voce',
    level: 1,
  },
  {
    id: 'doppiatore',
    name: 'Il Doppiatore',
    rule: 'Devi dire la tua parola con una voce che non è la tua: un accento, un personaggio, quello che vuoi.',
    emoji: '🎬',
    category: 'voce',
    level: 1,
  },
  {
    id: 'filosofo',
    name: 'Il Filosofo',
    rule: 'Devi dire la tua parola sotto forma di domanda, come se non fossi sicuro.',
    emoji: '🤔',
    category: 'voce',
    level: 1,
  },
  {
    id: 'cronista',
    name: 'Il Cronista',
    rule: 'Devi dire la tua parola come se stessi commentando una partita in diretta.',
    emoji: '🎙️',
    category: 'voce',
    level: 1,
  },
  {
    id: 'solenne',
    name: 'Il Solenne',
    rule: 'Devi alzarti in piedi e annunciare la tua parola come fosse una notizia importante.',
    emoji: '📯',
    category: 'voce',
    level: 1,
  },

  // --- senso: vincolano cosa può significare la parola, e sporcano la deduzione ---
  {
    id: 'depistatore',
    name: 'Il Depistatore',
    rule: 'La tua parola deve portare gli altri fuori strada: collegata alla parola segreta solo alla lontana.',
    emoji: '🌫️',
    category: 'senso',
    level: 3,
  },
  {
    id: 'ottimista',
    name: "L'Ottimista",
    rule: 'La tua parola deve essere qualcosa di positivo, che mette di buon umore.',
    emoji: '☀️',
    category: 'senso',
    level: 2,
  },
  {
    id: 'catastrofista',
    name: 'Il Catastrofista',
    rule: 'La tua parola deve essere qualcosa di brutto, che mette ansia.',
    emoji: '🌩️',
    category: 'senso',
    level: 2,
  },
  {
    id: 'nostalgico',
    name: 'Il Nostalgico',
    rule: 'La tua parola deve riguardare il passato: qualcosa di vecchio o di quando eri bambino.',
    emoji: '📼',
    category: 'senso',
    level: 2,
  },
  {
    id: 'futurista',
    name: 'Il Futurista',
    rule: 'La tua parola deve riguardare il futuro: qualcosa che deve ancora arrivare.',
    emoji: '🚀',
    category: 'senso',
    level: 2,
  },
  {
    id: 'goloso',
    name: 'Il Goloso',
    rule: 'La tua parola deve avere a che fare con il cibo, qualunque sia la parola segreta.',
    emoji: '🍝',
    category: 'senso',
    level: 3,
  },
  {
    id: 'concreto',
    name: 'Il Concreto',
    rule: 'La tua parola deve essere una cosa che si può toccare.',
    emoji: '🧱',
    category: 'senso',
    level: 2,
  },
  {
    id: 'astratto',
    name: "L'Astratto",
    rule: 'La tua parola non può essere una cosa che si tocca: solo idee, sentimenti, stati d’animo.',
    emoji: '☁️',
    category: 'senso',
    level: 3,
  },
  {
    id: 'casalingo',
    name: 'Il Casalingo',
    rule: 'La tua parola deve essere qualcosa che hai in casa.',
    emoji: '🏠',
    category: 'senso',
    level: 3,
  },

  // --- tavolo: ti obbligano a fare qualcosa verso gli altri, e muovono il voto ---
  {
    id: 'accusatore',
    name: "L'Accusatore",
    rule: 'Subito dopo la tua parola devi accusare qualcuno ad alta voce, anche senza motivo.',
    emoji: '👉',
    category: 'tavolo',
    level: 2,
  },
  {
    id: 'pappagallo',
    name: 'Il Pappagallo',
    rule: 'Prima di dire la tua, devi ripetere la parola di un altro giocatore.',
    emoji: '🦜',
    category: 'tavolo',
    level: 2,
    dependsOnPrevious: true,
  },
  {
    id: 'avvocato',
    name: "L'Avvocato",
    rule: 'Prima del voto devi difendere un giocatore e spiegare perché è innocente.',
    emoji: '🛡️',
    category: 'tavolo',
    level: 2,
  },
  {
    id: 'silenzioso',
    name: 'Il Silenzioso',
    rule: 'Dopo la tua parola non puoi più parlare fino al voto.',
    emoji: '🤐',
    category: 'tavolo',
    level: 3,
  },
  {
    id: 'fissatore',
    name: 'Il Fissatore',
    rule: 'Devi dire la tua parola fissando negli occhi un solo giocatore.',
    emoji: '👁️',
    category: 'tavolo',
    level: 1,
  },
  {
    id: 'presentatore',
    name: 'Il Presentatore',
    rule: 'Prima della tua parola devi presentare con enfasi il giocatore che parla dopo di te.',
    emoji: '🎩',
    category: 'tavolo',
    level: 1,
  },
]

/** Come chiamare le categorie quando si mostrano al giocatore. */
export const ARCHETYPE_CATEGORY_LABELS: Record<ArchetypeCategory, string> = {
  forma: 'Forma della parola',
  voce: 'Modo di dirla',
  senso: 'Significato',
  tavolo: 'Verso gli altri',
}

/** Come descrivere il livello quando si sceglie quanto cattiva sarà la partita. */
export const ARCHETYPE_LEVEL_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Solo scenette',
  2: 'Normale',
  3: 'Senza pietà',
}

/** Gli archetipi fino al livello scelto: 1 fa solo ridere, 3 fa anche perdere. */
export function archetypesUpToLevel(maxLevel: 1 | 2 | 3): Archetype[] {
  return ARCHETYPES.filter((archetype) => archetype.level <= maxLevel)
}
