// server/src/tests/test-questions-iba-2026.ts
// Questions de test pour valider le RAG CGI 2026 - Chapitre 2 (IBA, IRCM, IRF, ITS)

import { TestQuestion, TestLevel } from './test-questions-data.js';

// ==================== IBA ====================
const GREEN_QUESTIONS_IBA: TestQuestion[] = [
  {
    id: 1,
    level: 'green',
    question: "Qu'est-ce que l'IBA et qui y est soumis ?",
    expectedArticles: ['93'],
    mustContain: ['IBA', 'personnes physiques', 'benefices|lucratif'],
    category: 'IBA - Principe',
  },
  {
    id: 2,
    level: 'green',
    question: "Quel est le taux de l'IBA et le minimum de perception ?",
    expectedArticles: ['95'],
    mustContain: ['30%', '1,5%|minimum'],
    category: 'IBA - Taux',
  },
  {
    id: 3,
    level: 'green',
    question: "Quelle comptabilite doivent tenir les contribuables IBA ?",
    expectedArticles: ['94B'],
    mustContain: ['SYSCOHADA', 'comptabilite|engagement|caisse'],
    category: 'IBA - Comptabilite',
  },
  {
    id: 4,
    level: 'green',
    question: "Quels criteres definissent la residence habituelle au Congo ?",
    expectedArticles: ['93B'],
    mustContain: ['24 mois', 'residence|habitation'],
    category: 'IBA - Residence fiscale',
  },
];

const YELLOW_QUESTIONS_IBA: TestQuestion[] = [
  {
    id: 5,
    level: 'yellow',
    question: "Quels types de revenus sont imposables a l'IBA ?",
    expectedArticles: ['93A'],
    mustContain: ['BIC', 'BNC|professions liberales', 'propriete intellectuelle'],
    category: 'IBA - Revenus imposables',
  },
  {
    id: 6,
    level: 'yellow',
    question: "Les prelevements de l'exploitant sont-ils deductibles ?",
    expectedArticles: ['94A'],
    mustContain: ['non|pas deductible', 'prelevements|50%|representation'],
    category: 'IBA - Charges non deductibles',
  },
  {
    id: 7,
    level: 'yellow',
    question: "Quelles sont les particularites de la determination du benefice IBA par rapport a l'IS ?",
    expectedArticles: ['94'],
    mustContain: ['amortissement lineaire|3 exercices|provision'],
    category: 'IBA - Benefice imposable',
  },
  {
    id: 8,
    level: 'yellow',
    question: "Que se passe-t-il pour la plus-value en cas de deces de l'exploitant ?",
    expectedArticles: ['95A'],
    mustContain: ['deces', 'plus-value', 'report|heritier'],
    category: 'IBA - Deces exploitant',
  },
];

// ==================== FORFAIT ====================
const GREEN_QUESTIONS_FORFAIT: TestQuestion[] = [
  {
    id: 9,
    level: 'green',
    question: "Qui est soumis au regime du forfait ?",
    expectedArticles: ['96'],
    mustContain: ['forfait', 'seuil TVA|CA'],
    category: 'Forfait - Champ',
  },
  {
    id: 10,
    level: 'green',
    question: "Quelles obligations comptables pour les contribuables au forfait ?",
    expectedArticles: ['96A'],
    mustContain: ['SMT', 'registres|paraphe'],
    category: 'Forfait - Obligations',
  },
  {
    id: 11,
    level: 'green',
    question: "Quelles sanctions pour defaut de tenue des registres au forfait ?",
    expectedArticles: ['98', '99'],
    mustContain: ['100 000|500 000', 'amende|taxation d\'office'],
    category: 'Forfait - Sanctions',
  },
];

const YELLOW_QUESTIONS_FORFAIT: TestQuestion[] = [
  {
    id: 12,
    level: 'yellow',
    question: "Un contribuable au forfait peut-il opter pour le regime reel ?",
    expectedArticles: ['96'],
    mustContain: ['1er fevrier|3 ans|irrevocable'],
    category: 'Forfait - Option',
  },
  {
    id: 13,
    level: 'yellow',
    question: "Comment est evalue le benefice au forfait ?",
    expectedArticles: ['97'],
    mustContain: ['evaluation', '30 jours|commission'],
    category: 'Forfait - Evaluation',
  },
  {
    id: 14,
    level: 'yellow',
    question: "Quand un contribuable au forfait passe-t-il automatiquement au regime reel ?",
    expectedArticles: ['96'],
    mustContain: ['CA|2 exercices|premier exercice'],
    category: 'Forfait - Passage au reel',
  },
];

