import React from 'react'
import { formatTime, getStatusInfo } from '../utils.js'
import styles from './MatchRow.module.css'

function TeamBlock({ team, score, isWinner }) {
  return (
    <div className={`${styles.team} ${isWinner ? styles.winner : ''}`}>
      {team?.logo && (
        <img
          src={team.logo}
          alt={team.name}
          className={styles.teamLogo}
          onError={e => { e.target.style.display = 'none' }}
        />
      )}
      <span className={styles.teamName}>{team?.name ?? 'TBD'}</span>
      {score !== null && <span className={styles.score}>{score}</span>}
    </div>
  )
}

export default function MatchRow({ match, gameColor }) {
  const { label: statusLabel, cls: statusCls } = getStatusInfo(match.status)
  const time = match.status === 'running'
    ? null
    : match.status === 'finished'
      ? formatTime(match.endAt || match.beginAt)
      : formatTime(match.scheduledAt)

  const s1 = match.scores?.team1
  const s2 = match.scores?.team2
  const team1Wins = s1 !== null && s2 !== null && s1 > s2
  const team2Wins = s1 !== null && s2 !== null && s2 > s1

  return (
    <div
      className={`${styles.row} ${match.status === 'running' ? styles.isLive : ''}`}
      style={{ '--game-color': gameColor }}
    >
      {/* Indicateur live gauche */}
      {match.status === 'running' && <span className={styles.liveBar} />}

      <div className={styles.content}>
        {/* Équipes + score */}
        <div className={styles.matchup}>
          <TeamBlock team={match.teams?.team1} score={s1} isWinner={team1Wins} />
          <div className={styles.vs}>
            {match.status === 'running'
              ? <span className={styles.vsLive}>LIVE</span>
              : <span className={styles.vsSep}>vs</span>
            }
          </div>
          <TeamBlock team={match.teams?.team2} score={s2} isWinner={team2Wins} />
        </div>

        {/* Métadonnées */}
        <div className={styles.meta}>
          <span className={`${styles.status} ${styles[statusCls]}`}>{statusLabel}</span>
          {time && <span className={styles.time}>{time}</span>}
          <span className={styles.tournament}>{match.tournament?.name}</span>
          {match.numberOfGames > 1 && (
            <span className={styles.bo}>BO{match.numberOfGames}</span>
          )}
        </div>
      </div>
    </div>
  )
}
