# Architecture Decisions: LivePrompter PWA

## Vite invece di Next.js

**Context**: Il boilerplate è Next.js. La PWA è un'app client-only, completamente offline, senza SSR né API routes.
**Decision**: Riscrittura completa con Vite + React 18. Next.js porta overhead (SSR, file system routing, API routes, middleware) che è zero-value per questa app.
**Alternatives considered**: Mantenere Next.js in modalità SPA (`output: 'export'`) — scartato perché aggiunge complessità inutile e vite-plugin-pwa ha maturità superiore a next-pwa.

## IndexedDB (idb) invece di localStorage

**Context**: Necessità di persistere brani (testo completo), scalette, impostazioni.
**Decision**: IndexedDB tramite libreria `idb` per il wrapper Promise-based. localStorage è sincrono e ha limite 5MB (insufficiente per librerie di testi).
**Alternatives considered**: sqlite3 via WASM — overkill per un dataset semplice; Origin Private File System — troppo sperimentale.

## CSS Modules invece di Tailwind/shadcn

**Context**: La PWA ha un design system proprietario (dark pro con colori specifici) e i colori live devono essere dinamici (configurabili via settings).
**Decision**: CSS Modules per scoping dei componenti + variabili CSS custom per il design system statico. I colori live vengono applicati inline (`style={{}}`), non tramite classi CSS.
**Alternatives considered**: Tailwind CSS — scartato perché i colori live dinamici richiederebbero `style={}` comunque, e Tailwind non aggiunge valore su un design system così specifico.

## Font size adattivo per canzone (non globale)

**Context**: Le canzoni hanno lunghezze molto diverse. Un font globale fisso causerebbe canzoni brevi con testo piccolo o canzoni lunghe su troppe pagine.
**Decision**: Il paginator calcola un font size ottimale per ogni canzone individualmente (36sp → 28sp). Il font viene memorizzato in ogni oggetto `Page` e applicato al mount della pagina in LIVE.
**Alternatives considered**: Font globale configurabile manualmente — scartato perché richiede intervento manuale del musicista per ogni canzone.

## Dimensioni display configurabili (non window.innerWidth)

**Context**: Il calcolo della paginazione (righe per pagina) dipende dalle dimensioni fisiche dello schermo. `window.innerWidth/innerHeight` in un browser Chrome su Android può variare in base alla barra degli indirizzi, notifiche, ecc.
**Decision**: Le dimensioni display sono configurabili nelle Impostazioni con default 1848×2960 (Samsung Tab S8 Ultra). Il pulsante "USA QUESTO DISPOSITIVO" legge `window.innerWidth/innerHeight` come shortcut.
**Alternatives considered**: Usare sempre `window.innerWidth/innerHeight` — scartato perché non affidabile quando la PWA è in fullscreen ma il browser ridimensiona dinamicamente il viewport.

## @dnd-kit per drag & drop

**Context**: La schermata SCALETTA richiede riordinamento brani con drag & drop.
**Decision**: `@dnd-kit/core` + `@dnd-kit/sortable`. È la libreria di riferimento moderna per React, accessibile, funziona su touch screen Android.
**Alternatives considered**: `react-beautiful-dnd` — deprecated; `react-sortable-hoc` — non mantenuto.

## History API pushState per Back Android

**Context**: In Chrome Android, il tasto Back del sistema operativo triggera `history.back()`. In modalità Live, questo uscirebbe accidentalmente dalla schermata.
**Decision**: Al mount di Live, esegui `history.pushState(null, '', location.href)` per aggiungere una entry nello stack history. Il listener `popstate` intercetta il Back Android e naviga a Scaletta invece di uscire dall'app.
**Alternatives considered**: Bloccare `beforeunload` — non supportato in modo affidabile su mobile Chrome.

## Struttura route React Router

**Context**: 4 schermate con stack navigation.
**Decision**:
- `/` → Home
- `/scaletta/new` → nuova scaletta
- `/scaletta/:id` → scaletta esistente
- `/live/:setlistId` → live (riceve l'ID della scaletta da lanciare)
- `/impostazioni` → impostazioni

Il parametro `:setlistId` in Live permette di ricaricare la scaletta corretta anche dopo un refresh della pagina.
