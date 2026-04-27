import type { ParsedSong, ParsedSection } from './types'

export interface TextFragment {
  text: string
  special: boolean
  customColor?: string   // da [COLOR=#hex]...[/COLOR]
  sizeFactor?: number    // da [SIZE=n]...[/SIZE]
}

type MarkerKind = 'special' | 'color' | 'size'

interface StackEntry {
  kind: MarkerKind
  value?: string
}

// Riconosce [S], [/S], [COLOR=#hex], [/COLOR], [SIZE=n], [/SIZE] — case-insensitive
const MARKER_RE =
  /\[S\]|\[\/S\]|\[COLOR=(#[0-9A-Fa-f]{3,8})\]|\[\/COLOR\]|\[SIZE=([0-9]*\.?[0-9]+)\]|\[\/SIZE\]/gi

function findLast(stack: StackEntry[], kind: MarkerKind): number {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].kind === kind) return i
  }
  return -1
}

function makeFragment(text: string, stack: StackEntry[]): TextFragment {
  let special = false
  let customColor: string | undefined
  let sizeFactor: number | undefined
  for (const entry of stack) {
    if (entry.kind === 'special') special = true
    if (entry.kind === 'color') customColor = entry.value
    if (entry.kind === 'size' && entry.value) sizeFactor = Number(entry.value)
  }
  return { text, special, customColor, sizeFactor }
}

export function parseInlineMarkers(line: string): TextFragment[] {
  const fragments: TextFragment[] = []
  const stack: StackEntry[] = []
  let lastIdx = 0

  MARKER_RE.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = MARKER_RE.exec(line)) !== null) {
    const [full, colorVal, sizeVal] = match
    const segment = line.slice(lastIdx, match.index)
    if (segment) fragments.push(makeFragment(segment, stack))
    lastIdx = match.index + full.length

    const up = full.toUpperCase()
    if (up === '[S]') {
      stack.push({ kind: 'special' })
    } else if (up === '[/S]') {
      const i = findLast(stack, 'special')
      if (i >= 0) stack.splice(i, 1)
    } else if (colorVal) {
      stack.push({ kind: 'color', value: colorVal })
    } else if (up === '[/COLOR]') {
      const i = findLast(stack, 'color')
      if (i >= 0) stack.splice(i, 1)
    } else if (sizeVal) {
      stack.push({ kind: 'size', value: sizeVal })
    } else if (up === '[/SIZE]') {
      const i = findLast(stack, 'size')
      if (i >= 0) stack.splice(i, 1)
    }
  }

  const tail = line.slice(lastIdx)
  if (tail) fragments.push(makeFragment(tail, stack))
  if (fragments.length === 0) fragments.push({ text: line, special: false })
  return fragments
}

export function parseSong(content: string): ParsedSong {
  const rawLines = content.split('\n')
  const title = rawLines[0]?.trim() ?? 'Senza titolo'
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
  if (lines[0]?.trim().toUpperCase() === '[R]') {
    return { type: 'chorus', lines: lines.slice(1) }
  }
  return { type: 'verse', lines }
}
