// server/src/tests/test-questions-td.ts
// Questions de test pour valider le RAG CGI 2025 - Chapitre 5 (Taxes Diverses)

import { TestQuestion, TestLevel } from './test-questions-data.js';

// ==================== TAXES SUR LES TERRAINS ====================
const GREEN_QUESTIONS_TERRAINS: TestQuestion[] = [
  {
    id: 1,
    level: 'green',
    question: "Quelles taxes sur les terrains existent au Congo ?",
    expectedArticles: ['157'],
    mustContain: ['agrement|non mis en valeur|a batir|inexploites'],
    category: 'Taxes terrains - Principe',
  },
  {
    id: 2,
    level: 'green',
    question: "Dans quelles communes s'appliquent les taxes sur les terrains urbains ?",
    expectedArticles: ['158'],
    mustContain: ['Brazzaville|Pointe-Noire|Loudima'],
    category: 'Taxes terrains - Champ',
  },
  {
    id: 3,
    level: 'green',
    question: "Qu'est-ce qu'un terrain a batir ?",
    expectedArticles: ['159'],
    mustContain: ['sans construction|terrain nu', 'titre'],
    category: 'Taxes terrains - Definitions',
  },
  {
    id: 4,
    level: 'green',
    question: "Quand une plantation est-elle consideree comme inexploitee ?",
    expectedArticles: ['160'],
    mustContain: ['3 ans|trois ans', 'non entretenue|inexploitee'],
    category: 'Taxes terrains - Exploitation',
  },
  {
    id: 5,
    level: 'green',
    question: "Quel est le tarif de la taxe sur les terrains d'agrement a Brazzaville ?",
    expectedArticles: ['165'],
    mustContain: ['15 F|15 francs', 'm2|metre'],
    category: 'Taxes terrains - Tarifs',
  },
  {
    id: 6,
    level: 'green',
    question: "Quel est le tarif de la taxe sur les terrains inexploites ?",
    expectedArticles: ['165'],
    mustContain: ['250 F|250 francs', 'ha|hectare'],
    category: 'Taxes terrains - Tarifs',
  },
  {
    id: 7,
    level: 'green',
    question: "Quelle est la date limite de declaration des terrains ?",
    expectedArticles: ['166'],
    mustContain: ['1er avril|premier avril'],
    category: 'Taxes terrains - Declarations',
  },
];

const YELLOW_QUESTIONS_TERRAINS: TestQuestion[] = [
  {
    id: 8,
    level: 'yellow',
    question: "Qu'est-ce qu'un terrain d'agrement ?",
    expectedArticles: ['159'],
    mustContain: ['5 fois|cinq fois', 'superficie', 'construction'],
    category: 'Taxes terrains - Definitions',
  },
  {
    id: 9,
    level: 'yellow',
    question: "Quand une concession est-elle insuffisamment exploitee ?",
    expectedArticles: ['160'],
    mustContain: ['51%|plus de la moitie', 'superficie'],
    category: 'Taxes terrains - Exploitation',
  },
  {
    id: 10,
    level: 'yellow',
    question: "Qui est redevable de la taxe sur les terrains ?",
    expectedArticles: ['163'],
    mustContain: ['proprietaire', '1er janvier|usufruitier|emphyteote'],
    category: 'Taxes terrains - Redevable',
  },
  {
    id: 11,
    level: 'yellow',
    question: "Quel est le tarif de la taxe sur les terrains a batir ?",
    expectedArticles: ['165'],
    mustContain: ['30 F|20 F|10 F', 'categorie|voie|eau|electricite'],
    category: 'Taxes terrains - Tarifs',
  },
  {
    id: 12,
    level: 'yellow',
    question: "Comment est comptee la superficie des terrains marecageux ?",
    expectedArticles: ['165'],
    mustContain: ['1/4|un quart|25%', 'classe|marecageux'],
    category: 'Taxes terrains - Classes',
  },
];

const RED_QUESTIONS_TERRAINS: TestQuestion[] = [
  {
    id: 13,
    level: 'red',
    question: "Quels terrains a batir sont exemptes de taxe ?",
    expectedArticles: ['161'],
    mustContain: ['lotissement|voie carrossable|100 metres'],
    category: 'Taxes terrains - Exemptions',
  },
  {
    id: 14,
    level: 'red',
    question: "Comment obtenir une exemption temporaire pour un terrain ?",
    expectedArticles: ['162'],
    mustContain: ['programme investissement|DGID', '3 ans|25%'],
    category: 'Taxes terrains - Exemptions temporaires',
  },
];

