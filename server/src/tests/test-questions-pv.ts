// server/src/tests/test-questions-pv.ts
// Questions de test pour le Chapitre 7 - Plus-values titres, BTP, Réassurance (CGI 2025)

import { TestQuestion, TestLevel } from './test-questions-data.js';

// ==================== PLUS-VALUES SUR TITRES (Art. 185 quater) ====================
const GREEN_QUESTIONS_PV: TestQuestion[] = [
  {
    id: 1,
    level: 'green',
    question: 'Les plus-values de cession de titres par des non-residents sont-elles imposables au Congo ?',
    expectedArticles: ['185 quater-A'],
    mustContain: ['oui', 'impot special|plus-values'],
    category: 'Plus-values titres - Principe',
  },
  {
    id: 2,
    level: 'green',
    question: 'Quel est le taux d\'imposition des plus-values de cession de titres pour les non-residents ?',
    expectedArticles: ['185 quater-B'],
    mustContain: ['20%|vingt pourcent'],
    category: 'Plus-values titres - Taux',
  },
  {
    id: 3,
    level: 'green',
    question: 'Quand doit etre paye l\'impot sur les plus-values de cession de titres ?',
    expectedArticles: ['185 quater-B'],
    mustContain: ['enregistrement', 'acte cession|cession'],
    category: 'Plus-values titres - Paiement',
  },
  {
    id: 4,
    level: 'green',
    question: 'L\'impot de 20% sur les plus-values de titres est-il definitif ?',
    expectedArticles: ['185 quater-B'],
    mustContain: ['liberatoire', 'oui'],
    category: 'Plus-values titres - Liberatoire',
  },
];

const YELLOW_QUESTIONS_PV: TestQuestion[] = [
  {
    id: 5,
    level: 'yellow',
    question: 'Qui est responsable du paiement de l\'impot sur les plus-values de titres ?',
    expectedArticles: ['185 quater-C'],
    mustContain: ['solidairement|solidarite', 'cedant|cessionnaire'],
    category: 'Plus-values titres - Solidarite',
  },
  {
    id: 6,
    level: 'yellow',
    question: 'Sur quelle base est calcule l\'impot de 20% sur les plus-values de titres ?',
    expectedArticles: ['185 quater-A'],
    mustContain: ['plus-value|fraction', 'prix cession|prix acquisition'],
    category: 'Plus-values titres - Assiette',
  },
];

// ==================== BTP - SOUS-TRAITANTS (Art. 185 quinquies) ====================
const GREEN_QUESTIONS_BTP: TestQuestion[] = [
  {
    id: 7,
    level: 'green',
    question: 'Les entreprises de BTP doivent-elles prelever une retenue sur les paiements aux sous-traitants ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['oui', 'retenue|prelevement'],
    category: 'BTP - Principe',
  },
  {
    id: 8,
    level: 'green',
    question: 'Quels sont les taux de retenue sur les sous-traitants BTP ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['3%', '10%'],
    category: 'BTP - Taux',
  },
  {
    id: 9,
    level: 'green',
    question: 'Le sous-traitant BTP a-t-il des obligations d\'enregistrement ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['oui', 'enregistrement|enregistrer', 'contrat'],
    category: 'BTP - Enregistrement',
  },
  {
    id: 10,
    level: 'green',
    question: 'Les bureaux d\'etudes sont-ils concernes par la retenue BTP ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['oui', 'bureaux etudes|bureaux d\'etudes'],
    category: 'BTP - Bureaux etudes',
  },
  {
    id: 11,
    level: 'green',
    question: 'La retenue BTP s\'applique-t-elle aux marches prives ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['oui', 'marches prives|prives'],
    category: 'BTP - Marches prives',
  },
  {
    id: 12,
    level: 'green',
    question: 'Quel format pour la declaration trimestrielle des sous-traitants ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['trimestriel', 'liste|format'],
    category: 'BTP - Declaration trimestrielle',
  },
];

