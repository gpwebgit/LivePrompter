# Data Layer

## What It Does

Gestisce tutta la persistenza locale tramite IndexedDB (libreria `idb`). Tre object store: `songs` (brani importati), `setlists` (scalette), `settings` (configurazione colori e display). Espone hook React reattivi (`useSongs`, `useSetlists`, `useSettings`) che caricano i dati al mount e rieseguono il refresh dopo ogni mutazione.

## Data Model

### IndexedDB Stores

**songs** — `{ id: string, title: string, content: string, importedAt: Date }`
- `title`: prima riga del file .txt
- `content`: contenuto completo del file

**setlists** — `{ id: string, name: string, songIds: string[], createdAt: Date }`
- `songIds`: array ordinato di ID brani (l'ordine è l'ordine della scaletta)

**settings** — `{ id: 'config', colors: ColorsConfig, display: DisplayConfig }`
- Singleton (un solo record con key 'config')
- Valori default: vedi `DEFAULT_SETTINGS` in `src/lib/types.ts`

### Modified Tables
N/A

## API Routes
Nessuna.

## Key Files

- `src/lib/db.ts` — wrapper idb: inizializzazione DB, funzioni CRUD per i 3 store
- `src/lib/types.ts` — types Song, Setlist, Settings, ColorsConfig, DisplayConfig, DEFAULT_SETTINGS
- `src/hooks/useSongs.ts` — stato reattivo lista songs; espone importSong, removeSong, clearLibrary, findByTitle
- `src/hooks/useSetlists.ts` — stato reattivo lista setlists; espone saveSetlist, removeSetlist
- `src/hooks/useSettings.ts` — stato settings; espone updateColors, updateDisplay, resetColors

## Environment Variables
Nessuna.

## Notes for Future Development

- Il DB si inizializza lazily (prima chiamata a getDb()). Se serve una pre-migrazione, incrementare `DB_VERSION` e aggiungere logica nella callback `upgrade`.
- `useSongs` non espone `getSong` per singolo ID — per farlo usare direttamente `getSong(id)` da `src/lib/db.ts`.
- `useSettings` usa optimistic update: aggiorna lo state React immediatamente e poi persiste su IndexedDB. Non c'è rollback in caso di errore IndexedDB.
