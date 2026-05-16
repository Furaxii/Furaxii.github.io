import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../services/api.js'

/**
 * Hook générique avec polling automatique.
 */
function usePolling(fetcher, intervalMs = null) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const timerRef              = useRef(null)

  const fetch = useCallback(async () => {
    try {
      const result = await fetcher()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    fetch()
    if (intervalMs) {
      timerRef.current = setInterval(fetch, intervalMs)
    }
    return () => clearInterval(timerRef.current)
  }, [fetch, intervalMs])

  return { data, loading, error, refresh: fetch }
}

/**
 * Résumé du jour : nb de matchs live/upcoming par jeu.
 * Mis à jour toutes les 60 secondes.
 */
export function useSummary() {
  const fetcher = useCallback(() => api.getSummary(), [])
  return usePolling(fetcher, 60_000)
}

/**
 * Matchs du jour pour un jeu (ou tous si null).
 * Mis à jour toutes les 60 secondes.
 */
export function useTodayMatches(gameKey) {
  const fetcher = useCallback(() => api.getTodayMatches(gameKey), [gameKey])
  return usePolling(fetcher, 60_000)
}

/**
 * Tournois à venir pour un jeu (ou tous si null).
 * Mis à jour toutes les 30 minutes.
 */
export function useTournaments(gameKey) {
  const fetcher = useCallback(() => api.getTournaments(gameKey), [gameKey])
  return usePolling(fetcher, 30 * 60_000)
}
