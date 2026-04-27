import type { ParsedSong, ParsedSection } from './types'

// Case-insensitive: funziona con [S][/S], [s][/s] e qualsiasi combinazione
const INLINE_SPECIAL_RE = /\[S\](.*?)\[\/S\]/gi

export interface TextFragment {
  text: string
  special: boolean
}

export function parseInlineMarkers(line: string): TextFragment[] {
  const fragments: TextFragment[] = []
  let last = 0
  let match: RegExpExecArray | null

  INLINE_SPECIAL_RE.lastIndex = 0
  while ((match = INLINE_SPECIAL_RE.exec(line)) !== null) {
    if (match.index > last) {
      fragments.push({ text: line.slice(last, match.index), special: false })
    }
    fragments.push({ text: match[1], special: true })
    last = match.index + match[0].length
  }
  if (last < line.length) {
    fragments.push({ text: line.slice(last), special: false })
  }
  if (fragments.length === 0) {
    fragments.push({ text: line, special: false })
  }
  return fragments
}

export function parseSong(content: string): ParsedSong {
  const rawLines = content.split('\n')

  const title = rawLines[0]?.trim() ?? 'Senza titolo'

  // Lines after title + mandatory empty separator
  const bodyLines = rawLines.slice(2)

  const sections: ParsedSection[] = []
  let current: string[] = []

  for (const line of bodyLines) {
    if (line.trim() === '') {
      if (current.length > 0) {
        sections.push(buildSection(current))
        current = []
      }
    } else {
      current.push(line)
    }
  }
  if (current.length > 0) {
    sections.push(buildSection(current))
  }

  return { title, sections }
}

function buildSection(lines: string[]): ParsedSection {
  // Case-insensitive: [R], [r], [R] tutti riconosciuti come ritornello
  if (lines[0]?.trim().toUpperCase() === '[R]') {
    return { type: 'chorus', lines: lines.slice(1) }
  }
  return { type: 'verse', lines }
}
