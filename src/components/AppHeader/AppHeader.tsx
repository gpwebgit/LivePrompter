import type { ReactNode } from 'react'
import styles from './AppHeader.module.css'

interface Props {
  title?: string
  subtitle?: string
  left?: ReactNode
  right?: ReactNode
}

export default function AppHeader({ title: _title = 'LivePrompter', subtitle, left, right }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>{left}</div>
      <div className={styles.center}>
        <img src="/prompterlive_logo.png" alt="PrompterLive" className={styles.logo} />
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      <div className={styles.right}>{right}</div>
    </header>
  )
}
