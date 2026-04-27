# LivePrompter — Project Context

> Incolla questo file in qualsiasi nuova sessione agente (Claude Code, OpenAI Codex, Cursor Composer, o simili) per ripristinare istantaneamente il contesto completo del progetto.

## ⚠ Critical Build Constraints

1. Il progetto è una PWA **Vite + React 18 + TypeScript** — nessuna traccia di Next.js nel codice applicativo
2. L'app è **100% offline** — zero chiamate di rete a runtime, nessuna API esterna, nessun CDN
3. I colori della schermata LIVE sono **dinamici** (letti da IndexedDB via `useSettings`) — non usare variabili CSS per quei colori, usare sempre `style={{ color: settings.colors.liveTitle }}` ecc.
4. Il font live è **Arial SemiBold**, non Roboto — sono due contesti visivi distinti
5. Le transizioni tra pagine in LIVE sono **istantanee** — nessuna animation, nessuna transition
6. Il **font size è per-canzone** (calcolato dal paginator per ogni Song individualmente, 36sp→28sp min) — non è un setting globale
7. **Non spezzare mai sezioni tra pagine** — lascia spazio bianco, non tagliare
8. Il **titolo canzone** è sempre la prima riga del file .txt — il nome del file è irrilevante
9. Tutti i font sono **bundlati localmente** (Roboto da `@fontsource/roboto` in `public/fonts/`) — nessun Google Fonts

---

## What This App Does

LivePrompter è una PWA teleprompter per musicisti dal vivo: permette di creare scalette di canzoni e visualizzare i testi in modo paginato durante le esibizioni, navigando con un pedale Bluetooth PageDown/PageUp, completamente offline.

## Users & Roles

Utente singolo, nessun login, nessuna autenticazione. App per uso personale del musicista.

## Authentication

Nessuna. App completamente locale nel browser.

## Key Screens

### HOME `/`
- Layout: colonna singola, full viewport
- Primary element: lista scalette (nome + data) con empty state "CREA SCALETTA"
- Banner prominente se `songs.length === 0`: "Ancora nessun testo presente" + pulsante "IMPORTA BRANI" → naviga a `/impostazioni`
- Icona ⚙ in header dx → `/impostazioni`
- Long press riga scaletta → ConfirmDialog elimina
- Empty state (nessuna scaletta): icona centrata 48px + pulsante primario "CREA SCALETTA"
- Mobile/tablet: nessuna differenza — portrait full screen

### SCALETTA `/scaletta/new` e `/scaletta/:id`
- Layout: colonna singola con header fisso + lista scrollabile + footer bottoni
- Input nome scaletta (autofocus su new)
- Lista brani con drag & drop (@dnd-kit/sortable); long press → rimuovi
- Pannello overlay "AGGIUNGI BRANI": max-height 60vh, lista libreria con multi-select
- Footer: [AGGIUNGI BRANI] [SALVA] [▶ AVVIA LIVE]
- SALVA disabilitato se name vuoto o lista vuota
- AVVIA LIVE → `/live/:setlistId`

### LIVE `/live/:setlistId`
- Layout: `position: fixed; inset: 0` — fullscreen assoluto
- Header (altezza minima): titolo canzone sx (ellipsis, rosso configurabile) + badge orologio dx (HH:MM, bg rosso, testo bianco — configurabili)
- Body (flex: 1): pagina testo corrente — sezioni con colore appropriato; font Arial SemiBold; tutto UPPERCASE; font size dal paginator
- Footer (altezza minima): barra "▶ PROSSIMO: [TITOLO]" o "▶ FINE SCALETTA", bg blu configurabile
- Navigazione: PageDown/ArrowDown = pagina avanti; PageUp/ArrowUp = pagina indietro; tap centro = torna a Scaletta
- Wake Lock API: acquisita al mount, rilasciata all'unmount
- Back Android: interceptato via History API pushState → naviga a Scaletta

