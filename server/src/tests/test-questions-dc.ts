// server/src/tests/test-questions-dc.ts
// Questions de test pour valider le RAG CGI 2025 - Chapitre 4 (Dispositions Communes)

import { TestQuestion, TestLevel } from './test-questions-data.js';

// ==================== REVISION DES BILANS ====================
const GREEN_QUESTIONS_REVISION: TestQuestion[] = [
  {
    id: 1,
    level: 'green',
    question: "Les plus-values de reevaluation de bilan sont-elles imposables ?",
    expectedArticles: ['127'],
    mustContain: ['31 decembre 1964|droit commun', 'plus-values|reevaluation'],
    category: 'Revision des bilans',
  },
  {
    id: 2,
    level: 'green',
    question: "Une societe sous contrat de partage de production peut-elle beneficier d'un autre regime privilegie ?",
    expectedArticles: ['127 quinquies'],
    mustContain: ['non', 'CPP|contrat partage|convention', '2021'],
    category: 'Regimes derogatoires',
  },
];

// ==================== PROVISIONS MINIERES - PRINCIPE ====================
const GREEN_QUESTIONS_PROVISIONS: TestQuestion[] = [
  {
    id: 3,
    level: 'green',
    question: "Qu'est-ce que la provision pour reconstitution des gisements ?",
    expectedArticles: ['133'],
    mustContain: ['provision', 'franchise|exonere', 'substances minerales|gisements'],
    category: 'Provisions minieres',
  },
  {
    id: 4,
    level: 'green',
    question: "Dans quel delai la provision pour reconstitution des gisements doit-elle etre utilisee ?",
    expectedArticles: ['136'],
    mustContain: ['5 ans|cinq ans', 'delai|utilisation'],
    category: 'Hydrocarbures - Utilisation',
  },
  {
    id: 5,
    level: 'green',
    question: "Quel est le taux limite de la provision pour les substances minerales autres que les hydrocarbures ?",
    expectedArticles: ['140'],
    mustContain: ['15%', 'substances minerales|minerais'],
    category: 'Substances minerales',
  },
];

// ==================== HYDROCARBURES - LIMITES ====================
const YELLOW_QUESTIONS_HYDROCARBURES: TestQuestion[] = [
  {
    id: 6,
    level: 'yellow',
    question: "Quelles sont les deux limites de la provision pour reconstitution des gisements d'hydrocarbures ?",
    expectedArticles: ['134'],
    mustContain: ['27,5%|27.5%|27,50%', '50%', 'ventes|benefice'],
    category: 'Hydrocarbures - Limites',
  },
  {
    id: 7,
    level: 'yellow',
    question: "Comment est calcule le montant des ventes pour la limite de 27,50% ?",
    expectedArticles: ['134'],
    mustContain: ['petrole brut|gaz naturel', 'ventes', 'redevances minieres'],
    category: 'Hydrocarbures - Base de calcul',
  },
  {
    id: 8,
    level: 'yellow',
    question: "Comment sont traites les deficits d'exploitation pour le calcul de la provision hydrocarbures ?",
    expectedArticles: ['134'],
    mustContain: ['deficit', 'report|deductible', '5 exercices|5eme'],
    category: 'Hydrocarbures - Deficits',
  },
  {
    id: 9,
    level: 'yellow',
    question: "A quoi peut etre utilisee la provision pour reconstitution des gisements d'hydrocarbures ?",
    expectedArticles: ['136'],
    mustContain: ['travaux|recherche|immobilisations', 'participations|actions'],
    category: 'Hydrocarbures - Utilisation',
  },
  {
    id: 10,
    level: 'yellow',
    question: "Que se passe-t-il si la provision est utilisee conformement aux regles ?",
    expectedArticles: ['137'],
    mustContain: ['exoneration definitive|definitivement', 'reserve|virement'],
    category: 'Hydrocarbures - Remploi conforme',
  },
  {
    id: 11,
    level: 'yellow',
    question: "Quelle est la sanction en cas de non-utilisation de la provision dans les delais ?",
    expectedArticles: ['137'],
    mustContain: ['imposition complementaire', 'defaut|non-utilisation'],
    category: 'Hydrocarbures - Defaut remploi',
  },
];

// ==================== HYDROCARBURES - QUESTIONS COMPLEXES ====================
const RED_QUESTIONS_HYDROCARBURES: TestQuestion[] = [
  {
    id: 12,
    level: 'red',
    question: "Que devient la provision en cas de cession d'entreprise ?",
    expectedArticles: ['138'],
    mustContain: ['cession|cessation', 'imposable|imposition', 'continuation|nouvel exploitant'],
    category: 'Hydrocarbures - Cession',
  },
  {
    id: 13,
    level: 'red',
    question: "La provision est-elle imposable en cas de deces de l'exploitant ?",
    expectedArticles: ['138'],
    mustContain: ['deces', 'oui|imposable', 'heritiers|conjoint'],
    category: 'Hydrocarbures - Deces',
  },
  {
    id: 14,
    level: 'red',
    question: "La provision peut-elle financer des travaux sur un gisement reconnu ?",
    expectedArticles: ['136'],
    mustContain: ['non|exclusion', 'gisement reconnu', 'titre exploitation'],
    category: 'Hydrocarbures - Exclusions',
  },
  {
    id: 15,
    level: 'red',
    question: "Lors d'une fusion, que doit faire la societe absorbante concernant la provision ?",
    expectedArticles: ['138'],
    mustContain: ['fusion', 'societe absorbante', 'passif|inscrire', 'delai'],
    category: 'Hydrocarbures - Fusion',
  },
  {
    id: 16,
    level: 'red',
    question: "Le benefice net servant au calcul de la provision inclut-il les provisions anterieures reprises ?",
    expectedArticles: ['134'],
    mustContain: ['non', 'benefice net', 'provisions anterieures|reintegration'],
    category: 'Hydrocarbures - Benefice net',
  },
];

