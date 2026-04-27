# LivePrompter — AI Assistant Guidelines

## Project Overview

LivePrompter è una PWA (Progressive Web App) teleprompter per musicisti dal vivo. Completamente offline, installabile su Android tramite Chrome, navigazione con pedale Bluetooth. Works with any modern AI coding agent — Claude Code, OpenAI Codex, or Cursor Composer.

### Tech Stack

- **Framework**: Vite 6 + React 18 + TypeScript 5
- **Routing**: React Router v6 (SPA, stack navigation)
- **Storage**: IndexedDB tramite `idb` (offline, no server)
- **UI**: CSS Modules + design system custom (dark pro)
- **PWA**: vite-plugin-pwa + Workbox (cache-first, service worker)
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Icons**: react-icons (bundlato, nessun CDN)
- **Fonts**: @fontsource/roboto (bundlato localmente)
- **Package Manager**: pnpm

## File Map (for context management)

Use this to decide which files to read for a given task. **Don't load everything — load what's relevant.**

### Core Configuration
- `package.json` — dependencies and scripts
- `vite.config.ts` — Vite + PWA config (manifest, Workbox)
- `tsconfig.app.json` — TypeScript config for src/
- `tsconfig.node.json` — TypeScript config for vite.config.ts
- `index.html` — entry point (meta viewport, link manifest)
- `DESIGN.md` — design system e direzione estetica (leggere SEMPRE per lavoro UI)

### Data Layer
- `src/lib/types.ts` — tutti i TypeScript types (Song, Setlist, Settings, Page, ecc.)
- `src/lib/db.ts` — wrapper IndexedDB (idb): CRUD per songs, setlists, settings
- `src/hooks/useSongs.ts` — hook reattivo lista brani
- `src/hooks/useSetlists.ts` — hook reattivo lista scalette
- `src/hooks/useSettings.ts` — hook reattivo impostazioni (colori + display)

### Text Engine
- `src/lib/parser.ts` — parseSong(), parseInlineMarkers()
- `src/lib/paginator.ts` — paginateSong() con font adattivo per canzone

### Routes (schermate)
- `src/routes/Home/` — lista scalette, empty states, navigazione
- `src/routes/Scaletta/` — editor scaletta con drag & drop
- `src/routes/Live/` — teleprompter fullscreen, pedale, Wake Lock
- `src/routes/Impostazioni/` — display, libreria, colori, guida

### Components
- `src/components/AppHeader/` — header riutilizzabile (logo + slot left/right)
- `src/components/ConfirmDialog/` — dialog conferma riutilizzabile
- `src/components/TextLine/` — rendering riga con inline [S]...[/S]

### Styles
- `src/styles/global.css` — reset CSS, font-face Roboto, classi bottoni globali
- `src/styles/variables.css` — variabili CSS design system

### PWA Assets
- `public/icons/` — icon-192.png, icon-512.png (rigenerabili con `node scripts/generate-icons.mjs`)
- `scripts/generate-icons.mjs` — generatore icone PNG pure-Node.js

## Critical Rules

### 1. Always run checks after changes
```bash
pnpm lint && pnpm typecheck
```

### 2. Never start the dev server
Don't run `pnpm dev`. Ask the user to provide terminal output if needed.

### 3. Zero network calls — app completamente offline
Non aggiungere mai fetch(), axios, o qualsiasi chiamata HTTP a runtime.
Nessuna dipendenza che richieda CDN o server esterno.

### 4. IndexedDB patterns
```typescript
import { getSongs, putSong, deleteSong } from "@/lib/db";
import { useSongs } from "@/hooks/useSongs";

// Nel componente React — usa sempre gli hook:
const { songs, importSong, removeSong } = useSongs();

// Nelle funzioni asincrone standalone — usa le funzioni db dirette:
const song = await getSong(id);
await putSong({ id: crypto.randomUUID(), title, content, importedAt: new Date() });
```

### 5. Colori live: sempre inline style, mai variabili CSS
I 9 colori della schermata Live sono configurabili dall'utente e vengono letti da IndexedDB.
NON usare variabili CSS per questi colori — usare sempre `style={{ color: settings.colors.liveTitle }}`.
Le variabili CSS (in `variables.css`) sono SOLO per le schermate di gestione (HOME, SCALETTA, IMPOSTAZIONI).

