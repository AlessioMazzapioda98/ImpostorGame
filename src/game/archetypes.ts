import type { Archetype } from './types'

/**
 * Gli archetipi vincolano il modo di dire la propria parola: valgono allo stesso
 * modo per i giocatori normali e per gli impostori, così non tradiscono il ruolo.
 */
export const ARCHETYPES: Archetype[] = [
  {
    id: 'poeta',
    name: 'Il Poeta',
    rule: 'La tua parola deve fare rima con quella detta dal giocatore prima di te. Se sei il primo, scegli tu la rima.',
    emoji: '🪶',
  },
  {
    id: 'depistatore',
    name: 'Il Depistatore',
    rule: 'La tua parola deve portare gli altri fuori strada: collegata alla parola segreta solo alla lontana.',
    emoji: '🌫️',
  },
  {
    id: 'logorroico',
    name: 'Il Logorroico',
    rule: 'Non ti basta una parola: devi dirne due, e devono stare bene insieme.',
    emoji: '💬',
  },
  {
    id: 'timido',
    name: 'Il Timido',
    rule: 'Devi dire la tua parola sussurrando, senza ripeterla se non ti hanno sentito.',
    emoji: '🤫',
  },
  {
    id: 'copione',
    name: 'Il Copione',
    rule: "La tua parola deve iniziare con l'ultima lettera della parola detta prima di te.",
    emoji: '🔗',
  },
  {
    id: 'accusatore',
    name: "L'Accusatore",
    rule: 'Subito dopo la tua parola devi accusare qualcuno ad alta voce, anche senza motivo.',
    emoji: '👉',
  },
  {
    id: 'precisino',
    name: 'Il Precisino',
    rule: 'La tua parola deve essere lunga almeno otto lettere.',
    emoji: '📏',
  },
  {
    id: 'minimalista',
    name: 'Il Minimalista',
    rule: 'La tua parola deve essere di quattro lettere al massimo.',
    emoji: '🔹',
  },
  {
    id: 'straniero',
    name: 'Lo Straniero',
    rule: 'Devi dire la tua parola in una lingua che non è italiano.',
    emoji: '🌍',
  },
  {
    id: 'gesticolatore',
    name: 'Il Gesticolatore',
    rule: 'Ogni volta che parli devi accompagnare la parola con un gesto plateale.',
    emoji: '🙌',
  },
  {
    id: 'filosofo',
    name: 'Il Filosofo',
    rule: 'Devi dire la tua parola sotto forma di domanda, come se non fossi sicuro.',
    emoji: '🤔',
  },
  {
    id: 'ottimista',
    name: "L'Ottimista",
    rule: 'La tua parola deve essere qualcosa di positivo, che mette di buon umore.',
    emoji: '☀️',
  },
  {
    id: 'nostalgico',
    name: 'Il Nostalgico',
    rule: 'La tua parola deve riguardare il passato: qualcosa di vecchio o di quando eri bambino.',
    emoji: '📼',
  },
  {
    id: 'robot',
    name: 'Il Robot',
    rule: 'Devi dire la tua parola scandendo le sillabe, con voce piatta.',
    emoji: '🤖',
  },
  {
    id: 'cantante',
    name: 'Il Cantante',
    rule: 'Devi cantare la tua parola invece di dirla.',
    emoji: '🎤',
  },
  {
    id: 'pappagallo',
    name: 'Il Pappagallo',
    rule: 'Prima della tua parola devi ripetere quella di un altro giocatore.',
    emoji: '🦜',
  },
]
