// server/src/tests/test-questions-is-2026.ts
// Questions de test pour valider le RAG CGI 2026 - Chapitre IS

import { TestQuestion, TestLevel } from './test-questions-data.js';

// Niveau 1 - Questions factuelles directes IS 2026
const GREEN_QUESTIONS_IS_2026: TestQuestion[] = [
  {
    id: 1,
    level: 'green',
    question: "Quel est le taux normal de l'impot sur les societes au Congo en 2026 ?",
    expectedArticles: ['86A'],
    mustContain: ['25%', 'taux'],
    category: 'Taux IS',
  },
  {
    id: 2,
    level: 'green',
    question: "Quelles sont les societes imposables a l'IS en raison de leur forme ?",
    expectedArticles: ['2'],
    mustContain: ['SA', 'SAS', 'SARL', 'societes de capitaux|capitaux'],
    category: 'Personnes imposables',
  },
  {
    id: 3,
    level: 'green',
    question: "Les cooperatives agricoles sont-elles exonerees d'IS ?",
    expectedArticles: ['3'],
    mustContain: ['exonere|exoneration', 'cooperative'],
    category: 'Exonerations',
  },
  {
    id: 4,
    level: 'green',
    question: "Quel est le taux de retenue a la source sur les prestations de services rendues par des non-residents ?",
    expectedArticles: ['86C'],
    mustContain: ['20%', 'retenue|non-resident'],
    category: 'Retenues a la source',
  },
  {
    id: 5,
    level: 'green',
    question: "Quel est le taux d'amortissement des logiciels informatiques ?",
    expectedArticles: ['52'],
    mustContain: ['50%', 'logiciel'],
    category: 'Amortissements',
  },
  {
    id: 6,
    level: 'green',
    question: "Quelle est la duree du report deficitaire pour l'IS ?",
    expectedArticles: ['75'],
    mustContain: ['5 ans|5 exercices|cinq'],
    category: 'Report deficitaire',
  },
  {
    id: 7,
    level: 'green',
    question: "Quel est le seuil de documentation des prix de transfert ?",
    expectedArticles: ['81'],
    mustContain: ['500 000 000|500 millions|cinq cents millions'],
    category: 'Prix de transfert',
  },
  {
    id: 8,
    level: 'green',
    question: "Quelles sont les dates des acomptes IS ?",
    expectedArticles: ['124 B'],
    acceptableArticles: ['124-B', '124B'],
    mustContain: ['fevrier|mai|aout|novembre'],
    category: 'Obligations',
  },
  {
    id: 9,
    level: 'green',
    question: "Quelle est la quote-part frais et charges du regime mere-fille ?",
    expectedArticles: ['20'],
    mustContain: ['5%', 'quote-part'],
    category: 'Regime mere-fille',
  },
  {
    id: 10,
    level: 'green',
    question: "Quel est le taux d'IS pour les entreprises non residentes CEMAC ?",
    expectedArticles: ['86A'],
    mustContain: ['33%'],
    category: 'Taux IS',
  },
  {
    id: 11,
    level: 'green',
    question: "Quel est le plafond d'amortissement des vehicules de tourisme ?",
    expectedArticles: ['59'],
    mustContain: ['40 000 000|40 millions|quarante millions'],
    category: 'Amortissements',
  },
  {
    id: 12,
    level: 'green',
    question: "Quelle est la date obligatoire de cloture des comptes ?",
    expectedArticles: ['11'],
    mustContain: ['31 decembre'],
    category: 'Obligations',
  },
];

