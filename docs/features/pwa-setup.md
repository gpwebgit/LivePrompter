# PWA Setup

## What It Does

Configura il progetto come Progressive Web App (PWA) installabile su Android tramite Chrome. Include: configurazione Vite + vite-plugin-pwa con service worker Workbox cache-first, manifest.json per installazione su schermata home, font Roboto bundlati localmente, design system CSS con variabili, icone PWA, struttura React Router v6.

## Data Model

### New Tables
Nessuna. L'app usa IndexedDB (client-side) — non c'è database server-side.

### Modified Tables
N/A

## API Routes
Nessuna. App completamente offline, zero chiamate di rete.

## Key Files

- `vite.config.ts` — configurazione Vite con vite-plugin-pwa (manifest + Workbox)
- `index.html` — entry point con meta viewport no-scale
- `src/main.tsx` — React 18 root con StrictMode
- `src/App.tsx` — React Router v6 con 5 route
- `src/styles/global.css` — reset CSS, font-face Roboto, classi bottoni globali
- `src/styles/variables.css` — variabili CSS del design system
- `src/lib/types.ts` — tutti i TypeScript types dell'app (Song, Setlist, Settings, ParsedSong, Page, ecc.)
- `public/icons/icon-192.png` + `icon-512.png` — icone PWA (placeholder rosso #d40000)
- `scripts/generate-icons.mjs` — script Node.js per rigenerare le icone PNG

## Environment Variables
Nessuna.

## Notes for Future Development

- Le icone PWA sono placeholder a colore pieno (#d40000). Sostituirle con icone grafiche reali in `public/icons/` per una presentazione migliore su schermata home.
- Il service worker è in modalità `autoUpdate` — si aggiorna automaticamente. Per il controllo manuale cambiare in `prompt` in vite.config.ts.
- I font Roboto vengono bundlati da `@fontsource/roboto` — tutti i subset (latin, cyrillic, greek) sono inclusi. Se si vuole ridurre il bundle size, importare solo il subset `latin`: `@import '@fontsource/roboto/latin-400.css'` ecc.
