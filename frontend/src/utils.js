/**
 * Formate une date ISO en heure locale (ex: "18h30")
 */
export function formatTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).replace(':', 'h')
}

/**
 * Formate une date ISO en date courte (ex: "17 mai")
 */
export function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })
}

/**
 * Formate une plage de dates de tournoi
 */
export function formatDateRange(beginAt, endAt) {
  if (!beginAt) return '—'
  const start = formatDate(beginAt)
  if (!endAt) return start
  const end = formatDate(endAt)
  return start === end ? start : `${start} – ${end}`
}

/**
 * Retourne le libellé et la classe CSS d'un statut de match
 */
export function getStatusInfo(status) {
  switch (status) {
    case 'running':     return { label: 'EN DIRECT', cls: 'status-live' }
    case 'not_started': return { label: 'À VENIR',   cls: 'status-soon' }
    case 'finished':    return { label: 'TERMINÉ',   cls: 'status-done' }
    default:            return { label: status,      cls: 'status-done' }
  }
}

/**
 * Retourne la date d'aujourd'hui formatée en français
 */
export function getTodayLabel() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formate un prize pool (ex: "500000 USD" → "500 000 $")
 */
export function formatPrizepool(prizepool) {
  if (!prizepool) return null
  // PandaScore renvoie parfois "500000 USD" ou "$500,000"
  const match = prizepool.match(/[\d,]+/)
  if (!match) return prizepool
  const num = parseInt(match[0].replace(/,/g, ''), 10)
  if (isNaN(num)) return prizepool
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
}
