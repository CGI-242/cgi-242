# Plan d'Architecture des Agents CGI

## Objectif

Implémenter deux agents conversationnels distincts pour répondre aux questions sur le Code Général des Impôts du Congo-Brazzaville, avec une séparation claire entre les versions 2025 et 2026.

---

## 1. Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                      Interface Utilisateur                   │
│                   (Chat / API / Widget)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Routeur de Version                        │
│         (Détection automatique ou sélection manuelle)        │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────┐            ┌─────────────────────┐
│   Agent CGI 2025    │            │   Agent CGI 2026    │
│   (Code actuel)     │            │   (Directive CEMAC) │
└──────────┬──────────┘            └──────────┬──────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────┐            ┌─────────────────────┐
│  /data/cgi/2025/    │            │  /data/cgi/2026/    │
│  - tome1/           │            │  - tome1/           │
│  - tome2/           │            │  - tome2/           │
└─────────────────────┘            └─────────────────────┘
```

---

## 2. Différences Structurelles

### CGI 2025 (Structure actuelle)

| Chapitre | Titre | Articles |
|----------|-------|----------|
| 1 | IRPP (Impôt sur le Revenu des Personnes Physiques) | 1-... |
| 2 | Abrogé | - |
| 3 | IS (Impôt sur les Sociétés) | 106-... |

### CGI 2026 (Nouvelle structure - Directive CEMAC)

| Chapitre | Titre | Articles |
|----------|-------|----------|
| 1 | IS (Impôt sur les Sociétés) | 1-92F |
| 2 | IBA (Impôt sur les Bénéfices d'Affaires) | 93-... |
| 3 | Sans objet | - |

---

## 3. Spécifications des Agents

### 3.1 Agent CGI 2025

**Identifiant:** `cgi-agent-2025`

**Contexte système:**
```
Tu es un expert du Code Général des Impôts du Congo-Brazzaville, version 2025.
Tu réponds uniquement sur la base du CGI 2025 actuellement en vigueur.
Ne fais jamais référence au CGI 2026 sauf si l'utilisateur demande une comparaison.
```

**Sources de données:**
- `/server/data/cgi/2025/tome1/`
- `/server/data/cgi/2025/tome2/`

**Mots-clés spécifiques:**
- "IRPP" (Chapitre 1)
- "Article 106+" pour IS
- Structure actuelle

### 3.2 Agent CGI 2026

**Identifiant:** `cgi-agent-2026`

**Contexte système:**
```
Tu es un expert du Code Général des Impôts du Congo-Brazzaville, version 2026.
Ce code transpose la Directive CEMAC n°0119/25-UEAC-177-CM-42 du 09/01/2025.
Tu réponds uniquement sur la base du CGI 2026 (LF 2026).
Précise toujours que ces dispositions entrent en vigueur le 1er janvier 2026.
```

**Sources de données:**
- `/server/data/cgi/2026/tome1/`
- `/server/data/cgi/2026/tome2/`

**Mots-clés spécifiques:**
- "IBA" (nouveau - Chapitre 2)
- "Article 1-92F" pour IS
- "Directive CEMAC"
- "Prix de transfert" (Art. 77-85)

---

## 4. Routeur de Version

### 4.1 Détection Automatique

```typescript
interface VersionDetector {
  detectVersion(query: string): '2025' | '2026' | 'ambiguous';
}

const VERSION_KEYWORDS = {
  '2026': [
    'IBA', 'impôt sur les bénéfices d\'affaires',
    'directive CEMAC', 'LF 2026',
    'article 93', // IBA
    'prix de transfert article 77',
    '2026'
  ],
  '2025': [
    'IRPP', 'impôt sur le revenu des personnes physiques',
    'article 106', // IS 2025
    'article 72', // IRPP
    'code actuel',
    '2025'
  ]
};
```

### 4.2 Sélection Manuelle

```typescript
// Option 1: Préfixe dans la question
// "CGI 2025: Quel est le taux IS?"
// "CGI 2026: Quel est le taux IS?"

// Option 2: Sélecteur UI
interface ChatSession {
  cgiVersion: '2025' | '2026';
  messages: Message[];
}
```

---

## 5. Table de Correspondance

### 5.1 Mapping Articles IS

| Sujet | CGI 2025 | CGI 2026 |
|-------|----------|----------|
| Définition IS | Art. 106 | Art. 1 |
| Personnes imposables | Art. 107 | Art. 2 |
| Exonérations | Art. 108-109 | Art. 3-3A |
| Territorialité | Art. 110-112 | Art. 4-7 |
| Bénéfice imposable | Art. 113+ | Art. 8-85 |
| Taux IS | Art. 127 | Art. 86A |
| Minimum perception | Art. 127bis | Art. 86B |

### 5.2 Nouveautés CGI 2026

| Élément | CGI 2025 | CGI 2026 |
|---------|----------|----------|
| IBA (Bénéfices d'Affaires) | N/A | Chapitre 2 |
| Prix de transfert détaillé | Limité | Art. 77-85 |
| Intégration fiscale | Limité | Art. 91-91I |
| Holdings | Limité | Art. 90-90F |

---

## 6. Fonctionnalités Avancées

### 6.1 Mode Comparaison

```typescript
interface ComparisonQuery {
  topic: string;
  versions: ['2025', '2026'];
}

