# Text Engine

## What It Does

Implementa il parsing dei file .txt nel formato LivePrompter e l'algoritmo di paginazione adattiva. Il parser estrae titolo e sezioni (strofe/ritornelli); il paginatore distribuisce le sezioni in pagine senza mai spezzarle, calcolando un font size ottimale per canzone (da 36sp a 28sp min). Il componente `TextLine` rende ogni riga con supporto ai marcatori inline `[S]...[/S]` come span colorati.

## Data Model

### Types rilevanti (in src/lib/types.ts)

- `ParsedSection`: `{ type: 'verse' | 'chorus', lines: string[] }`
- `ParsedSong`: `{ title: string, sections: ParsedSection[] }`
- `Page`: `{ sections: ParsedSection[], fontSize: number }`

### Modified Tables
N/A

## API Routes
Nessuna.

## Key Files

- `src/lib/parser.ts` — `parseSong(content)` → ParsedSong; `parseInlineMarkers(line)` → TextFragment[]
- `src/lib/paginator.ts` — `paginateSong(song, display)` → Page[]
- `src/components/TextLine/TextLine.tsx` — render riga con inline [S]...[/S] come span colorati

## Environment Variables
Nessuna.

## Notes for Future Development

- **Formato file**: riga 1 = titolo, riga 2 = vuota obbligatoria, corpo = sezioni divise da righe vuote. `[R]` come prima riga di sezione = ritornello. `[S]testo[/S]` = testo speciale inline.
- **Font adattivo**: FONT_MAX=36, FONT_MIN=28, LINE_HEIGHT=1.55. Costanti modificabili in `paginator.ts`.
- **Altezze header/footer**: HEADER_HEIGHT=44, FOOTER_HEIGHT=32 in `paginator.ts` — aggiornare se cambia il layout della schermata Live.
- **Sezioni troppo lunghe**: se una sezione supera l'intera pagina, viene spezzata riga per riga (caso eccezionale).
- `parseInlineMarkers` è chiamata da `TextLine` per ogni riga — per performance su canzoni molto lunghe, considerare memoizzazione.