// ==================== REGIME REEL ====================
const GREEN_QUESTIONS_REEL: TestQuestion[] = [
  {
    id: 15,
    level: 'green',
    question: "Qui est soumis au regime reel ?",
    expectedArticles: ['102'],
    mustContain: ['regime reel', 'seuil TVA|CA'],
    category: 'Regime reel - Champ',
  },
  {
    id: 16,
    level: 'green',
    question: "Pendant combien de temps les documents comptables doivent-ils etre conserves ?",
    expectedArticles: ['104'],
    mustContain: ['10 ans', 'conserv|documents'],
    category: 'Regime reel - Conservation',
  },
];

const YELLOW_QUESTIONS_REEL: TestQuestion[] = [
  {
    id: 17,
    level: 'yellow',
    question: "La teledeclaration est-elle obligatoire au regime reel ?",
    expectedArticles: ['103'],
    mustContain: ['teledeclaration', '10%|expert-comptable'],
    category: 'Regime reel - Teledeclaration',
  },
  {
    id: 18,
    level: 'yellow',
    question: "Quels documents doivent accompagner la declaration au regime reel ?",
    expectedArticles: ['104'],
    mustContain: ['etats financiers|OHADA|3 jeux|declaration statistique'],
    category: 'Regime reel - Documents',
  },
];

// ==================== IRCM ====================
const GREEN_QUESTIONS_IRCM: TestQuestion[] = [
  {
    id: 19,
    level: 'green',
    question: "Quels revenus sont soumis a l'IRCM ?",
    expectedArticles: ['105'],
    mustContain: ['IRCM', 'valeurs mobilieres|obligations|creances|dividendes'],
    category: 'IRCM - Champ',
  },
  {
    id: 20,
    level: 'green',
    question: "Quel est le taux de l'IRCM ?",
    expectedArticles: ['110'],
    mustContain: ['15%', '35%|revenus occultes'],
    category: 'IRCM - Taux',
  },
  {
    id: 21,
    level: 'green',
    question: "Quand intervient le fait generateur de l'IRCM sur dividendes ?",
    expectedArticles: ['108'],
    mustContain: ['fait generateur|distribution', '3 mois'],
    category: 'IRCM - Fait generateur',
  },
];

const YELLOW_QUESTIONS_IRCM: TestQuestion[] = [
  {
    id: 22,
    level: 'yellow',
    question: "Les plus-values de cession d'actions sont-elles soumises a l'IRCM ?",
    expectedArticles: ['105E'],
    mustContain: ['oui|plus-values', 'cession|actions|parts'],
    category: 'IRCM - Plus-values',
  },
  {
    id: 23,
    level: 'yellow',
    question: "Les moins-values mobilieres peuvent-elles etre imputees ?",
    expectedArticles: ['109'],
    mustContain: ['oui|imputation', '3 ans'],
    category: 'IRCM - Moins-values',
  },
  {
    id: 24,
    level: 'yellow',
    question: "Quand l'IRCM est-il du au Congo sur les plus-values de cession de titres ?",
    expectedArticles: ['107'],
    mustContain: ['10%', '365 jours'],
    category: 'IRCM - Territorialite',
  },
  {
    id: 25,
    level: 'yellow',
    question: "Dans quel delai doit-on declarer une plus-value de cession de titres ?",
    expectedArticles: ['110A'],
    mustContain: ['60 jours', 'cedant'],
    category: 'IRCM - Declaration',
  },
];

const RED_QUESTIONS_IRCM: TestQuestion[] = [
  {
    id: 26,
    level: 'red',
    question: "Les remboursements d'apports sont-ils soumis a l'IRCM ?",
    expectedArticles: ['105B'],
    mustContain: ['non|exclusion', 'remboursement apports|primes emission'],
    category: 'IRCM - Exclusions',
  },
  {
    id: 27,
    level: 'red',
    question: "Les attributions gratuites d'actions lors d'une fusion sont-elles imposables ?",
    expectedArticles: ['106'],
    mustContain: ['non|exoneration', 'fusion|attribution'],
    category: 'IRCM - Exonerations',
  },
  {
    id: 28,
    level: 'red',
    question: "Quels sont les revenus de valeurs mobilieres imposables a l'IRCM ?",
    expectedArticles: ['105A'],
    mustContain: ['dividendes|distribues', 'administrateurs|avances|reputes'],
    category: 'IRCM - Revenus imposables',
  },
];

