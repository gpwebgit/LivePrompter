# Scaletta Editor

## What It Does

Schermata per creare e modificare scalette. Permette di: dare un nome alla scaletta, aggiungere brani dalla libreria (pannello multi-select che sale dal basso), riordinare i brani con drag & drop (@dnd-kit), rimuovere brani singoli (bottone remove), salvare su IndexedDB, avviare direttamente la modalità Live. Non permette di salvare scalette senza nome o senza almeno un brano.

## Data Model

### Modified Stores
- `setlists` — creato/aggiornato al salvataggio

## API Routes
Nessuna.

## Key Files

- `src/routes/Scaletta/Scaletta.tsx` — editor scaletta
- `src/routes/Scaletta/Scaletta.module.css`

## Environment Variables
Nessuna.

## Notes for Future Development

- La route `/scaletta/new` crea una nuova scaletta; `/scaletta/:id` carica quella esistente da IndexedDB.
- Drag & drop usa `@dnd-kit/core` + `@dnd-kit/sortable`. I sensori sono configurati con `PointerSensor` (distance: 8px) e `TouchSensor` (delay: 200ms) per distinguere tap da drag su touch screen.
- Il pannello "Aggiungi brani" filtra solo i brani NON già presenti nella scaletta (`availableSongs = songs.filter(s => !songIds.includes(s.id))`).
- Il pulsante "Avvia Live" salva automaticamente la scaletta prima di navigare a `/live/:setlistId` — non c'è un draft non salvato.
- Uscire senza salvare mostra un ConfirmDialog di conferma.
