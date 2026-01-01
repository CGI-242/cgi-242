# Agents IA - Code Général des Impôts Congo

> Document de planification pour le développement des agents IA basés sur le CGI Congo-Brazzaville

---

## 1. État de l'ingestion des données

### Fichiers JSON créés

| Fichier | Contenu | Lignes | Statut |
|---------|---------|--------|--------|
| `tome1-livre1-chapitre1.json` | IRPP (Art. 1-101) | 2617 | ✅ Complet |
| `tome1-livre1-chapitre3.json` | Impôt sur les Sociétés (Art. 106-126 septies) | 1928 | ✅ Complet |
| `tome1-livre1-chapitre2.json` | Impôt complémentaire | - | Abrogé |
| `tome1-livre1-chapitre4.json` | Dispositions communes | - | À créer |
| `tome1-livre1-chapitre5.json` | Taxes diverses | - | À créer |
| `tome1-livre1-chapitre6.json` | Dispositions diverses | - | À créer |

**Total ingéré : 4545 lignes (Chapitres 1 + 3)**

### Structure des données

```json
{
  "meta": {
    "tome": 1,
    "livre": 1,
    "chapitre": 3,
    "titre": "Impôt sur les sociétés",
    "version": "2025",
    "derniere_modification": "L.F.2023"
  },
  "sections": [
    {
      "section": 1,
      "titre": "...",
      "sous_sections": [
        {
          "sous_section": 1,
          "titre": "...",
          "articles": [
            {
              "article": "Art. XXX",
              "titre": "...",
              "texte": ["..."],
              "mots_cles": ["..."],
              "statut": "en vigueur",
              "reference": "L.F.2023"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 2. Architecture des Agents IA

### Vue d'ensemble

```
cgi-engine/
├── server/
│   ├── data/cgi/                         # Données structurées JSON
│   │   ├── tome1-livre1-chapitre1.json   # IRPP
│   │   ├── tome1-livre1-chapitre3.json   # IS (complet)
│   │   └── ...
│   │
│   └── services/
│       ├── cgi/
│       │   ├── cgi-search.service.ts     # Recherche dans le CGI
│       │   ├── cgi-parser.service.ts     # Parsing des articles
│       │   └── cgi-version.service.ts    # Gestion des versions
│       │
│       └── agents/
│           ├── qualification-fiscale.agent.ts
│           ├── conformite-declarative.agent.ts
│           ├── controle-facturation.agent.ts
│           ├── simulation-fiscale.agent.ts
│           ├── risque-fiscal.agent.ts
│           ├── veille-juridique.agent.ts
│           └── audit-fiscal.agent.ts
│
├── client/
│   └── src/app/features/
│       └── agents/
│           ├── qualification/
│           ├── conformite/
│           ├── simulation/
│           └── audit/
```

---

## 3. Spécifications des Agents

### Agent 1 : Qualification Fiscale Automatique

**Objectif** : Déterminer instantanément le régime fiscal applicable

**Entrée**
```typescript
interface QualificationInput {
  pays: 'Congo' | 'CEMAC' | 'Etranger';
  type_societe: 'residente' | 'non_residente' | 'succursale' | 'holding';
  activites: string[];
  chiffre_affaires: {
    petrolier: number;
    total: number;
  };
  participations?: {
    societe: string;
    pourcentage: number;
  }[];
  duree_activite?: number; // en mois
}
```

**Sortie**
```typescript
interface QualificationOutput {
  regime_applicable: RegimeFiscal;
  base_legale: string[];           // ["art.126 ter", "art.126 sexies"]
  taux: string;                    // "22%" | "28%" | "30%"
  motif: string;
  obligations: Obligation[];
  alertes: Alerte[];
}

type RegimeFiscal =
  | 'IS_droit_commun'
  | 'IS_forfaitaire_22'
  | 'regime_petrolier'
  | 'regime_holding'
  | 'regime_integration_fiscale'
  | 'regime_mere_fille'
  | 'regime_succursale'
  | 'regime_quartier_general'
  | 'regime_personnes_morales_etrangeres';
