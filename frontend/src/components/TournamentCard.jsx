import React from 'react'
import { formatDateRange, formatPrizepool } from '../utils.js'
import styles from './TournamentCard.module.css'

export default function TournamentCard({ tournament }) {
  const dateRange  = formatDateRange(tournament.beginAt, tournament.endAt)
  const prizepool  = formatPrizepool(tournament.prizepool)
  const isRunning  = tournament.beginAt && new Date(tournament.beginAt) <= new Date()
                     && (!tournament.endAt || new Date(tournament.endAt) >= new Date())

  return (
    <div
      className={styles.card}
      style={{ '--game-color': tournament.gameColor }}
    >
      <div className={styles.topBar} />

      <div className={styles.body}>
        {tournament.leagueName && (
          <span className={styles.league}>{tournament.leagueName}</span>
        )}
        <h3 className={styles.name}>{tournament.name}</h3>

        <div className={styles.meta}>
          <span className={styles.dates}>{dateRange}</span>
          {isRunning && <span className={styles.running}>EN COURS</span>}
        </div>

        {prizepool && (
          <div className={styles.prize}>{prizepool}</div>
        )}
      </div>
    </div>
  )
}
