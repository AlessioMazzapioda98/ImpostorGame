import { Fragment } from 'react'
import { SEGNAPOSTO_BERSAGLIO } from '../game/archetypes'
import type { Archetype } from '../game/types'
import { Avatar } from './Avatar'

interface Props {
  archetype: Archetype
  targetName: string | null
}

/**
 * La regola di un archetipo. Se nomina un bersaglio, il nome non resta testo
 * dentro la frase: diventa una pastiglia col colore di quella persona. È
 * l'unica cosa della carta che cambia a ogni partita, e va ritrovata a colpo
 * d'occhio senza rileggere la regola.
 */
export function RegolaArchetipo({ archetype, targetName }: Props) {
  if (!archetype.needsTarget) return <>{archetype.rule}</>

  const pezzi = archetype.rule.split(SEGNAPOSTO_BERSAGLIO)

  return (
    <>
      {pezzi.map((pezzo, indice) => (
        <Fragment key={indice}>
          {pezzo}
          {indice < pezzi.length - 1 &&
            (targetName ? (
              // Tre regole nominano il bersaglio due volte. La pastiglia piena
              // serve a farlo trovare, e una sola basta: ripeterla raddoppia
              // l'ingombro senza aggiungere niente da leggere.
              indice === 0 ? (
                <span className="bersaglio">
                  <Avatar nome={targetName} dimensione="sm" />
                  {targetName}
                </span>
              ) : (
                <span className="bersaglio-ripetuto">{targetName}</span>
              )
            ) : (
              'il giocatore indicato'
            ))}
        </Fragment>
      ))}
    </>
  )
}
