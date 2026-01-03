# CGI-ENGINE

**Plateforme SaaS d'Intelligence Fiscale IA pour le Congo-Brazzaville**

[![CI/CD](https://github.com/your-org/cgi-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/cgi-engine/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-136%20passing-brightgreen)](./ANALYSE_COMPLETE_CGI_ENGINE.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

---

## Description

CGI-ENGINE est une application SaaS multi-tenant alimentée par l'IA, dédiée au **Code Général des Impôts du Congo-Brazzaville**. Elle fournit :

- **Consultations fiscales assistées par IA** (Claude Haiku)
- **Calculateurs fiscaux** (IRPP, ITS, IS) conformes au CGI 2026
- **Navigation du code CGI** avec recherche hybride (sémantique + lexicale)
- **Gestion multi-tenant** avec abonnements et quotas

---

## Stack Technologique

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Node.js | 20+ | Runtime |
| TypeScript | 5.3 | Langage |
| Express.js | 4.18 | Framework HTTP |
| Prisma | 5.10 | ORM |
| PostgreSQL | 16 | Base de données |
| Redis | 7 | Cache & Sessions |
| Qdrant | 1.16 | Base vectorielle |

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Angular | 17.3 | Framework SPA |
| TailwindCSS | 3.4 | Styles |
| RxJS | 7.8 | Programmation réactive |

### IA & ML
| Service | Usage |
|---------|-------|
| Claude Haiku | Consultations fiscales |
| OpenAI GPT-4 | Embeddings |
| Qdrant | Recherche vectorielle |

---

## Prérequis

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 16
- **Redis** >= 7
- **Docker** (optionnel, recommandé)

---

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/your-org/cgi-engine.git
cd cgi-engine
```

### 2. Configuration des variables d'environnement

```bash
# Backend
cp server/.env.example server/.env

# Frontend
cp client/.env.example client/.env
```

**Variables requises (server/.env):**

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/cgi_engine"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"
COOKIE_SECRET="your-cookie-secret-32-characters"

# IA
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Qdrant
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY=""

# Frontend
FRONTEND_URL="http://localhost:4200"

# Optionnel
SENTRY_DSN=""
```

### 3. Installation des dépendances

```bash
# Backend
cd server
npm install
npx prisma generate
npx prisma migrate dev

# Frontend
cd ../client
npm install
```

### 4. Démarrage en développement

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

L'application sera accessible sur:
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api-docs

---

## Scripts Disponibles

### Backend (`server/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrage en mode développement |
| `npm run build` | Compilation TypeScript |
| `npm start` | Démarrage en production |
| `npm test` | Exécution des tests |
| `npm run test:coverage` | Tests avec couverture |
| `npm run lint` | Vérification ESLint |
| `npm run db:migrate` | Migrations Prisma |
| `npm run db:studio` | Interface Prisma Studio |

### Frontend (`client/`)

| Script | Description |
|--------|-------------|
| `npm start` | Démarrage en développement |
| `npm run build` | Build de production |
| `npm test` | Tests unitaires Jest |
| `npm run e2e` | Tests E2E Playwright |
| `npm run lint` | Vérification ESLint |

---

## Architecture

```
cgi-engine/
├── client/                    # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Composants Angular
│   │   │   ├── services/      # Services (API, Auth, Fiscal)
│   │   │   ├── guards/        # Route guards
│   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   └── models/        # Interfaces TypeScript
│   │   └── environments/
│   └── e2e/                   # Tests E2E Playwright
│
├── server/                    # Backend Express
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # Controllers HTTP
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # Définitions routes
│   │   ├── services/         # Logique métier
│   │   ├── utils/            # Utilitaires
│   │   └── __tests__/        # Tests Jest
│   └── prisma/               # Schéma & migrations
│
├── .github/
│   ├── workflows/ci.yml      # Pipeline CI/CD
│   └── dependabot.yml        # Mises à jour auto
│
└── docker-compose.yml        # Stack Docker
```

---

## API Endpoints

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/refresh-token` | Rafraîchir token |
| GET | `/api/auth/me` | Profil utilisateur |
| POST | `/api/auth/forgot-password` | Mot de passe oublié |

### Chat IA

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/chat/message` | Envoyer message |
| GET | `/api/chat/conversations` | Liste conversations |
| GET | `/api/chat/conversations/:id` | Détail conversation |
| DELETE | `/api/chat/conversations/:id` | Supprimer conversation |

### Simulateurs Fiscaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/fiscal/irpp/calculate` | Calcul IRPP |
| POST | `/api/fiscal/its/calculate` | Calcul ITS |
| POST | `/api/fiscal/is/calculate` | Calcul IS |

### Health & Monitoring

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Status complet |
| GET | `/health/ping` | Ping simple |
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe |
| GET | `/metrics` | Métriques Prometheus |

---

## Tests

### Exécuter tous les tests

```bash
# Backend (51 tests)
cd server && npm test

# Frontend (85 tests)
cd client && npm test

# E2E (40 tests)
cd client && npm run e2e
```

### Couverture de tests

```bash
# Backend
cd server && npm run test:coverage

# Frontend
cd client && npm run test:coverage
```

### Structure des tests

```
server/src/__tests__/
├── setup.ts                    # Configuration Jest
├── unit/
│   └── services.test.ts        # Tests unitaires (15)
└── integration/
    ├── health.test.ts          # Tests health (5)
    ├── auth.test.ts            # Tests auth (19)
    └── api.test.ts             # Tests API (12)

client/src/app/services/__tests__/
├── fiscal-common.service.spec.ts  # (28 tests)
├── irpp.service.spec.ts           # (20 tests)
├── its.service.spec.ts            # (22 tests)
└── is.service.spec.ts             # (15 tests)

client/e2e/
├── landing.spec.ts             # Tests landing (12)
├── auth.spec.ts                # Tests auth (16)
└── simulateur.spec.ts          # Tests simulateurs (12)
```

---

## Déploiement

### Docker Compose

```bash
# Démarrage complet
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêt
docker-compose down
```

### Variables de production

```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="production-secret-64-chars-minimum"
FRONTEND_URL="https://your-domain.com"
```

---

## Sécurité

- **CSRF Protection** - Double Submit Cookie pattern
- **JWT** - Access tokens (15min) + Refresh tokens (7j)
- **Rate Limiting** - Protection contre les abus
- **Helmet** - Headers de sécurité HTTP
- **CORS** - Origines autorisées configurables
- **Input Validation** - express-validator
- **Password Hashing** - bcrypt avec salt rounds

---

## Monitoring

- **Sentry** - Error tracking en production
- **Winston** - Logging structuré avec rotation
- **Prometheus** - Métriques applicatives
- **Health Checks** - Endpoints Kubernetes-ready

---

## Contribution

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines de contribution.

---

## Changelog

Voir [CHANGELOG.md](./CHANGELOG.md) pour l'historique des versions.

---

## License

MIT License - voir [LICENSE](./LICENSE) pour plus de détails.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/your-org/cgi-engine/issues)
- **Email:** support@cgi-engine.com

---

**Développé avec par l'équipe CGI-ENGINE**
# cgi-242