// Niveau 2 - Questions d'application IS 2026
const YELLOW_QUESTIONS_IS_2026: TestQuestion[] = [
  {
    id: 13,
    level: 'yellow',
    question: "Comment est calcule le minimum de perception de l'IS ?",
    expectedArticles: ['86B'],
    mustContain: ['1%', 'produits|exploitation'],
    category: 'Minimum de perception',
  },
  {
    id: 14,
    level: 'yellow',
    question: "Quelles sont les conditions pour beneficier du regime mere-fille ?",
    expectedArticles: ['20'],
    mustContain: ['25%', 'participation', '365 jours|2 ans'],
    category: 'Regime mere-fille',
  },
  {
    id: 15,
    level: 'yellow',
    question: "Quelle est la limite de deductibilite des interets entre societes liees ?",
    expectedArticles: ['49'],
    mustContain: ['20%', 'EBE|excedent brut|BEAC'],
    category: 'Charges financieres',
  },
  {
    id: 16,
    level: 'yellow',
    question: "Quelles sont les conditions de l'integration fiscale ?",
    expectedArticles: ['91'],
    mustContain: ['95%', 'participation', '5 exercices'],
    category: 'Integration fiscale',
  },
  {
    id: 17,
    level: 'yellow',
    question: "Quel est le regime des holdings au Congo ?",
    expectedArticles: ['90'],
    mustContain: ['deux tiers|2/3', 'actif|portefeuille'],
    category: 'Holdings',
  },
  {
    id: 18,
    level: 'yellow',
    question: "Dans quelle limite les dons sont-ils deductibles ?",
    expectedArticles: ['45'],
    mustContain: ['0,5|0,3%', 'CA|chiffre'],
    category: 'Charges deductibles',
  },
  {
    id: 19,
    level: 'yellow',
    question: "Quelle est la duree minimale d'un chantier pour constituer un etablissement stable ?",
    expectedArticles: ['4A'],
    mustContain: ['3 mois|trois mois'],
    category: 'Territorialite',
  },
  {
    id: 20,
    level: 'yellow',
    question: "Quel est le plafond de deductibilite pour les remunerations versees a l'etranger ?",
    expectedArticles: ['38'],
    mustContain: ['20%', 'benefice|BTP|2%'],
    category: 'Charges deductibles',
  },
];

// Niveau 3 - Questions complexes IS 2026
const RED_QUESTIONS_IS_2026: TestQuestion[] = [
  {
    id: 21,
    level: 'red',
    question: "Les plus-values de fusion sont-elles imposables ?",
    expectedArticles: ['21'],
    mustContain: ['fusion', 'plus-value', 'exoner|report'],
    category: 'Restructurations',
  },
  {
    id: 22,
    level: 'red',
    question: "Comment documenter les prix de transfert selon le CGI 2026 ?",
    expectedArticles: ['81', '85'],
    mustContain: ['documentation', 'methode|OCDE|CUP'],
    category: 'Prix de transfert',
  },
  {
    id: 23,
    level: 'red',
    question: "Quelles sont les 5 methodes de determination du prix de pleine concurrence ?",
    expectedArticles: ['85'],
    mustContain: ['CUP|prix comparable', 'prix de revente|cout majore|marge nette'],
    category: 'Prix de transfert',
  },
  {
    id: 24,
    level: 'red',
    question: "Quelles sont les sanctions en matiere de prix de transfert ?",
    expectedArticles: ['81'],
    mustContain: ['5 000 000|25 000 000|5 millions|25 millions', 'amende|sanction'],
    category: 'Prix de transfert',
  },
  {
    id: 25,
    level: 'red',
    question: "Comment sont eliminees les doubles impositions sur les revenus de source etrangere ?",
    expectedArticles: ['13'],
    mustContain: ['credit d\'impot|deduction', 'etranger'],
    category: 'Double imposition',
  },
  {
    id: 26,
    level: 'red',
    question: "Quelles sont les conditions du regime de remploi des plus-values ?",
    expectedArticles: ['17 A'],
    acceptableArticles: ['17A', '17-A'],
    mustContain: ['3 ans', 'reinvest|remploi'],
    category: 'Plus-values',
  },
  {
    id: 27,
    level: 'red',
    question: "Comment sont traites les deficits dans l'integration fiscale ?",
    expectedArticles: ['91D', '91H'],
    mustContain: ['3 ans', '1/3|un tiers', 'report'],
    category: 'Integration fiscale',
  },
  {
    id: 28,
    level: 'red',
    question: "Regime fiscal des sous-traitants petroliers etrangers",
    expectedArticles: ['92B', '92J'],
    mustContain: ['petrolier', '5,75%|70%'],
    category: 'Regimes speciaux',
  },
];

