import { useState, useEffect, useCallback } from 'react'
import type { Setlist } from '../lib/types'
import { getSetlists, getSetlist, putSetlist, deleteSetlist } from '../lib/db'

export function useSetlists() {
  const [setlists, setSetlists] = useState<Setlist[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const all = await getSetlists()
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setSetlists(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveSetlist = useCallback(
    async (setlist: Setlist): Promise<void> => {
      await putSetlist(setlist)
      await load()
    },
    [load],
  )

  const removeSetlist = useCallback(
    async (id: string): Promise<void> => {
      await deleteSetlist(id)
      await load()
    },
    [load],
  )

  return { setlists, loading, saveSetlist, removeSetlist, getSetlist }
}
