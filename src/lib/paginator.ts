import type { ParsedSong, ParsedSection, SectionType, Page, DisplayConfig } from './types'
import { calcPageFontBase } from './textMeasure'

const HEADER_HEIGHT = 68
const BODY_PADDING_V = 16
const BODY_PADDING_H = 18
const LINE_HEIGHT = 1.55
const FONT_MIN = 22
const FONT_MAX = 200
const SECTION_GAP_PX = 12
const SAFE_FACTOR = 0.90

export { BODY_PADDING_H }

interface FlatLine {
  text: string
  type: SectionType
  breakBefore: boolean
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

// Binary search: trova il font più grande in [FONT_MIN, startFont] che sta nella safeH
function getRenderFont(sections: ParsedSection[], display: DisplayConfig): number | null {
  const safeH  = calcAvailableHeight(display)
  const availW = calcAvailableWidth(display)

  const maxFont = Math.max(calcPageFontBase(sections, FONT_MAX, availW), FONT_MIN)

  if (calcPageHeight(sections, FONT_MIN) > safeH) return null

  let lo = FONT_MIN
  let hi = maxFont
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (calcPageHeight(sections, mid) <= safeH) lo = mid
    else hi = mid - 1
  }
  return lo
}

function flattenSong(song: ParsedSong): FlatLine[] {
  return song.sections.flatMap((s) =>
    s.lines
      .filter((l) => l.trim().length > 0)
      .map((text, li) => ({ text, type: s.type, breakBefore: li === 0 })),
  )
}

// Aggiunge una riga a sections in modo incrementale — evita di ricostruire da zero
function addLineToSections(sections: ParsedSection[], fl: FlatLine): ParsedSection[] {
  const last = sections[sections.length - 1]
  if (last && last.type === fl.type && !fl.breakBefore) {
    return [...sections.slice(0, -1), { type: last.type, lines: [...last.lines, fl.text] }]
  }
  return [...sections, { type: fl.type, lines: [fl.text] }]
}

export function paginateSong(song: ParsedSong, display: DisplayConfig): Page[] {
  const flatLines = flattenSong(song)
  if (flatLines.length === 0) return [{ sections: [], fontSize: FONT_MIN, firstSectionContinues: false }]

  // Greedy fill incrementale: mantiene sections aggiornate senza ricostruirle ogni iterazione.
  // Font e sections vengono salvati al momento del push → eliminata la seconda chiamata
  // a getRenderFont nella fase di mapping finale.
  const pages: Array<{ lines: FlatLine[]; sections: ParsedSection[]; font: number }> = []
  let currentLines: FlatLine[] = []
  let currentSections: ParsedSection[] = []
  let currentFont = FONT_MIN

  for (const fl of flatLines) {
    const candidateSections = addLineToSections(currentSections, fl)
    const renderFont = getRenderFont(candidateSections, display)

    if (renderFont !== null) {
      currentLines = [...currentLines, fl]
      currentSections = candidateSections
      currentFont = renderFont
    } else {
      if (currentLines.length > 0) {
        pages.push({ lines: currentLines, sections: currentSections, font: currentFont })
      }
      currentLines = [fl]
      currentSections = [{ type: fl.type, lines: [fl.text] }]
      currentFont = getRenderFont(currentSections, display) ?? FONT_MIN
    }
  }

  if (currentLines.length > 0) {
    pages.push({ lines: currentLines, sections: currentSections, font: currentFont })
  }

  if (pages.length === 0) return [{ sections: [], fontSize: FONT_MIN, firstSectionContinues: false }]

  return pages.map(({ lines, sections, font }) => ({
    sections,
    fontSize: font,
    firstSectionContinues: lines.length > 0 && !lines[0].breakBefore,
  }))
}