const YELLOW_QUESTIONS_BTP: TestQuestion[] = [
  {
    id: 13,
    level: 'yellow',
    question: 'Quelles sont les obligations de l\'entrepreneur principal en BTP ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['retenue|prelever', 'trimestriel|liste', 'enregistrement|enregistrer'],
    category: 'BTP - Obligations entrepreneur',
  },
  {
    id: 14,
    level: 'yellow',
    question: 'La retenue BTP est-elle un impot definitif pour le sous-traitant ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['non', 'acompte'],
    category: 'BTP - Nature retenue',
  },
  {
    id: 15,
    level: 'yellow',
    question: 'Quelles sanctions en cas de defaut de retenue BTP ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['5 000 000|5000000', 'deductibilite|perte'],
    category: 'BTP - Sanctions defaut',
  },
  {
    id: 16,
    level: 'yellow',
    question: 'Quelle penalite en cas de retard de versement de la retenue BTP ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['2%', 'mois', '100%'],
    category: 'BTP - Sanctions retard',
  },
  {
    id: 17,
    level: 'yellow',
    question: 'Comment et quand verser la retenue BTP ?',
    expectedArticles: ['185 quinquies'],
    mustContain: ['20 jours', 'bordereau|Art. 172|Art. 173'],
    category: 'BTP - Versement',
  },
];

// ==================== REASSURANCE (Art. 185 sexies) ====================
const GREEN_QUESTIONS_REASSURANCE: TestQuestion[] = [
  {
    id: 18,
    level: 'green',
    question: 'Quel est le taux de retenue sur les primes de reassurance hors CIMA ?',
    expectedArticles: ['185 sexies'],
    mustContain: ['20%|vingt pourcent'],
    category: 'Reassurance - Taux',
  },
];

const YELLOW_QUESTIONS_REASSURANCE: TestQuestion[] = [
  {
    id: 19,
    level: 'yellow',
    question: 'Les primes de reassurance sont-elles soumises a retenue ?',
    expectedArticles: ['185 sexies'],
    mustContain: ['oui', 'CIMA|Art. 308', '20%'],
    category: 'Reassurance - Principe',
  },
];

const RED_QUESTIONS_REASSURANCE: TestQuestion[] = [
  {
    id: 20,
    level: 'red',
    question: 'L\'autorisation du Ministre des assurances exonere-t-elle de la retenue reassurance ?',
    expectedArticles: ['185 sexies'],
    mustContain: ['non', 'nonobstant|malgre'],
    category: 'Reassurance - Autorisation',
  },
];

// Export complet
export const PV_QUESTIONS: TestQuestion[] = [
  ...GREEN_QUESTIONS_PV,
  ...YELLOW_QUESTIONS_PV,
  ...GREEN_QUESTIONS_BTP,
  ...YELLOW_QUESTIONS_BTP,
  ...GREEN_QUESTIONS_REASSURANCE,
  ...YELLOW_QUESTIONS_REASSURANCE,
  ...RED_QUESTIONS_REASSURANCE,
];

export const PV_QUESTIONS_BY_LEVEL: Record<string, TestQuestion[]> = {
  green: [
    ...GREEN_QUESTIONS_PV,
    ...GREEN_QUESTIONS_BTP,
    ...GREEN_QUESTIONS_REASSURANCE,
  ],
  yellow: [
    ...YELLOW_QUESTIONS_PV,
    ...YELLOW_QUESTIONS_BTP,
    ...YELLOW_QUESTIONS_REASSURANCE,
  ],
  red: RED_QUESTIONS_REASSURANCE,
  black: [],
};

export const PV_QUESTIONS_BY_SECTION: Record<string, TestQuestion[]> = {
  plus_values: [...GREEN_QUESTIONS_PV, ...YELLOW_QUESTIONS_PV],
  btp: [...GREEN_QUESTIONS_BTP, ...YELLOW_QUESTIONS_BTP],
  reassurance: [...GREEN_QUESTIONS_REASSURANCE, ...YELLOW_QUESTIONS_REASSURANCE, ...RED_QUESTIONS_REASSURANCE],
};

export const QUICK_PV_IDS = [2, 8, 15, 18];
export const QUICK_PV_QUESTIONS = PV_QUESTIONS.filter(q => QUICK_PV_IDS.includes(q.id));
