import React from 'react'
import styles from './GameCard.module.css'

const GAME_META = {
  lol: { label: 'League of Legends', abbr: 'LOL',  color: '#C8A84B' },
  cs2: { label: 'CS2',               abbr: 'CS2',  color: '#E05A2B' },
  cod: { label: 'Call of Duty',       abbr: 'COD',  color: '#4A9E4F' },
  r6:  { label: 'Rainbow Six Siege', abbr: 'R6S',  color: '#2A6FC4' },
}

export default function GameCard({ gameKey, summary, isActive, onClick }) {
  const meta   = GAME_META[gameKey] || { label: gameKey, abbr: gameKey.toUpperCase(), color: '#888' }
  const live   = summary?.live     ?? 0
  const upcoming = summary?.upcoming ?? 0
  const total  = summary?.total    ?? 0
  const hasMatches = total > 0

  return (
    <button
      className={`${styles.card} ${isActive ? styles.active : ''} ${!hasMatches ? styles.empty : ''}`}
      onClick={onClick}
      style={{ '--game-color': meta.color }}
      aria-pressed={isActive}
    >
      {/* Barre colorée en haut */}
      <span className={styles.topBar} />

      <div className={styles.body}>
        <div className={styles.abbr}>{meta.abbr}</div>
        <div className={styles.label}>{meta.label}</div>

        <div className={styles.badges}>
          {live > 0 && (
            <span className={styles.badgeLive}>
              <span className={styles.liveDot} />
              {live} live
            </span>
          )}
          {upcoming > 0 && (
            <span className={styles.badgeSoon}>{upcoming} à venir</span>
          )}
          {total === 0 && (
            <span className={styles.badgeEmpty}>Aucun match</span>
          )}
        </div>
      </div>
    </button>
  )
}
