# Guide de Contribution

Merci de votre intérêt pour contribuer à CGI-ENGINE ! Ce document fournit les lignes directrices pour contribuer au projet.

## Table des matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Standards de Code](#standards-de-code)
- [Process de Pull Request](#process-de-pull-request)
- [Signaler des Bugs](#signaler-des-bugs)
- [Proposer des Fonctionnalités](#proposer-des-fonctionnalités)

---

## Code de Conduite

Ce projet adhère à un code de conduite. En participant, vous êtes tenu de respecter ce code. Veuillez signaler tout comportement inacceptable à conduct@cgi-engine.com.

### Nos Standards

- Utiliser un langage accueillant et inclusif
- Respecter les différents points de vue et expériences
- Accepter gracieusement les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres

---

## Comment Contribuer

### Types de Contributions

1. **Corrections de bugs** - Identifiez et corrigez des bugs
2. **Nouvelles fonctionnalités** - Ajoutez de nouvelles capacités
3. **Documentation** - Améliorez la documentation
4. **Tests** - Ajoutez ou améliorez les tests
5. **Refactoring** - Améliorez la qualité du code
6. **Traductions** - Traduisez l'interface utilisateur

### Workflow Git

1. Fork le repository
2. Créez une branche depuis `develop`
3. Faites vos modifications
4. Soumettez une Pull Request vers `develop`

```bash
# Cloner votre fork
git clone https://github.com/YOUR_USERNAME/cgi-engine.git
cd cgi-engine

# Ajouter le remote upstream
git remote add upstream https://github.com/your-org/cgi-engine.git

# Créer une branche feature
git checkout -b feature/ma-fonctionnalite develop

# Faire vos modifications et commits
git add .
git commit -m "feat: description de la fonctionnalité"

# Pousser vers votre fork
git push origin feature/ma-fonctionnalite
```

---

## Configuration de l'Environnement

### Prérequis

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 16
- Redis >= 7
- Docker (recommandé)

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-org/cgi-engine.git
cd cgi-engine

# Copier les fichiers d'environnement
cp server/.env.example server/.env
cp client/.env.example client/.env

# Installer les dépendances
cd server && npm install
cd ../client && npm install

# Configurer la base de données
cd ../server
npx prisma generate
npx prisma migrate dev

# Démarrer en développement
npm run dev  # Backend (Terminal 1)
cd ../client && npm start  # Frontend (Terminal 2)
```

### Docker (Alternative)

```bash
docker-compose up -d
```

---

## Standards de Code

### TypeScript

- Utiliser TypeScript strict mode
- Pas de `any` implicite
- Documenter les fonctions publiques avec JSDoc
- Préférer les interfaces aux types pour les objets

```typescript
/**
 * Calcule l'IRPP pour un revenu donné
 * @param revenu - Revenu brut annuel en FCFA
 * @param parts - Nombre de parts fiscales
 * @returns Montant de l'impôt dû
 */
export function calculerIRPP(revenu: number, parts: number): number {
  // Implementation
}
```

### Conventions de Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Fichiers | kebab-case | `auth.service.ts` |
| Classes | PascalCase | `AuthService` |
| Fonctions | camelCase | `getUserById` |
| Constantes | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Interfaces | PascalCase (préfixe I optionnel) | `User`, `IUserService` |

### Structure des Fichiers

```
src/
├── config/          # Configuration
├── controllers/     # Contrôleurs HTTP
├── middleware/      # Middleware Express
├── routes/          # Définitions des routes
├── services/        # Logique métier
├── utils/           # Utilitaires
├── models/          # Types et interfaces
└── __tests__/       # Tests
```

### Commits

Suivez la convention [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - Nouvelle fonctionnalité
- `fix` - Correction de bug
- `docs` - Documentation
- `style` - Formatage (sans changement de code)
- `refactor` - Refactoring
- `test` - Ajout de tests
- `chore` - Maintenance

**Exemples:**
```bash
feat(auth): add password reset functionality
fix(irpp): correct tax bracket calculation for high incomes
docs(readme): update installation instructions
test(fiscal): add unit tests for ITS calculator
```

---

## Process de Pull Request

### Avant de Soumettre

1. **Tests**
   ```bash
   # Backend
   cd server && npm test

   # Frontend
   cd client && npm test

   # E2E (si applicable)
   cd client && npm run e2e
   ```

2. **Linting**
   ```bash
   cd server && npm run lint
   cd client && npm run lint
   ```

3. **Build**
   ```bash
   cd server && npm run build
   cd client && npm run build
   ```

### Checklist PR

- [ ] Les tests passent
- [ ] Le linting passe
- [ ] Le build réussit
- [ ] La documentation est mise à jour
- [ ] Le CHANGELOG est mis à jour (si applicable)
- [ ] Les commits suivent les conventions
- [ ] La PR est basée sur `develop`

### Template PR

```markdown
## Description
Brève description des changements

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Comment tester
1. Étape 1
2. Étape 2

## Checklist
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de warnings ESLint
```

### Review Process

1. Au moins 1 approbation requise
2. Tous les checks CI doivent passer
3. Les discussions doivent être résolues
4. Le merge se fait par squash

---

## Signaler des Bugs

### Avant de Signaler

1. Vérifiez les [issues existantes](https://github.com/your-org/cgi-engine/issues)
2. Assurez-vous d'utiliser la dernière version
3. Collectez les informations de debug

### Template Bug Report

```markdown
## Description du Bug
Description claire et concise du bug

## Étapes pour Reproduire
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

## Comportement Attendu
Ce qui devrait se passer

## Comportement Actuel
Ce qui se passe réellement

## Screenshots
Si applicable

## Environnement
- OS: [e.g. Ubuntu 22.04]
- Node.js: [e.g. 20.10.0]
- Browser: [e.g. Chrome 120]

## Logs
```
Coller les logs pertinents ici
```
```

---

## Proposer des Fonctionnalités

### Avant de Proposer

1. Vérifiez la [roadmap](https://github.com/your-org/cgi-engine/projects)
2. Cherchez dans les issues existantes
3. Discutez dans les discussions GitHub

### Template Feature Request

```markdown
## Problème
Description du problème que cette fonctionnalité résoudrait

## Solution Proposée
Description de la solution envisagée

## Alternatives Considérées
Autres approches envisagées

## Contexte Additionnel
Tout autre contexte ou screenshots
```

---

## Resources

- [Documentation API](/api-docs)
- [Architecture du Projet](./ANALYSE_COMPLETE_CGI_ENGINE.md)
- [Code Général des Impôts Congo](https://www.finances.gouv.cg)

---

## Questions?

- Ouvrez une [discussion GitHub](https://github.com/your-org/cgi-engine/discussions)
- Email: dev@cgi-engine.com

---

Merci de contribuer à CGI-ENGINE !
