import { useState, useRef } from 'react'
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

function formatDate(date: Date | string | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

function SetlistCard({ setlist, featured, onEdit, onLaunch, onDelete }: {
  setlist: Setlist
  featured: boolean
  onEdit: () => void
  onLaunch: () => void
  onDelete: () => void
}) {
  const displayDate = setlist.updatedAt ?? setlist.createdAt

  return (
    <div className={featured ? styles.cardFeatured : styles.card} onClick={onEdit}>
      <div className={styles.cardTop}>
        <div>
          <div className={featured ? styles.cardNameFeatured : styles.cardName}>
            {setlist.name}
          </div>
          <div className={featured ? styles.cardDateFeatured : styles.cardDate}>
            {formatDate(displayDate)}
          </div>
        </div>
        <button
          className={styles.cardDeleteBtn}
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          aria-label={`Elimina ${setlist.name}`}
        >
          <MdDeleteOutline size={18} color={featured ? 'rgba(255,255,255,0.5)' : '#555555'} />
        </button>
      </div>

      <div className={styles.cardBottom}>
        <div className={styles.cardCount}>
          <span className={featured ? styles.cardCountNumFeatured : styles.cardCountNum}>
            {setlist.songIds.length}
          </span>
          <span className={featured ? styles.cardCountLabelFeatured : styles.cardCountLabel}>
            {setlist.songIds.length === 1 ? 'brano' : 'brani'}
          </span>
        </div>
        <button
          className={featured ? styles.cardLaunchFeatured : styles.cardLaunch}
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

  // Long press per eliminare (alternativa ai tre puntini)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onPointerDown = (setlist: Setlist) => {
    longPressTimer.current = setTimeout(() => setDeleteTarget(setlist), 600)
  }
  const onPointerUp = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current) }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await removeSetlist(deleteTarget.id)
    setDeleteTarget(null)
  }

  const loading = loadingSetlists || loadingSongs
  const noSongs = !loading && songs.length === 0
  const noSetlists = !loading && setlists.length === 0

  return (
    <div className={styles.page}>
      {/* Brand bar */}
      <div className={styles.brandBar}>
        <span className={styles.brandName}>LivePrompter</span>
        <div className={styles.brandActions}>
          <button className={styles.headerIconBtn} onClick={() => setAlVoloOpen(true)} aria-label="Testo al volo">
            <MdSearch size={22} color="#888888" />
          </button>
          <button className={styles.headerIconBtn} onClick={() => navigate('/impostazioni')} aria-label="Impostazioni">
            <MdSettings size={22} color="#888888" />
          </button>
        </div>
      </div>

      <div className={styles.content} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        <div className={styles.inner}>
          {/* Header scalette + FAB */}
          <div className={styles.listHeader}>
            <div>
              <h1 className={styles.headerTitle}>Le tue scalette</h1>
              {setlists.length > 0 && <p className={styles.headerSub}>{setlists.length} salvate</p>}
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

          {/* Lista scalette */}
          {!noSetlists && (
            <div className={styles.cardList}>
              {setlists.map((s, i) => (
                <div key={s.id} data-setlist-id={s.id} onPointerDown={() => onPointerDown(s)}>
                  <SetlistCard
                    setlist={s}
                    featured={i === 0}
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
              <MdLibraryMusic size={48} color="#2a2a2a" />
              <p className={styles.emptyText}>Nessuna scaletta</p>
              <p className={styles.emptySubtext}>Premi + per crearne una</p>
            </div>
          )}

          {/* Dots indicator */}
          {setlists.length > 1 && (
            <div className={styles.dots}>
              {setlists.map((s, i) => (
                <span key={s.id} className={i === 0 ? styles.dotActive : styles.dot} />
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