// Exemple de réponse:
// "Comparer le taux IS entre 2025 et 2026"
// → CGI 2025: 30% (Art. 127)
// → CGI 2026: 25% général, 33% étrangers (Art. 86A)
```

### 6.2 Recherche par Mots-Clés

```typescript
interface SearchResult {
  version: '2025' | '2026';
  article: string;
  titre: string;
  extrait: string;
  mots_cles: string[];
  pertinence: number;
}
```

### 6.3 Navigation Hiérarchique

```typescript
// Permettre la navigation:
// Tome → Livre → Chapitre → Section → Sous-section → Article

interface NavigationPath {
  tome: number;
  livre?: number;
  chapitre?: number;
  section?: number;
  sous_section?: number;
  article?: string;
}
```

---

## 7. Implémentation Technique

### 7.1 Stack Recommandé

| Composant | Technologie |
|-----------|-------------|
| Backend API | NestJS (existant) |
| Agents LLM | LangChain / Claude API |
| Vector Store | Pinecone / Qdrant / pgvector |
| Embeddings | OpenAI / Cohere |
| Frontend | Angular (existant) |

### 7.2 Endpoints API

```typescript
// Endpoints proposés
POST /api/cgi/chat
{
  "version": "2025" | "2026",
  "question": string,
  "session_id"?: string
}

GET /api/cgi/article/:version/:article
GET /api/cgi/search/:version?q=keyword
GET /api/cgi/compare/:article2025/:article2026
```

### 7.3 Structure Base de Données

```sql
-- Table articles avec versioning
CREATE TABLE cgi_articles (
  id SERIAL PRIMARY KEY,
  version VARCHAR(4) NOT NULL, -- '2025' ou '2026'
  tome INT,
  livre INT,
  chapitre INT,
  section INT,
  sous_section INT,
  article VARCHAR(20),
  titre TEXT,
  texte TEXT[],
  mots_cles TEXT[],
  statut VARCHAR(20),
  embedding VECTOR(1536), -- Pour recherche sémantique
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_version ON cgi_articles(version);
CREATE INDEX idx_article ON cgi_articles(article);
```

---

## 8. Phases d'Implémentation

### Phase 1: Fondations (2-3 semaines)
- [ ] Finaliser ingestion JSON CGI 2026
- [ ] Compléter ingestion JSON CGI 2025
- [ ] Créer API de recherche basique
- [ ] Implémenter routeur de version

### Phase 2: Agents (3-4 semaines)
- [ ] Intégrer LangChain/Claude API
- [ ] Créer prompts spécifiques par version
- [ ] Implémenter embeddings et recherche vectorielle
- [ ] Développer mode comparaison

### Phase 3: Interface (2-3 semaines)
- [ ] Widget chat Angular
- [ ] Sélecteur de version
- [ ] Affichage résultats formatés
- [ ] Navigation hiérarchique

### Phase 4: Optimisation (Continu)
- [ ] Amélioration prompts basée sur feedback
- [ ] Cache des réponses fréquentes
- [ ] Analytics et monitoring
- [ ] Tests utilisateurs

---

## 9. Métriques de Succès

| Métrique | Objectif |
|----------|----------|
| Précision réponses | >95% |
| Temps réponse | <3 secondes |
| Satisfaction utilisateur | >4/5 |
| Taux confusion version | <5% |

---

## 10. Risques et Mitigations

| Risque | Mitigation |
|--------|------------|
| Confusion entre versions | Affichage clair de la version, badge visuel |
| Réponses incorrectes | Toujours citer l'article source |
| Données obsolètes | Système de versioning avec dates |
| Hallucinations LLM | RAG strict, limiter aux données indexées |

---

## Annexes

### A. Exemple de Prompt Agent 2026

```
Tu es un assistant expert du Code Général des Impôts du Congo-Brazzaville, version 2026.

CONTEXTE:
- Ce code transpose la Directive CEMAC n°0119/25-UEAC-177-CM-42 du 09/01/2025
- Adopté par la Loi de Finances 2026 le 22/12/2025
- Entre en vigueur le 1er janvier 2026

RÈGLES:
1. Réponds uniquement sur la base des articles du CGI 2026
2. Cite toujours le numéro d'article exact
3. Si la question concerne le CGI 2025, indique poliment que tu ne traites que le CGI 2026
4. Reproduis le texte des articles mot pour mot quand demandé
5. Pour les taux et seuils, sois précis (ex: "25% selon l'article 86A")

STRUCTURE CGI 2026:
- Chapitre 1: IS (Impôt sur les Sociétés) - Art. 1-92F
- Chapitre 2: IBA (Impôt sur les Bénéfices d'Affaires) - Art. 93+
```

### B. Fichiers de Données

```
/server/data/cgi/
├── 2025/
│   ├── tome1/
│   │   └── livre1/
│   │       ├── chapitre1/ (IRPP)
│   │       ├── chapitre2/ (Abrogé)
│   │       └── chapitre3/ (IS)
│   └── tome2/
└── 2026/
    ├── tome1/
    │   └── livre1/
    │       ├── chapitre1/ (IS) ✓
    │       ├── chapitre2/ (IBA) - En cours
    │       └── chapitre3-6/
    └── tome2/
```

---

*Document créé le 30/12/2024*
*Dernière mise à jour: 30/12/2024*
