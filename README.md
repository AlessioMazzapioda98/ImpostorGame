# Impostor Game

Party game da giocare passandosi un solo telefono. Tutti leggono la parola segreta
tranne gli impostori, che ricevono un indizio e i nomi degli altri impostori. A turno
ognuno dice una parola collegata, poi si vota. L'impostore che viene scoperto ha
un'ultima occasione: se indovina la parola, vincono gli impostori.

In più, come in un gioco di ruolo, ogni giocatore riceve due archetipi insieme alla
propria carta: una **classe**, che vincola come si comporta durante la discussione e al
voto (L'Accusatore deve prendersela con una persona sorteggiata dal gioco, Il Silenzioso
non può parlare), e una **sottoclasse**, che vincola le parole che può dire al proprio
turno (Il Minimalista non supera le cinque lettere, Il Goloso parla di cibo qualunque
sia la parola segreta). Valgono per tutti, impostori compresi, così non tradiscono il
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
  archetypes.ts  gli archetipi: classi e sottoclassi
  engine.test.ts i test della logica
src/screens/   una schermata per ogni fase: consegna, giro, voto, esito
src/App.tsx    tiene lo stato della partita e sceglie la schermata
```

La logica sta tutta in `src/game/engine.ts` come funzioni pure che prendono uno stato
e ne restituiscono uno nuovo, quindi è testabile senza aprire il browser.

## Gli archetipi

Stanno in `src/game/archetypes.ts`, in un solo elenco diviso da `kind`:

- `classe` vincola il comportamento nella discussione e al voto. Sono tredici.
- `sottoclasse` vincola le parole che puoi dire al tuo turno. Sono tredici.

Nessuno dei due riguarda il tono o il modo di pronunciare la parola: cantare o
sussurrare fa ridere per due secondi e non cambia niente di quello che il tavolo deve
capire.

Le classi con `needsTarget` nominano un altro giocatore, che il gioco sorteggia a inizio
partita fra gli altri e scrive sulla carta. Nel testo della regola sta il segnaposto
`{bersaglio}`, e `archetypeRule(archetype, targetName)` ci mette il nome vero: le regole
sono scritte in modo da non prendere genere, perché il bersaglio può essere chiunque.

`assignArchetypeCards` in `src/game/engine.ts` pesca da due mazzi mescolati, una classe
e una sottoclasse a testa, senza bilanciamenti e senza tetti. Se i giocatori superano
gli archetipi di un mazzo, quel mazzo si rimescola e qualcuno può ripetersi.

## Aggiungere parole

Le parole stanno in `src/game/words.ts`, raggruppate per categoria: ogni voce ha la
parola e l'indizio che leggerà l'impostore.
