# Impostor Game

Party game da giocare passandosi un solo telefono. Tutti leggono la parola segreta
tranne gli impostori, che ricevono un indizio e i nomi degli altri impostori. A turno
ognuno dice una parola collegata, poi si vota. L'impostore che viene scoperto ha
un'ultima occasione: se indovina la parola, vincono gli impostori.

L'indizio dell'impostore è la **categoria** da cui è uscita la parola: lo mette sulla
strada giusta senza consegnargliela, e ha sempre la stessa difficoltà, cosa che un
indizio scritto a mano non riesce ad avere.

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
- Chi non dice la propria parola entro il tempo (`settings.answerSeconds`, 15 di
  default) prende un cartellino giallo, e poi la dice con calma: il cartellino è la
  penalità, non il silenzio. Al secondo cartellino si esce, con le stesse conseguenze
  di un'eliminazione per voto, tentativo sulla parola compreso se era l'ultimo
  impostore. A zero secondi non c'è limite e quindi non ci sono cartellini.
- Il voto è a volte segreto e a volte a mano alzata, estratto a inizio partita. Il
  primo voto è sempre segreto, perché a mano alzata senza ancora nessun indizio ci si
  accoderebbe soltanto al primo che parla. Si può anche fissarlo su una delle due.
- In caso di pareggio decide la ruota della fortuna: fra i pari merito ne esce uno a
  sorte. Sembra una penalità per i giocatori normali, perché fra i pari merito ci sono
  più innocenti che impostori, e invece li aiuta: il giro a vuoto che seguiva ogni
  pareggio era tutto a vantaggio degli impostori, perché un giro in più vuol dire
  altre parole vere da cui capire la parola. Misurata, la ruota accorcia le partite e
  sposta da quattro a sei punti a favore del tavolo.
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
  archetypes.ts  gli archetipi: classi e sottoclassi
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

Stanno in `src/game/archetypes.ts`, in un solo elenco diviso da `kind`:

- `classe` vincola il comportamento nella discussione e al voto.
- `sottoclasse` vincola le parole che puoi dire al tuo turno. `classico` è quella
  senza vincoli, per chi in quella partita vuole giocare all'impostore normale.

Nessuno dei due riguarda il tono o il modo di pronunciare la parola: cantare o
sussurrare fa ridere per due secondi e non cambia niente di quello che il tavolo deve
capire.

**Il Matto fa eccezione e gira da solo.** La sua carta ha `sottoclasse` a `null`
(`vuoleSottoclasse` decide chi ne riceve una): dire che uno è libero da tutto e
poi vincolargli le parole confonde e basta. Il nome della carta resta una parola
sola, "il Matto", e sotto c'è un riquadro invece di due.

**I nomi si attaccano.** Classe più sottoclasse devono suonare come un nome solo,
perché è così che se ne parla dopo la partita: «mi è capitato il Testimone Poeta».
Quindi ogni `name` è una parola sola, maschile e singolare, senza articolo;
l'articolo sta in `article` sulla classe. `archetypeCardName` compone "Testimone
Poeta" e `archetypeCardWithArticle` compone "il Testimone Poeta". Sulla carta il nome
intero è la prima cosa che si legge dopo la parola o l'indizio, in grande; i due
riquadri sotto sono la spiegazione del nome, non un elenco di due voci separate.

Le classi con `needsTarget` nominano un altro giocatore, che il gioco sorteggia a inizio
partita e scrive sulla carta. Nel testo della regola sta il segnaposto `{bersaglio}`, e
`archetypeRule(archetype, targetName)` ci mette il nome vero: le regole sono scritte in
modo da non prendere genere, perché il bersaglio può essere chiunque.

`assignArchetypeCards` in `src/game/engine.ts` pesca da due mazzi mescolati, una classe
e una sottoclasse a testa (il Matto solo la classe), senza bilanciamenti e senza tetti. Se i giocatori superano
gli archetipi di un mazzo, quel mazzo si rimescola e qualcuno può ripetersi.

**Il cambio di carta.** Mentre legge la propria carta, ogni giocatore può rifiutarla una
volta sola: `rerollArchetypes` ripesca classe, sottoclasse ed eventuale bersaglio, senza
ridare quello che aveva né quello che ha già un altro. Se esce il Matto la sottoclasse
sparisce, e se il Matto se ne va la sottoclasse torna. Il campo `rerolled` sulla carta
dice che il cambio è stato speso. La schermata richiude la carta e fa ripartire il
tempo, perché quella nuova è tutta da leggere.

## Aggiungere parole

Le parole stanno in `src/game/words.ts`, raggruppate per categoria: basta la parola,
perché l'indizio è il nome della categoria. Gli archetipi stanno in
`src/game/archetypes.ts`: servono un nome, la regola scritta rivolgendosi al giocatore,
un'emoji e il `kind`, `classe` o `sottoclasse`. Una classe che nomina qualcuno scrive
`{bersaglio}` nella regola e dichiara `needsTarget`.

## Controllare il bilanciamento

`src/game/bilanciamento.ts` simula migliaia di partite per ogni configurazione, senza
dover radunare dieci amici. Non imita le parole, che nessun modello sa imitare: imita
le due cose che decidono la partita. La prima è il voto, giocatore per giocatore,
perché il punto è proprio che gli impostori si conoscono e votano compatti mentre i
normali si sparpagliano. La seconda è quello che l'impostore impara, che dipende da
quante parole vere sono state dette in tutto.

I valori del modello sono stime e non misure sul campo: presi da soli dicono poco, ma
il confronto fra una configurazione e l'altra regge.

I cartellini non sono nel simulatore, ma sono stati misurati a parte: spostano poco,
fra zero e un punto con un impostore, e fino a nove punti a favore dei giocatori
normali con due impostori, perché lì capita che uno dei due cada da solo. Si possono
quindi stringere o allargare senza rifare i conti sul resto.

`npm test` esegue anche `bilanciamento.test.ts`, che non controlla il codice ma le
regole: se una modifica rende una configurazione una vittoria annunciata, o allunga
troppo le partite, quei test si rompono.

## Quello che il motore sa fare e l'app non mostra ancora

I cartellini esistono come regola (`giveYellowCard`, `yellowCardsOf`,
`isOnLastWarning` in `src/game/engine.ts`) ma non ha ancora una schermata: manca il
modo di darli durante il giro di parole e il comando per cambiare `answerSeconds`
nelle impostazioni.
