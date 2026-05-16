/**
 * Routes Express pour les matchs et tournois.
 */

import { Router } from 'express'
import { cacheGet, cacheSet } from '../services/cache.js'
import { fetchTodayMatches, fetchUpcomingTournaments, GAMES } from '../services/pandascore.js'

const router = Router()

// TTL du cache en secondes
const TTL_MATCHES     = 60    // 1 minute pour les matchs live
const TTL_TOURNAMENTS = 3600  // 1 heure pour les tournois

/**
 * GET /api/games
 * Liste des jeux supportés avec leur metadata.
 */
router.get('/games', (req, res) => {
  res.json(Object.entries(GAMES).map(([key, g]) => ({
    key,
    label: g.label,
    color: g.color,
    emoji: g.emoji,
  })))
})

/**
 * GET /api/matches/today
 * Matchs du jour pour tous les jeux (ou ?game=lol pour filtrer).
 */
router.get('/matches/today', async (req, res) => {
  const { game } = req.query
  const gameKeys = game ? [game] : Object.keys(GAMES)

  // Vérification des clés valides
  const invalid = gameKeys.filter(k => !GAMES[k])
  if (invalid.length) return res.status(400).json({ error: `Jeu(x) inconnu(s): ${invalid.join(', ')}` })

  try {
    const results = await Promise.allSettled(
      gameKeys.map(async (key) => {
        const cacheKey = `matches:today:${key}`
        const cached = await cacheGet(cacheKey)
        if (cached) return { key, matches: cached, fromCache: true }

        const matches = await fetchTodayMatches(key)
        await cacheSet(cacheKey, matches, TTL_MATCHES)
        return { key, matches, fromCache: false }
      })
    )

    const data = {}
    results.forEach((result, i) => {
      const key = gameKeys[i]
      if (result.status === 'fulfilled') {
        data[key] = { matches: result.value.matches, error: null }
      } else {
        console.error(`[matches] Erreur pour ${key}:`, result.reason?.message)
        data[key] = { matches: [], error: result.reason?.message || 'Erreur inconnue' }
      }
    })

    res.json(data)
  } catch (err) {
    console.error('[matches/today]', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * GET /api/tournaments
 * Tournois à venir pour tous les jeux (ou ?game=cs2 pour filtrer).
 */
router.get('/tournaments', async (req, res) => {
  const { game } = req.query
  const gameKeys = game ? [game] : Object.keys(GAMES)

  const invalid = gameKeys.filter(k => !GAMES[k])
  if (invalid.length) return res.status(400).json({ error: `Jeu(x) inconnu(s): ${invalid.join(', ')}` })

  try {
    const results = await Promise.allSettled(
      gameKeys.map(async (key) => {
        const cacheKey = `tournaments:upcoming:${key}`
        const cached = await cacheGet(cacheKey)
        if (cached) return { key, tournaments: cached }

        const tournaments = await fetchUpcomingTournaments(key)
        await cacheSet(cacheKey, tournaments, TTL_TOURNAMENTS)
        return { key, tournaments }
      })
    )

    const data = {}
    results.forEach((result, i) => {
      const key = gameKeys[i]
      if (result.status === 'fulfilled') {
        data[key] = { tournaments: result.value.tournaments, error: null }
      } else {
        console.error(`[tournaments] Erreur pour ${key}:`, result.reason?.message)
        data[key] = { tournaments: [], error: result.reason?.message || 'Erreur inconnue' }
      }
    })

    res.json(data)
  } catch (err) {
    console.error('[tournaments]', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * GET /api/summary
 * Résumé global : nb de matchs live + à venir par jeu aujourd'hui.
 * Utilisé par le dashboard pour les cartes de jeux.
 */
router.get('/summary', async (req, res) => {
  try {
    const cacheKey = 'summary:today'
    const cached = await cacheGet(cacheKey)
    if (cached) return res.json(cached)

    const results = await Promise.allSettled(
      Object.keys(GAMES).map(key => fetchTodayMatches(key).then(matches => ({ key, matches })))
    )

    const summary = {}
    results.forEach(result => {
      if (result.status !== 'fulfilled') return
      const { key, matches } = result.value
      summary[key] = {
        live:     matches.filter(m => m.status === 'running').length,
        upcoming: matches.filter(m => m.status === 'not_started').length,
        finished: matches.filter(m => m.status === 'finished').length,
        total:    matches.length,
      }
    })

    await cacheSet(cacheKey, summary, TTL_MATCHES)
    res.json(summary)
  } catch (err) {
    console.error('[summary]', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