### 6. Styling: CSS Modules + variabili CSS
- Ogni componente/pagina ha il suo `.module.css`
- Usa `var(--color-bg-surface)` ecc. nelle schermate di gestione
- Usa `className={styles.myClass}` per classi scoped
- Classi bottoni globali in `global.css`: `btn-primary`, `btn-secondary`, `btn-destructive`
- NON usare Tailwind, shadcn, o inline styles nelle schermate di gestione (eccetto colori live)

### 7. Leggi DESIGN.md prima di qualsiasi lavoro UI
`DESIGN.md` alla root è la fonte di verità per l'estetica. Contiene:
- Palette colori completa
- Tipografia (Roboto gestione / Arial SemiBold live)
- Spacing e border radius
- Anti-pattern specifici per questa app
- Spec dei componenti (bottoni, input, card)

### 8. Formato file .txt e algoritmo paginazione
```
Riga 1: Titolo canzone
Riga 2: vuota (obbligatoria)
...sezioni divise da righe vuote...
[R] come prima riga = ritornello (giallo)
[S]testo[/S] = testo speciale (viola)
```
Il font size è per-canzone (36sp→28sp min). Usare sempre `paginateSong()` — non reinventarlo.

### 9. Reuse components — check before creating
1. Controlla `src/components/` per componenti esistenti (AppHeader, ConfirmDialog, TextLine)
2. Estendi con props invece di forkare
3. Crea nuovi componenti in `src/components/NomeComponente/` con file `.tsx` + `.module.css`

### 10. Schermata Live — regole speciali
- `position: fixed; inset: 0` — fullscreen assoluto
- Zero elementi focalizzabili
- Transizioni pagina istantanee (no CSS transition/animation)
- Keyboard listener su `window` per PageDown/PageUp (pedale Bluetooth)
- Wake Lock API al mount, rilascia all'unmount
- History API pushState per intercettare Back Android

## Available Scripts

```bash
pnpm dev          # Start dev server (Vite) — DON'T run this yourself
pnpm build        # TypeScript check + Vite build (genera dist/)
pnpm preview      # Serve il build locale (dopo pnpm build)
pnpm lint         # ESLint — ALWAYS run after changes
pnpm typecheck    # TypeScript check — ALWAYS run after changes
pnpm check        # Run both lint + typecheck
node scripts/generate-icons.mjs  # Rigenera le icone PWA PNG
```

## Context Management for Commands

When implementing a task, follow this loading strategy:

1. **Always load first**: `AGENTS.md`, `src/lib/types.ts`, `package.json`, `DESIGN.md`
2. **For data work**: add `src/lib/db.ts` + hook relevante
3. **For text/pagination work**: add `src/lib/parser.ts`, `src/lib/paginator.ts`
4. **For UI work**: read `DESIGN.md`, check `src/components/` per componenti esistenti
5. **For the specific feature**: load only the files in the relevant route directory
6. **Skip**: `node_modules/`, `dist/`, `pnpm-lock.yaml`

This prevents context window waste on large projects.

## How to Handle Build Requests

When the user describes something to build, ask yourself: **would this feature deserve its own page in the app's documentation?**

- **No** → implement directly in this context. Bug fixes, styling tweaks, adding a button to an existing page, extending an existing feature with a small enhancement — just do it.
- **Yes** → it introduces a new capability to the app (new entities, new user flows, new screens). Create a spec first, then build via `/continue-feature` (which uses your runtime's sub-agent mechanism if available, or executes sequentially otherwise).
- **Ambiguous** → check what already exists in the codebase (routes, schema, components) and ask the user: "This touches X — do you want me to spec it or just handle it?"

### Feature Documentation Rule

`docs/features/` is a living map of the app — not a build log. Keep it current on every change:
- **New capability built via spec**: the Final Report in continue-feature creates the doc automatically.
- **Extending an existing capability** (no spec): after implementing, update the existing `docs/features/{feature-name}.md` to reflect the change.
- **Feature removed**: delete the corresponding `docs/features/{feature-name}.md`.
- **Quick fix / bug fix**: no doc update needed unless the fix changes user-facing behavior.

### README Rule

`README.md` is always the **state-of-the-art document** of the application. It must describe what the app IS, not what it was scaffolded from.