### IMPOSTAZIONI `/impostazioni`
- Layout: colonna singola con sezioni divise da bordi #2a2a2a
- **Sezione DISPLAY**: input width/height, toggle PORTRAIT/LANDSCAPE, pulsante "USA QUESTO DISPOSITIVO"
- **Sezione LIBRERIA**: `<input type="file" accept=".txt" multiple>`, contatore brani, "ELIMINA LIBRERIA"
- **Sezione COLORI**: 9 righe (swatch + hex + input type="color"), preview barra live real-time, "RIPRISTINA DEFAULT"
- **Sezione GUIDA FORMATTAZIONE**: box informativo con regole formato .txt

## Core Features

1. Gestione scalette (crea, modifica, elimina, riordina brani con drag & drop)
2. Libreria brani (importa .txt multipli, estrae titolo da riga 1, gestione duplicati)
3. Teleprompter live fullscreen (font adattivo per canzone, paginazione intelligente, Wake Lock)
4. Parsing .txt (strofe bianche, ritornelli [R] gialli, inline [S]...[/S] viola chiaro)
5. Navigazione pedale Bluetooth (PageDown/PageUp keyboard events)
6. Configurazione colori e display (9 colori live + dimensioni schermo per paginazione)

## Design System

**Layout**: stack navigation — nessuna tab bar
**Density**: compact
**Accent color**: `#d40000` · **Mode**: dark only
**App bg**: `#121212` · **Surfaces**: `#1e1e1e` · **Borders**: `#2a2a2a`
**Typography management**: Roboto (bundlato, @fontsource/roboto)
**Typography live**: Arial SemiBold, tutto uppercase
**Border radius**: 6–8px
**Reference apps**: Ableton Live, Behringer X32, VLC touch

### Formato file .txt
```
Titolo della canzone          ← riga 1 (titolo, non paginata)
                              ← riga 2 (vuota obbligatoria)
Strofa normale                ← sezione verse (bianco #ffffff)

[R]                           ← sezione chorus (giallo #fcfc03), [R] non mostrato
Testo ritornello

Strofa con [S]speciale[/S]    ← [S]...[/S] = colore speciale #fd9eff
```

### IndexedDB stores
- `songs`: `{ id, title, content, importedAt }`
- `setlists`: `{ id, name, songIds[], createdAt }`
- `settings`: `{ id: 'config', colors: ColorsConfig, display: DisplayConfig }`

### Default display (Samsung Tab S8 Ultra)
- width: 1848px, height: 2960px

## Integrations

Nessuna. App 100% offline.

## Tech Stack

React 18 · TypeScript · Vite · React Router v6 · IndexedDB (idb) · CSS Modules · vite-plugin-pwa · @dnd-kit/core + sortable · react-icons · @fontsource/roboto

---

## Context for Your Agent

Questo progetto è stato scaffoldato dal boilerplate Next.js di Simo ma è stato completamente riscritto come PWA Vite. Regole importanti:

- Leggi `DESIGN.md` alla root del progetto prima di qualsiasi lavoro UI
- Leggi `src/lib/types.ts` per i TypeScript types prima di qualsiasi lavoro di codice
- Leggi `src/lib/db.ts` prima di qualsiasi lavoro su IndexedDB
- Il design system CSS è in `src/styles/variables.css` — usa le variabili, non i colori hardcoded nelle schermate di gestione
- I colori live NON usano variabili CSS — vengono applicati inline tramite `useSettings()`
- Controlla `specs/livepropter-pwa/` per decisioni architetturali e stato dei task

## Spec Location

`specs/livepropter-pwa/`
- `requirements.md` — requisiti completi
- `implementation-plan.md` — piano a fasi con task e wave markers
- `decisions.md` — decisioni architetturali
- `action-required.md` — nessun step manuale richiesto
- `research-notes.md` — note di ricerca codebase
