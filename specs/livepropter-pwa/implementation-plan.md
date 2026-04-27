# Implementation Plan: LivePrompter PWA

## Overview

Riscrittura completa del progetto: rimozione del boilerplate Next.js e creazione di una PWA Vite + React 18 + TypeScript da zero. Il progetto si sviluppa in 7 fasi sequenziali; ogni fase può essere sviluppata indipendentemente dalla precedente una volta completata.

---

## Phase 1: Project Bootstrap + PWA Config [L] [feature: pwa-setup]

Bootstrap dell'intera struttura progetto Vite, configurazione PWA, design system CSS, font bundlati.

### Tasks

- [x] [wave:1] Elimina tutti i file Next.js non necessari: `src/`, `next.config.ts`, `drizzle.config.ts`, `drizzle/`, `e2e/`, `playwright.config.ts`, `components.json`, `docker-compose.yml`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`
- [x] [wave:1] Scrivi `package.json` con dipendenze Vite + React 18 + TypeScript
- [x] [wave:2] Scrivi `vite.config.ts` con `vite-plugin-pwa` (manifest + Workbox cache-first)
- [x] [wave:2] Scrivi `tsconfig.json` e `tsconfig.node.json` per Vite
- [x] [wave:2] Scrivi `index.html` (entry point Vite, meta viewport, link manifest)
- [x] [wave:2] Scrivi `src/main.tsx` (React root + BrowserRouter)
- [x] [wave:2] Scrivi `src/App.tsx` (React Router v6 routes: /, /scaletta/:id, /live/:id, /impostazioni)
- [x] [wave:2] Crea `public/manifest.json` (nome, icone, display: fullscreen, orientation: portrait, theme_color: #121212, background_color: #000000)
- [x] [wave:2] Crea `public/icons/` con icon-192.png e icon-512.png (generabili da SVG)
- [x] [wave:2] Crea `public/fonts/` con file Roboto woff2 (da @fontsource/roboto come devDependency, copiati in public con script Vite o manualmente)
- [x] [wave:2] Scrivi `src/styles/global.css` con @font-face Roboto, variabili CSS design system, reset CSS base
- [x] [wave:2] Scrivi `src/styles/variables.css` con tutte le variabili CSS del design system
- [x] [wave:3] Esegui `pnpm install`
- [x] [wave:3] Scrivi `src/lib/types.ts` con tutti i TypeScript types (Song, Setlist, Settings, ColorsConfig, DisplayConfig, ParsedSection, Page)

### Technical Details

**package.json dependencies:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "idb": "^8.0.0",
    "react-icons": "^5.4.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^6.0.5",
    "vite-plugin-pwa": "^0.21.1",
    "@fontsource/roboto": "^5.1.0"
  }
}
```

**vite.config.ts struttura:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [] // cache-first per tutto
      },
      manifest: { /* vedere public/manifest.json */ }
    })
  ]
})
```

**React Router routes:**
- `/` → Home
- `/scaletta/new` → Scaletta (nuova)
- `/scaletta/:id` → Scaletta (esistente)
- `/live/:setlistId` → Live
- `/impostazioni` → Impostazioni

**CSS variables (src/styles/variables.css):**
```css
:root {
  --color-bg-app: #121212;
  --color-bg-surface: #1e1e1e;
  --color-bg-elevated: #252525;
  --color-border: #2a2a2a;
  --color-text-primary: #e0e0e0;
  --color-text-secondary: #888888;
  --color-accent: #d40000;
  --color-accent-pressed: #aa0000;
  --font-management: 'Roboto', sans-serif;
  --font-live: Arial, sans-serif;
  --radius-card: 8px;
  --radius-btn: 6px;
  --radius-input: 6px;
}
```

**TypeScript types (src/lib/types.ts):**
```typescript
export interface Song {
  id: string
  title: string
  content: string
  importedAt: Date
}

export interface Setlist {
  id: string
  name: string
  songIds: string[]
  createdAt: Date
}

export interface ColorsConfig {
  liveBg: string        // #000000
  liveTitle: string     // #d40000
  liveVerse: string     // #ffffff
  liveChorus: string    // #fcfc03
  liveSpecial: string   // #fd9eff
  liveBarBg: string     // #005d9c
  liveBarText: string   // #ffffff
  liveClockBg: string   // #d40000
  liveClockText: string // #ffffff
}

export interface DisplayConfig {
  width: number   // 1848
  height: number  // 2960
}

