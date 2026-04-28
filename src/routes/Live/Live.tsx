import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MdSearch, MdNotifications } from 'react-icons/md'
import TextLine from '../../components/TextLine/TextLine'
import TestoAlVolo from '../../components/TestoAlVolo/TestoAlVolo'
import { parseSong } from '../../lib/parser'
import { paginateSong, BODY_PADDING_H } from '../../lib/paginator'
import { getSetlist, getSongs, getSettings, getReminders, putReminder } from '../../lib/db'
import type { Page, ColorsConfig, Song, Reminder } from '../../lib/types'
import { DEFAULT_COLORS } from '../../lib/types'
import styles from './Live.module.css'

function formatClock(date: Date): string {
  return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function buildPages(songs: Song[]): Page[][] {
  const display = { width: window.innerWidth, height: window.innerHeight }
  return songs.map((song) => {
    const parsed = parseSong(song.content)
    return paginateSong(parsed, display)
  })
}

export default function Live() {
  const navigate = useNavigate()
  const { setlistId } = useParams<{ setlistId: string }>()

  const [songs, setSongs] = useState<Song[]>([])
  const [allSongsLibrary, setAllSongsLibrary] = useState<Song[]>([])
  const [allPages, setAllPages] = useState<Page[][]>([])
  const [songIdx, setSongIdx] = useState(0)
  const [pageIdx, setPageIdx] = useState(0)
  const [colors, setColors] = useState<ColorsConfig>(DEFAULT_COLORS)
  const [clock, setClock] = useState(() => formatClock(new Date()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alVoloOpen, setAlVoloOpen] = useState(false)
  const [bodyWidth, setBodyWidth] = useState(() => window.innerWidth - BODY_PADDING_H * 2)
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null)
  const remindersRef = useRef<Reminder[]>([])
  const reminderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-chiude l'alert dopo 3 minuti se non viene chiuso manualmente
  useEffect(() => {
    if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current)
    if (activeReminder) {
      reminderTimerRef.current = setTimeout(() => setActiveReminder(null), 3 * 60 * 1000)
    }
    return () => {
      if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current)
    }
  }, [activeReminder])

  const songIdxRef = useRef(songIdx)
  const pageIdxRef = useRef(pageIdx)
  const allPagesRef = useRef(allPages)
  const alVoloOpenRef = useRef(alVoloOpen)
  const songsRef = useRef(songs)
  songIdxRef.current = songIdx
  pageIdxRef.current = pageIdx
  allPagesRef.current = allPages
  alVoloOpenRef.current = alVoloOpen
  songsRef.current = songs

  // Load data
  useEffect(() => {
    if (!setlistId) { setError('ID scaletta mancante'); return }
    let cancelled = false

    async function load() {
      const [setlist, allSongs, settings] = await Promise.all([
        getSetlist(setlistId!),
        getSongs(),
        getSettings(),
      ])

      if (cancelled) return
      if (!setlist) { setError('Scaletta non trovata'); return }

      const songMap = new Map(allSongs.map((s) => [s.id, s]))
      const orderedSongs: Song[] = setlist.songIds
        .map((id) => songMap.get(id))
        .filter(Boolean) as Song[]

      if (orderedSongs.length === 0) { setError('Nessun brano disponibile in questa scaletta'); return }

      setSongs(orderedSongs)
      setAllSongsLibrary(allSongs)
      setAllPages(buildPages(orderedSongs))
      setColors(settings.colors)
      // Carica reminder non ancora mostrati
      const allReminders = await getReminders()
      const pending = allReminders.filter((r) => !r.dismissed)
      remindersRef.current = pending
      setLoading(false)
    }

    load().catch((e: unknown) => {
      if (!cancelled) setError(String(e))
    })
    return () => { cancelled = true }
  }, [setlistId])

  // Resize + orientamento — ricalcola paginazione (debounce 200ms)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setBodyWidth(window.innerWidth - BODY_PADDING_H * 2)
        if (songsRef.current.length > 0) {
          setAllPages(buildPages(songsRef.current))
        }
      }, 200)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  // Clock + check reminder ogni 10s
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0')

    const checkReminders = (now: Date) => {
      if (remindersRef.current.length === 0) return

      // Costruisce data e ora LOCALE con getFullYear/Month/Date/Hours/Minutes
      // Nessuna dipendenza da locale o da formatClock
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      const timeStr  = `${pad(now.getHours())}:${pad(now.getMinutes())}`

      const due = remindersRef.current.find((r) => {
        const rDate = r.triggerAt.slice(0, 10)  // "YYYY-MM-DD"
        const rTime = r.triggerAt.slice(11, 16) // "HH:MM"
        if (rDate < todayStr) return true               // data passata → scatta sempre
        if (rDate === todayStr) return rTime <= timeStr // oggi → scatta se l'ora è arrivata
        return false
      })

      if (due) {
        remindersRef.current = remindersRef.current.filter((r) => r.id !== due.id)
        putReminder({ ...due, dismissed: true })
        setActiveReminder(due)
      }
    }

    const tick = () => {
      const now = new Date()
      setClock(formatClock(now))
      checkReminders(now)
    }

    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  // Wake Lock
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null
    const acquire = async () => {
      if ('wakeLock' in navigator) {
        try { wakeLock = await navigator.wakeLock.request('screen') } catch { /* unsupported */ }
      }
    }
    const onVisibility = () => { if (document.visibilityState === 'visible') acquire() }
    acquire()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      wakeLock?.release()
    }
  }, [])

  // History API — intercept Android Back
  const navigateBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  useEffect(() => {
    history.pushState(null, '', location.href)
    const onPopState = () => navigateBack()
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [navigateBack])

  // Navigation
  const goNext = useCallback(() => {
    if (alVoloOpenRef.current) return
    const pages = allPagesRef.current
    const si = songIdxRef.current
    const pi = pageIdxRef.current
    if (pi < (pages[si]?.length ?? 1) - 1) {
      setPageIdx((p) => p + 1)
    } else if (si < pages.length - 1) {
      setSongIdx((s) => s + 1)
      setPageIdx(0)
    }
  }, [])

  const goPrev = useCallback(() => {
    if (alVoloOpenRef.current) return
    const pages = allPagesRef.current
    const si = songIdxRef.current
    const pi = pageIdxRef.current
    if (pi > 0) {
      setPageIdx((p) => p - 1)
    } else if (si > 0) {
      const prevSongPages = pages[si - 1]?.length ?? 1
      setSongIdx((s) => s - 1)
      setPageIdx(prevSongPages - 1)
    }
  }, [])

  // Keyboard listener pedale
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'PageDown' || e.key === 'ArrowDown') { e.preventDefault(); goNext() }
      if (e.key === 'PageUp' || e.key === 'ArrowUp') { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  // Tap center → back
  const handleBodyTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) navigateBack()
    },
    [navigateBack],
  )

  if (loading) {
    return (
      <div className={styles.container} style={{ backgroundColor: colors.liveBg }}>
        <div className={styles.loadingText}>Caricamento...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container} style={{ backgroundColor: colors.liveBg }}>
        <div className={styles.errorText}>{error}</div>
        <button className={styles.errorBack} onClick={navigateBack}>TORNA INDIETRO</button>
      </div>
    )
  }

  // Font dinamico per l'alert: riempie la riga senza andare a capo
  // padding 18*2 + icona ~24 + close ~24 + gap 10*2 = ~104px riservati
  const reminderFontSize = (() => {
    if (!activeReminder) return 18
    const avail = window.innerWidth - 104
    const _c = document.createElement('canvas').getContext('2d')
    if (!_c) return 18
    for (let fs = 36; fs >= 12; fs--) {
      _c.font = `700 ${fs}px Arial, sans-serif`
      if (_c.measureText(activeReminder.message).width <= avail) return fs
    }
    return 12
  })()

  const currentSong = songs[songIdx]
  const nextSong = songs[songIdx + 1]
  const currentPage = allPages[songIdx]?.[pageIdx]
  const isLastPageOfSong = pageIdx === (allPages[songIdx]?.length ?? 1) - 1
  const uniformFontSize = currentPage?.fontSize ?? 28

  // Prima riga della pagina successiva (stessa canzone) — usata come ghost preview
  const nextPageInSong = !isLastPageOfSong ? allPages[songIdx]?.[pageIdx + 1] : undefined
  const previewSection = nextPageInSong?.sections[0]
  const previewLine = previewSection?.lines[0]
  const previewColor = previewSection?.type === 'chorus' ? colors.liveChorus : colors.liveVerse
  // Se la prossima pagina continua la stessa sezione parser, annulla il gap flex (12px) per far apparire
  // la riga come continuazione naturale; se invece inizia un nuovo blocco, il gap flex è corretto
  const previewMarginTop = nextPageInSong?.firstSectionContinues ? -12 : 0

  return (
    <>
      <div
        className={styles.container}
        style={{ backgroundColor: colors.liveBg }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Header — alert promemoria o header normale */}
        {activeReminder ? (
          <div
            className={styles.reminderAlert}
            style={{ backgroundColor: colors.alertBg }}
            onClick={() => setActiveReminder(null)}
            role="button"
            aria-label="Tocca per chiudere il promemoria"
          >
            <MdNotifications size={22} color={colors.alertText} className={styles.reminderAlertIcon} />
            <span className={styles.reminderAlertText} style={{ fontSize: reminderFontSize, color: colors.alertText }}>{activeReminder.message}</span>
            <span className={styles.reminderAlertClose} style={{ color: colors.alertText }}>✕</span>
          </div>
        ) : (
        <div className={styles.header}>
          <span className={styles.songTitle} style={{ color: colors.liveTitle }}>
            {currentSong?.title?.toUpperCase() ?? ''}
          </span>
          <div className={styles.headerRight}>
            <button
              className={styles.backBtn}
              onClick={navigateBack}
              style={{ color: colors.liveTitle }}
              aria-label="Torna alla scaletta"
            >
              ‹
            </button>
            <span
              className={styles.clockBadge}
              style={{ backgroundColor: colors.liveClockBg, color: colors.liveClockText }}
            >
              {clock}
            </span>
            <button
              className={styles.searchBtn}
              onClick={() => setAlVoloOpen(true)}
              style={{ color: colors.liveTitle }}
              aria-label="Testo al volo"
            >
              <MdSearch size={18} />
            </button>
          </div>
        </div>
        )}

        {/* Body */}
        <div
          className={styles.body}
          onClick={handleBodyTap}
          style={{ fontSize: uniformFontSize }}
        >
          {currentPage?.sections.map((section, si) => (
            <div key={si} className={styles.section}>
              {section.lines.map((line, li) => (
                <TextLine
                  key={li}
                  text={line}
                  sectionColor={section.type === 'chorus' ? colors.liveChorus : colors.liveVerse}
                  specialColor={colors.liveSpecial}
                  fontSize={uniformFontSize}
                  availableWidth={bodyWidth}
                />
              ))}
            </div>
          ))}

          {/* Ghost preview: prima riga della pagina successiva (stessa canzone) */}
          {previewLine && (
            <div className={styles.previewLine} style={{ marginTop: previewMarginTop }}>
              <TextLine
                text={previewLine}
                sectionColor={previewColor}
                specialColor={colors.liveSpecial}
                fontSize={uniformFontSize}
                availableWidth={bodyWidth}
              />
            </div>
          )}
        </div>

        {/* Footer — solo sull'ultima pagina della canzone corrente */}
        {isLastPageOfSong && (
          <div
            className={styles.footer}
            style={{ backgroundColor: colors.liveBarBg, color: colors.liveBarText }}
          >
            {nextSong
              ? `▶ PROSSIMO: ${nextSong.title.toUpperCase()}`
              : '▶ FINE SCALETTA'}
          </div>
        )}
      </div>

      <TestoAlVolo
        open={alVoloOpen}
        onClose={() => setAlVoloOpen(false)}
        songs={allSongsLibrary}
        colors={colors}
      />
    </>
  )
}
