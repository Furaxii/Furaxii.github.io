import React, { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import GameCard from './components/GameCard.jsx'
import MatchList from './components/MatchList.jsx'
import TournamentSection from './components/TournamentSection.jsx'
import FilterBar from './components/FilterBar.jsx'
import Skeleton from './components/Skeleton.jsx'
import { useSummary } from './hooks/useEsport.js'
import { formatTime } from './utils.js'
import styles from './App.module.css'

const GAME_KEYS = ['lol', 'cs2', 'cod', 'r6']

export default function App() {
  const [activeGame, setActiveGame] = useState('lol')
  const [filter, setFilter]         = useState('all')
  const [lastUpdate, setLastUpdate] = useState(null)

  const { data: summary, loading: summaryLoading } = useSummary()

  // Mise à jour de l'heure du dernier refresh
  useEffect(() => {
    if (summary) setLastUpdate(formatTime(new Date().toISOString()))
  }, [summary])

  // Auto-sélectionne le premier jeu avec des matchs live au chargement
  useEffect(() => {
    if (!summary) return
    const firstLive = GAME_KEYS.find(k => summary[k]?.live > 0)
    if (firstLive) setActiveGame(firstLive)
  }, [summary])

  const handleGameClick = (key) => {
    setActiveGame(key)
    setFilter('all')
  }

  return (
    <div className={styles.app}>
      <Header lastUpdate={lastUpdate} />

      <main className={styles.main}>

        {/* Grille des jeux */}
        <section className={styles.gamesSection} aria-label="Jeux avec matchs aujourd'hui">
          <h2 className={styles.sectionLabel}>Aujourd'hui</h2>
          <div className={styles.gamesGrid}>
            {summaryLoading
              ? GAME_KEYS.map(k => <Skeleton key={k} height={106} borderRadius={12} />)
              : GAME_KEYS.map(k => (
                  <GameCard
                    key={k}
                    gameKey={k}
                    summary={summary?.[k]}
                    isActive={activeGame === k}
                    onClick={() => handleGameClick(k)}
                  />
                ))
            }
          </div>
        </section>

        {/* Zone principale : matchs + tournois */}
        <div className={styles.content}>

          {/* Colonne matchs */}
          <div className={styles.matchesCol}>
            <div className={styles.matchesControls}>
              <FilterBar active={filter} onChange={setFilter} />
            </div>
            <MatchList activeGame={activeGame} filter={filter} />
          </div>

          {/* Colonne tournois */}
          <aside className={styles.tournamentsCol}>
            <TournamentSection activeGame={activeGame} />
          </aside>

        </div>
      </main>

      <footer className={styles.footer}>
        <p>Données fournies par <a href="https://pandascore.co" target="_blank" rel="noreferrer">PandaScore</a> · EsportHub {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
