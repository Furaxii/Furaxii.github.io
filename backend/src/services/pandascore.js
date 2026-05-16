/**
 * Client PandaScore — centralise tous les appels vers l'API.
 * Gère l'authentification, les erreurs et le rate-limiting.
 */

import fetch from 'node-fetch'

const BASE_URL = 'https://api.pandascore.co'
const TOKEN = process.env.PANDASCORE_TOKEN

// Slugs PandaScore pour chaque jeu
export const GAMES = {
  lol:  { slug: 'lol',    label: 'League of Legends', color: '#C8A84B', emoji: '⚔️' },
  cs2:  { slug: 'csgo',   label: 'CS2',               color: '#E05A2B', emoji: '🎯' },
  cod:  { slug: 'codmw',  label: 'Call of Duty',      color: '#4A9E4F', emoji: '🔫' },
  r6:   { slug: 'r6siege',label: 'Rainbow Six Siege', color: '#2A6FC4', emoji: '🛡️' },
  valorant: { slug: 'valorant',label: 'Valorant',  color: '#FF4655', emoji: '🎯' },
}

async function pandaFetch(path, params = {}) {
  if (!TOKEN) throw new Error('PANDASCORE_TOKEN manquant dans les variables d\'environnement')

  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PandaScore ${res.status}: ${text}`)
  }

  return res.json()
}

/**
 * Normalise un match PandaScore en format unifié,
 * quel que soit le jeu.
 */
function normalizeMatch(match, gameKey) {
  const game = GAMES[gameKey]
  const opponent1 = match.opponents?.[0]?.opponent
  const opponent2 = match.opponents?.[1]?.opponent

  return {
    id: match.id,
    gameKey,
    gameLabel: game.label,
    gameColor: game.color,
    gameEmoji: game.emoji,
    name: match.name,
    status: match.status,          // 'running' | 'not_started' | 'finished'
    scheduledAt: match.scheduled_at,
    beginAt: match.begin_at,
    endAt: match.end_at,
    tournament: {
      id: match.tournament_id,
      name: match.league?.name || match.tournament?.name || '—',
      serie: match.serie?.full_name || null,
    },
    teams: {
      team1: opponent1 ? { id: opponent1.id, name: opponent1.name, logo: opponent1.image_url } : null,
      team2: opponent2 ? { id: opponent2.id, name: opponent2.name, logo: opponent2.image_url } : null,
    },
    scores: {
      team1: match.results?.[0]?.score ?? null,
      team2: match.results?.[1]?.score ?? null,
    },
    numberOfGames: match.number_of_games,
    matchType: match.match_type,
  }
}

/**
 * Normalise un tournoi PandaScore en format unifié.
 */
function normalizeTournament(tourn, gameKey) {
  const game = GAMES[gameKey]
  return {
    id: tourn.id,
    gameKey,
    gameLabel: game.label,
    gameColor: game.color,
    gameEmoji: game.emoji,
    name: tourn.name,
    fullName: tourn.league?.name ? `${tourn.league.name} — ${tourn.name}` : tourn.name,
    leagueName: tourn.league?.name || null,
    beginAt: tourn.begin_at,
    endAt: tourn.end_at,
    prizepool: tourn.prizepool || null,
    country: tourn.country || null,
    winnerId: tourn.winner_id || null,
    liveSupported: tourn.live_supported || false,
  }
}

/**
 * Récupère les matchs du jour (running + not_started pour today)
 * pour un jeu donné.
 */
export async function fetchTodayMatches(gameKey) {
  const game = GAMES[gameKey]
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

  const [running, upcoming] = await Promise.all([
    pandaFetch(`/${game.slug}/matches/running`, { 'page[size]': 20 }),
    pandaFetch(`/${game.slug}/matches/upcoming`, {
      'page[size]': 20,
      'range[scheduled_at]': `${todayStart},${todayEnd}`,
      sort: 'scheduled_at',
    }),
  ])

  const finished = await pandaFetch(`/${game.slug}/matches/past`, {
    'page[size]': 10,
    'range[end_at]': `${todayStart},${todayEnd}`,
    sort: '-end_at',
  }).catch(() => [])

  const all = [...(running || []), ...(upcoming || []), ...(finished || [])]
  // Dédoublonnage par id
  const seen = new Set()
  return all
    .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true })
    .map(m => normalizeMatch(m, gameKey))
}

/**
 * Récupère les tournois à venir (+ en cours) pour un jeu donné.
 */
export async function fetchUpcomingTournaments(gameKey) {
  const game = GAMES[gameKey]
  const data = await pandaFetch(`/${game.slug}/tournaments/upcoming`, {
    'page[size]': 20,
    sort: 'begin_at',
    'filter[tier]': 's,a',       // ← uniquement Tier S et Tier A
  })
  const running = await pandaFetch(`/${game.slug}/tournaments/running`, {
    'page[size]': 10,
    'filter[tier]': 's,a',       // ← idem pour les tournois en cours
  }).catch(() => [])

  const all = [...(running || []), ...(data || [])]
  const seen = new Set()
  return all
    .filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true })
    .map(t => normalizeTournament(t, gameKey))
}
