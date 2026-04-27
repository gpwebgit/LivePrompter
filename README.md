# LivePrompter

PWA teleprompter per musicisti dal vivo. Completamente offline, installabile su Android tramite Chrome, navigazione con pedale Bluetooth PageDown/PageUp.

## Funzionalità

- **Scalette** — crea e gestisce scalette con drag & drop per riordinare i brani
- **Libreria brani** — importa file `.txt` multipli, estrae titolo dalla prima riga
- **Teleprompter live** — font adattivo per canzone (36sp→28sp), paginazione intelligente che non spezza mai strofe/ritornelli
- **Pedale Bluetooth** — naviga tra le pagine con PageDown/PageUp (emulazione tasti tastiera)
- **Wake Lock** — schermo sempre acceso durante l'esibizione
- **9 colori configurabili** — sfondo, testo strofe, ritornelli, testo speciale, barra prossima canzone, orologio
- **100% offline** — nessuna chiamata di rete, funziona in modalità aereo

## Formato file .txt

```
Titolo della canzone
                          ← riga vuota obbligatoria
Prima strofa
che continua qui

[R]
Testo del ritornello

Seconda strofa
con una [S]parola speciale[/S] evidenziata
```

- Riga 1 = titolo della canzone
- `[R]` come prima riga di sezione = ritornello (testo giallo)
- `[S]testo[/S]` = testo in colore speciale (viola chiaro)
- Tutto il testo viene convertito in maiuscolo automaticamente

## Setup

### Prerequisiti

- Node.js 20+, pnpm 9+

### Installazione

```bash
pnpm install
pnpm build
pnpm preview
```

Apri `http://localhost:4173` in Chrome, poi "Aggiungi a schermata Home" per installare come PWA.

## Sviluppo

```bash
pnpm dev          # Server di sviluppo Vite
pnpm check        # lint + typecheck
pnpm build        # build produzione
pnpm preview      # anteprima build locale
node scripts/generate-icons.mjs  # rigenera icone PWA
```

## Tech Stack

React 18 · TypeScript · Vite · React Router v6 · IndexedDB (idb) · CSS Modules · vite-plugin-pwa + Workbox · @dnd-kit · react-icons · @fontsource/roboto

## Target

Samsung Galaxy Tab S8 Ultra (1848×2960), Chrome Android, portrait
