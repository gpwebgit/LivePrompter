import { parseInlineMarkers } from '../../lib/parser'
import styles from './TextLine.module.css'

interface Props {
  text: string
  sectionColor: string
  specialColor: string
  fontSize: number
  availableWidth: number
}

// Canvas riutilizzato per evitare allocazioni ad ogni render
const _canvas = document.createElement('canvas')
const _ctx = _canvas.getContext('2d')

// Riduce il font solo se la riga sfora availableWidth — le righe corte restano invariate
function fittedFontSize(text: string, maxWidth: number, fontSize: number): number {
  if (!text.trim() || !_ctx) return fontSize
  _ctx.font = `600 ${fontSize}px Arial, sans-serif`
  const measured = _ctx.measureText(text.toUpperCase()).width
  if (measured <= maxWidth) return fontSize
  const reduced = Math.floor(fontSize * (maxWidth / measured) * 0.97)
  return Math.max(reduced, 12)
}

export default function TextLine({ text, sectionColor, specialColor, fontSize, availableWidth }: Props) {
  const fragments = parseInlineMarkers(text)
  const plainText = fragments.map((f) => f.text).join('')
  const actualFontSize = fittedFontSize(plainText, availableWidth, fontSize)

  return (
    <span className={styles.line} style={{ fontSize: actualFontSize }}>
      {fragments.map((frag, i) => {
        const color = frag.customColor ?? (frag.special ? specialColor : sectionColor)
        const spanSize = frag.sizeFactor != null ? Math.round(actualFontSize * frag.sizeFactor) : undefined
        return (
          <span key={i} style={{ color, ...(spanSize != null ? { fontSize: spanSize } : {}) }}>
            {frag.text}
          </span>
        )
      })}
    </span>
  )
}
