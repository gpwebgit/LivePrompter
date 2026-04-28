import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdArrowBack, MdOutlineLocalLibrary, MdNotifications } from 'react-icons/md'
import AppHeader from '../../components/AppHeader/AppHeader'
import AppFooter from '../../components/AppFooter/AppFooter'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import LibraryModal from '../../components/LibraryModal/LibraryModal'
import { useSettings } from '../../hooks/useSettings'
import { useSongs } from '../../hooks/useSongs'
import { parseSong } from '../../lib/parser'
import type { ColorsConfig } from '../../lib/types'
import styles from './Impostazioni.module.css'

interface ColorField {
  key: keyof ColorsConfig
  label: string
}

const COLOR_FIELDS: ColorField[] = [
  { key: 'liveBg', label: 'Sfondo live' },
  { key: 'liveTitle', label: 'Titolo canzone' },
  { key: 'liveVerse', label: 'Testo strofe' },
  { key: 'liveChorus', label: 'Testo ritornelli' },
  { key: 'liveSpecial', label: 'Testo speciale [S]' },
  { key: 'liveBarBg', label: 'Sfondo barra fine testo' },
  { key: 'liveBarText', label: 'Testo barra fine testo' },
  { key: 'liveClockBg', label: 'Sfondo orologio' },
  { key: 'liveClockText', label: 'Testo orologio' },
  { key: 'alertBg', label: 'Sfondo alert promemoria' },
  { key: 'alertText', label: 'Testo alert promemoria' },
]

