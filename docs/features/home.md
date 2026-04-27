# Home Screen

## What It Does

Schermata principale dell'app. Mostra la lista delle scalette salvate con nome e data. Permette di navigare a una scaletta esistente (tap), eliminarla (long press o bottone delete con ConfirmDialog), creare una nuova scaletta, e accedere alle Impostazioni. Se la libreria brani è vuota mostra un banner prominente con CTA "Importa brani".

## Data Model

### New Tables
N/A (legge da `setlists` e `songs` su IndexedDB)

### Modified Tables
N/A

## API Routes
Nessuna.

## Key Files

- `src/routes/Home/Home.tsx` — pagina principale
- `src/routes/Home/Home.module.css` — stili
- `src/components/AppHeader/AppHeader.tsx` — header riutilizzabile (logo + slot left/right)
- `src/components/AppHeader/AppHeader.module.css`
- `src/components/ConfirmDialog/ConfirmDialog.tsx` — dialog conferma riutilizzabile
- `src/components/ConfirmDialog/ConfirmDialog.module.css`

## Environment Variables
Nessuna.

## Notes for Future Development

- Long press detection usa `useRef` con `setTimeout(500ms)` via PointerEvents. Funziona su touch e mouse.
- `ConfirmDialog` è riutilizzabile in tutta l'app — accetta `destructive` prop per lo stile del bottone di conferma.
- Il banner "nessun testo" naviga a `/impostazioni` — se si aggiunge una rotta specifica per l'import, aggiornare la navigazione.
- `AppHeader` usa slot `left` e `right` come `ReactNode` — flessibile per aggiungere azioni future.
