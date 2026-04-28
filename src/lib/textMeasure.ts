import type { ParsedSection } from './types'

const _canvas = document.createElement('canvas')
const _ctx = _canvas.getContext('2d')

// Regex a livello di modulo — compilate una sola volta
const RE_S_MARKERS = /\[\/?(s)\]/gi
const RE_FORMAT_MARKERS = /\[COLOR=#[0-9A-Fa-f]{3,8}\]|\[\/COLOR\]|\[SIZE=[0-9.]+\]|\[\/SIZE\]/gi

export function measureLine(text: string, fontSize: number): number {
  if (!_ctx) return 0
  RE_S_MARKERS.lastIndex = 0
  RE_FORMAT_MARKERS.lastIndex = 0
  const plain = text
    .replace(RE_S_MARKERS, '')
    .replace(RE_FORMAT_MARKERS, '')
    .toUpperCase()
  _ctx.font = `600 ${fontSize}px Arial, sans-serif`
  return _ctx.measureText(plain).width
}

/**
 * Sistema a DUE grandezze per pagina:
 * fontBase → dalla SECONDA riga più lunga. TextLine riduce solo la riga più lunga se sfora.
 */
export function calcPageFontBase(
  sections: ParsedSection[],
  baseFontSize: number,
  availableWidth: number,
): number {
  let top1 = 0
  let top2 = 0

  for (const section of sections) {
    for (const line of section.lines) {
      const w = measureLine(line, baseFontSize)
      if (w >= top1) { top2 = top1; top1 = w }
      else if (w > top2) { top2 = w }
    }
  }

  const targetWidth = top2 > 0 ? top2 : top1
  if (targetWidth <= availableWidth) return baseFontSize

  const ratio = (availableWidth / targetWidth) * 0.97
  return Math.floor(baseFontSize * ratio)
}
