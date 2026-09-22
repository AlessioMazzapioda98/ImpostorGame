# Impostor Game

Party game da giocare passandosi un solo telefono. Tutti leggono la parola segreta
tranne gli impostori, che ricevono un indizio e i nomi degli altri impostori. A turno
ognuno dice una parola collegata, poi si vota. L'impostore che viene scoperto ha
un'ultima occasione: se indovina la parola, vincono gli impostori.

L'indizio dell'impostore è la **categoria** da cui è uscita la parola: lo mette sulla
strada giusta senza consegnargliela, e ha sempre la stessa difficoltà, cosa che un
indizio scritto a mano non riesce ad avere.

In più, ogni giocatore riceve un **archetipo** insieme alla propria carta: un vincolo
sul modo in cui deve dire la sua parola (Il Poeta deve rimare, Il Minimalista non può
superare le quattro lettere, Il Cantante deve cantare). Gli archetipi valgono per tutti,
impostori compresi, così non tradiscono il ruolo.

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

- Da 4 a 12 giocatori. Sotto i quattro la partita è una votazione sola: se i due
  normali sbagliano restano in due contro l'impostore e hanno già perso.
- Un impostore fino a sette giocatori, due da otto in su. Il massimo è tre, e sale
  molto più piano di prima: ogni impostore in più allunga la partita, e più la
  partita dura più parole sente l'impostore, finché la parola gliela regala il tavolo.
- L'impostore legge la categoria della parola. Vale qualcosa solo se le categorie in
  gioco sono almeno due, altrimenti la sanno già tutti. I giocatori normali la
  categoria non la vedono.
- Le carte si consegnano una alla volta, con una schermata di copertura tra un
  giocatore e l'altro. Ogni carta resta aperta lo stesso tempo per tutti
  (`settings.revealSeconds`, 15 di default), così chi legge più lentamente non sembra
  l'impostore per questo. Si può spegnere mettendolo a zero, ma spegnendolo il tempo
  di lettura torna a essere un indizio.
- Il voto è a volte segreto e a volte a mano alzata, estratto a inizio partita. Il
  primo voto è sempre segreto, perché a mano alzata senza ancora nessun indizio ci si
  accoderebbe soltanto al primo che parla. Si può anche fissarlo su una delle due.
- In caso di pareggio non viene eliminato nessuno e si passa al giro successivo.
- Solo l'ultimo impostore rimasto, quando viene scoperto, può tentare la parola. Se
  la indovina vincono gli impostori. Gli impostori scoperti prima non tentano: dare
  un tentativo a ciascuno regalava loro la partita ogni volta che erano più di uno.
- Vincono i giocatori normali quando cade l'ultimo impostore e questo non indovina.
- Vincono gli impostori se restano in numero pari ai giocatori normali.

## Com'è fatto

```
src/game/      logica pura, senza React: stato della partita, voti, vittoria
  types.ts       i tipi condivisi
  engine.ts      creazione partita, carte, votazione, fine partita
  words.ts       le categorie di parole con il relativo indizio
  archetypes.ts  gli archetipi
  engine.test.ts i test della logica
src/screens/   una schermata per ogni fase: consegna, giro, voto, esito
src/App.tsx    tiene lo stato della partita e sceglie la schermata
```

La logica sta tutta in `src/game/engine.ts` come funzioni pure che prendono uno stato
e ne restituiscono uno nuovo, quindi è testabile senza aprire il browser.

## Aggiungere parole o archetipi

Le parole stanno in `src/game/words.ts`, raggruppate per categoria: basta la parola,
perché l'indizio è il nome della categoria. Gli archetipi stanno in
`src/game/archetypes.ts`: bastano un nome, la regola scritta rivolgendosi al giocatore
e un'emoji.

## Controllare il bilanciamento

`src/game/bilanciamento.ts` simula migliaia di partite per ogni configurazione, senza
dover radunare dieci amici. Non imita le parole, che nessun modello sa imitare: imita
le due cose che decidono la partita, cioè quanto il gruppo vota meglio del caso e
quanto l'impostore si avvicina alla parola a ogni giro che passa.

`npm test` esegue anche `bilanciamento.test.ts`, che non controlla il codice ma le
regole: se una modifica rende una configurazione una vittoria annunciata, o allunga
troppo le partite, quei test si rompono.