// ==================== IRF ====================
const GREEN_QUESTIONS_IRF: TestQuestion[] = [
  {
    id: 29,
    level: 'green',
    question: "Quels revenus sont soumis a l'IRF ?",
    expectedArticles: ['111'],
    mustContain: ['IRF', 'revenus fonciers|proprietes|loyers'],
    category: 'IRF - Champ',
  },
  {
    id: 30,
    level: 'green',
    question: "Quels sont les taux de l'IRF ?",
    expectedArticles: ['113'],
    acceptableArticles: ['112'],
    mustContain: ['9%', '15%|loyers|plus-values'],
    category: 'IRF - Taux',
  },
  {
    id: 31,
    level: 'green',
    question: "La plus-value de cession de la residence principale est-elle exoneree ?",
    expectedArticles: ['111C'],
    mustContain: ['oui|exoner', '5 ans|residence principale'],
    category: 'IRF - Exonerations',
  },
];

const YELLOW_QUESTIONS_IRF: TestQuestion[] = [
  {
    id: 32,
    level: 'yellow',
    question: "Quand la retenue a la source sur les loyers est-elle obligatoire ?",
    expectedArticles: ['113A'],
    mustContain: ['retenue source', '15 mars|3 mois'],
    category: 'IRF - Retenue source',
  },
  {
    id: 33,
    level: 'yellow',
    question: "Pour qui la retenue sur loyers est-elle liberatoire ?",
    expectedArticles: ['113A'],
    mustContain: ['liberatoire', 'personnes physiques|non-residents|forfait'],
    category: 'IRF - Retenue liberatoire',
  },
  {
    id: 34,
    level: 'yellow',
    question: "Comment est calculee la plus-value immobiliere imposable ?",
    expectedArticles: ['112A'],
    mustContain: ['prix cession|prix acquisition', 'frais'],
    category: 'IRF - Plus-value',
  },
];

const RED_QUESTIONS_IRF: TestQuestion[] = [
  {
    id: 35,
    level: 'red',
    question: "Qu'est-ce qu'une societe a preponderance immobiliere ?",
    expectedArticles: ['111B'],
    mustContain: ['50%', 'actif|365 jours|immeubles'],
    category: 'IRF - Preponderance immobiliere',
  },
  {
    id: 36,
    level: 'red',
    question: "Comment sont imposes les associes de societes a preponderance fonciere ?",
    expectedArticles: ['111A'],
    mustContain: ['80%', 'revenus fonciers|associes|IRF'],
    category: 'IRF - Preponderance fonciere',
  },
  {
    id: 37,
    level: 'red',
    question: "Les licences d'exploitation sont-elles considerees comme des immeubles ?",
    expectedArticles: ['111B'],
    mustContain: ['oui', 'immeubles|licences|ressources naturelles'],
    category: 'IRF - Definition immeubles',
  },
  {
    id: 38,
    level: 'red',
    question: "Qui est responsable du paiement de l'IRF sur plus-values immobilieres ?",
    expectedArticles: ['113'],
    mustContain: ['cedant|cessionnaire', 'solidaire'],
    category: 'IRF - Responsabilite',
  },
];

// ==================== ITS ====================
const GREEN_QUESTIONS_ITS: TestQuestion[] = [
  {
    id: 39,
    level: 'green',
    question: "Quels revenus sont soumis a l'ITS ?",
    expectedArticles: ['114'],
    mustContain: ['ITS', 'salaires|traitements|pensions'],
    category: 'ITS - Champ',
  },
  {
    id: 40,
    level: 'green',
    question: "Combien de jours de presence conferent la residence fiscale pour l'ITS ?",
    expectedArticles: ['114D'],
    mustContain: ['183 jours', '12 mois'],
    category: 'ITS - Territorialite',
  },
  {
    id: 41,
    level: 'green',
    question: "Quel est le bareme progressif de l'ITS ?",
    expectedArticles: ['116'],
    mustContain: ['10%', '15%', '20%', '30%'],
    category: 'ITS - Bareme',
  },
];

