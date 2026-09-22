import { Avatar } from './Avatar'
import { Screen, ScreenActions, ScreenBody } from './Screen'
import { vibra } from './haptics'

interface Props {
  nome: string
  /** Es. "Carta 2 di 5": dice a colpo d'occhio quanto manca al giro completo. */
  passo: string
  nota: string
  azione: string
  onPronto: () => void
}

/**
 * La schermata di passaggio del telefono. Sta in mezzo a ogni momento segreto e
 * serve a due cose: dire ad alta voce a chi tocca, e coprire quello che c'era
 * prima sullo schermo mentre il telefono attraversa il tavolo.
 */
export function Handoff({ nome, passo, nota, azione, onPronto }: Props) {
  return (
    <Screen center>
      <ScreenBody>
        <div className="handoff">
          <p className="eyebrow">{passo}</p>
          <div className="handoff-target">
            <Avatar nome={nome} dimensione="lg" />
            <h1>
              Passa il telefono a<br />
              <span className="handoff-nome">{nome}</span>
            </h1>
          </div>
          <p className="muted handoff-nota">{nota}</p>
        </div>
      </ScreenBody>
      <ScreenActions>
        <button
          type="button"
          className="btn"
          onClick={() => {
            vibra('tocco')
            onPronto()
          }}
        >
          Sono {nome}, {azione}
        </button>
      </ScreenActions>
    </Screen>
  )
}
