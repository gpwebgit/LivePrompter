import { openDB, type IDBPDatabase } from 'idb'
import type { Song, Setlist, Settings } from './types'
import { DEFAULT_SETTINGS } from './types'

interface LivePrompterDB {
  songs: {
    key: string
    value: Song
  }
  setlists: {
    key: string
    value: Setlist
  }
  settings: {
    key: string
    value: Settings
  }
}

const DB_NAME = 'liveprompter'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<LivePrompterDB>> | null = null

function getDb(): Promise<IDBPDatabase<LivePrompterDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LivePrompterDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('songs', { keyPath: 'id' })
        db.createObjectStore('setlists', { keyPath: 'id' })
        db.createObjectStore('settings', { keyPath: 'id' })
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
  return s ?? DEFAULT_SETTINGS
}

export async function putSettings(settings: Settings): Promise<void> {
  const db = await getDb()
  await db.put('settings', settings)
}
