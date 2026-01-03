# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added
- Documentation API Swagger/OpenAPI
- Fichier CONTRIBUTING.md
- README.md complet

---

## [1.2.0] - 2026-01-03

### Added
- **Infrastructure Tests & CI/CD**
  - 51 tests backend (Jest + Supertest)
  - 85 tests frontend Angular (Jest)
  - 40 tests E2E (Playwright)
  - Pipeline CI/CD GitHub Actions (5 jobs)
  - Dependabot pour mises à jour automatiques
  - Template Pull Request

- **Mocking Infrastructure**
  - Mock Prisma Client complet
  - Mock Redis Service
  - Mock Health Service
  - Mock Sentry

### Changed
- Configuration Jest backend avec moduleNameMapper pour ESM
- Tests d'intégration avec gestion flexible des status codes

### Fixed
- Résolution modules .js pour Jest
- Mock Prisma $use, $on, $extends methods

---

## [1.1.0] - 2026-01-03

### Added
- **Performance Optimizations**
  - `takeUntilDestroyed()` pour gestion automatique des subscriptions Angular
  - `OnPush` change detection sur composants critiques
  - Redis cache pour embeddings (TTL 24h)
  - Redis cache pour recherche CGI (TTL 1h)
  - Redis cache pour quotas (TTL 5min)
  - API Resilience avec timeout et retry exponential backoff

- **Fiscal Services Refactoring**
  - `FiscalCommonService` centralisé (élimination duplication)
  - Configuration externalisée `fiscal-params.json`
  - 85 tests unitaires pour services fiscaux

### Changed
- Barèmes fiscaux externalisés dans fichier JSON
- Calculs CNSS centralisés

### Fixed
- Duplication code entre IRPP, ITS, IS services
- Console.log restants dans code production

---

## [1.0.0] - 2026-01-02

### Added
- **Sécurité**
  - CSRF Protection (Double Submit Cookie)
  - JWT avec refresh tokens (Access: 15min, Refresh: 7j)
  - Cookies HttpOnly et Secure
  - Rate limiting par endpoint
  - Headers de sécurité Helmet (CSP, HSTS, X-Content-Type-Options)
  - Validation entrées avec express-validator
  - Sanitization XSS

- **Multi-tenant Architecture**
  - Isolation données par organizationId
  - RBAC hiérarchique (OWNER > ADMIN > MEMBER > VIEWER)
  - Système d'invitation avec expiration
  - Gestion quotas par plan

- **Quota Management**
  - `checkQuotaMiddleware` sur routes chat
  - Job CRON reset quotas mensuel
  - Plans: FREE, STARTER, PROFESSIONAL, TEAM, ENTERPRISE

- **Audit Trail**
  - `AuditService` complet
  - Table AuditLog dans Prisma
  - Tracking actions utilisateurs

- **Payment Integration**
  - CinetPay (Mobile Money Congo)
  - Webhooks payment

- **Monitoring**
  - Sentry error tracking
  - Winston logging avec rotation
  - Métriques Prometheus
  - Health checks Kubernetes-ready

### Changed
- Migration de Stripe vers CinetPay pour paiements locaux

---

## [0.9.0] - 2026-01-01

### Added
- **Chat IA Fiscal**
  - Intégration Claude Haiku
  - Recherche hybride (sémantique + lexicale)
  - Base vectorielle Qdrant
  - Embeddings OpenAI text-embedding-3-small

- **Simulateurs Fiscaux**
  - Calculateur IRPP conforme CGI 2026
  - Calculateur ITS avec forfait 1,200 FCFA (nouveau 2026)
  - Calculateur IS avec minimum perception

- **Frontend Angular**
  - Composants standalone Angular 17
  - Interface responsive TailwindCSS
  - Calcul temps réel

- **Backend Express**
  - API REST TypeScript
  - Prisma ORM + PostgreSQL
  - Architecture modulaire

### Security
- Authentification JWT
- Validation entrées basique

---

## [0.1.0] - 2025-12-15

### Added
- Setup initial projet
- Structure monorepo (client/server)
- Configuration TypeScript
- Docker Compose pour développement

---

## Types de changements

- `Added` pour les nouvelles fonctionnalités
- `Changed` pour les modifications de fonctionnalités existantes
- `Deprecated` pour les fonctionnalités qui seront supprimées
- `Removed` pour les fonctionnalités supprimées
- `Fixed` pour les corrections de bugs
- `Security` pour les mises à jour de sécurité

[Unreleased]: https://github.com/your-org/cgi-engine/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/your-org/cgi-engine/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/your-org/cgi-engine/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/your-org/cgi-engine/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/your-org/cgi-engine/compare/v0.1.0...v0.9.0
[0.1.0]: https://github.com/your-org/cgi-engine/releases/tag/v0.1.0