```

**Règles de classification (extraites du CGI)**

| Critère | Seuil | Régime | Article |
|---------|-------|--------|---------|
| CA pétrolier / CA total | ≥ 70% | IS forfaitaire pétrolier | Art. 126 sexies |
| Détention filiale | ≥ 95% | Intégration fiscale | Art. 126-E |
| Détention filiale | ≥ 25% | Régime mère-fille | Art. 126 |
| Portefeuille / Actif | ≥ 2/3 | Régime holding | Art. 126-D |
| Durée travaux | < 6 mois | Retenue à la source | Art. 126 quater B-1 |

---

### Agent 2 : Conformité Déclarative & Échéancier

**Objectif** : Éviter sanctions, amendes, pénalités

**Fonctionnalités**
- Génère toutes les obligations selon le régime
- Produit un calendrier fiscal personnalisé
- Alerte sur les échéances proches

**Échéances clés (extraites du CGI)**

| Obligation | Délai | Article | Sanction |
|------------|-------|---------|----------|
| Déclaration trimestrielle sous-traitants | 20 du mois suivant | Art. 126 quinquies-1 | 3.000.000 FCFA |
| Déclaration mensuelle rémunérations | 20 du mois suivant | Art. 126 quinquies-1 | 3.000.000 FCFA |
| Facturation prestations | 30 jours du 2ème mois | Art. 126 quater B-1 | Paiement spontané IS |
| Enregistrement contrats pétroliers | 15 du mois suivant | Art. 126 quinquies-1 | 5.000.000 FCFA |
| Déclaration liquidation | Avant départ matériel | Art. 126 ter | Taxation d'office |
| Paiement IS | 20 du mois suivant | Art. 126 quater B-1 | 100% + 1%/jour |

**Sortie**
```typescript
interface EcheancierOutput {
  obligations: {
    type: string;
    article: string;
    echeance: Date;
    sanction: string;
    priorite: 'haute' | 'moyenne' | 'basse';
    statut: 'a_faire' | 'en_cours' | 'fait' | 'en_retard';
  }[];
  prochaine_echeance: Date;
  risque_total_sanctions: number;
}
```

---

### Agent 3 : Contrôle de Facturation

**Objectif** : Sécuriser la déductibilité et la retenue à la source

**Mentions obligatoires (Art. 126 quater C-3)**
- Prestation imposable : "Prestation rendue au Congo. Montant imposable à l'IS. Retenue à la source à effectuer par le client."
- Prestation non imposable : "Prestation rendue au Congo. Montant non imposable."

**Vérifications**
```typescript
interface FactureVerification {
  facture_id: string;
  conforme: boolean;
  erreurs: {
    code: string;
    message: string;
    article: string;
    consequence: string;
  }[];
  recommandations: string[];
}
```

**Conséquences absence mention**
- Client autorisé à différer paiement
- Non-déductibilité pour le client
- Risque redressement fiscal

---

### Agent 4 : Simulation Fiscale & Arbitrage

**Objectif** : Aide à la décision stratégique

**Simulations disponibles**

| Comparaison | Paramètres | Articles |
|-------------|------------|----------|
| IS droit commun vs forfaitaire | CA, charges, résultat | Art. 122 vs Art. 126 ter A |
| Holding vs société classique | Dividendes, plus-values | Art. 126-D |
| Intégration vs sociétés isolées | Résultats groupe | Art. 126-E |
| Retenue source vs IS direct | Durée activité | Art. 126 quater B-1 |

**Sortie**
```typescript
interface SimulationOutput {
  scenarios: {
    nom: string;
    impot_du: number;
    cash_flow_impact: number;
    risques: string[];
    articles: string[];
  }[];
  recommandation: string;
  gain_potentiel: number;
  conditions: string[];
}
```

---

### Agent 5 : Gestion du Risque Fiscal

**Objectif** : Cartographier les risques

**Barème des sanctions (extrait du CGI)**

| Manquement | Sanction | Article |
|------------|----------|---------|
| Défaut production factures | 100.000 FCFA/élément | Art. 126 quater C-2 |
| Non-paiement après mise en demeure | 100% droits | Art. 126 quater C-2 |
| Paiement tardif | 1%/jour (max 50%) | Art. 126 quater C-2 |
| Report paiement fin mois | 500.000 FCFA | Art. 126 quater C-2 |
| Défaut enregistrement contrat | 5.000.000 FCFA | Art. 126 quinquies-1 |
| Défaut déclaration trimestrielle | 3.000.000 FCFA | Art. 126 quinquies-1 |
| Omission dans déclaration | 10.000 FCFA/omission | Art. 126 quinquies-1 |
| Défaut traduction contrat | 2.000.000 FCFA | Art. 126 quinquies-1 |
| Défaut valeur prévisionnelle | 3.000.000 FCFA | Art. 126 quinquies-1 |

**Score de risque**
```typescript
interface RisqueOutput {
  score: number;           // 0-100
  niveau: 'faible' | 'moyen' | 'eleve' | 'critique';
  manquements: {
    description: string;
    article: string;
    sanction_potentielle: number;
    probabilite: number;
  }[];
  total_sanctions_potentiel: number;
  actions_prioritaires: string[];
}
```

---

### Agent 6 : Veille Juridique Intelligente

**Objectif** : Rester à jour automatiquement

**Sources surveillées**
- Lois de finances (LF)
- Lois de finances rectificatives (LFR)
- Arrêtés ministériels
- Instructions DGI
- Circulaires

**Détection de changements**
```typescript
interface ChangementDetecte {
  article: string;
  ancien_texte: string;
  nouveau_texte: string;
  date_effet: Date;
  source: string;           // "L.F.2024"
  impact: 'majeur' | 'mineur' | 'technique';
  entites_impactees: string[];
}
```

---

### Agent 7 : Auditeur IA / Pré-contrôle Fiscal

**Objectif** : Se préparer à un contrôle DGI

**Points de contrôle**
- Cohérence CA déclaré / factures
- Présence mentions obligatoires
- Respect des délais
- Retenues à la source effectuées
- Enregistrement contrats
- Déclarations trimestrielles/mensuelles

**Rapport de pré-audit**
```typescript
interface RapportAudit {
  date_audit: Date;
  periode_auditee: { debut: Date; fin: Date };
  score_conformite: number;  // 0-100

