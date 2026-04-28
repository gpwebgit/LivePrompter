import { useState, useEffect, useRef } from 'react'
import { MdDeleteOutline, MdNotificationsNone, MdEditNote } from 'react-icons/md'
import { getReminders, putReminder, deleteReminder } from '../../lib/db'
import type { Reminder } from '../../lib/types'
import styles from './PromemoriaModal.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

const MAX_CHARS = 160

function formatTrigger(iso: string): string {
  const [date, time] = iso.split('T')
  if (!date || !time) return iso
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y} ${time}`
}

function defaultDatetime(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  d.setSeconds(0, 0)
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function PromemoriaModal({ open, onClose }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [message, setMessage] = useState('')
  const [triggerAt, setTriggerAt] = useState(defaultDatetime)
  const [editingId, setEditingId] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      getReminders().then((r) => {
        r.sort((a, b) => a.triggerAt.localeCompare(b.triggerAt))
        setReminders(r)
      })
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setMessage('')
    setTriggerAt(defaultDatetime())
    setEditingId(null)
  }

  const startEdit = (r: Reminder) => {
    setMessage(r.message)
    setTriggerAt(r.triggerAt)
    setEditingId(r.id)
    // Scorri al form
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const handleSave = async () => {
    if (!message.trim() || !triggerAt) return

    const reminder: Reminder = {
      id: editingId ?? crypto.randomUUID(),
      message: message.trim().slice(0, MAX_CHARS),
      triggerAt,
      // Se si sta modificando un reminder già mostrato, lo rimette in attesa
      dismissed: false,
    }

    await putReminder(reminder)
    const updated = await getReminders()
    updated.sort((a, b) => a.triggerAt.localeCompare(b.triggerAt))
    setReminders(updated)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    await deleteReminder(id)
    setReminders((r) => r.filter((x) => x.id !== id))
    if (editingId === id) resetForm()
  }

  if (!open) return null

  const pending = reminders.filter((r) => !r.dismissed)
  const past = reminders.filter((r) => r.dismissed)
  const isEditing = editingId !== null

  const ReminderRow = ({ r, muted }: { r: Reminder; muted?: boolean }) => (
    <div key={r.id} className={`${styles.reminderRow} ${muted ? styles.reminderRowDismissed : ''} ${editingId === r.id ? styles.reminderRowEditing : ''}`}>
      <div className={styles.reminderInfo}>
        <span className={styles.reminderTime}>{formatTrigger(r.triggerAt)}</span>
        <span className={styles.reminderMsg}>{r.message}</span>
      </div>
      <div className={styles.reminderActions}>
        <button className={styles.editBtn} onClick={() => startEdit(r)} aria-label="Modifica">
          <MdEditNote size={20} />
        </button>
        <button className={styles.deleteBtn} onClick={() => handleDelete(r.id)} aria-label="Elimina">
          <MdDeleteOutline size={18} />
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>
            <MdNotificationsNone size={18} />
            Promemoria
          </span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Form */}
          <div className={styles.form} ref={formRef}>
            {isEditing && (
              <div className={styles.editingBadge}>
                <MdEditNote size={14} />
                Modifica in corso
                <button className={styles.editingCancel} onClick={resetForm}>Annulla</button>
              </div>
            )}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Messaggio</label>
              <textarea
                className={styles.textarea}
                placeholder="Es: Auguri a Marco alle 23:55!"
                maxLength={MAX_CHARS}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
              />
              <span className={styles.charCount}>{message.length}/{MAX_CHARS}</span>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Data e ora</label>
              <input
                className={styles.datetimeInput}
                type="datetime-local"
                value={triggerAt}
                onChange={(e) => setTriggerAt(e.target.value)}
              />
            </div>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={!message.trim() || !triggerAt}
            >
              {isEditing ? 'Aggiorna promemoria' : 'Salva promemoria'}
            </button>
          </div>

          {/* In attesa */}
          {pending.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>In attesa ({pending.length})</h3>
              {pending.map((r) => <ReminderRow key={r.id} r={r} />)}
            </div>
          )}

          {/* Già mostrati */}
          {past.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitleMuted}>Già mostrati ({past.length})</h3>
              {past.map((r) => <ReminderRow key={r.id} r={r} muted />)}
            </div>
          )}

          {pending.length === 0 && past.length === 0 && (
            <p className={styles.empty}>Nessun promemoria salvato.</p>
          )}
        </div>
      </div>
    </div>
  )
}
