import type { ReactNode } from 'react'
import styles from './AppHeader.module.css'

interface Props {
  title?: string
  subtitle?: string
  left?: ReactNode
  right?: ReactNode
}

export default function AppHeader({ title = 'LivePrompter', subtitle, left, right }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>{left}</div>
      <div className={styles.center}>
        <span className={styles.logo}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      <div className={styles.right}>{right}</div>
    </header>
  )
}
