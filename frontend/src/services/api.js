/**
 * Service API frontend — centralise tous les appels vers le backend.
 */

const BASE = import.meta.env.VITE_API_URL || ''

async function apiFetch(path) {
  const res = await fetch(`${BASE}/api${path}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Liste des jeux supportés
  getGames: () => apiFetch('/games'),

  // Résumé du jour (nb live/upcoming par jeu)
  getSummary: () => apiFetch('/summary'),

  // Matchs du jour — tous les jeux ou un jeu précis
  getTodayMatches: (gameKey = null) =>
    apiFetch(gameKey ? `/matches/today?game=${gameKey}` : '/matches/today'),

  // Tournois à venir — tous les jeux ou un jeu précis
  getTournaments: (gameKey = null) =>
    apiFetch(gameKey ? `/tournaments?game=${gameKey}` : '/tournaments'),
}