export interface Settings {
  id: 'config'
  colors: ColorsConfig
  display: DisplayConfig
}

export type SectionType = 'verse' | 'chorus'

export interface ParsedSection {
  type: SectionType
  lines: string[]
}

export interface ParsedSong {
  title: string
  sections: ParsedSection[]
}

export interface Page {
  sections: ParsedSection[]
  fontSize: number
}
```

### Files to Read
- `package.json` (versione attuale per confronto)

---

## Phase 2: Data Layer (IndexedDB) [M] [feature: data-layer] (blocked by: Phase 1)

Wrapper IndexedDB con idb, hook React per i tre store.

### Tasks

- [x] [wave:1] Scrivi `src/lib/db.ts` — inizializzazione idb, 3 object store (songs, setlists, settings), funzioni CRUD
- [x] [wave:1] Scrivi `src/hooks/useSongs.ts` — stato reattivo lista songs, importSong, deleteSong, getSong
- [x] [wave:1] Scrivi `src/hooks/useSetlists.ts` — stato reattivo lista setlists, createSetlist, updateSetlist, deleteSetlist
- [x] [wave:1] Scrivi `src/hooks/useSettings.ts` — lettura/scrittura settings, valori default, updateColors, updateDisplay

### Technical Details

**src/lib/db.ts struttura:**
```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Song, Setlist, Settings } from './types'

interface LivePrompterDB extends DBSchema {
  songs: { key: string; value: Song }
  setlists: { key: string; value: Setlist }
  settings: { key: string; value: Settings }
}

const DB_NAME = 'liveprompter'
const DB_VERSION = 1

export async function getDb(): Promise<IDBPDatabase<LivePrompterDB>> {
  return openDB<LivePrompterDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('songs', { keyPath: 'id' })
      db.createObjectStore('setlists', { keyPath: 'id' })
      db.createObjectStore('settings', { keyPath: 'id' })
    }
  })
}

// Esporta funzioni: getSongs, getSong, putSong, deleteSong
// getSetlists, getSetlist, putSetlist, deleteSetlist
// getSettings, putSettings
```

**Default settings:**
```typescript
export const DEFAULT_COLORS: ColorsConfig = {
  liveBg: '#000000', liveTitle: '#d40000', liveVerse: '#ffffff',
  liveChorus: '#fcfc03', liveSpecial: '#fd9eff', liveBarBg: '#005d9c',
  liveBarText: '#ffffff', liveClockBg: '#d40000', liveClockText: '#ffffff'
}
export const DEFAULT_DISPLAY: DisplayConfig = { width: 1848, height: 2960 }
```

**Hook pattern (tutti e tre i hook):**
```typescript
export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  useEffect(() => { loadSongs() }, [])
  // restituisce { songs, importSong, deleteSong, getSong, loading }
}
```

### Files to Read
- `src/lib/types.ts`

---

## Phase 3: Text Engine (Parser + Paginator) [M] [feature: text-engine] (blocked by: Phase 1)

Algoritmo di parsing del formato .txt e algoritmo di paginazione adattiva.

### Tasks

- [x] [wave:1] Scrivi `src/lib/parser.ts` — `parseSong(content: string): ParsedSong`
- [x] [wave:1] Scrivi `src/lib/paginator.ts` — `paginateSong(song: ParsedSong, display: DisplayConfig): Page[]`
- [x] [wave:2] Scrivi `src/components/TextLine/TextLine.tsx` — rendering riga con inline [S]...[/S] come span colorati [complex]

### Technical Details

**parser.ts — algoritmo parseSong:**
```
1. Dividi content in righe con split('\n')
2. Riga 1 = title (trim)
3. Salta riga 2 (vuota obbligatoria)
4. Le righe da 3 in poi formano il corpo
5. Dividi il corpo in sezioni usando righe vuote come separatore
   (filtra gruppi di righe consecutive non vuote)
6. Per ogni sezione:
   - Se righe[0].trim() === '[R]' → type: 'chorus', lines = righe.slice(1)
   - Altrimenti → type: 'verse', lines = righe intere
7. Restituisce { title, sections }
```

**paginator.ts — algoritmo paginateSong:**
```
HEADER_HEIGHT = 44px (stimato — usare costante configurabile)
FOOTER_HEIGHT = 32px (stimato — usare costante configurabile)
LINE_HEIGHT = 1.55

