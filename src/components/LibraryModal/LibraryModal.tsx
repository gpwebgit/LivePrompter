import { useState } from 'react'
import { MdPlayArrow, MdDelete, MdEdit } from 'react-icons/md'
import TextLine from '../TextLine/TextLine'
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog'
import { parseSong } from '../../lib/parser'
import { paginateSong } from '../../lib/paginator'
import type { Song, ColorsConfig, Page } from '../../lib/types'
import styles from './LibraryModal.module.css'

interface Props {
  open: boolean
  onClose: () => void
  songs: Song[]
  colors: ColorsConfig
  onRemoveSong: (id: string) => Promise<void>
  onEdit: (songId: string) => void
}

type SubMode = 'list' | 'reader'

export default function LibraryModal({ open, onClose, songs, colors, onRemoveSong, onEdit }: Props) {
  const [subMode, setSubMode] = useState<SubMode>('list')
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [pageIdx, setPageIdx] = useState(0)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (!open) return null

  const sorted = [...songs].sort((a, b) => a.title.localeCompare(b.title, 'it'))

  const handlePlay = (song: Song) => {
    const parsed = parseSong(song.content)
    const p = paginateSong(parsed, { width: window.innerWidth, height: window.innerHeight })
    setSelectedSong(song)
    setPages(p)
    setPageIdx(0)
    setSubMode('reader')
  }

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    await onRemoveSong(confirmDeleteId)
    setConfirmDeleteId(null)
  }

  const handleClose = () => {
    setSubMode('list')
    setSelectedSong(null)
    onClose()
  }

  // READER MODE
  if (subMode === 'reader' && selectedSong) {
    const currentPage = pages[pageIdx]
    const uniform = currentPage?.fontSize ?? 28
    const avail = window.innerWidth - 36

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
          <div className={styles.readerHeaderRight}>
            <button
              className={styles.readerNav}
              style={{ color: colors.liveTitle, opacity: pageIdx === 0 ? 0.2 : 0.7 }}
              onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
              aria-label="Pagina precedente"
            >
              ‹
            </button>
            <button
              className={styles.readerNav}
              style={{ color: colors.liveTitle, opacity: pageIdx === pages.length - 1 ? 0.2 : 0.7 }}
              onClick={() => setPageIdx((p) => Math.min(pages.length - 1, p + 1))}
              aria-label="Pagina successiva"
            >
              ›
            </button>
            <button
              className={styles.readerClose}
              style={{ color: colors.liveTitle }}
              onClick={() => { setSubMode('list'); setSelectedSong(null) }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.readerBody} style={{ fontSize: uniform }}>
          {currentPage?.sections.map((section, si) => (
            <div key={si} className={styles.readerSection}>
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
      </div>
    )
  }

  // LIST MODE
  return (
    <div className={styles.overlay} style={{ backgroundColor: 'var(--color-bg-app)' }}>
      <div className={styles.header}>
        <h2 className={styles.title}>Libreria brani</h2>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Chiudi">
          ✕
        </button>
      </div>

      <div className={styles.list}>
        {sorted.length === 0 ? (
          <p className={styles.empty}>Nessun brano in libreria.</p>
        ) : (
          sorted.map((song) => (
            <div key={song.id} className={styles.row}>
              <span className={styles.songTitle}>{song.title}</span>
              <div className={styles.actions}>
                <button
                  className={styles.actionBtn}
                  onClick={() => handlePlay(song)}
                  title="Visualizza live"
                  aria-label="Visualizza live"
                >
                  <MdPlayArrow size={22} />
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => onEdit(song.id)}
                  title="Modifica"
                  aria-label="Modifica"
                >
                  <MdEdit size={20} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => setConfirmDeleteId(song.id)}
                  title="Elimina"
                  aria-label="Elimina"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Elimina brano"
        message={`Eliminare "${sorted.find((s) => s.id === confirmDeleteId)?.title}"? L'operazione è irreversibile.`}
        confirmLabel="ELIMINA"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
        destructive
      />
    </div>
  )
}