  points_conformes: {
    description: string;
    article: string;
  }[];

  anomalies: {
    gravite: 'critique' | 'majeure' | 'mineure';
    description: string;
    article: string;
    montant_risque: number;
    recommandation: string;
  }[];

  documents_manquants: string[];
  recommandations_generales: string[];
}
```

---

## 4. Points d'attention critiques

### Seuils légaux sensibles

| Seuil | Signification | Article |
|-------|---------------|---------|
| 70% | CA pétrolier pour régime dérogatoire | Art. 126 sexies |
| 95% | Détention pour intégration fiscale | Art. 126-E |
| 25% | Détention pour régime mère-fille | Art. 126 |
| 10% | Détention pour remises de dettes | Art. 126-A |
| 60% | Participations CEMAC pour exonération plus-values | Art. 126-D-1 |
| 2/3 | Portefeuille/actif pour régime holding | Art. 126-D |
| 6 mois | Durée travaux pour retenue source | Art. 126 quater B-1 |
| 100 Mds FCFA | Seuil compétence DGID/Ministre | Art. 126 quater D |

### Délais critiques

| Délai | Contexte | Article |
|-------|----------|---------|
| 15 jours | Cessation d'activités | Art. 124-C |
| 20 du mois | Déclarations mensuelles/trimestrielles | Art. 126 quinquies-1 |
| 30 jours | Facturation après prestation | Art. 126 quater B-1 |
| 3 mois | Enregistrement bons de commande | Art. 126 quinquies-1 |
| 2 ans | Détention titres nominatifs mère-fille | Art. 126 |
| 3 ans | Report moins-values holding | Art. 126-D-2 |
| 5 ans | Durée intégration fiscale | Art. 126-E |
| 5 ans | Maintien portefeuille holding | Art. 126-D |

### Territorialité

| Zone | Régime applicable | Articles |
|------|-------------------|----------|
| Congo | Droit commun ou dérogatoire | Art. 107 et suivants |
| CEMAC | Régime mère-fille, exonérations | Art. 126, Art. 126-D-1 |
| Zone pétrolière Angola | Taux 5,75% | Art. 126 quater B-1 |
| Hors Congo | Retenue source | Art. 126 ter |

---

## 5. Roadmap de développement

### Phase 1 : Fondations (Semaine 1-2)

- [ ] Compléter ingestion Chapitre 1 (IRPP)
- [ ] Compléter ingestion Chapitres 4-6
- [ ] Créer service `cgi-search.service.ts`
- [ ] Créer service `cgi-parser.service.ts`
- [ ] Tests unitaires services CGI

### Phase 2 : Agent Qualification (Semaine 3-4)

- [ ] Implémenter règles de classification
- [ ] Créer `qualification-fiscale.agent.ts`
- [ ] UI formulaire qualification
- [ ] Tests E2E qualification

### Phase 3 : Agent Conformité (Semaine 5-6)

- [ ] Implémenter calendrier fiscal
- [ ] Créer `conformite-declarative.agent.ts`
- [ ] Intégration notifications
- [ ] Dashboard échéances

### Phase 4 : Agents Avancés (Semaine 7-10)

- [ ] Agent simulation fiscale
- [ ] Agent contrôle facturation
- [ ] Agent risque fiscal
- [ ] Agent audit

### Phase 5 : Veille & Maintenance (Continue)

- [ ] Agent veille juridique
- [ ] Système de versioning CGI
- [ ] API publique agents
- [ ] Documentation utilisateur

---

## 6. Technologies recommandées

| Composant | Technologie |
|-----------|-------------|
| Backend | NestJS (existant) |
| Base de données | PostgreSQL + JSON columns |
| Recherche full-text | PostgreSQL FTS ou Elasticsearch |
| Cache | Redis |
| Notifications | WebSocket + Push |
| IA/NLP | OpenAI API ou Claude API |
| Frontend | Angular (existant) |

---

## 7. Métriques de succès

| Métrique | Objectif |
|----------|----------|
| Précision qualification | > 98% |
| Couverture articles CGI | 100% IS, 80% autres |
| Temps réponse agents | < 2 secondes |
| Réduction erreurs déclaratives | -50% |
| Adoption utilisateurs | 500+ entreprises |

---

## 8. Prochaines étapes immédiates

1. **Continuer l'ingestion** : Chapitres 1, 4, 5, 6 du Tome 1
2. **Créer service de recherche CGI** : full-text + mots-clés
3. **Prototype Agent Qualification** : règles de classification IS
4. **Tests avec cas réels** : validation avec cabinets fiscaux

---

*Document créé le 30/12/2024*
*Dernière mise à jour : 30/12/2024*
*Version : 1.0*
