# Design Direction — LivePrompter

> Source of truth for the project's aesthetic. The `frontend-design` skill reads this on every UI task.

## Aesthetic direction

**Technical-Utility**

LivePrompter è uno strumento professionale per il palco. L'interfaccia deve scomparire durante l'uso — come un mixer audio o un rack di effetti: ogni elemento ha uno scopo preciso, niente è decorativo. Il design richiama le interfacce dei software di produzione musicale (DAW, hardware MIDI) e dei teleprompter broadcast: superfici scure, tipografia ad alta leggibilità, accenti rossi che segnalano azione. Due app di riferimento: l'interfaccia di Ableton Live (griglia funzionale, rosso su nero) e i display LED dei mixer Behringer/Midas (informazione densa, zero ornamenti).

## Reference apps

- Ableton Live — griglia funzionale, rosso su nero, zero decorazioni
- Behringer X32 display — informazione densa, font monospazio, alta leggibilità
- VLC Media Player (interfaccia touch) — controlli essenziali, dark

## Typography

**Heading / management screens**: Roboto 500 — font di sistema Android, leggibilità eccellente su schermi ad alta densità, neutralità industriale
**Body management**: Roboto 400 — stesso family per coerenza
**Live screen**: Arial SemiBold (600) — sans-serif universale, massima leggibilità a distanza, nessuna dipendenza da font bundlati aggiuntivi
**Mono**: non usato nell'interfaccia principale; monospace solo per codici hex nelle impostazioni colori

**Scale management**: titoli sezione 12sp uppercase letter-spacing 1px, corpo 14sp, bottoni 14sp uppercase weight 600
**Scale live**: corpo adattivo 28–36sp, header/footer 10–11sp
**Tracking**: tight su titoli sezione (letter-spacing 1px), default altrove
**Tabular numerals**: non necessario

## Color story

**Mode**: dark only — l'app è pensata per uso in scena, in ambienti bui
**Accent**: `#d40000` — rosso saturato, segnale di azione primaria, richiama il rosso on-air dei broadcast
**Off-black**: `#121212` — sfondo app gestione (non puro nero per ridurre affaticamento visivo)
**Pure black**: `#000000` — sfondo LIVE (massimo contrasto per il testo durante l'esibizione)
**Surfaces**: `#1e1e1e` card e pannelli, `#252525` elementi elevati (dropdown, modal); le superfici si distinguono per luminosità incrementale
**Borders**: `#2a2a2a` — sottile, quasi invisibile, solo per separare elementi

**Semantic colors**:
- Success: non usato esplicitamente (feedback implicito nel flusso)
- Warning: usato per il banner "nessun testo" con tono neutro (nessun verde/giallo nei toni di gestione)
- Destructive: `#d40000` per azioni delete (stesso accento — l'app è monocolore nell'accento)

**Live colors (configurabili dall'utente):**
- Strofe: `#ffffff`
- Ritornelli: `#fcfc03` (giallo caldo, massimo contrasto su nero)
- Testo speciale [S]: `#fd9eff` (viola chiaro, terzo colore distinto)
- Barra inferiore: `#005d9c` (blu navy, si distingue dal nero senza distrarre)
- Titolo/orologio: `#d40000` / badge rosso

## Motion personality

**Character**: Nessuna animazione decorativa. L'app è uno strumento da palco — ogni millisecondo di latenza è percepito. Le transizioni tra pagine in LIVE sono istantanee (nessuna animazione). Le uniche animazioni sono feedback di interazione (pressed state scale 0.98) nelle schermate di gestione.

**Named easings**:
- `ease-snap` — `cubic-bezier(0.25, 0, 0, 1)` — pressed state bottoni (10–80ms)
- `ease-settle` — `cubic-bezier(0.22, 1, 0.36, 1)` — apertura pannelli/dialog (200ms)
- nessun `ease-drift` — nessuna animazione ambientale

**Stagger**: non usato
**Reduced motion**: rispettato globalmente via `@media (prefers-reduced-motion: reduce)` — rimuove tutte le transizioni

## Layout personality

**Composition rule**: lineare e verticale — l'app è portrait su tablet, il layout è colonne singole con gerarchie chiare
**Density**: compact — ogni pixel conta; l'header LIVE è alto il minimo indispensabile
**Default page max-width**: nessun max-width — l'app usa tutto il viewport del tablet
**Spacing scale**: tight nelle schermate di gestione (padding 16px, gap card 1px border)
**Whitespace philosophy**: nessun whitespace decorativo; lo spazio bianco nelle pagine LIVE (sezione che non entra) è funzionale, non estetico

## Tone of voice

L'app parla in italiano, maiuscolo dove rilevante. Le label sono operative ("AVVIA LIVE", "IMPORTA BRANI", "RIPRISTINA DEFAULT"), non descrittive. Nessun tono promozionale o playful.
- "AVVIA LIVE" ✓
- "Inizia la tua performance!" ✗
- "ELIMINA LIBRERIA" ✓
- "Cancella tutti i tuoi brani" ✗

## Anti-patterns for this app

- Non usare border-radius > 8px — non è un'app consumer, è uno strumento professionale
- Non aggiungere icone decorative accanto a ogni label — le icone si usano solo dove sostituiscono il testo (header, drag handle, azioni lista)
- Non usare gradients — superfici piatte solo
- Non usare ombre (`box-shadow`) nelle schermate di gestione — i layer si distinguono per colore di sfondo, non per ombra
- Non usare colori al di fuori del design system nelle schermate di gestione (solo i 9 colori live sono configurabili)
- Non mostrare animazioni di transizione pagina in LIVE — cambio istantaneo assoluto
- Non usare emoji nell'interfaccia
- Non usare font diversi da Roboto (gestione) e Arial (live)

## Component customizations required

- **Button primario**: bg `#d40000`, testo bianco, radius 6px, uppercase, weight 600; pressed: bg `#aa0000` + scale 0.98 (10ms ease-snap)
- **Button secondario**: bg transparent, border 1px `#d40000`, testo `#d40000`; pressed: bg `#1a0000` + scale 0.98
- **Button distruttivo**: bg transparent, border 1px `#666`, testo `#888`; hover/focus: border `#d40000`, testo `#d40000`
- **Input**: bg `#1e1e1e`, border 1px `#2a2a2a`, focus border `#d40000` (no outline, solo border-color change), radius 6px
- **Lista row**: bg `#1e1e1e`, border-bottom 1px `#2a2a2a`, padding 14px 16px; no hover state decorativo
- **Color swatch**: 22×22px, radius 4px, border 1px `#444`
- **Dialog/overlay**: bg `#252525`, border 1px `#2a2a2a`, radius 8px; backdrop semi-trasparente `rgba(0,0,0,0.7)`