// ==================== TSS - TAXE SPECIALE SUR LES SOCIETES ====================
const GREEN_QUESTIONS_TSS: TestQuestion[] = [
  {
    id: 15,
    level: 'green',
    question: "Quel est le taux de la taxe speciale sur les societes ?",
    expectedArticles: ['170'],
    mustContain: ['1%', 'CA|chiffre d\'affaires'],
    category: 'TSS - Taux',
  },
  {
    id: 16,
    level: 'green',
    question: "Quel est le minimum de la taxe speciale sur les societes ?",
    expectedArticles: ['170'],
    mustContain: ['1 000 000|un million', 'minimum'],
    category: 'TSS - Minimum',
  },
  {
    id: 17,
    level: 'green',
    question: "Quand doit-on payer la taxe speciale sur les societes ?",
    expectedArticles: ['171'],
    mustContain: ['10|20 mars', 'paiement'],
    category: 'TSS - Paiement',
  },
  {
    id: 18,
    level: 'green',
    question: "Quelle sanction en cas de non-paiement de la TSS dans les delais ?",
    expectedArticles: ['171'],
    mustContain: ['double|doublement'],
    category: 'TSS - Sanctions',
  },
];

const YELLOW_QUESTIONS_TSS: TestQuestion[] = [
  {
    id: 19,
    level: 'yellow',
    question: "Quelles societes sont soumises a la taxe speciale sur les societes ?",
    expectedArticles: ['168'],
    mustContain: ['SA|SARL|SCA|SNC', 'societes'],
    category: 'TSS - Champ',
  },
  {
    id: 20,
    level: 'yellow',
    question: "Quelles societes sont exonerees de la taxe speciale ?",
    expectedArticles: ['169'],
    mustContain: ['agriculture|peche|elevage', 'premier exercice'],
    category: 'TSS - Exonerations',
  },
  {
    id: 21,
    level: 'yellow',
    question: "Quel est le taux de TSS pour les societes deficitaires ?",
    expectedArticles: ['170'],
    mustContain: ['2%', 'deficitaire|2 exercices'],
    category: 'TSS - Taux deficitaire',
  },
  {
    id: 22,
    level: 'yellow',
    question: "La TSS est-elle imputable sur l'IS ?",
    expectedArticles: ['171'],
    mustContain: ['oui|deduction', 'IS|impot societes'],
    category: 'TSS - Imputation',
  },
];

const RED_QUESTIONS_TSS: TestQuestion[] = [
  {
    id: 23,
    level: 'red',
    question: "Comment est calcule le CA des distributeurs de produits petroliers pour la TSS ?",
    expectedArticles: ['170'],
    mustContain: ['marge distribution|frais', 'petroliers'],
    category: 'TSS - Marketeurs',
  },
  {
    id: 24,
    level: 'red',
    question: "Comment est calcule le CA des societes forestieres pour la TSS ?",
    expectedArticles: ['170'],
    mustContain: ['deduction transport|CEMAC|port'],
    category: 'TSS - Forestieres',
  },
];

// ==================== BONS DE CAISSE ====================
const GREEN_QUESTIONS_BONS: TestQuestion[] = [
  {
    id: 25,
    level: 'green',
    question: "Quels sont les taux de l'impot sur les bons de caisse ?",
    expectedArticles: ['171 novies'],
    mustContain: ['15%', '30%', 'nominatifs|porteur'],
    category: 'Bons de caisse - Taux',
  },
  {
    id: 26,
    level: 'green',
    question: "Quand doit-on verser l'impot sur les bons de caisse ?",
    expectedArticles: ['171 octies'],
    mustContain: ['15 premiers jours|15 jours', 'mois'],
    category: 'Bons de caisse - Versement',
  },
];

const YELLOW_QUESTIONS_BONS: TestQuestion[] = [
  {
    id: 27,
    level: 'yellow',
    question: "Quels bons sont soumis a l'impot special sur les bons de caisse ?",
    expectedArticles: ['171 sexies'],
    mustContain: ['bons nominatifs|bons au porteur', 'pret|interets'],
    category: 'Bons de caisse - Champ',
  },
  {
    id: 28,
    level: 'yellow',
    question: "L'impot sur les bons de caisse est-il deductible ?",
    expectedArticles: ['171 decies'],
    mustContain: ['non|pas deductible', 'IRPP|IS'],
    category: 'Bons de caisse - Deductibilite',
  },
];

const RED_QUESTIONS_BONS: TestQuestion[] = [
  {
    id: 29,
    level: 'red',
    question: "Des bons emis pour le compte d'une societe etrangere sont-ils imposables au Congo ?",
    expectedArticles: ['171 septies'],
    mustContain: ['oui', 'Congo|intermediaire|payable'],
    category: 'Bons de caisse - Territorialite',
  },
];

// ==================== TVS - TAXE VEHICULES TOURISME ====================
const GREEN_QUESTIONS_TVS: TestQuestion[] = [
  {
    id: 30,
    level: 'green',
    question: "Quel est le montant de la taxe sur les vehicules de tourisme ?",
    expectedArticles: ['171 F'],
    mustContain: ['200 000 FCFA|200000', 'vehicule'],
    category: 'TVS - Montant',
  },
  {
    id: 31,
    level: 'green',
    question: "Quels vehicules sont exoneres de la TVS ?",
    expectedArticles: ['171 D'],
    mustContain: ['10 ans|dix ans', 'anciennete|mise en circulation'],
    category: 'TVS - Exoneration',
  },
  {
    id: 32,
    level: 'green',
    question: "Quand doit-on declarer et payer la TVS ?",
    expectedArticles: ['171 I'],
    mustContain: ['1er mars|premier mars'],
    category: 'TVS - Declaration',
  },
  {
    id: 33,
    level: 'green',
    question: "La TVS est-elle deductible de l'IS ?",
    expectedArticles: ['171 K'],
    mustContain: ['non|pas deductible', 'IS'],
    category: 'TVS - Deductibilite',
  },
];

