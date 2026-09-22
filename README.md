# Impostor Game

Party game da giocare passandosi un solo telefono. Tutti leggono la parola segreta
tranne gli impostori, che ricevono un indizio e i nomi degli altri impostori. A turno
ognuno dice una parola collegata, poi si vota. L'impostore che viene scoperto ha
un'ultima occasione: se indovina la parola, vincono gli impostori.

In più, ogni giocatore riceve un **archetipo** insieme alla propria carta: un vincolo
su quello che può dire al proprio turno (Il Poeta deve rimare, Il Minimalista non può
superare le cinque lettere, Il Goloso deve parlare di cibo qualunque sia la parola
segreta). Gli archetipi valgono per tutti, impostori compresi, così non tradiscono il
ruolo.

## Come si avvia

Serve Node 20 o superiore.

```bash
npm install
npm run dev      # apre l'app in sviluppo su http://localhost:5173
npm run build    # compila la versione di produzione in dist/
npm run preview  # prova la versione compilata
npm test         # esegue i test della logica di gioco
```

L'app è una PWA: aperta dal telefono si può aggiungere alla schermata home e da lì
funziona a schermo intero e anche senza connessione.

## Regole applicate dall'app

- Da 3 a 12 giocatori, con un numero di impostori sempre inferiore alla metà.
- Le carte si consegnano una alla volta, con una schermata di copertura tra un
  giocatore e l'altro.
- Il voto è segreto: il telefono gira di nuovo e ognuno sceglie il proprio sospetto.
- In caso di pareggio non viene eliminato nessuno e si passa al giro successivo.
- Vincono i giocatori normali quando cade l'ultimo impostore.
- Vincono gli impostori se un impostore eliminato indovina la parola, oppure se
  restano in numero pari ai giocatori normali.

## Com'è fatto

```
src/game/      logica pura, senza React: stato della partita, voti, vittoria
  types.ts       i tipi condivisi
  engine.ts      creazione partita, carte, votazione, fine partita
  words.ts       le categorie di parole con il relativo indizio
  archetypes.ts  gli archetipi, con categoria e livello
  engine.test.ts i test della logica
src/screens/   una schermata per ogni fase: consegna, giro, voto, esito
src/App.tsx    tiene lo stato della partita e sceglie la schermata
```

La logica sta tutta in `src/game/engine.ts` come funzioni pure che prendono uno stato
e ne restituiscono uno nuovo, quindi è testabile senza aprire il browser.

## Gli archetipi

Stanno in `src/game/archetypes.ts`. Nessuno di loro riguarda il tono o il modo di
pronunciare la parola: cantare o sussurrare fa ridere per due secondi e non cambia
niente di quello che il tavolo deve capire. Ognuno vincola la parola, il suo
significato o il voto, e dichiara due cose oltre al testo della regola:

- `category`, cioè su cosa mette le mani.
  - `forma` vincola com'è fatta la parola, e il tavolo può verificarlo dopo (rima,
    lunghezza, lettere, lingua).
  - `senso` vincola cosa può significare, quindi sporca la deduzione.
  - `tavolo` non tocca la parola, sposta il voto.
- `trap`, vero se può farti sembrare l'impostore anche quando sei innocente.

`assignArchetypes` in `src/game/engine.ts` segue l'ordine di parola e tiene conto di
entrambi: alterna le categorie invece di ammucchiarle, non supera il tetto di trappole
(`trapBudget`, circa una ogni tre giocatori) e non dà mai a chi apre il giro una regola
che guarda la parola precedente, né due di quelle regole a giocatori consecutivi.

Con `settings.trapsEnabled` a falso restano solo gli archetipi che complicano la parola
senza far perdere nessuno per sbaglio. Il valore predefinito è vero.

## Aggiungere parole

Le parole stanno in `src/game/words.ts`, raggruppate per categoria: ogni voce ha la
parola e l'indizio che leggerà l'impostore.