// ==================== SUBSTANCES MINERALES ====================
const YELLOW_QUESTIONS_MINERAUX: TestQuestion[] = [
  {
    id: 17,
    level: 'yellow',
    question: "Quels produits sont pris en compte pour le calcul de la provision sur substances minerales ?",
    expectedArticles: ['140'],
    mustContain: ['minerais', 'mattes|speiss|metaux|alliages'],
    category: 'Substances minerales - Produits',
  },
  {
    id: 18,
    level: 'yellow',
    question: "La provision pour substances minerales peut-elle etre utilisee pour des travaux sur gisements existants ?",
    expectedArticles: ['140'],
    mustContain: ['oui', 'gisements existants|mise en exploitation|recuperation'],
    category: 'Substances minerales - Utilisation',
  },
  {
    id: 19,
    level: 'yellow',
    question: "Les provisions minieres sont-elles cumulables avec les reductions pour investissement ?",
    expectedArticles: ['140 bis'],
    mustContain: ['non', 'cumul|cumulable', 'reductions investissement'],
    category: 'Non-cumul',
  },
];

// ==================== OBLIGATIONS DECLARATIVES ====================
const YELLOW_QUESTIONS_OBLIGATIONS: TestQuestion[] = [
  {
    id: 20,
    level: 'yellow',
    question: "Quels renseignements les entreprises petrolieres doivent-elles fournir a l'administration ?",
    expectedArticles: ['139'],
    mustContain: ['ventes|montant', 'benefice net', 'declaration|renseignements'],
    category: 'Hydrocarbures - Obligations',
  },
  {
    id: 21,
    level: 'yellow',
    question: "Comment la provision pour reconstitution des gisements doit-elle etre inscrite au bilan ?",
    expectedArticles: ['135'],
    mustContain: ['passif', 'bilan', 'rubrique speciale|dotations'],
    category: 'Hydrocarbures - Bilan',
  },
];

// ==================== QUESTIONS SPECIALES ====================
const BLACK_QUESTIONS_DC: TestQuestion[] = [
  {
    id: 22,
    level: 'black',
    question: "Les redevances minieres sont-elles deduites pour le calcul de la provision ?",
    expectedArticles: ['134'],
    mustContain: ['non|pas deduites|exception', 'redevances minieres'],
    category: 'Hydrocarbures - Redevances',
  },
  {
    id: 23,
    level: 'black',
    question: "Les subventions liees a la production sont-elles incluses dans la base de calcul de la provision ?",
    expectedArticles: ['134'],
    mustContain: ['oui', 'subventions', 'quantites extraites'],
    category: 'Hydrocarbures - Subventions',
  },
  {
    id: 24,
    level: 'black',
    question: "La section sur les reductions pour investissement est-elle encore applicable ?",
    expectedArticles: ['128', '129', '130', '131', '132'],
    mustContain: ['non|abroge', 'reductions investissement'],
    category: 'Reductions investissement',
  },
  {
    id: 25,
    level: 'black',
    question: "Qu'entend-on par 'participations' pour l'utilisation de la provision hydrocarbures ?",
    expectedArticles: ['136'],
    mustContain: ['actions', 'parts|interets', 'avances|societes'],
    category: 'Hydrocarbures - Participations',
  },
];

// Export complet
export const DC_QUESTIONS: TestQuestion[] = [
  ...GREEN_QUESTIONS_REVISION,
  ...GREEN_QUESTIONS_PROVISIONS,
  ...YELLOW_QUESTIONS_HYDROCARBURES,
  ...RED_QUESTIONS_HYDROCARBURES,
  ...YELLOW_QUESTIONS_MINERAUX,
  ...YELLOW_QUESTIONS_OBLIGATIONS,
  ...BLACK_QUESTIONS_DC,
];

export const DC_QUESTIONS_BY_LEVEL: Record<string, TestQuestion[]> = {
  green: [...GREEN_QUESTIONS_REVISION, ...GREEN_QUESTIONS_PROVISIONS],
  yellow: [...YELLOW_QUESTIONS_HYDROCARBURES, ...YELLOW_QUESTIONS_MINERAUX, ...YELLOW_QUESTIONS_OBLIGATIONS],
  red: RED_QUESTIONS_HYDROCARBURES,
  black: BLACK_QUESTIONS_DC,
};

export const DC_QUESTIONS_BY_SECTION: Record<string, TestQuestion[]> = {
  revision: GREEN_QUESTIONS_REVISION,
  provisions: GREEN_QUESTIONS_PROVISIONS,
  hydrocarbures: [...YELLOW_QUESTIONS_HYDROCARBURES, ...RED_QUESTIONS_HYDROCARBURES, ...YELLOW_QUESTIONS_OBLIGATIONS],
  mineraux: YELLOW_QUESTIONS_MINERAUX,
  special: BLACK_QUESTIONS_DC,
};

export const QUICK_DC_IDS = [2, 3, 4, 6, 11, 12, 17, 19];
export const QUICK_DC_QUESTIONS = DC_QUESTIONS.filter(q => QUICK_DC_IDS.includes(q.id));
