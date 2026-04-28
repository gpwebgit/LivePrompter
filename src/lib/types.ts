export interface Song {
  id: string
  title: string
  content: string
  importedAt: Date
}

export interface Setlist {
  id: string
  name: string
  songIds: string[]
  createdAt: Date
  updatedAt?: Date
}

export interface ColorsConfig {
  liveBg: string
  liveTitle: string
  liveVerse: string
  liveChorus: string
  liveSpecial: string
  liveBarBg: string
  liveBarText: string
  liveClockBg: string
  liveClockText: string
  alertBg: string
  alertText: string
}

// Usata solo dal paginator — non più nei Settings
export interface DisplayConfig {
  width: number
  height: number
}

export interface Settings {
  id: 'config'
  colors: ColorsConfig
}

export type SectionType = 'verse' | 'chorus'

export interface ParsedSection {
  type: SectionType
  lines: string[]
}

export interface ParsedSong {
  title: string
  sections: ParsedSection[]
}

export interface Page {
  sections: ParsedSection[]
  fontSize: number
  firstSectionContinues: boolean  // true = prima riga continua dalla pagina precedente (no gap iniziale)
}

export const DEFAULT_COLORS: ColorsConfig = {
  liveBg: '#000000',
  liveTitle: '#d40000',
  liveVerse: '#ffffff',
  liveChorus: '#fcfc03',
  liveSpecial: '#fc4dff',
  liveBarBg: '#005d9c',
  liveBarText: '#ffffff',
  liveClockBg: '#d40000',
  liveClockText: '#ffffff',
  alertBg: '#ec8a55',
  alertText: '#000000',
}

export interface Reminder {
  id: string
  message: string   // max 160 chars
  triggerAt: string // ISO string (datetime-local value)
  dismissed: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'config',
  colors: DEFAULT_COLORS,
}
