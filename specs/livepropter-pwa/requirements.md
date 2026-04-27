# LivePrompter PWA

## Summary

LivePrompter è una Progressive Web App per musicisti dal vivo che funge da teleprompter digitale. Permette di creare scalette di canzoni, caricare i testi in formato .txt e visualizzarli in modo ottimizzato durante le esibizioni dal vivo tramite un tablet Android. L'app funziona al 100% offline, senza alcuna chiamata di rete. Navigazione tra pagine tramite pedale Bluetooth PageUp/PageDown.

## Users

Utente singolo, nessun login, nessuna autenticazione. L'app è per uso personale del musicista.

## Auth

Nessuna autenticazione. App completamente locale e offline.

## Core Features

1. **Gestione scalette** — crea, modifica, elimina scalette con nome personalizzato; ogni scaletta contiene un elenco ordinato di canzoni; riordinamento con drag & drop
2. **Libreria brani** — importa file .txt multipli; estrae titolo dalla prima riga del file; salva contenuto completo su IndexedDB; gestione sovrascrittura duplicati
3. **Teleprompter live** — visualizza testo paginato a schermo intero con font adattivo per canzone (36sp→28sp min); naviga con pedale Bluetooth (PageDown/PageUp); Wake Lock API per schermo sempre acceso
4. **Parsing e formattazione testo** — strofe (bianco) e ritornelli ([R], giallo); marcatori inline [S]...[/S] per testo speciale (viola chiaro); tutto UPPERCASE
5. **Configurazione display e colori** — 9 colori live configurabili; dimensioni display personalizzabili per calcolo paginazione; anteprima live colori

## Data Model

**songs**: `{ id: string, title: string, content: string, importedAt: Date }`
— title = prima riga del file .txt; content = contenuto completo del file; dati privati dell'utente

**setlists**: `{ id: string, name: string, songIds: string[], createdAt: Date }`
— songIds = array ordinato di ID canzone; un brano può apparire in più scalette

**settings**: `{ id: 'config', colors: ColorsConfig, display: DisplayConfig }`
— singleton; colori live configurabili; displayWidth/displayHeight per calcolo paginazione

Tutti i dati sono locali su IndexedDB del browser, nessuna sincronizzazione.

## Key Screens

- **HOME** — lista scalette (nome + data); empty state con solo "Crea scaletta"; banner "Ancora nessun testo presente" + "Importa brani" se la libreria è vuota; icona ⚙ → Impostazioni
- **SCALETTA** — input nome scaletta; lista brani drag & drop; pannello selezione multipla dalla libreria; swipe/long press rimuovi; SALVA (min 1 brano) / AVVIA LIVE
- **LIVE** — fullscreen; header (titolo canzone sx + orologio HH:MM dx); corpo (pagina testo corrente); footer (barra prossima canzone); navigazione pedale; tap centro → torna a Scaletta
- **IMPOSTAZIONI** — sezione Display (width, height, orientation toggle, "usa questo dispositivo"); sezione Libreria (importa .txt, contatore, elimina tutto); sezione Colori (9 picker + preview barra + ripristina default); sezione Guida formattazione

## Struttura File .txt

```
Titolo della canzone          ← riga 1 = titolo (non paginata)
                              ← riga 2 = vuota obbligatoria
Prima strofa                  ← sezione STROFA (bianco)
che continua qui

[R]                           ← sezione RITORNELLO (giallo), [R] non mostrato
Testo del ritornello

Seconda strofa
con una [S]parola[/S] speciale ← [S]...[/S] = testo speciale (#fd9eff)
```

## Design Direction

Vedi `DESIGN.md` per la direzione estetica del progetto.

Note specifiche per questa feature:
- La schermata LIVE è un contesto radicalmente diverso dalle schermate di gestione: zero decorazioni, zero bordi, zero UI chrome — solo testo e il minimo indispensabile per la navigazione
- Il font adattivo per canzone (non globale) è un comportamento critico: canzoni brevi → font più grande, canzoni lunghe → font più piccolo (mai sotto 28sp)
- Le transizioni tra pagine in LIVE devono essere istantanee (no animation) per ridurre la latenza percepita dal musicista

## AI Integration

Nessuna.

## Error Handling

- **Libreria vuota**: banner prominente in HOME con CTA "Importa brani"
- **File .txt malformato** (nessuna riga titolo, solo righe vuote): importa comunque, usa il nome file come titolo fallback, mostra un warning nell'UI
- **Wake Lock non supportato**: l'app funziona comunque, lo schermo può spegnersi; nessun errore mostrato all'utente
- **IndexedDB non disponibile**: mostra errore critico "Storage non disponibile — prova a reinstallare la PWA"
- **Brano mancante dalla scaletta** (file eliminato dalla libreria): salta quel brano in LIVE, mostra "[BRANO NON DISPONIBILE]" nel footer
- **Scaletta senza brani validi**: non permette di avviare LIVE

## Acceptance Criteria

- [ ] L'app funziona completamente offline (modalità aereo)
- [ ] È installabile su Chrome Android come PWA
- [ ] Il pedale Bluetooth (PageDown/PageUp) naviga correttamente tra le pagine
- [ ] Il font si adatta per canzone tra 36sp e 28sp
- [ ] Le sezioni non vengono mai spezzate tra due pagine
- [ ] Il tasto Back Android porta a SCALETTA (non chiude l'app)
- [ ] Wake Lock mantiene lo schermo acceso in LIVE
- [ ] I 9 colori live sono configurabili e persistono tra le sessioni
- [ ] I marcatori [S]...[/S] vengono renderizzati correttamente (colore speciale, marcatori nascosti)
- [ ] L'app funziona su Samsung Galaxy Tab S8 Ultra in Chrome Android, portrait
