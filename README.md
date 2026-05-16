# EsportHub 🎮

Dashboard esport temps réel — League of Legends, CS2, Call of Duty, Rainbow Six Siege.

Données fournies par l'API PandaScore (plan gratuit, 1000 req/h).

---

## Structure du projet

```
esport-hub/
├── backend/          ← API Express (Node.js)
│   ├── src/
│   │   ├── index.js                  ← Point d'entrée
│   │   ├── routes/api.js             ← Routes REST
│   │   └── services/
│   │       ├── pandascore.js         ← Client PandaScore + normalisation
│   │       └── cache.js              ← Redis ou cache mémoire
│   ├── .env.example
│   └── package.json
│
└── frontend/         ← Interface React (Vite)
    ├── src/
    │   ├── App.jsx                   ← Layout principal
    │   ├── components/               ← GameCard, MatchRow, TournamentCard…
    │   ├── hooks/useEsport.js        ← Fetching + polling auto
    │   ├── services/api.js           ← Appels vers le backend
    │   └── utils.js                  ← Helpers date/format
    ├── .env.example
    └── package.json
```

---

## Installation locale

### 1. Cloner et installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurer les variables d'environnement

```bash
# Backend
cd backend
cp .env.example .env
# → Renseigne PANDASCORE_TOKEN avec ta clé PandaScore
```

```bash
# Frontend — en développement, rien à modifier
# Le proxy Vite redirige /api → localhost:3001 automatiquement
cd frontend
cp .env.example .env
```

### 3. Lancer en développement

Dans deux terminaux séparés :

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

---

## Déploiement en production

### Backend → Railway

1. Crée un compte sur [railway.app](https://railway.app)
2. Nouveau projet → "Deploy from GitHub repo" → sélectionne le dossier `backend/`
3. Ajoute les variables d'environnement dans Railway :
   - `PANDASCORE_TOKEN` = ta clé API
   - `FRONTEND_URL` = l'URL Vercel de ton frontend (ex: `https://esport-hub.vercel.app`)
4. (Optionnel) Ajoute un service Redis depuis Railway pour le cache persistant
5. Copie l'URL Railway générée (ex: `https://esport-hub-backend.up.railway.app`)

### Frontend → Vercel

1. Crée un compte sur [vercel.com](https://vercel.com)
2. Nouveau projet → importe le dossier `frontend/`
3. Ajoute la variable d'environnement :
   - `VITE_API_URL` = l'URL Railway de ton backend
4. Deploy !

---

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/games` | Liste des jeux supportés |
| GET | `/api/summary` | Nb de matchs live/upcoming par jeu |
| GET | `/api/matches/today` | Matchs du jour (tous les jeux) |
| GET | `/api/matches/today?game=lol` | Matchs du jour (jeu filtré) |
| GET | `/api/tournaments` | Tournois à venir (tous les jeux) |
| GET | `/api/tournaments?game=cs2` | Tournois à venir (jeu filtré) |
| GET | `/health` | Vérification de l'état du serveur |

---

## Ajouter un nouveau jeu

1. Dans `backend/src/services/pandascore.js`, ajoute une entrée dans l'objet `GAMES` :
   ```js
   val: { slug: 'valorant', label: 'Valorant', color: '#FF4655', emoji: '⚡' },
   ```
2. Dans `frontend/src/components/GameCard.jsx`, ajoute l'entrée correspondante dans `GAME_META`.
3. Dans `frontend/src/App.jsx`, ajoute `'val'` dans le tableau `GAME_KEYS`.
4. C'est tout — le reste est dynamique.

---

## Stack technique

| Couche | Technologie | Raison |
|--------|-------------|--------|
| Frontend | React + Vite | Rapide, écosystème riche, HMR excellent |
| Styling | CSS Modules | Scoping local, zero runtime |
| Backend | Node.js + Express | Léger, async natif, idéal pour proxy |
| Cache | Redis (fallback mémoire) | Préserve les 1000 req/h du plan gratuit |
| API | PandaScore | Plan gratuit, tous nos 4 jeux couverts |
| Frontend host | Vercel | Gratuit, CDN mondial, déploiement Git |
| Backend host | Railway | Gratuit au démarrage, supporte Node + Redis |
