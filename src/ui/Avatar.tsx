/**
 * Una pastiglia colorata con le iniziali. Durante la partita i nomi si leggono
 * di sfuggita, e un colore sempre uguale per la stessa persona si riconosce
 * prima della parola scritta.
 */

const TINTE = [265, 200, 330, 150, 25, 300, 175, 45, 230, 355, 120, 285]

function tinta(nome: string): number {
  let somma = 0
  for (let i = 0; i < nome.length; i += 1) somma = (somma * 31 + nome.charCodeAt(i)) % 100003
  return TINTE[somma % TINTE.length]
}

function iniziali(nome: string): string {
  const parole = nome.trim().split(/\s+/).filter(Boolean)
  if (parole.length === 0) return '?'
  if (parole.length === 1) return parole[0].slice(0, 2).toUpperCase()
  return (parole[0][0] + parole[1][0]).toUpperCase()
}

interface Props {
  nome: string
  dimensione?: 'sm' | 'md' | 'lg'
  spento?: boolean
}

export function Avatar({ nome, dimensione = 'md', spento = false }: Props) {
  const h = tinta(nome)
  return (
    <span
      className={`avatar avatar-${dimensione}${spento ? ' avatar-spento' : ''}`}
      aria-hidden="true"
      style={{
        background: `linear-gradient(150deg, hsl(${h} 78% 72%), hsl(${(h + 28) % 360} 70% 56%))`,
      }}
    >
      {iniziali(nome)}
    </span>
  )
}