function calcOptimalFontSize(song, display): number {
  for (let fs = 36; fs >= 28; fs--) {
    const linesPerPage = calcLinesPerPage(fs, display)
    const pages = distributeIntoPages(song.sections, linesPerPage)
    if (pages.length <= 4) return fs
  }
  return 28
}

function calcLinesPerPage(fontSize, display): number {
  const availableHeight = display.height - HEADER_HEIGHT - FOOTER_HEIGHT
  return Math.floor(availableHeight / (fontSize * LINE_HEIGHT))
}

function distributeIntoPages(sections, linesPerPage): Page[] {
  let pages: Page[] = []
  let currentPageLines = 0
  let currentPageSections: ParsedSection[] = []

  for (const section of sections) {
    const sectionLines = section.lines.length
    if (currentPageLines + sectionLines > linesPerPage) {
      if (currentPageSections.length > 0) {
        pages.push({ sections: currentPageSections, fontSize: 0 })
        currentPageSections = []
        currentPageLines = 0
      }
      if (sectionLines > linesPerPage) {
        // sezione troppo lunga: spezza tra righe solo in questo caso
        // distribuisci le righe in più pagine
      }
    }
    currentPageSections.push(section)
    currentPageLines += sectionLines
  }
  if (currentPageSections.length > 0) {
    pages.push({ sections: currentPageSections, fontSize: 0 })
  }
  return pages
}
```

**TextLine.tsx — rendering inline markers:**
```typescript
// Riceve: text (stringa con eventuali [S]...[/S]), colore sezione, colore speciale
// Spezza la stringa sui token [S] e [/S]
// Ogni frammento prima di [S] → span con colore sezione
// Ogni frammento dentro [S]...[/S] → span con colore speciale
// Applica text-transform: uppercase tramite CSS
```

### Files to Read
- `src/lib/types.ts`

---

## Phase 4: HOME Screen [M] [feature: home] (blocked by: Phase 2)

Schermata principale con lista scalette, empty states, navigazione.

### Tasks

- [x] [wave:1] Scrivi `src/components/AppHeader/AppHeader.tsx` e `.module.css` — header riutilizzabile con titolo "LIVEPROMPTER" + slot azioni dx
- [x] [wave:1] Scrivi `src/components/ConfirmDialog/ConfirmDialog.tsx` — dialog conferma eliminazione riutilizzabile
- [x] [wave:2] Scrivi `src/routes/Home/Home.tsx` e `Home.module.css` [complex]
  - Lista scalette (nome + data formattata)
  - Tap scaletta → `/scaletta/:id`
  - Long press scaletta → ConfirmDialog elimina
  - Empty state lista: solo pulsante "CREA SCALETTA" (no "APRI SCALETTA")
  - Banner "Ancora nessun testo presente" se `songs.length === 0`
    con pulsante "IMPORTA BRANI" → naviga a `/impostazioni`
  - Pulsante "CREA SCALETTA" → `/scaletta/new`
  - Icona ⚙ nell'header → `/impostazioni`

### Technical Details

**Struttura Home.tsx:**
```tsx
// usa useSetlists() e useSongs()
// se songs.length === 0: mostra banner prominente con MdWarning + CTA
// se setlists.length === 0: mostra empty state centrato con MdLibraryMusic (48px) + pulsante "CREA SCALETTA"
// se setlists.length > 0: mostra FlatList-like con map di SetlistRow
```

**Long press detection (web):**
```typescript
// useLongPress hook: onPointerDown → setTimeout 500ms → trigger
// onPointerUp/onPointerLeave → clearTimeout
```

**SetlistRow:** bg #1e1e1e, border-bottom #2a2a2a, padding 14px 16px, testo primario + data secondaria

**ConfirmDialog:** `<dialog>` HTML nativo o overlay div, sfondo #252525, pulsante ANNULLA (secondario) + ELIMINA (distruttivo)

### Files to Read
- `src/hooks/useSongs.ts`
- `src/hooks/useSetlists.ts`
- `src/styles/variables.css`

---

## Phase 5: IMPOSTAZIONI Screen [M] [feature: settings] (blocked by: Phase 2)

Configurazione display, libreria brani, colori live.

### Tasks

- [x] [wave:1] Scrivi `src/routes/Impostazioni/Impostazioni.tsx` e `.module.css` [complex]
- [x] [wave:2] Sezione DISPLAY: input numerici width/height, toggle PORTRAIT/LANDSCAPE (scambia i valori), pulsante "USA QUESTO DISPOSITIVO" (legge `window.innerWidth` / `window.innerHeight`)
- [x] [wave:2] Sezione LIBRERIA: `<input type="file" accept=".txt" multiple hidden>`, pulsante "IMPORTA BRANI", contatore brani, pulsante "ELIMINA LIBRERIA" con ConfirmDialog; gestione duplicati (stesso titolo → chiedi conferma sovrascrittura)
- [x] [wave:2] Sezione COLORI: 9 righe (label + swatch 22x22 + codice hex + `<input type="color" hidden>`), tap swatch → apre color picker; preview barra live in tempo reale; pulsante "RIPRISTINA DEFAULT"
- [x] [wave:2] Sezione GUIDA FORMATTAZIONE: box informativo con regole in testo

### Technical Details

**Import brani:**
```typescript
// Leggi file.text() → string
// parseSong(content) → title
// Controlla duplicati: cerca in songs store per title
// Se duplicato: mostra ConfirmDialog con "Sovrascrivere '[titolo]'?"
// putSong({ id: crypto.randomUUID(), title, content, importedAt: new Date() })
```

**Toggle orientamento:**
```typescript
// Se PORTRAIT → display.width < display.height (swap se necessario)
// Se LANDSCAPE → display.width > display.height (swap se necessario)
```

**Color picker pattern:**
```tsx
<div className={styles.colorRow}>
  <span className={styles.label}>Sfondo live</span>
  <div
    className={styles.swatch}
    style={{ backgroundColor: colors.liveBg }}
    onClick={() => inputRef.current?.click()}
  />
  <span className={styles.hex}>{colors.liveBg}</span>
  <input type="color" ref={inputRef} value={colors.liveBg}
    onChange={e => updateColors({ ...colors, liveBg: e.target.value })} />
