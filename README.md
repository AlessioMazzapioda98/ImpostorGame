# Impostor Game

Party game da giocare passandosi un solo telefono. Tutti leggono la parola segreta
tranne gli impostori, che ricevono un indizio e i nomi degli altri impostori. A turno
ognuno dice una parola collegata, poi si vota. L'impostore che viene scoperto ha
un'ultima occasione: se indovina la parola, vincono gli impostori.

L'indizio dell'impostore è la **categoria** da cui è uscita la parola: lo mette sulla
strada giusta senza consegnargliela, e ha sempre la stessa difficoltà, cosa che un
indizio scritto a mano non riesce ad avere.

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

- Da 4 a 12 giocatori. Sotto i quattro la partita è una votazione sola: se i due
  normali sbagliano restano in due contro l'impostore e hanno già perso.
- Un impostore fino a sette giocatori, due da otto in su, e mai più di due. Un
  impostore in più non aiuta mai il tavolo, anche se sembrerebbe di sì perché a ogni
  giro si dicono meno parole vere: servono più votazioni per scoprirli tutti, quindi
  alla fine di parole vere ne sente di più, e intanto gli impostori votano compatti
  sullo stesso innocente mentre i normali si sparpagliano. Con tre impostori i
  giocatori normali vincono meno di una partita su dieci.
- L'impostore legge la categoria della parola. Vale qualcosa solo se le categorie in
  gioco sono almeno due, altrimenti la sanno già tutti. I giocatori normali la
  categoria non la vedono.
- Le carte si consegnano una alla volta, con una schermata di copertura tra un
  giocatore e l'altro. Ogni carta resta aperta lo stesso tempo per tutti
  (`settings.revealSeconds`, 20 di default), così chi legge più lentamente non sembra
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
  words.ts       le categorie di parole: il nome della categoria è l'indizio
  archetypes.ts  gli archetipi, con categoria e flag trap
  engine.test.ts i test della logica
  bilanciamento.ts  la simulazione che controlla le regole
src/ui/        pezzi comuni dell'interfaccia: carta segreta, passaggio del
               telefono, conto alla rovescia, vibrazione, preferenze
src/screens/   una schermata per ogni fase: consegna, giro, voto, esito
src/App.tsx    tiene lo stato della partita e sceglie la schermata
```

L'interfaccia è pensata per un telefono che gira di mano in mano: la carta segreta si
scopre **tenendo premuto** e si richiude appena stacchi il dito, e a carta chiusa il
contenuto non viene proprio disegnato, così non si sbircia di lato. Il pulsante per
passare al prossimo compare solo a tempo scaduto.

Le preferenze di `src/ui/preferences.ts` (tenere premuto, vibrazione) sono separate da
`Settings`: cambiano come si usa il telefono, non le regole. Il tempo della carta non
sta lì ma in `Settings.revealSeconds`, perché cambia quale informazione trapela dal
tavolo.

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

`assignArchetypes` in `src/game/engine.ts` li pesca a caso: un archetipo a testa da un
mazzo mescolato, senza bilanciare le categorie e senza tetti. Se i giocatori superano
gli archetipi disponibili il mazzo si rimescola, quindi qualcuno può ripetersi.

Con `settings.trapsEnabled` a falso restano solo gli archetipi che complicano la parola
senza far perdere nessuno per sbaglio. Il valore predefinito è vero.

## Aggiungere parole

Le parole stanno in `src/game/words.ts`, raggruppate per categoria: basta la parola,
perché l'indizio è il nome della categoria. Gli archetipi stanno in
`src/game/archetypes.ts`: servono un nome, la regola scritta rivolgendosi al giocatore,
un'emoji, la `category` e il flag `trap`.

## Controllare il bilanciamento

`src/game/bilanciamento.ts` simula migliaia di partite per ogni configurazione, senza
dover radunare dieci amici. Non imita le parole, che nessun modello sa imitare: imita
le due cose che decidono la partita. La prima è il voto, giocatore per giocatore,
perché il punto è proprio che gli impostori si conoscono e votano compatti mentre i
normali si sparpagliano. La seconda è quello che l'impostore impara, che dipende da
quante parole vere sono state dette in tutto.

I valori del modello sono stime e non misure sul campo: presi da soli dicono poco, ma
il confronto fra una configurazione e l'altra regge.

`npm test` esegue anche `bilanciamento.test.ts`, che non controlla il codice ma le
regole: se una modifica rende una configurazione una vittoria annunciata, o allunga
troppo le partite, quei test si rompono.
