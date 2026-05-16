/**
 * EsportHub — Backend Express
 * Point d'entrée principal du serveur.
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import apiRouter from './routes/api.js'

const app = express()
const PORT = process.env.PORT || 3001

// CORS — autorise le frontend (Vercel en prod, localhost en dev)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS bloqué : ${origin}`))
  },
  credentials: true,
}))

app.use(express.json())

// Logging minimal
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api', apiRouter)

// Health check (Railway l'utilise pour vérifier que le service est up)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    token: !!process.env.PANDASCORE_TOKEN,
  })
})

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }))

// Erreur globale
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`\n🎮 EsportHub Backend démarré sur http://localhost:${PORT}`)
  console.log(`   Token PandaScore : ${process.env.PANDASCORE_TOKEN ? '✓ présent' : '✗ MANQUANT'}`)
  console.log(`   Redis            : ${process.env.REDIS_URL ? '✓ configuré' : '— cache mémoire'}`)
  console.log(`   CORS autorisé    : ${allowedOrigins.join(', ')}\n`)
})
