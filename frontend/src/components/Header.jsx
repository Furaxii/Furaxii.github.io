import React from 'react'
import { getTodayLabel } from '../utils.js'
import styles from './Header.module.css'

export default function Header({ lastUpdate }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>E</span>
          <span className={styles.logoText}>SPORT<strong>HUB</strong></span>
        </div>

        <div className={styles.meta}>
          <span className={styles.date}>{getTodayLabel()}</span>
          {lastUpdate && (
            <span className={styles.update}>
              <span className={styles.updateDot} />
              Mis à jour à {lastUpdate}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
