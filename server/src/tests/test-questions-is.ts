// server/src/tests/test-questions-is.ts
// Questions de test pour valider le RAG CGI 2025 - Chapitre IS

import { TestQuestion, TestLevel } from './test-questions-data.js';

// Niveau 1 - Questions factuelles directes IS
const GREEN_QUESTIONS_IS: TestQuestion[] = [
  {
    id: 1,
    level: 'green',
    question: "Quel est le taux normal de l'impôt sur les sociétés au Congo ?",
    expectedArticles: ['122'],
    mustContain: ['30%', 'taux'],
    category: 'Taux IS',
  },
  {
    id: 2,
    level: 'green',
    question: "Quelles sont les sociétés imposables à l'IS en raison de leur forme ?",
    expectedArticles: ['107'],
    mustContain: ['SA', 'SARL', 'sociétés de capitaux'],
    category: 'Personnes imposables',
  },
  {
    id: 3,
    level: 'green',
    question: "Les coopératives agricoles sont-elles exonérées d'IS ?",
    expectedArticles: ['107-A'],
    mustContain: ['exonéré|exonération', 'coopérative'],
    category: 'Exonérations',
  },
  {
    id: 4,
    level: 'green',
    question: "Quel est le plafond de déduction des frais de siège ?",
    expectedArticles: ['111'],
    mustContain: ['20%', 'frais de siège'],
    category: 'Charges déductibles',
  },
  {
    id: 5,
    level: 'green',
    question: "Quel est le plafond d'amortissement des véhicules de tourisme ?",
    expectedArticles: ['114-G'],
    mustContain: ['40 000 000|40 millions|quarante millions', 'véhicule'],
    category: 'Amortissements',
  },
  {
    id: 6,
    level: 'green',
    question: "Quelle est la durée du report déficitaire ?",
    expectedArticles: ['119'],
    mustContain: ['3 ans|trois ans|trois exercices'],
    category: 'Report déficitaire',
  },
  {
    id: 7,
    level: 'green',
    question: "Quel est le seuil de documentation des prix de transfert ?",
    expectedArticles: ['120-A'],
    mustContain: ['500 000 000|500 millions|cinq cents millions'],
    category: 'Prix de transfert',
  },
  {
    id: 8,
    level: 'green',
    question: "Quelles sont les dates des acomptes IS ?",
    expectedArticles: ['124-B'],
    mustContain: ['15 février|15 mai|15 août|15 novembre'],
    category: 'Obligations',
  },
  {
    id: 9,
    level: 'green',
    question: "Quel est le taux de la quote-part frais et charges du régime mère-fille ?",
    expectedArticles: ['126'],
    mustContain: ['10%', 'quote-part'],
    category: 'Régime mère-fille',
  },
  {
    id: 10,
    level: 'green',
    question: "Quel est le taux d'IS pour les personnes morales étrangères ?",
    expectedArticles: ['122-A'],
    mustContain: ['33%'],
    category: 'Taux IS',
  },
];

// Niveau 2 - Questions d'application IS
const YELLOW_QUESTIONS_IS: TestQuestion[] = [
  {
    id: 11,
    level: 'yellow',
    question: "Une société réalise un bénéfice de 100 millions FCFA. Calculez l'IS au taux normal.",
    expectedArticles: ['122'],
    mustContain: ['30%', 'impôt|IS'],
    category: 'Calcul IS',
  },
  {
    id: 12,
    level: 'yellow',
    question: "Quelles sont les conditions pour bénéficier du régime mère-fille ?",
    expectedArticles: ['126'],
    mustContain: ['25%', 'participation', '2 ans'],
    category: 'Régime mère-fille',
  },
  {
    id: 13,
    level: 'yellow',
    question: "Comment sont traités les intérêts versés aux associés ?",
    expectedArticles: ['112-E'],
    mustContain: ['BEAC', 'intérêts', 'taux'],
    category: 'Charges financières',
  },
  {
    id: 14,
    level: 'yellow',
    question: "Quelles sont les conditions de l'intégration fiscale ?",
    expectedArticles: ['126-E'],
    mustContain: ['95%', 'participation', '5 exercices'],
    category: 'Intégration fiscale',
  },
  {
    id: 15,
    level: 'yellow',
    question: "Quel est le régime des holdings au Congo ?",
    expectedArticles: ['126-D'],
    mustContain: ['deux tiers|2/3', 'actif', 'holding'],
    category: 'Holdings',
  },
];

// Niveau 3 - Questions complexes IS
const RED_QUESTIONS_IS: TestQuestion[] = [
  {
    id: 16,
    level: 'red',
    question: "Cas d'une fusion : quelles sont les conditions du régime de faveur ?",
    expectedArticles: ['118-B'],
    mustContain: ['fusion', 'plus-value', 'report|sursis'],
    category: 'Restructurations',
  },
  {
    id: 17,
    level: 'red',
    question: "Comment documenter les prix de transfert selon le CGI ?",
    expectedArticles: ['120-A', '120-B'],
    mustContain: ['documentation', 'méthode|OCDE'],
    category: 'Prix de transfert',
  },
  {
    id: 18,
    level: 'red',
    question: "Régime des sous-traitants pétroliers étrangers",
    expectedArticles: ['126 ter A'],
    mustContain: ['pétrolier', 'sous-traitant'],
    category: 'Régimes spéciaux',
  },
  {
    id: 19,
    level: 'red',
    question: "Quelles sont les sanctions en matière de prix de transfert ?",
    expectedArticles: ['120-D'],
    mustContain: ['5 000 000|25 000 000', 'amende|sanction'],
    category: 'Prix de transfert',
  },
  {
    id: 20,
    level: 'red',
    question: "Régime fiscal des quartiers généraux CEMAC",
    expectedArticles: ['126-C-1', '126-C-2'],
    mustContain: ['quartier général|QG', 'CEMAC|forfaitaire'],
    category: 'Régimes spéciaux',
  },
];

// Export
export const IS_QUESTIONS: TestQuestion[] = [
  ...GREEN_QUESTIONS_IS,
  ...YELLOW_QUESTIONS_IS,
  ...RED_QUESTIONS_IS,
];

export const IS_QUESTIONS_BY_LEVEL: Record<string, TestQuestion[]> = {
  green: GREEN_QUESTIONS_IS,
  yellow: YELLOW_QUESTIONS_IS,
  red: RED_QUESTIONS_IS,
};

export const QUICK_IS_IDS = [1, 2, 4, 6, 7, 11, 14, 16];
export const QUICK_IS_QUESTIONS = IS_QUESTIONS.filter(q => QUICK_IS_IDS.includes(q.id));
