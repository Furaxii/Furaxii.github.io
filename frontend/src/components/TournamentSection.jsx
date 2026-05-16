import React from 'react'
import { useTournaments } from '../hooks/useEsport.js'
import TournamentCard from './TournamentCard.jsx'
import Skeleton from './Skeleton.jsx'
import styles from './TournamentSection.module.css'

export default function TournamentSection({ activeGame }) {
  const { data, loading, error } = useTournaments(null)

  if (loading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Tournois à venir</h2>
        <div className={styles.grid}>
          {[1,2,3,4].map(i => <Skeleton key={i} height={110} />)}
        </div>
      </section>
    )
  }

  if (error) return null

  // Construit la liste plate de tous les tournois, jeu actif en premier
  const gameKeys = ['lol', 'cs2', 'cod', 'r6']
  const ordered  = activeGame
    ? [activeGame, ...gameKeys.filter(k => k !== activeGame)]
    : gameKeys

  const allTournaments = ordered.flatMap(key => {
    const d = data?.[key]
    return (d?.tournaments || []).slice(0, 4)
  })

  if (allTournaments.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Tournois à venir</h2>
        <p className={styles.empty}>Aucun tournoi programmé prochainement.</p>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tournois à venir</h2>
      </div>
      <div className={styles.grid}>
        {allTournaments.map((t, i) => (
          <div key={t.id} style={{ animationDelay: `${i * 50}ms` }}>
            <TournamentCard tournament={t} />
          </div>
        ))}
      </div>
    </section>
  )
}