const YELLOW_QUESTIONS_ITS: TestQuestion[] = [
  {
    id: 42,
    level: 'yellow',
    question: "Comment est evalue l'avantage en nature logement ?",
    expectedArticles: ['115'],
    mustContain: ['20%', 'logement|salaire'],
    category: 'ITS - Avantages en nature',
  },
  {
    id: 43,
    level: 'yellow',
    question: "Les indemnites de licenciement sont-elles imposables ?",
    expectedArticles: ['114A'],
    mustContain: ['non|exoner', 'licenciement|plan social'],
    category: 'ITS - Exonerations',
  },
  {
    id: 44,
    level: 'yellow',
    question: "Les diplomates etrangers sont-ils exoneres d'ITS ?",
    expectedArticles: ['114B'],
    mustContain: ['oui|exoner', 'reciprocite|Convention de Vienne'],
    category: 'ITS - Diplomates',
  },
  {
    id: 45,
    level: 'yellow',
    question: "Les primes de mutuelles payees par l'employeur sont-elles imposables ?",
    expectedArticles: ['115'],
    mustContain: ['non|pas imposable', 'mutuelles'],
    category: 'ITS - Mutuelles',
  },
];

const RED_QUESTIONS_ITS: TestQuestion[] = [
  {
    id: 46,
    level: 'red',
    question: "La retenue ITS est-elle liberatoire ?",
    expectedArticles: ['116'],
    mustContain: ['non|pas liberatoire', 'plusieurs sources|declaration annuelle'],
    category: 'ITS - Retenue source',
  },
  {
    id: 47,
    level: 'red',
    question: "Comment sont imposes les revenus de source etrangere a l'ITS ?",
    expectedArticles: ['115'],
    mustContain: ['montant net|etranger', 'conventions'],
    category: 'ITS - Revenus etrangers',
  },
];

// Export complet
export const IBA_2026_QUESTIONS: TestQuestion[] = [
  ...GREEN_QUESTIONS_IBA,
  ...YELLOW_QUESTIONS_IBA,
  ...GREEN_QUESTIONS_FORFAIT,
  ...YELLOW_QUESTIONS_FORFAIT,
  ...GREEN_QUESTIONS_REEL,
  ...YELLOW_QUESTIONS_REEL,
  ...GREEN_QUESTIONS_IRCM,
  ...YELLOW_QUESTIONS_IRCM,
  ...RED_QUESTIONS_IRCM,
  ...GREEN_QUESTIONS_IRF,
  ...YELLOW_QUESTIONS_IRF,
  ...RED_QUESTIONS_IRF,
  ...GREEN_QUESTIONS_ITS,
  ...YELLOW_QUESTIONS_ITS,
  ...RED_QUESTIONS_ITS,
];

export const IBA_2026_QUESTIONS_BY_LEVEL: Record<string, TestQuestion[]> = {
  green: [
    ...GREEN_QUESTIONS_IBA,
    ...GREEN_QUESTIONS_FORFAIT,
    ...GREEN_QUESTIONS_REEL,
    ...GREEN_QUESTIONS_IRCM,
    ...GREEN_QUESTIONS_IRF,
    ...GREEN_QUESTIONS_ITS,
  ],
  yellow: [
    ...YELLOW_QUESTIONS_IBA,
    ...YELLOW_QUESTIONS_FORFAIT,
    ...YELLOW_QUESTIONS_REEL,
    ...YELLOW_QUESTIONS_IRCM,
    ...YELLOW_QUESTIONS_IRF,
    ...YELLOW_QUESTIONS_ITS,
  ],
  red: [
    ...RED_QUESTIONS_IRCM,
    ...RED_QUESTIONS_IRF,
    ...RED_QUESTIONS_ITS,
  ],
};

export const IBA_2026_QUESTIONS_BY_SECTION: Record<string, TestQuestion[]> = {
  iba: [...GREEN_QUESTIONS_IBA, ...YELLOW_QUESTIONS_IBA],
  forfait: [...GREEN_QUESTIONS_FORFAIT, ...YELLOW_QUESTIONS_FORFAIT],
  reel: [...GREEN_QUESTIONS_REEL, ...YELLOW_QUESTIONS_REEL],
  ircm: [...GREEN_QUESTIONS_IRCM, ...YELLOW_QUESTIONS_IRCM, ...RED_QUESTIONS_IRCM],
  irf: [...GREEN_QUESTIONS_IRF, ...YELLOW_QUESTIONS_IRF, ...RED_QUESTIONS_IRF],
  its: [...GREEN_QUESTIONS_ITS, ...YELLOW_QUESTIONS_ITS, ...RED_QUESTIONS_ITS],
};

export const QUICK_IBA_2026_IDS = [1, 2, 9, 15, 19, 20, 29, 30, 39, 41];
export const QUICK_IBA_2026_QUESTIONS = IBA_2026_QUESTIONS.filter(q => QUICK_IBA_2026_IDS.includes(q.id));
