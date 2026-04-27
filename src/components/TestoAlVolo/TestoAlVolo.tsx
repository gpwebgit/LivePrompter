import { useState, useEffect, useRef } from 'react'
import { MdSearch } from 'react-icons/md'
import TextLine from '../TextLine/TextLine'
import { parseSong } from '../../lib/parser'
import { paginateSong } from '../../lib/paginator'

import type { Song, ColorsConfig, Page } from '../../lib/types'
import styles from './TestoAlVolo.module.css'

interface Props {
  open: boolean
  onClose: () => void
  songs: Song[]
  colors: ColorsConfig
}

export default function TestoAlVolo({ open, onClose, songs, colors }: Props) {
  const [query, setQuery] = useState('')
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [pageIdx, setPageIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset quando viene chiuso
  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedSong(null)
      setPages([])
      setPageIdx(0)
    } else {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  // Paginazione del brano selezionato
  useEffect(() => {
    if (!selectedSong) return
    const parsed = parseSong(selectedSong.content)
    const p = paginateSong(parsed, { width: window.innerWidth, height: window.innerHeight })
    setPages(p)
    setPageIdx(0)
  }, [selectedSong])

  // Navigazione tastiera (cattura prima del listener Live.tsx)
  useEffect(() => {
    if (!open || !selectedSong) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'PageDown' || e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopImmediatePropagation()
        setPageIdx((p) => Math.min(p + 1, pages.length - 1))
      }
      if (e.key === 'PageUp' || e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopImmediatePropagation()
        setPageIdx((p) => Math.max(p - 1, 0))
      }
    }
    window.addEventListener('keydown', handler, { capture: true })
    return () => window.removeEventListener('keydown', handler, { capture: true })
  }, [open, selectedSong, pages.length])

  if (!open) return null

  const filtered = query.trim()
    ? songs.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()))
    : songs

  // Modalità lettore
  if (selectedSong) {
    const currentPage = pages[pageIdx]
    return (
      <div
        className={styles.overlay}
        style={{ backgroundColor: colors.liveBg }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className={styles.readerHeader}>
          <span className={styles.readerTitle} style={{ color: colors.liveTitle }}>
            {selectedSong.title.toUpperCase()}
          </span>
          <button
            className={styles.closeBtn}
            style={{ color: colors.liveTitle }}
            onClick={onClose}
            aria-label="Chiudi testo al volo"
          >
            ✕
          </button>
        </div>
        {(() => {
          const uniform = currentPage?.fontSize ?? 28
          const avail = window.innerWidth - 36
          return (
        <div className={styles.readerBody} style={{ fontSize: uniform }}>
          {currentPage?.sections.map((section, si) => (
            <div key={si} className={styles.section}>
              {section.lines.map((line, li) => (
                <TextLine
                  key={li}
                  text={line}
                  sectionColor={section.type === 'chorus' ? colors.liveChorus : colors.liveVerse}
                  specialColor={colors.liveSpecial}
                  fontSize={uniform}
                  availableWidth={avail}
                />
              ))}
            </div>
          ))}
        </div>
          )
        })()}
      </div>
    )
  }

  // Modalità ricerca
  return (
    <div className={styles.overlay} style={{ backgroundColor: 'rgba(0,0,0,0.97)' }}>
      <div className={styles.searchHeader}>
        <MdSearch size={20} color="#888888" />
        <input
          ref={inputRef}
          className={styles.searchInput}
          type="text"
          placeholder="Cerca canzone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'PageDown' || e.key === 'PageUp') e.preventDefault()
          }}
          autoComplete="off"
          spellCheck={false}
        />
        <button className={styles.closeBtn} style={{ color: '#888888' }} onClick={onClose} aria-label="Chiudi ricerca">
          ✕
        </button>
      </div>

      <div className={styles.searchResults}>
        {filtered.length === 0 ? (
          <p className={styles.noResults}>Nessun brano trovato</p>
        ) : (
          filtered.map((song) => (
            <button
              key={song.id}
              className={styles.resultRow}
              onClick={() => setSelectedSong(song)}
            >
              {song.title}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
