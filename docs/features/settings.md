# Impostazioni

## What It Does

Schermata di configurazione divisa in 4 sezioni: **Display** (dimensioni schermo per il calcolo paginazione, toggle portrait/landscape, "usa questo dispositivo"), **Libreria brani** (import file .txt multipli con gestione duplicati, contatore, elimina tutto), **Colori** (9 color picker per i colori della schermata Live con anteprima barra in tempo reale, ripristina default), **Guida formattazione** (box informativo sulle regole del formato .txt).

## Data Model

### Modified Stores
- `settings.colors` — aggiornato ad ogni cambio colore (real-time)
- `settings.display` — aggiornato ad ogni cambio dimensione o orientamento
- `songs` — aggiunto/sovrascritto ad ogni import

## API Routes
Nessuna.

## Key Files

- `src/routes/Impostazioni/Impostazioni.tsx` — pagina impostazioni
- `src/routes/Impostazioni/Impostazioni.module.css`

## Environment Variables
Nessuna.

## Notes for Future Development

- L'import dei file .txt usa `<input type="file" accept=".txt" multiple hidden>` — nessuna API nativa del filesystem, funziona su tutti i browser moderni.
- La gestione duplicati mostra un `ConfirmDialog` per ogni brano in conflitto (uno alla volta, in sequenza). La coda è gestita con `overwriteQueue` + `pendingImport` state.
- I 9 colori live si aggiornano su IndexedDB in tempo reale ad ogni cambio (via `useSettings.updateColors`). Non c'è debounce — considerarlo se si nota lag.
- Il toggle orientamento scambia width/height se necessario per mantenere la coerenza (es. portrait → width < height).
- Aggiungere nuovi colori: aggiungere entry all'array `COLOR_FIELDS` in Impostazioni.tsx e il campo corrispondente in `ColorsConfig` (types.ts) + `DEFAULT_COLORS`.