const YELLOW_QUESTIONS_TVS: TestQuestion[] = [
  {
    id: 34,
    level: 'yellow',
    question: "Qui est redevable de la taxe sur les vehicules de tourisme ?",
    expectedArticles: ['171 B'],
    mustContain: ['societes', 'etablissements publics|credit-bail'],
    category: 'TVS - Redevable',
  },
  {
    id: 35,
    level: 'yellow',
    question: "Quels vehicules sont soumis a la TVS ?",
    expectedArticles: ['171 C'],
    mustContain: ['vehicules tourisme|voitures particulieres', '1er jour'],
    category: 'TVS - Vehicules concernes',
  },
];

// ==================== ABROGATIONS ====================
const BLACK_QUESTIONS_TD: TestQuestion[] = [
  {
    id: 36,
    level: 'black',
    question: "La taxe d'apprentissage existe-t-elle encore ?",
    expectedArticles: ['141'],
    mustContain: ['non|abroge', 'TUS|taxe unique salaires'],
    category: 'Abrogations',
  },
  {
    id: 37,
    level: 'black',
    question: "Existe-t-il un minimum de perception pour les taxes sur les terrains ?",
    expectedArticles: ['165'],
    mustContain: ['500 FCFA', 'minimum|negligee'],
    category: 'Taxes terrains - Minimum',
  },
  {
    id: 38,
    level: 'black',
    question: "Un terrain en jachere est-il considere comme exploite ?",
    expectedArticles: ['160'],
    mustContain: ['oui', 'jachere|regeneration|assolement'],
    category: 'Taxes terrains - Jachere',
  },
  {
    id: 39,
    level: 'black',
    question: "Le minimum de TSS est-il reduit pour les petites societes ?",
    expectedArticles: ['170'],
    mustContain: ['500 000 FCFA', '10 000 000|10 millions'],
    category: 'TSS - Petit CA',
  },
  {
    id: 40,
    level: 'black',
    question: "La TSS au taux de 2% est-elle imputable sur l'IS ?",
    expectedArticles: ['171'],
    mustContain: ['non|pas deductible', '2%|50%|premier exercice'],
    category: 'TSS - Imputation 2%',
  },
];

// Export complet
export const TD_QUESTIONS: TestQuestion[] = [
  ...GREEN_QUESTIONS_TERRAINS,
  ...YELLOW_QUESTIONS_TERRAINS,
  ...RED_QUESTIONS_TERRAINS,
  ...GREEN_QUESTIONS_TSS,
  ...YELLOW_QUESTIONS_TSS,
  ...RED_QUESTIONS_TSS,
  ...GREEN_QUESTIONS_BONS,
  ...YELLOW_QUESTIONS_BONS,
  ...RED_QUESTIONS_BONS,
  ...GREEN_QUESTIONS_TVS,
  ...YELLOW_QUESTIONS_TVS,
  ...BLACK_QUESTIONS_TD,
];

export const TD_QUESTIONS_BY_LEVEL: Record<string, TestQuestion[]> = {
  green: [
    ...GREEN_QUESTIONS_TERRAINS,
    ...GREEN_QUESTIONS_TSS,
    ...GREEN_QUESTIONS_BONS,
    ...GREEN_QUESTIONS_TVS,
  ],
  yellow: [
    ...YELLOW_QUESTIONS_TERRAINS,
    ...YELLOW_QUESTIONS_TSS,
    ...YELLOW_QUESTIONS_BONS,
    ...YELLOW_QUESTIONS_TVS,
  ],
  red: [
    ...RED_QUESTIONS_TERRAINS,
    ...RED_QUESTIONS_TSS,
    ...RED_QUESTIONS_BONS,
  ],
  black: BLACK_QUESTIONS_TD,
};

export const TD_QUESTIONS_BY_SECTION: Record<string, TestQuestion[]> = {
  terrains: [...GREEN_QUESTIONS_TERRAINS, ...YELLOW_QUESTIONS_TERRAINS, ...RED_QUESTIONS_TERRAINS],
  tss: [...GREEN_QUESTIONS_TSS, ...YELLOW_QUESTIONS_TSS, ...RED_QUESTIONS_TSS],
  bons_caisse: [...GREEN_QUESTIONS_BONS, ...YELLOW_QUESTIONS_BONS, ...RED_QUESTIONS_BONS],
  tvs: [...GREEN_QUESTIONS_TVS, ...YELLOW_QUESTIONS_TVS],
  abrogations: BLACK_QUESTIONS_TD,
};

export const QUICK_TD_IDS = [1, 5, 15, 16, 25, 30, 31, 36];
export const QUICK_TD_QUESTIONS = TD_QUESTIONS.filter(q => QUICK_TD_IDS.includes(q.id));
