import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MdArrowBack, MdDragHandle, MdRemoveCircleOutline, MdPlaylistAdd, MdPlayCircleFilled, MdSave, MdContentPaste } from 'react-icons/md'
import AppHeader from '../../components/AppHeader/AppHeader'
import AppFooter from '../../components/AppFooter/AppFooter'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useSetlists } from '../../hooks/useSetlists'
import { useSongs } from '../../hooks/useSongs'
import type { Song, Setlist } from '../../lib/types'
import styles from './Scaletta.module.css'

interface SortableSongRowProps {
  id: string
  title: string
  onRemove: () => void
}

function SortableSongRow({ id, title, onRemove }: SortableSongRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className={styles.songRow}>
      <span className={styles.dragHandle} {...attributes} {...listeners}>
        <MdDragHandle size={20} color="#888888" />
      </span>
      <span className={styles.songTitle}>{title}</span>
      <button className={styles.removeBtn} onClick={onRemove} aria-label={`Rimuovi ${title}`}>
        <MdRemoveCircleOutline size={20} color="#888888" />
      </button>
    </div>
  )
}

// Normalizza per confronto robusto — confronti su code point, zero Unicode letterali
function normalizeTitle(s: string): string {
  const APOSTROPHES = new Set([
    0x2018, 0x2019, 0x201A, 0x201B, // varianti virgolette singole
    0x0060, 0x00B4, 0x02BC, 0xFF07, // backtick, accento acuto, modificatori
  ])
  const INVISIBLE = new Set([
    0x00A0, 0x200B, 0x200C, 0x200D, 0xFEFF, 0x00AD,
  ])
  const mapped = s.normalize('NFC').toLowerCase().split('').map((c) => {
    const cp = c.codePointAt(0) ?? 0
    if (APOSTROPHES.has(cp)) return "'"
    if (INVISIBLE.has(cp)) return ' '
    return c
  }).join('')
  return mapped.trim().replace(/\s+/g, ' ')
}