export default function Impostazioni() {
  const navigate = useNavigate()
  const { settings, updateColors, resetColors } = useSettings()
  const { songs, importSong, removeSong, clearLibrary, findByTitle } = useSongs()
  const [libraryOpen, setLibraryOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const colorRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [confirmClearLibrary, setConfirmClearLibrary] = useState(false)
  const [overwriteQueue, setOverwriteQueue] = useState<{ title: string; content: string; existingId: string }[]>([])
  const [pendingImport, setPendingImport] = useState<{ title: string; content: string; existingId: string } | null>(null)
  const [rtfErrors, setRtfErrors] = useState<string[]>([])

  // --- Library handlers ---
  const handleFilesSelected = async (files: FileList) => {
    const queue: typeof overwriteQueue = []
    const rtfNames: string[] = []
    for (const file of files) {
      if (!file.name.endsWith('.txt')) continue
      const content = await file.text()
      if (content.trimStart().startsWith('{\\rtf')) {
        rtfNames.push(file.name)
        continue
      }
      const parsed = parseSong(content)
      const existing = findByTitle(parsed.title)
      if (existing) {
        queue.push({ title: parsed.title, content, existingId: existing.id })
      } else {
        await importSong({ id: crypto.randomUUID(), title: parsed.title, content, importedAt: new Date() })
      }
    }
    if (rtfNames.length > 0) setRtfErrors(rtfNames)
    if (queue.length > 0) {
      setOverwriteQueue(queue)
      const [first, ...rest] = queue
      setPendingImport(first)
      setOverwriteQueue(rest)
    }
  }

  const handleOverwriteConfirm = async () => {
    if (!pendingImport) return
    await importSong({
      id: pendingImport.existingId,
      title: pendingImport.title,
      content: pendingImport.content,
      importedAt: new Date(),
    })
    if (overwriteQueue.length > 0) {
      const [next, ...rest] = overwriteQueue
      setPendingImport(next)
      setOverwriteQueue(rest)
    } else {
      setPendingImport(null)
    }
  }

  const handleOverwriteSkip = () => {
    if (overwriteQueue.length > 0) {
      const [next, ...rest] = overwriteQueue
      setPendingImport(next)
      setOverwriteQueue(rest)
    } else {
      setPendingImport(null)
    }
  }

  const handleOverwriteAll = async () => {
    const all = pendingImport ? [pendingImport, ...overwriteQueue] : overwriteQueue
    for (const item of all) {
      await importSong({ id: item.existingId, title: item.title, content: item.content, importedAt: new Date() })
    }
    setPendingImport(null)
    setOverwriteQueue([])
  }

  // --- Color handlers ---
  const handleColorChange = (key: keyof ColorsConfig, value: string) => {
    updateColors({ ...settings.colors, [key]: value })
  }

  return (
    <div className={styles.page}>
      <AppHeader
        subtitle="Impostazioni"
        left={
          <button className={styles.iconBtn} onClick={() => navigate('/')} aria-label="Indietro">
            <MdArrowBack size={24} color="#888888" />
          </button>
        }
      />

      <div className={styles.scroll}>
      <div className={styles.inner}>
        {/* LIBRERIA */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Libreria brani</h2>
          <p className={styles.sectionHint}>
            {songs.length === 0
              ? 'Nessun brano importato.'
              : `${songs.length} ${songs.length === 1 ? 'brano' : 'brani'} in libreria.`}
          </p>
          {rtfErrors.length > 0 && (
            <div className={styles.rtfError}>
              <strong>File non compatibili (formato RTF):</strong>
              <ul>
                {rtfErrors.map((name) => <li key={name}>{name}</li>)}
              </ul>
              <p>
                In TextEdit: apri il file → <strong>Formato → Converti in testo semplice</strong> → Salva.
                Poi reimporta.
              </p>
              <button className={styles.rtfErrorClose} onClick={() => setRtfErrors([])}>✕</button>
            </div>
          )}
          <div className={styles.libraryActions}>
            <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
              Importa brani
            </button>
            <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
              Aggiorna libreria
            </button>
            {songs.length > 0 && (
              <button className="btn-destructive" onClick={() => setConfirmClearLibrary(true)}>
                Elimina libreria
              </button>
            )}
            {songs.length > 0 && (
              <button className="btn-secondary" onClick={() => setLibraryOpen(true)}>
                <MdOutlineLocalLibrary size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Apri libreria
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
          />
        </section>

        {/* COLORI */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Colori</h2>
          <div className={styles.colorList}>
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key} className={styles.colorRow}>
                <span className={styles.colorLabel}>{label}</span>
                {/* Input sovrapposto al quadratino — il browser apre il picker vicino all'elemento */}
                <div className={styles.swatchWrapper}>
                  <div className={styles.swatch} style={{ backgroundColor: settings.colors[key] }} />
                  <input
                    ref={(el) => { colorRefs.current[key] = el }}
                    type="color"
                    value={settings.colors[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className={styles.colorInput}
                    aria-label={`Colore ${label}`}
                  />
                </div>
                <span className={styles.colorHex}>{settings.colors[key]}</span>
              </div>
            ))}
          </div>

          <div className={styles.previewLabel}>Anteprima schermata live</div>
          {/* Anteprima alert promemoria */}
          <div className={styles.alertPreview} style={{ backgroundColor: settings.colors.alertBg }}>
            <MdNotifications size={18} color={settings.colors.alertText} style={{ flexShrink: 0 }} />
            <span className={styles.alertPreviewText} style={{ color: settings.colors.alertText }}>Auguri a Mario!</span>
            <span className={styles.alertPreviewClose} style={{ color: settings.colors.alertText }}>✕</span>
          </div>
          <div className={styles.livePreview} style={{ backgroundColor: settings.colors.liveBg }}>
            {/* Header */}
            <div className={styles.lpHeader}>
              <span className={styles.lpTitle} style={{ color: settings.colors.liveTitle }}>
                TITOLO CANZONE
              </span>
              <div className={styles.lpHeaderRight}>
                <span className={styles.lpBack} style={{ color: settings.colors.liveTitle }}>‹</span>
                <span className={styles.lpClock} style={{ backgroundColor: settings.colors.liveClockBg, color: settings.colors.liveClockText }}>
                  10:30
                </span>
              </div>
            </div>
            {/* Body */}
            <div className={styles.lpBody}>
              <div className={styles.lpSection}>
                <span style={{ color: settings.colors.liveVerse }}>QUESTA È UNA STROFA</span>
                <span style={{ color: settings.colors.liveVerse }}>
                  CON <span style={{ color: settings.colors.liveSpecial }}>TESTO SPECIALE</span> QUI
                </span>
              </div>
              <div className={styles.lpSection}>
                <span style={{ color: settings.colors.liveChorus }}>QUESTO È IL RITORNELLO</span>
                <span style={{ color: settings.colors.liveChorus }}>DELLA CANZONE</span>
              </div>
            </div>
            {/* Footer bar */}
            <div className={styles.lpBar} style={{ backgroundColor: settings.colors.liveBarBg, color: settings.colors.liveBarText }}>
              ▶ PROSSIMO: NOME CANZONE
            </div>
          </div>

          <button className="btn-secondary" onClick={resetColors} style={{ marginTop: 16 }}>
            Ripristina default
          </button>
        </section>

        {/* GUIDA FORMATTAZIONE */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Guida formattazione testi</h2>
          <div className={styles.guide}>
            <p>📄 Ogni file <code>.txt</code> è una canzone.</p>
            <p>• La <strong>prima riga</strong> del file è il titolo della canzone.</p>
            <p>• La prima riga deve essere seguita da una <strong>riga vuota</strong> obbligatoria.</p>
            <p>• <strong>Riga vuota</strong> = separatore di sezione (strofa o ritornello).</p>
            <p>• <strong>[R]</strong> come prima riga di una sezione = ritornello (testo giallo).</p>
            <p>• Nessun marcatore = strofa (testo bianco).</p>
            <p>• <strong>[S]testo[/S]</strong> = parola o frase in colore speciale (viola chiaro), funziona dentro strofe e ritornelli.</p>
            <p>• <strong>[COLOR=#FF0000]testo[/COLOR]</strong> = colore personalizzato su una parola o frase (usa l'editor per applicarlo).</p>
            <p>• <strong>[SIZE=1.5]testo[/SIZE]</strong> = dimensione personalizzata su una parola o frase — il numero è un moltiplicatore (es. 1.5 = 50% più grande, 0.8 = 20% più piccolo).</p>
            <p>• <code>[COLOR]</code> e <code>[SIZE]</code> si possono annidare: <code>[COLOR=#FF0000][SIZE=1.5]testo[/SIZE][/COLOR]</code>.</p>
            <p>• Scrivi il testo in minuscolo — l'app lo converte in maiuscolo automaticamente.</p>
          </div>
        </section>

        <div style={{ height: 32 }} />
      </div>
      </div>
      <AppFooter />

      <LibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        songs={songs}
        colors={settings.colors}
        onRemoveSong={removeSong}
        onEdit={(id) => { setLibraryOpen(false); navigate(`/editor/${id}`) }}
      />

      <ConfirmDialog
        open={confirmClearLibrary}
        title="Elimina libreria"
        message="Tutti i brani verranno eliminati. Le scalette che li contengono potrebbero non funzionare. Continuare?"
        confirmLabel="ELIMINA TUTTO"
        onConfirm={async () => { await clearLibrary(); setConfirmClearLibrary(false) }}
        onCancel={() => setConfirmClearLibrary(false)}
        destructive
      />

      <ConfirmDialog
        open={pendingImport !== null}
        title="Brano già esistente"
        message={`Il brano "${pendingImport?.title}" è già presente in libreria. Sovrascriverlo?${overwriteQueue.length > 0 ? ` (${overwriteQueue.length + 1} conflitti rimasti)` : ''}`}
        confirmLabel="SOVRASCRIVI"
        cancelLabel="SALTA"
        extraLabel={overwriteQueue.length > 0 ? 'SOVRASCRIVI TUTTI' : undefined}
        onConfirm={handleOverwriteConfirm}
        onCancel={handleOverwriteSkip}
        onExtra={overwriteQueue.length > 0 ? handleOverwriteAll : undefined}
      />
    </div>
  )
}
