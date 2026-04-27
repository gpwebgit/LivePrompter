import type { ParsedSong, ParsedSection, SectionType, Page, DisplayConfig } from './types'
import { calcPageFontBase } from './textMeasure'

const HEADER_HEIGHT = 68
const BODY_PADDING_V = 16   // 8px top + 8px bottom in Live.module.css
const BODY_PADDING_H = 18
const LINE_HEIGHT = 1.55
const FONT_MIN = 22
const FONT_MAX = 200
const SECTION_GAP_PX = 12
const SAFE_FACTOR = 0.90    // 10% margine sotto

interface FlatLine {
  text: string
  type: SectionType
  breakBefore: boolean  // prima riga di una sezione parser → forza nuovo gruppo visivo
}

function calcAvailableHeight(display: DisplayConfig): number {
  return (display.height - HEADER_HEIGHT - BODY_PADDING_V) * SAFE_FACTOR
}

function calcAvailableWidth(display: DisplayConfig): number {
  return display.width - BODY_PADDING_H * 2
}

function calcPageHeight(sections: ParsedSection[], fontSize: number): number {
  const lineCount = sections.reduce((sum, s) => sum + s.lines.length, 0)
  const gapsHeight = Math.max(0, sections.length - 1) * SECTION_GAP_PX
  return lineCount * fontSize * LINE_HEIGHT + gapsHeight
}

function getRenderFont(sections: ParsedSection[], display: DisplayConfig): number | null {
  const safeH  = calcAvailableHeight(display)
  const availW = calcAvailableWidth(display)

  // Se il fitting orizzontale scende sotto FONT_MIN, clamp a FONT_MIN:
  // le righe troppo lunghe vengono gestite da TextLine individualmente.
  // L'unico motivo per restituire null è il mancato fit verticale.
  let font = Math.max(calcPageFontBase(sections, FONT_MAX, availW), FONT_MIN)

  while (font >= FONT_MIN && calcPageHeight(sections, font) > safeH) {
    font--
  }

  if (font < FONT_MIN) return null
  return font
}

/** Appiattisce tutte le sezioni in righe singole, mantenendo tipo e confine di sezione */
function flattenSong(song: ParsedSong): FlatLine[] {
  return song.sections.flatMap((s) =>
    s.lines
      .filter((l) => l.trim().length > 0)
      .map((text, li) => ({ text, type: s.type, breakBefore: li === 0 })),
  )
}

/**
 * Raggruppa righe piatte in ParsedSection[].
 * Un nuovo gruppo inizia al cambio di tipo OPPURE quando breakBefore=true
 * (prima riga di una sezione parser originale) — preserva i gap tra blocchi dello stesso tipo.
 */
function groupToSections(flatLines: FlatLine[]): ParsedSection[] {
  const sections: ParsedSection[] = []
  for (const fl of flatLines) {
    const last = sections[sections.length - 1]
    if (last && last.type === fl.type && !fl.breakBefore) {
      last.lines.push(fl.text)
    } else {
      sections.push({ type: fl.type, lines: [fl.text] })
    }
  }
  return sections
}

/**
 * Greedy fill riga per riga:
 * Le sezioni possono essere spezzate tra pagine — ogni riga porta con sé il suo tipo
 * (verso/ritornello) per il colore. Le pagine si riempiono al massimo possibile.
 */
export function paginateSong(song: ParsedSong, display: DisplayConfig): Page[] {
  const flatLines = flattenSong(song)
  if (flatLines.length === 0) return [{ sections: [], fontSize: FONT_MIN, firstSectionContinues: false }]

  const pages: FlatLine[][] = []
  let current: FlatLine[] = []

  for (const fl of flatLines) {
    const candidate = [...current, fl]
    const renderFont = getRenderFont(groupToSections(candidate), display)

    if (renderFont !== null) {
      current = candidate
    } else {
      if (current.length > 0) pages.push(current)
      current = [fl]
    }
  }

  if (current.length > 0) pages.push(current)
  if (pages.length === 0) pages.push([])

  return pages.map((lines) => {
    const sections = groupToSections(lines)
    return {
      sections,
      fontSize: getRenderFont(sections, display) ?? FONT_MIN,
      firstSectionContinues: lines.length > 0 && !lines[0].breakBefore,
    }
  })
}
