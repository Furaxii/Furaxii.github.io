import React from 'react'
import styles from './FilterBar.module.css'

const FILTERS = [
  { key: 'all',      label: 'Tous' },
  { key: 'live',     label: 'Live' },
  { key: 'upcoming', label: 'À venir' },
  { key: 'finished', label: 'Terminés' },
]

export default function FilterBar({ active, onChange }) {
  return (
    <div className={styles.bar} role="tablist" aria-label="Filtrer les matchs">
      {FILTERS.map(f => (
        <button
          key={f.key}
          role="tab"
          aria-selected={active === f.key}
          className={`${styles.btn} ${active === f.key ? styles.active : ''}`}
          onClick={() => onChange(f.key)}
        >
          {f.key === 'live' && <span className={styles.liveDot} />}
          {f.label}
        </button>
      ))}
    </div>
  )
}
