import Redis from 'ioredis'

let redis = null

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: false,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
    })
    redis.on('error', (err) => {
      console.warn('[cache] Redis erreur, fallback mémoire :', err.message)
      redis = null
    })
    console.log('[cache] Redis configuré ✓')
  } catch (err) {
    console.warn('[cache] Redis indisponible, fallback mémoire :', err.message)
    redis = null
  }
}

// Fallback : cache Map en mémoire avec TTL manuel
const memCache = new Map()

export async function cacheGet(key) {
  if (redis) {
    const val = await redis.get(key)
    return val ? JSON.parse(val) : null
  }
  const entry = memCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { memCache.delete(key); return null }
  return entry.data
}

export async function cacheSet(key, data, ttlSeconds = 60) {
  if (redis) {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds)
    return
  }
  memCache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 })
}