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

  // Stabile ([] deps): costruisce Settings senza catturare settings nella closure
  const updateColors = useCallback(async (colors: ColorsConfig): Promise<void> => {
    const next: Settings = { id: 'config', colors }
    setSettings(next)
    await putSettings(next)
  }, [])

  const resetColors = useCallback(async (): Promise<void> => {
    const next: Settings = { id: 'config', colors: DEFAULT_SETTINGS.colors }
    setSettings(next)
    await putSettings(next)
  }, [])

  return { settings, loading, updateColors, resetColors }
}
