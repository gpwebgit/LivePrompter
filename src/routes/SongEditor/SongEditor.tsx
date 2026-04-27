import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MdArrowBack, MdFileDownload } from 'react-icons/md'
import TextLine from '../../components/TextLine/TextLine'
import { getSong, putSong, getSettings } from '../../lib/db'
import { parseSong } from '../../lib/parser'
import { paginateSong } from '../../lib/paginator'
import type { Song, ColorsConfig, Page } from '../../lib/types'
import { DEFAULT_COLORS } from '../../lib/types'
import styles from './SongEditor.module.css'

// Il paginator internamente sottrae PAGINATOR_HEADER_H all'altezza passata.
// Quando passiamo l'altezza del solo corpo (senza header Live), lo compensiamo.
const PAGINATOR_HEADER_H = 68
// Altezza barra nav ‹ › in fondo al pannello Live
const LIVE_NAV_H = 36

const COLOR_LABELS: Record<string, string> = {
  liveBg: 'Sfondo', liveTitle: 'Titolo', liveVerse: 'Strofa',
  liveChorus: 'Ritornello', liveSpecial: 'Speciale',
  liveBarBg: 'Barra sfondo', liveBarText: 'Barra testo',
  liveClockBg: 'Orologio sfondo', liveClockText: 'Orologio testo',
}

const SIZE_MIN = 0.5
const SIZE_MAX = 2.0
const SIZE_STEP = 0.1

function clampSize(v: number): number {
  return Math.round(Math.min(SIZE_MAX, Math.max(SIZE_MIN, v)) * 10) / 10
}

