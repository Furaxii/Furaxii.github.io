import React, { useMemo } from 'react'
import { useTodayMatches } from '../hooks/useEsport.js'
import MatchRow from './MatchRow.jsx'
import Skeleton from './Skeleton.jsx'
import styles from './MatchList.module.css'

const GAME_META = {
  lol: { label: 'League of Legends', color: '#C8A84B' },
  cs2: { label: 'CS2',               color: '#E05A2B' },
  cod: { label: 'Call of Duty',       color: '#4A9E4F' },
  r6:  { label: 'Rainbow Six Siege', color: '#2A6FC4' },
}

const STATUS_ORDER = { running: 0, not_started: 1, finished: 2 }

export default function MatchList({ activeGame, filter }) {
  const { data, loading, error } = useTodayMatches(activeGame)

  const matches = useMemo(() => {
    if (!data) return []
    const gameData = data[activeGame]
    if (!gameData?.matches) return []

    let list = gameData.matches

    // Filtre par status
    if (filter !== 'all') {
      const statusMap = { live: 'running', upcoming: 'not_started', finished: 'finished' }
      list = list.filter(m => m.status === statusMap[filter])
    }

    // Tri : live > à venir > terminés
    return [...list].sort((a, b) =>
      (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
    )
  }, [data, activeGame, filter])

  const meta = GAME_META[activeGame] || { label: activeGame, color: '#888' }

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>Matchs — {meta.label}</h2>
        </div>
        <div className={styles.list}>
          {[1, 2, 3].map(i => <Skeleton key={i} height={62} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>Matchs — {meta.label}</h2>
        </div>
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>⚠</span>
          <p>Impossible de charger les matchs : {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title} style={{ '--game-color': meta.color }}>
          <span className={styles.titleAccent} />
          Matchs — {meta.label}
        </h2>
        <span className={styles.count}>{matches.length} match{matches.length !== 1 ? 's' : ''}</span>
      </div>

      {matches.length === 0 ? (
        <div className={styles.empty}>
          <p>Aucun match{filter !== 'all' ? ' pour ce filtre' : ''} aujourd'hui.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {matches.map((match, i) => (
            <div
              key={match.id}
              className={styles.item}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <MatchRow match={match} gameColor={meta.color} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
