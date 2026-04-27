import type { ParsedSection } from './types'

const _canvas = document.createElement('canvas')
const _ctx = _canvas.getContext('2d')

export function measureLine(text: string, fontSize: number): number {
  if (!_ctx) return 0
  const plain = text
    .replace(/\[\/?(s)\]/gi, '')
    .replace(/\[COLOR=#[0-9A-Fa-f]{3,8}\]|\[\/COLOR\]|\[SIZE=[0-9.]+\]|\[\/SIZE\]/gi, '')
    .toUpperCase()
  _ctx.font = `600 ${fontSize}px Arial, sans-serif`
  return _ctx.measureText(plain).width
}

/**
 * Sistema a DUE grandezze per pagina:
 *
 * 1. fontBase  → determinato dalla SECONDA riga più lunga della pagina.
 *               Tutte le righe che ci stanno usano questo font.
 *
 * 2. fontRidotto → solo per la riga più lunga (se sfora fontBase),
 *               calcolato da TextLine in autonomia (già implementato).
 *
 * Restituisce fontBase. TextLine gestisce in automatico le righe che sforano.
 */
export function calcPageFontBase(
  sections: ParsedSection[],
  baseFontSize: number,
  availableWidth: number,
): number {
  const widths: number[] = []
  for (const section of sections) {
    for (const line of section.lines) {
      widths.push(measureLine(line, baseFontSize))
    }
  }

  if (widths.length === 0) return baseFontSize

  widths.sort((a, b) => b - a)

  // Seconda riga più lunga (o unica riga se ce n'è solo una)
  const targetWidth = widths.length >= 2 ? widths[1] : widths[0]

  if (targetWidth <= availableWidth) return baseFontSize

  const ratio = (availableWidth / targetWidth) * 0.97
  return Math.floor(baseFontSize * ratio)
}
