import { useEffect, useRef } from 'react'
import styles from './ConfirmDialog.module.css'

interface Props {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  extraLabel?: string
  onConfirm: () => void
  onCancel: () => void
  onExtra?: () => void
  destructive?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'CONFERMA',
  cancelLabel = 'ANNULLA',
  extraLabel,
  onConfirm,
  onCancel,
  onExtra,
  destructive = false,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel()
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.dialog} ref={dialogRef}>
        <h3 className={styles.title}>{title}</h3>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.actions}>
          <button className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          {extraLabel && onExtra && (
            <button className="btn-secondary" onClick={onExtra}>
              {extraLabel}
            </button>
          )}
          <button
            className={destructive ? 'btn-destructive' : 'btn-primary'}
            onClick={onConfirm}
            style={destructive ? { color: '#d40000', borderColor: '#d40000' } : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