</div>
```

**Preview barra live:**
```tsx
<div style={{
  backgroundColor: colors.liveBarBg,
  color: colors.liveBarText,
  padding: '4px 18px',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderRadius: 0,
  fontFamily: 'Arial, sans-serif'
}}>
  ▶ PROSSIMO: NOME CANZONE
</div>
```

### Files to Read
- `src/hooks/useSettings.ts`
- `src/hooks/useSongs.ts`
- `src/lib/types.ts`

---

## Phase 6: SCALETTA Screen [M] [feature: setlist-editor] (blocked by: Phase 2, Phase 3)

Creazione e modifica scalette con drag & drop.

### Tasks

- [x] [wave:1] Scrivi `src/routes/Scaletta/Scaletta.tsx` e `.module.css` [complex]
- [x] [wave:2] Input nome scaletta (autofocus su `/scaletta/new`)
- [x] [wave:2] Lista brani con drag & drop usando `@dnd-kit/sortable` (SortableContext + useSortable per ogni riga)
- [x] [wave:2] Long press brano → rimuovi dalla scaletta (con feedback visivo, no dialog)
- [x] [wave:2] Pannello "AGGIUNGI BRANI": overlay con lista tutti i brani della libreria, checkbox multipla, pulsante AGGIUNGI; brani già presenti evidenziati diversamente
- [x] [wave:2] Pulsante SALVA: disabilitato se name vuoto o songIds.length === 0; su press → `putSetlist` + navigate(-1)
- [x] [wave:2] Pulsante AVVIA LIVE: visibile solo se la scaletta ha almeno 1 brano; su press → naviga a `/live/:setlistId`
- [x] [wave:2] Gestione route `/scaletta/new` vs `/scaletta/:id`: se new → setlist vuota; se id → carica da IndexedDB

### Technical Details

**dnd-kit setup:**
```tsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SongRow({ id, title, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className={styles.songRow}>
      <span className={styles.dragHandle} {...attributes} {...listeners}>
        <MdDragHandle size={20} color="#888" />
      </span>
      <span className={styles.songTitle}>{title}</span>
      <button onClick={onRemove}><MdRemoveCircleOutline /></button>
    </div>
  )
}
```

**Pannello brani:** position fixed, bottom 0, width 100%, max-height 60vh, overflow-y scroll, bg #1e1e1e, lista con checkbox custom (accent #d40000)

**Pulsanti footer Scaletta:**
```
[AGGIUNGI BRANI]  [SALVA]  [▶ AVVIA LIVE]
secondario        primario   primario
```

### Files to Read
- `src/hooks/useSetlists.ts`
- `src/hooks/useSongs.ts`
- `src/lib/types.ts`
- `src/lib/parser.ts`

---

## Phase 7: LIVE Screen [L] [feature: live] (blocked by: Phase 3, Phase 6)

Schermata teleprompter fullscreen con pedale Bluetooth.

### Tasks

- [x] [wave:1] Scrivi `src/routes/Live/Live.tsx` — struttura layout base (header + body + footer) [complex]
- [x] [wave:2] Header: titolo canzone sx (ellipsis, colore `colors.liveTitle`) + badge orologio dx (HH:MM, update ogni minuto, bg `colors.liveClockBg`, testo `colors.liveClockText`)
- [x] [wave:2] Body: rendering pagina corrente — mappa `page.sections`, ogni sezione → colore appropriato (verse/chorus/special), usa `<TextLine>` per ogni riga
- [x] [wave:2] Footer: `▶ PROSSIMO: [TITOLO]` o `▶ FINE SCALETTA`, colori configurabili
- [x] [wave:2] Keyboard listener: `window.addEventListener('keydown')` — PageDown/ArrowDown avanza, PageUp/ArrowUp torna indietro; `event.preventDefault()` su questi tasti
- [x] [wave:2] Tap center detection: `onClick` su body → se `event.target === bodyElement` → `navigate(-1)` (o navigate a scaletta/:id)
- [x] [wave:2] Wake Lock: `navigator.wakeLock.request('screen')` on mount, `wakeLock.release()` on unmount + re-acquire su `visibilitychange`
- [x] [wave:2] History API: `history.pushState(null, '', location.href)` on mount; `window.addEventListener('popstate')` → navigate a scaletta/:id (intercetta Back Android)
- [x] [wave:3] Pre-calcola pagine per ogni canzone della scaletta al mount (paginateSong per tutte le canzoni) — salva in `allPages: Page[][]`
- [x] [wave:3] Logica navigazione: `[currentSongIndex, currentPageIndex]`; PageDown sull'ultima pagina → canzone successiva; PageUp sulla prima pagina → ultima pagina canzone precedente
- [x] [wave:3] Disabilita context menu (`onContextMenu={e => e.preventDefault()}`); rimuovi tutti gli elementi focalizzabili; imposta `tabIndex={-1}` sul container

### Technical Details

**Struttura state Live:**
```typescript
const [allPages, setAllPages] = useState<Page[][]>([]) // allPages[songIndex][pageIndex]
const [songIdx, setSongIdx] = useState(0)
const [pageIdx, setPageIdx] = useState(0)
const currentPage = allPages[songIdx]?.[pageIdx]
const currentSong = songs[songIdx] // oggetto Song
const nextSong = songs[songIdx + 1] // per footer
```

**Layout CSS Live (Live.module.css):**
```css
.container {
  position: fixed;
  inset: 0;
  background-color: var(--live-bg, #000000);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.header { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding: 10px 18px; }
.body { flex: 1; overflow: hidden; padding: 8px 18px; display: flex; flex-direction: column; justify-content: flex-start; gap: 8px; }
.footer { flex-shrink: 0; padding: 4px 18px; }
```

**Navigazione pagine:**
```typescript
function nextPage() {
  if (pageIdx < allPages[songIdx].length - 1) {
    setPageIdx(p => p + 1)
  } else if (songIdx < songs.length - 1) {
    setSongIdx(s => s + 1)
    setPageIdx(0)
  }
}
function prevPage() {
  if (pageIdx > 0) {
    setPageIdx(p => p - 1)
  } else if (songIdx > 0) {
    setSongIdx(s => s - 1)
    setPageIdx(allPages[songIdx - 1].length - 1)
  }
}
```

**Wake Lock:**
```typescript
useEffect(() => {
  let wakeLock: WakeLockSentinel | null = null
  const acquire = async () => {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
    }
  }
  acquire()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') acquire()
  })
  return () => { wakeLock?.release() }
}, [])
```

**Font size in body:** usa `currentPage?.fontSize` (calcolato dal paginator) come `fontSize` CSS sul container body.

### Files to Read
- `src/lib/types.ts`
- `src/lib/paginator.ts`
- `src/lib/parser.ts`
- `src/components/TextLine/TextLine.tsx`
- `src/hooks/useSettings.ts`
- `src/hooks/useSongs.ts`
- `src/hooks/useSetlists.ts`
