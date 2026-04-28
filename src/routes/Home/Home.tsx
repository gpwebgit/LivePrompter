import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdDeleteOutline, MdLibraryMusic, MdWarning, MdSearch, MdSettings } from 'react-icons/md'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import TestoAlVolo from '../../components/TestoAlVolo/TestoAlVolo'
import AppFooter from '../../components/AppFooter/AppFooter'
import { useSetlists } from '../../hooks/useSetlists'
import { useSongs } from '../../hooks/useSongs'
import { useSettings } from '../../hooks/useSettings'
import type { Setlist } from '../../lib/types'
import styles from './Home.module.css'

const CARDS_PER_PAGE = 5

function formatDate(date: Date | string | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

function SetlistCard({ setlist, onEdit, onLaunch, onDelete }: {
  setlist: Setlist
  onEdit: () => void
  onLaunch: () => void
  onDelete: () => void
}) {
  const displayDate = setlist.updatedAt ?? setlist.createdAt
  return (
    <div className={styles.card} onClick={onEdit}>
      <div className={styles.cardTop}>
        <div>
          <div className={styles.cardName}>{setlist.name}</div>
          <div className={styles.cardDate}>{formatDate(displayDate)}</div>
        </div>
        <button
          className={styles.cardDeleteBtn}
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          aria-label={`Elimina ${setlist.name}`}
        >
          <MdDeleteOutline size={18} />
        </button>
      </div>

      <div className={styles.cardBottom}>
        <div className={styles.cardCount}>
          <span className={styles.cardCountNum}>{setlist.songIds.length}</span>
          <span className={styles.cardCountLabel}>
            {setlist.songIds.length === 1 ? 'brano' : 'brani'}
          </span>
        </div>
        <button
          className={styles.cardLaunch}
          onClick={(e) => { e.stopPropagation(); onLaunch() }}
        >
          AVVIA ▶
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { setlists, loading: loadingSetlists, removeSetlist } = useSetlists()
  const { songs, loading: loadingSongs } = useSongs()
  const { settings } = useSettings()
  const [deleteTarget, setDeleteTarget] = useState<Setlist | null>(null)
  const [alVoloOpen, setAlVoloOpen] = useState(false)
  const [pageIdx, setPageIdx] = useState(0)

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef(0)

  const totalPages = Math.ceil(setlists.length / CARDS_PER_PAGE)

  // Clamp page when setlists change
  useEffect(() => {
    if (pageIdx >= totalPages && totalPages > 0) {
      setPageIdx(totalPages - 1)
    }
  }, [setlists.length, totalPages, pageIdx])

  const onPointerDown = (setlist: Setlist) => {
    longPressTimer.current = setTimeout(() => setDeleteTarget(setlist), 600)
  }
  const onPointerUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await removeSetlist(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) < 50) return
    if (delta > 0 && pageIdx < totalPages - 1) setPageIdx((p) => p + 1)
    if (delta < 0 && pageIdx > 0) setPageIdx((p) => p - 1)
  }

  const loading = loadingSetlists || loadingSongs
  const noSongs = !loading && songs.length === 0
  const noSetlists = !loading && setlists.length === 0
  const currentPageSetlists = setlists.slice(pageIdx * CARDS_PER_PAGE, (pageIdx + 1) * CARDS_PER_PAGE)

  return (
    <div className={styles.page}>
      {/* Brand bar */}
      <div className={styles.brandBar}>
        <img src="/prompterlive_logo.png" alt="PrompterLive" className={styles.brandLogo} />
        <div className={styles.brandActions}>
          <button className={styles.headerIconBtn} onClick={() => setAlVoloOpen(true)} aria-label="Testo al volo">
            <MdSearch size={22} color="rgba(255,255,255,0.55)" />
          </button>
          <button className={styles.headerIconBtn} onClick={() => navigate('/impostazioni')} aria-label="Impostazioni">
            <MdSettings size={22} color="rgba(255,255,255,0.55)" />
          </button>
        </div>
      </div>

      <div
        className={styles.content}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.inner}>
          {/* Header + FAB */}
          <div className={styles.listHeader}>
            <div>
              <h1 className={styles.headerTitle}>Le tue scalette</h1>
              {setlists.length > 0 && (
                <p className={styles.headerSub}>{setlists.length} salvate</p>
              )}
            </div>
            <button className={styles.fabAdd} onClick={() => navigate('/scaletta/new')} aria-label="Nuova scaletta">
              +
            </button>
          </div>

          {/* Banner nessun testo */}
          {noSongs && (
            <div className={styles.banner}>
              <MdWarning size={18} color="#d40000" />
              <span className={styles.bannerText}>Ancora nessun testo presente</span>
              <button className="btn-primary" onClick={() => navigate('/impostazioni')}>
                Importa brani
              </button>
            </div>
          )}

          {/* Lista scalette (pagina corrente) */}
          {!noSetlists && (
            <div className={styles.cardList}>
              {currentPageSetlists.map((s) => (
                <div key={s.id} onPointerDown={() => onPointerDown(s)}>
                  <SetlistCard
                    setlist={s}
                    onEdit={() => navigate(`/scaletta/${s.id}`)}
                    onLaunch={() => navigate(`/live/${s.id}`)}
                    onDelete={() => setDeleteTarget(s)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {noSetlists && (
            <div className={styles.emptyState}>
              <MdLibraryMusic size={48} color="rgba(255,255,255,0.10)" />
              <p className={styles.emptyText}>Nessuna scaletta</p>
              <p className={styles.emptySubtext}>Premi + per crearne una</p>
            </div>
          )}

          {/* Dots — solo quando ci sono più pagine */}
          {totalPages > 1 && (
            <div className={styles.dots}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={i === pageIdx ? styles.dotActive : styles.dot}
                  onClick={() => setPageIdx(i)}
                  aria-label={`Pagina ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Elimina scaletta"
        message={`Vuoi eliminare "${deleteTarget?.name}"? Questa azione non può essere annullata.`}
        confirmLabel="ELIMINA"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />

      <TestoAlVolo
        open={alVoloOpen}
        onClose={() => setAlVoloOpen(false)}
        songs={songs}
        colors={settings.colors}
      />
      <AppFooter />
    </div>
  )
}
