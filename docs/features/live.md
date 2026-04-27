# Live Screen (Teleprompter)

## What It Does

Schermata teleprompter fullscreen per l'esibizione dal vivo. Carica la scaletta selezionata, parsifica e pagina ogni canzone al mount, poi visualizza una pagina alla volta. La navigazione avviene tramite pedale Bluetooth (PageDown/PageUp emulati come tasti tastiera) o tap al centro dello schermo per tornare alla scaletta. Mantiene lo schermo sempre acceso tramite Wake Lock API. Intercetta il tasto Back Android via History API.

## Data Model

### Read-only Stores
- `setlists` — carica la scaletta per `setlistId`
- `songs` — carica i brani della scaletta
- `settings` — legge colori e display per rendering e paginazione

## API Routes
Nessuna.

## Key Files

- `src/routes/Live/Live.tsx` — schermata teleprompter
- `src/routes/Live/Live.module.css`
- `src/components/TextLine/TextLine.tsx` — rendering riga con inline [S]...[/S]
- `src/lib/parser.ts` — parsing .txt → ParsedSong
- `src/lib/paginator.ts` — paginazione → Page[]

## Environment Variables
Nessuna.

## Notes for Future Development

- **Font size**: calcolato dal paginatore per canzone, letto da `currentPage.fontSize`. Non è un setting globale.
- **Navigazione**: `[songIdx, pageIdx]` come state React + ref mirrors per i keyboard handler. I ref sono necessari perché i keyboard listener catturano i valori al momento del mount.
- **Wake Lock**: acquisita al mount, rilasciata all'unmount. Re-acquisita al ritorno in foreground (`visibilitychange`). Se non supportata (browser vecchio) l'app funziona comunque senza errori.
- **Back Android**: `history.pushState` al mount aggiunge una entry nello stack. Il listener `popstate` intercetta il Back e naviga a `/scaletta/:setlistId`. Funziona anche quando la PWA è installata in fullscreen.
- **Performance**: il precalcolo di tutte le pagine al mount (`allPages: Page[][]`) è sincrono ma pesante su scalette molto lunghe. Se si nota lag, considerare calcolo lazy per canzone.
- **Errori**: se un brano è stato eliminato dalla libreria dopo la creazione della scaletta, `orderedSongs` lo salta silenziosamente. Il footer mostrerà `[BRANO NON DISPONIBILE]` come titolo se il `Song` è undefined (attualmente: skip silenzioso).
