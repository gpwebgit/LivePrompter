import { useState, useEffect, useCallback } from 'react'
import type { Settings, ColorsConfig } from '../lib/types'
import { DEFAULT_SETTINGS } from '../lib/types'
import { getSettings, putSettings } from '../lib/db'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  const updateColors = useCallback(
    async (colors: ColorsConfig): Promise<void> => {
      const next: Settings = { ...settings, colors }
      setSettings(next)
      await putSettings(next)
    },
    [settings],
  )

  const resetColors = useCallback(async (): Promise<void> => {
    await updateColors(DEFAULT_SETTINGS.colors)
  }, [updateColors])

  return { settings, loading, updateColors, resetColors }
}