export default function Scaletta() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isNew = id === undefined

  const { saveSetlist, getSetlist } = useSetlists()
  const { songs } = useSongs()

  const [name, setName] = useState('')
  const [songIds, setSongIds] = useState<string[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set())
  const [pickerQuery, setPickerQuery] = useState('')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [pendingLeave, setPendingLeave] = useState<string | null>(null)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [pasteNotFound, setPasteNotFound] = useState<string[]>([])

  useEffect(() => {
    if (!isNew && id) {
      getSetlist(id).then((s) => {
        if (s) {
          setName(s.name)
          setSongIds(s.songIds)
        }
      })
    }
  }, [id, isNew, getSetlist])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setSongIds((ids) => {
        const oldIdx = ids.indexOf(active.id as string)
        const newIdx = ids.indexOf(over.id as string)
        return arrayMove(ids, oldIdx, newIdx)
      })
    }
  }

  const removeSong = (removeId: string) => {
    setSongIds((ids) => ids.filter((i) => i !== removeId))
  }

  const handlePickerToggle = (songId: string) => {
    setPickerSelected((prev) => {
      const next = new Set(prev)
      if (next.has(songId)) next.delete(songId)
      else next.add(songId)
      return next
    })
  }

  const handlePickerAdd = () => {
    setSongIds((ids) => {
      const toAdd = [...pickerSelected].filter((sid) => !ids.includes(sid))
      return [...ids, ...toAdd]
    })
    setPickerSelected(new Set())
    setPickerQuery('')
    setShowPicker(false)
  }

  const handlePasteConfirm = () => {
    const lines = pasteText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
    const found: string[] = []
    const notFound: string[] = []

    for (const line of lines) {
      const match = songs.find((s) => normalizeTitle(s.title) === normalizeTitle(line))
      if (match) {
        found.push(match.id)
      } else {
        notFound.push(line)
      }
    }

    if (found.length > 0) setSongIds(found)
    setPasteNotFound(notFound)

    if (notFound.length === 0) {
      setPasteText('')
      setShowPaste(false)
    }
  }

  const canSave = name.trim().length > 0 && songIds.length > 0

  const doSave = async (): Promise<Setlist> => {
    const now = new Date()
    const setlist: Setlist = {
      id: isNew ? crypto.randomUUID() : id!,
      name: name.trim(),
      songIds,
      createdAt: isNew ? now : new Date(0),
      updatedAt: now,
    }
    if (!isNew) {
      const existing = await getSetlist(id!)
      setlist.createdAt = existing?.createdAt ?? now
    }
    await saveSetlist(setlist)
    return setlist
  }

  const handleSave = async () => {
    if (!canSave) return
    await doSave()
    navigate('/')
  }

  const handleLaunchLive = async () => {
    if (!canSave) return
    const saved = await doSave()
    navigate(`/live/${saved.id}`)
  }

  const handleBack = () => {
    setPendingLeave('/')
    setShowLeaveConfirm(true)
  }

  const songMap = new Map<string, Song>(songs.map((s) => [s.id, s]))
  const orderedSongs = songIds.map((sid) => songMap.get(sid)).filter(Boolean) as Song[]
  const availableSongs = songs.filter((s) => !songIds.includes(s.id))

  return (
    <div className={styles.page}>
      <AppHeader
        subtitle={isNew ? 'Nuova scaletta' : 'Modifica scaletta'}
        left={
          <button className={styles.iconBtn} onClick={handleBack} aria-label="Indietro">
            <MdArrowBack size={24} color="#888888" />
          </button>
        }
      />

      <div className={styles.content}>
      <div className={styles.inner}>
        {/* Nome scaletta */}
        <div className={styles.nameRow}>
          <input
            className={styles.nameInput}
            type="text"
            placeholder="Nome scaletta..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus={isNew}
          />
        </div>

        {/* Lista brani */}
        {orderedSongs.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={songIds} strategy={verticalListSortingStrategy}>
              <div className={styles.songList}>
                {orderedSongs.map((song) => (
                  <SortableSongRow
                    key={song.id}
                    id={song.id}
                    title={song.title}
                    onRemove={() => removeSong(song.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className={styles.emptySongs}>
            <p className={styles.emptyText}>Nessun brano aggiunto</p>
            <p className={styles.emptySubtext}>Aggiungi almeno un brano per salvare la scaletta</p>
          </div>
        )}
        <AppFooter />
      </div>
      </div>

      {/* Footer actions */}
      <div className={styles.footer}>
        <button className="btn-secondary" onClick={() => setShowPicker(true)}>
          <MdPlaylistAdd size={20} />
          Aggiungi
        </button>
        <button className="btn-secondary" onClick={() => { setPasteText(''); setPasteNotFound([]); setShowPaste(true) }}>
          <MdContentPaste size={20} />
          Incolla
        </button>
        <button className="btn-primary" onClick={handleSave} disabled={!canSave}>
          <MdSave size={20} />
          Salva
        </button>
        <button className="btn-primary" onClick={handleLaunchLive} disabled={!canSave}>
          <MdPlayCircleFilled size={20} />
          Live
        </button>
      </div>

      {/* Picker overlay */}
      {showPicker && (
        <div className={styles.pickerBackdrop} onClick={(e) => e.target === e.currentTarget && setShowPicker(false)}>
          <div className={styles.picker}>
            <div className={styles.pickerHeader}>
              <span className={styles.pickerTitle}>Aggiungi brani</span>
              <button className={styles.iconBtn} onClick={() => { setPickerSelected(new Set()); setPickerQuery(''); setShowPicker(false) }}>
                ✕
              </button>
            </div>
            <div className={styles.pickerSearch}>
              <input
                className={styles.pickerSearchInput}
                type="text"
                placeholder="Cerca..."
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            {availableSongs.filter(s =>
              pickerQuery.trim() === '' || s.title.toLowerCase().includes(pickerQuery.toLowerCase())
            ).length === 0 ? (
              <div className={styles.pickerEmpty}>
                {pickerQuery.trim() !== '' ? (
                  <p>Nessun brano trovato per "{pickerQuery}".</p>
                ) : (
                  <>
                    <p>Nessun brano disponibile.</p>
                    {songs.length === 0 && <p>Importa brani dalle Impostazioni.</p>}
                    {songs.length > 0 && <p>Tutti i brani sono già in questa scaletta.</p>}
                  </>
                )}
              </div>
            ) : (
              <ul className={styles.pickerList}>
                {availableSongs
                  .filter(s => pickerQuery.trim() === '' || s.title.toLowerCase().includes(pickerQuery.toLowerCase()))
                  .map((song) => (
                  <li key={song.id} className={styles.pickerRow}>
                    <label className={styles.pickerLabel}>
                      <input
                        type="checkbox"
                        className={styles.pickerCheck}
                        checked={pickerSelected.has(song.id)}
                        onChange={() => handlePickerToggle(song.id)}
                      />
                      <span className={styles.pickerSongTitle}>{song.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <div className={styles.pickerActions}>
              <button className="btn-secondary" onClick={() => { setPickerSelected(new Set()); setShowPicker(false) }}>
                Annulla
              </button>
              <button className="btn-primary" onClick={handlePickerAdd} disabled={pickerSelected.size === 0}>
                Aggiungi ({pickerSelected.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay incolla lista */}
      {showPaste && (
        <div className={styles.pickerBackdrop} onClick={(e) => e.target === e.currentTarget && setShowPaste(false)}>
          <div className={styles.picker}>
            <div className={styles.pickerHeader}>
              <span className={styles.pickerTitle}>Incolla lista brani</span>
              <button className={styles.iconBtn} onClick={() => setShowPaste(false)}>✕</button>
            </div>

            <div className={styles.pasteBody}>
              <p className={styles.pasteHint}>
                Incolla i titoli dei brani, uno per riga. Devono corrispondere ai titoli in libreria.
              </p>
              <textarea
                className={styles.pasteTextarea}
                placeholder={"Titolo canzone 1\nTitolo canzone 2\n..."}
                value={pasteText}
                onChange={(e) => { setPasteText(e.target.value); setPasteNotFound([]) }}
                autoFocus
                spellCheck={false}
              />
              {pasteNotFound.length > 0 && (
                <div className={styles.pasteErrors}>
                  <p className={styles.pasteErrorTitle}>
                    {pasteNotFound.length} {pasteNotFound.length === 1 ? 'titolo non trovato' : 'titoli non trovati'} in libreria:
                  </p>
                  <ul className={styles.pasteErrorList}>
                    {pasteNotFound.map((t, i) => <li key={i}>"{t}"</li>)}
                  </ul>
                  <p className={styles.pasteErrorHint}>
                    I brani trovati sono stati aggiunti. Correggi i titoli mancanti e riprova, oppure chiudi.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.pickerActions}>
              <button className="btn-secondary" onClick={() => setShowPaste(false)}>
                Annulla
              </button>
              <button
                className="btn-primary"
                onClick={handlePasteConfirm}
                disabled={pasteText.trim().length === 0}
              >
                Applica
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showLeaveConfirm}
        title="Uscire senza salvare?"
        message="Le modifiche non salvate andranno perse."
        confirmLabel="ESCI"
        cancelLabel="RIMANI"
        onConfirm={() => { setShowLeaveConfirm(false); navigate(pendingLeave ?? '/') }}
        onCancel={() => { setShowLeaveConfirm(false); setPendingLeave(null) }}
      />
    </div>
  )
}