// Niveau 4 - Questions pieges et avancees IS 2026
const BLACK_QUESTIONS_IS_2026: TestQuestion[] = [
  {
    id: 29,
    level: 'black',
    question: "Les exonerations conventionnelles d'IS sont-elles encore possibles a partir de 2026 ?",
    expectedArticles: ['3'],
    mustContain: ['non|supprim|plus', 'convention', '2026'],
    category: 'Exonerations',
  },
  {
    id: 30,
    level: 'black',
    question: "La fraction d'interets non deductibles est-elle perdue definitivement ?",
    expectedArticles: ['49'],
    mustContain: ['non|report', '5 ans'],
    category: 'Charges financieres',
  },
  {
    id: 31,
    level: 'black',
    question: "Les provisions pour conges payes sont-elles deductibles ?",
    expectedArticles: ['69', '74'],
    mustContain: ['non|jamais', 'provision|conges'],
    category: 'Provisions',
  },
  {
    id: 32,
    level: 'black',
    question: "Le credit d'impot investissement non utilise est-il remboursable ?",
    expectedArticles: ['3A'],
    mustContain: ['non|pas remboursable', 'report|5 ans'],
    category: 'Credit d\'impot',
  },
  {
    id: 33,
    level: 'black',
    question: "Quel est le cout d'un accord prealable de prix (APP) ?",
    expectedArticles: ['84'],
    mustContain: ['10 000 000|10 millions', '3 ans'],
    category: 'Prix de transfert',
  },
];

// Questions transversales IS 2026
const BLUE_QUESTIONS_IS_2026: TestQuestion[] = [
  {
    id: 34,
    level: 'blue',
    question: "Quelles sont les conditions generales de deductibilite des charges ?",
    expectedArticles: ['26'],
    mustContain: ['200.000|200 000', 'justifi|interet'],
    category: 'Charges deductibles',
  },
  {
    id: 35,
    level: 'blue',
    question: "Qu'est-ce qu'un etablissement stable selon le CGI 2026 ?",
    expectedArticles: ['4A'],
    mustContain: ['installation fixe', 'siege|succursale|bureau'],
    category: 'Territorialite',
  },
  {
    id: 36,
    level: 'blue',
    question: "Quelles sont les echeances de paiement du minimum de perception ?",
    expectedArticles: ['86B'],
    mustContain: ['4 acomptes|15 mars|15 juin|15 septembre|15 decembre'],
    category: 'Minimum de perception',
  },
  {
    id: 37,
    level: 'blue',
    question: "Quel est le seuil de CA pour l'obtention du quitus fiscal aupres du Ministre des Finances ?",
    expectedArticles: ['92G'],
    mustContain: ['100 milliards', 'ministre|DGID'],
    category: 'Quitus fiscal',
  },
  {
    id: 38,
    level: 'blue',
    question: "Quelles sont les conditions pour beneficier de l'amortissement accelere ?",
    expectedArticles: ['58'],
    mustContain: ['40%', '40 millions|3 ans|neuf'],
    category: 'Amortissements',
  },
];

// Export
export const IS_2026_QUESTIONS: TestQuestion[] = [
  ...GREEN_QUESTIONS_IS_2026,
  ...YELLOW_QUESTIONS_IS_2026,
  ...RED_QUESTIONS_IS_2026,
  ...BLACK_QUESTIONS_IS_2026,
  ...BLUE_QUESTIONS_IS_2026,
];

export const IS_2026_QUESTIONS_BY_LEVEL: Record<string, TestQuestion[]> = {
  green: GREEN_QUESTIONS_IS_2026,
  yellow: YELLOW_QUESTIONS_IS_2026,
  red: RED_QUESTIONS_IS_2026,
  black: BLACK_QUESTIONS_IS_2026,
  blue: BLUE_QUESTIONS_IS_2026,
};

export const QUICK_IS_2026_IDS = [1, 2, 6, 7, 13, 14, 21, 24, 29, 34];
export const QUICK_IS_2026_QUESTIONS = IS_2026_QUESTIONS.filter(q => QUICK_IS_2026_IDS.includes(q.id));
