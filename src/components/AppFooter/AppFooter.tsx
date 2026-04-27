import { useState } from 'react'
import { CHANGELOG } from '../../lib/changelog'
import styles from './AppFooter.module.css'

export default function AppFooter() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <footer className={styles.footer}>
        <span className={styles.text}>
          LivePrompter · Made musically by Giuseppe Paino ·{' '}
          <button className={styles.versionBtn} onClick={() => setOpen(true)}>
            Versione {__APP_VERSION__}
          </button>
        </span>
      </footer>

      {open && (
        <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Novità e aggiornamenti</span>
              <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Chiudi">
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {CHANGELOG.map((entry) => (
                <div key={entry.version} className={styles.entry}>
                  <div className={styles.entryHeader}>
                    <span className={styles.entryVersion}>v. {entry.version}</span>
                    <span className={styles.entryDate}>{entry.date}</span>
                  </div>
                  <ul className={styles.changeList}>
                    {entry.changes.map((c, i) => (
                      <li key={i} className={styles.changeItem}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