export default function SongEditor() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const customColorRef = useRef<HTMLInputElement>(null)
  const savedSelRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 })
  const liveAreaRef = useRef<HTMLDivElement>(null)

  const [song, setSong] = useState<Song | null>(null)
  const [content, setContent] = useState('')
  const [colors, setColors] = useState<ColorsConfig>(DEFAULT_COLORS)
  const [pages, setPages] = useState<Page[]>([])
  const [pageIdx, setPageIdx] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  const [saveFlash, setSaveFlash] = useState(false)
  const [liveAreaDims, setLiveAreaDims] = useState({ width: 0, height: 0 })
  const [sizeValue, setSizeValue] = useState(1.0)
  const [sizeInputStr, setSizeInputStr] = useState('1.0')

  // Ref sincrono al contenuto corrente — evita closure stale in applyMarker
  const contentRef = useRef('')
  contentRef.current = content

  // Selezione da ripristinare dopo il prossimo render (dopo setContent)
  const pendingSelRef = useRef<{ start: number; end: number } | null>(null)

  // Dopo ogni render, applica la selezione pendente (se presente)
  useLayoutEffect(() => {
    const sel = pendingSelRef.current
    if (!sel || !textareaRef.current) return
    textareaRef.current.setSelectionRange(sel.start, sel.end)
    pendingSelRef.current = null
  })

  // Carica brano e impostazioni
  useEffect(() => {
    if (!songId) return
    Promise.all([getSong(songId), getSettings()]).then(([s, settings]) => {
      if (s) { setSong(s); setContent(s.content) }
      setColors(settings.colors)
    })
  }, [songId])

  // Osserva le dimensioni dell'area Live per paginare correttamente.
  // Dipende da song?.id: il liveAreaRef viene attaccato solo dopo che il brano
  // è caricato (la UI reale sostituisce il loading state), quindi l'effect
  // deve rigirare quando song diventa disponibile.
  useEffect(() => {
    const el = liveAreaRef.current
    if (!el) return
    const update = () => setLiveAreaDims({ width: el.clientWidth, height: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [song?.id])

  // Ripagina ogni volta che il contenuto o le dimensioni cambiano
  useEffect(() => {
    if (!liveAreaDims.width || !liveAreaDims.height) return
    const parsed = parseSong(content)
    // Compensiamo: il paginator sottrae PAGINATOR_HEADER_H internamente,
    // ma qui l'area Live non ha header — solo la barra nav LIVE_NAV_H in fondo.
    const displayH = liveAreaDims.height - LIVE_NAV_H + PAGINATOR_HEADER_H
    const p = paginateSong(parsed, { width: liveAreaDims.width, height: displayH })
    setPages(p)
    setPageIdx((prev) => Math.min(prev, Math.max(0, p.length - 1)))
  }, [content, liveAreaDims])

  const saveSelection = useCallback(() => {
    const ta = textareaRef.current
    if (ta) savedSelRef.current = { start: ta.selectionStart, end: ta.selectionEnd }
  }, [])

  /**
   * Applica opening+closing attorno alla selezione.
   * stripKind: se specificato, rimuove prima i marcatori dello stesso tipo
   *            (evita l'annidamento — sostituisce invece di aggiungere).
   * Dopo il render, la selezione viene ripristinata sull'intero blocco inserito.
   */
  const applyMarker = useCallback(
    (opening: string, closing: string, stripKind?: 'color' | 'size', sel?: { start: number; end: number }) => {
      const { start, end } = sel ?? savedSelRef.current
      if (start === end) return

      let inner = contentRef.current.slice(start, end)
      if (stripKind === 'color') {
        inner = inner
          .replace(/\[COLOR=#[0-9A-Fa-f]{3,8}\]/gi, '')
          .replace(/\[\/COLOR\]/gi, '')
      } else if (stripKind === 'size') {
        inner = inner
          .replace(/\[SIZE=[0-9.]+\]/gi, '')
          .replace(/\[\/SIZE\]/gi, '')
      }

      const newContent =
        contentRef.current.slice(0, start) + opening + inner + closing + contentRef.current.slice(end)
      contentRef.current = newContent
      setContent(newContent)
      setIsDirty(true)

      // Selezione sul blocco appena inserito: da start a fine del closing tag
      const newSel = { start, end: start + opening.length + inner.length + closing.length }
      savedSelRef.current = newSel
      pendingSelRef.current = newSel
    },
    [],
  )

  const clearFormatting = useCallback(() => {
    const { start, end } = savedSelRef.current
    if (start === end) return
    const inner = contentRef.current
      .slice(start, end)
      .replace(/\[COLOR=#[0-9A-Fa-f]{3,8}\]|\[\/COLOR\]/gi, '')
      .replace(/\[SIZE=[0-9.]+\]|\[\/SIZE\]/gi, '')
      .replace(/\[S\]|\[\/S\]/gi, '')
    const newContent = contentRef.current.slice(0, start) + inner + contentRef.current.slice(end)
    contentRef.current = newContent
    setContent(newContent)
    setIsDirty(true)
    const newSel = { start, end: start + inner.length }
    savedSelRef.current = newSel
    pendingSelRef.current = newSel
  }, [])

  const handleSizeStep = useCallback(
    (delta: number) => {
      const next = clampSize(sizeValue + delta)
      setSizeValue(next)
      setSizeInputStr(next.toFixed(1))
      applyMarker(`[SIZE=${next}]`, '[/SIZE]', 'size')
    },
    [sizeValue, applyMarker],
  )

  const handleSizeApply = useCallback(() => {
    const parsed = parseFloat(sizeInputStr.replace(',', '.'))
    const v = isNaN(parsed) ? sizeValue : clampSize(parsed)
    setSizeValue(v)
    setSizeInputStr(v.toFixed(1))
    applyMarker(`[SIZE=${v}]`, '[/SIZE]', 'size')
  }, [sizeInputStr, sizeValue, applyMarker])

  const handleSave = async () => {
    if (!song) return
    const updated = { ...song, content }
    await putSong(updated)
    setSong(updated)
    setIsDirty(false)
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1000)
  }

  const handleExport = () => {
    if (!song) return
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${song.title.replace(/[^\w\s\-àèéìòù]/gi, '_')}_edit.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!song) {
    return (
      <div className={styles.page} style={{ backgroundColor: 'var(--color-bg-app)' }}>
        <div className={styles.loading}>Caricamento...</div>
      </div>
    )
  }

  const currentPage = pages[pageIdx]
  const uniform = currentPage?.fontSize ?? 28
  const bodyWidth = liveAreaDims.width - 36  // 18px padding left + right
  const colorEntries = Object.entries(colors) as [keyof ColorsConfig, string][]

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate(-1)} aria-label="Indietro">
          <MdArrowBack size={22} color="var(--color-text-secondary)" />
        </button>
        <span className={styles.headerTitle}>{song.title}</span>
        <div className={styles.headerActions}>
          <button
            className={`${styles.saveBtn} ${saveFlash ? styles.saveBtnFlash : ''}`}
            onClick={handleSave}
          >
            {isDirty ? 'Salva*' : 'Salvato'}
          </button>
          <button className={styles.iconBtn} onClick={handleExport} aria-label="Esporta _edit.txt">
            <MdFileDownload size={22} color="var(--color-text-secondary)" />
          </button>
        </div>
      </div>

      {/* Corpo: Live rendering + pannello modifica */}
      <div className={styles.body}>

        {/* ── Pannello Live (rendering in tempo reale) ── */}
        <div
          ref={liveAreaRef}
          className={styles.liveArea}
          style={{ backgroundColor: colors.liveBg }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Contenuto paginato */}
          <div className={styles.liveBody} style={{ fontSize: uniform }}>
            {currentPage?.sections.map((section, si) => (
              <div key={si} className={styles.liveSection}>
                {section.lines.map((line, li) => (
                  <TextLine
                    key={li}
                    text={line}
                    sectionColor={section.type === 'chorus' ? colors.liveChorus : colors.liveVerse}
                    specialColor={colors.liveSpecial}
                    fontSize={uniform}
                    availableWidth={bodyWidth}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Barra nav ‹ › (nessun contatore) */}
          <div className={styles.liveNav}>
            <button
              className={styles.navBtn}
              style={{ color: colors.liveTitle, opacity: pageIdx === 0 ? 0.2 : 0.7 }}
              onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
              aria-label="Pagina precedente"
            >
              ‹
            </button>
            <button
              className={styles.navBtn}
              style={{ color: colors.liveTitle, opacity: pageIdx === pages.length - 1 ? 0.2 : 0.7 }}
              onClick={() => setPageIdx((p) => Math.min(pages.length - 1, p + 1))}
              aria-label="Pagina successiva"
            >
              ›
            </button>
          </div>
        </div>

        {/* ── Pannello modifica ── */}
        <div className={styles.editPanel}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolRow}>
              <span className={styles.toolLabel}>Col</span>
              <div className={styles.swatches}>
                {colorEntries.map(([key, hex]) => (
                  <button
                    key={key}
                    className={styles.swatch}
                    style={{ backgroundColor: hex }}
                    title={COLOR_LABELS[key] ?? key}
                    onPointerDown={(e) => { e.preventDefault(); applyMarker(`[COLOR=${hex}]`, '[/COLOR]', 'color') }}
                  />
                ))}
                <div className={styles.swatchPlusWrapper}>
                  <button
                    className={styles.swatchPlus}
                    title="Altro colore"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      saveSelection()
                      customColorRef.current?.click()
                    }}
                  >+</button>
                  <input
                    ref={customColorRef}
                    type="color"
                    className={styles.hiddenColorInput}
                    onChange={(e) => applyMarker(`[COLOR=${e.target.value}]`, '[/COLOR]', 'color', savedSelRef.current)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.toolRow}>
              <span className={styles.toolLabel}>Dim</span>
              <div className={styles.sizeSpinner}>
                <button
                  className={styles.spinnerBtn}
                  onPointerDown={(e) => { e.preventDefault(); handleSizeStep(-SIZE_STEP) }}
                  aria-label="Riduci"
                >▼</button>
                <div className={styles.spinnerValueWrap}>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={styles.spinnerInput}
                    value={sizeInputStr}
                    onChange={(e) => setSizeInputStr(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSizeApply() } }}
                  />
                  <span className={styles.spinnerUnit}>×</span>
                </div>
                <button
                  className={styles.spinnerBtn}
                  onPointerDown={(e) => { e.preventDefault(); handleSizeStep(SIZE_STEP) }}
                  aria-label="Aumenta"
                >▲</button>
                <span className={styles.spinnerHint}>Invio per applicare</span>
              </div>
              <button
                className={`${styles.sizeBtn} ${styles.clearBtn}`}
                onPointerDown={(e) => { e.preventDefault(); clearFormatting() }}
                title="Rimuovi tutta la formattazione dalla selezione"
              >✕ fmt</button>
            </div>
          </div>

          {/* Textarea sorgente */}
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={content}
            onChange={(e) => { setContent(e.target.value); setIsDirty(true) }}
            onSelect={saveSelection}
            onMouseUp={saveSelection}
            onTouchEnd={saveSelection}
            onKeyUp={saveSelection}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />

          {/* Riferimento marcatori */}
          <div className={styles.markerRef}>
            <code>[R]</code> rit &nbsp;·&nbsp;
            <code>[S]...[/S]</code> spec &nbsp;·&nbsp;
            <code>[COLOR=#HEX]...[/COLOR]</code> colore &nbsp;·&nbsp;
            <code>[SIZE=1.5]...[/SIZE]</code> dim (moltiplicatore)
          </div>
        </div>
      </div>
    </div>
  )
}
