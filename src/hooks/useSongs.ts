import { useState, useEffect, useCallback } from 'react'
import type { Song } from '../lib/types'
import { getSongs, getSong, putSong, deleteSong, clearSongs } from '../lib/db'

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const all = await getSongs()
    all.sort((a, b) => new Date(a.importedAt).getTime() - new Date(b.importedAt).getTime())
    setSongs(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const importSong = useCallback(
    async (song: Song): Promise<void> => {
      await putSong(song)
      await load()
    },
    [load],
  )

  const removeSong = useCallback(
    async (id: string): Promise<void> => {
      await deleteSong(id)
      await load()
    },
    [load],
  )

  const clearLibrary = useCallback(async (): Promise<void> => {
    await clearSongs()
    await load()
  }, [load])

  const findByTitle = useCallback(
    (title: string): Song | undefined => songs.find((s) => s.title === title),
    [songs],
  )

  return { songs, loading, importSong, removeSong, clearLibrary, findByTitle, getSongById: getSong }
}
