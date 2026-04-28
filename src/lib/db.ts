import { openDB, type IDBPDatabase } from 'idb'
import type { Song, Setlist, Settings, Reminder } from './types'
import { DEFAULT_SETTINGS } from './types'

interface LivePrompterDB {
  songs:     { key: string; value: Song }
  setlists:  { key: string; value: Setlist }
  settings:  { key: string; value: Settings }
  reminders: { key: string; value: Reminder }
}

const DB_NAME = 'liveprompter'
const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase<LivePrompterDB>> | null = null

function getDb(): Promise<IDBPDatabase<LivePrompterDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LivePrompterDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('songs',    { keyPath: 'id' })
          db.createObjectStore('setlists', { keyPath: 'id' })
          db.createObjectStore('settings', { keyPath: 'id' })
        }
        if (oldVersion < 2) {
          db.createObjectStore('reminders', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

// Songs
export async function getSongs(): Promise<Song[]> {
  const db = await getDb()
  return db.getAll('songs')
}
export async function getSong(id: string): Promise<Song | undefined> {
  const db = await getDb()
  return db.get('songs', id)
}
export async function putSong(song: Song): Promise<void> {
  const db = await getDb()
  await db.put('songs', song)
}
export async function deleteSong(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('songs', id)
}
export async function clearSongs(): Promise<void> {
  const db = await getDb()
  await db.clear('songs')
}

// Setlists
export async function getSetlists(): Promise<Setlist[]> {
  const db = await getDb()
  return db.getAll('setlists')
}
export async function getSetlist(id: string): Promise<Setlist | undefined> {
  const db = await getDb()
  return db.get('setlists', id)
}
export async function putSetlist(setlist: Setlist): Promise<void> {
  const db = await getDb()
  await db.put('setlists', setlist)
}
export async function deleteSetlist(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('setlists', id)
}

// Settings
export async function getSettings(): Promise<Settings> {
  const db = await getDb()
  const s = await db.get('settings', 'config')
  if (!s) return DEFAULT_SETTINGS
  // Merge con i default per garantire che i nuovi campi abbiano sempre un valore
  return { ...s, colors: { ...DEFAULT_SETTINGS.colors, ...s.colors } }
}
export async function putSettings(settings: Settings): Promise<void> {
  const db = await getDb()
  await db.put('settings', settings)
}

// Reminders
export async function getReminders(): Promise<Reminder[]> {
  const db = await getDb()
  return db.getAll('reminders')
}
export async function putReminder(reminder: Reminder): Promise<void> {
  const db = await getDb()
  await db.put('reminders', reminder)
}
export async function deleteReminder(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('reminders', id)
}
