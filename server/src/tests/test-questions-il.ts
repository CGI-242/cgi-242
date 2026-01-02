// server/src/tests/test-questions-il.ts
// Questions de test pour Impôts Locaux (Partie 2 Titre 1 Chapitre 1) - CGI 2025

import { TestQuestion, TestLevel } from './test-questions-data.js';

/**
 * Questions de test Impôts Locaux (60 questions)
 * Couvre: CFPB, CFPNB, Patente, Taxe régionale, Spectacles
 */
export const IL_QUESTIONS: TestQuestion[] = [
  // ==================== GÉNÉRALITÉS ====================
  {
    id: 1,
    question: 'Comment est réparti le produit des impôts locaux ?',
    expectedArticles: ['Art. 250'],
    mustContain: ['85%', 'collectivités', '10%', '5%'],
    level: 'green' as TestLevel,
    category: 'generalites',
  },
  {
    id: 2,
    question: 'Quels sont les impôts locaux obligatoires au Congo ?',
    expectedArticles: ['Art. 250'],
    mustContain: ['CFPB', 'CFPNB', 'patente', 'spectacles'],
    level: 'green' as TestLevel,
    category: 'generalites',
  },

  // ==================== CFPB ====================
  {
    id: 3,
    question: 'Quelles propriétés sont soumises à la CFPB ?',
    expectedArticles: ['Art. 251', 'Art. 252'],
    mustContain: ['propriétés bâties', 'fondations'],
    level: 'yellow' as TestLevel,
    category: 'cfpb',
  },
  {
    id: 4,
    question: 'Qui est redevable de la CFPB en cas de crédit-bail ?',
    expectedArticles: ['Art. 252 bis'],
    mustContain: ['preneur'],
    level: 'green' as TestLevel,
    category: 'cfpb',
  },
  {
    id: 5,
    question: 'Quels immeubles bénéficient d\'une exemption permanente de CFPB ?',
    expectedArticles: ['Art. 253'],
    mustContain: ['État', 'édifices', 'bâtiments agricoles', 'ambassades'],
    level: 'yellow' as TestLevel,
    category: 'cfpb',
  },
  {
    id: 6,
    question: 'Quelle est la durée d\'exemption pour une construction nouvelle ?',
    expectedArticles: ['Art. 254'],
    mustContain: ['5 ans', '10 ans', '25 ans'],
    level: 'yellow' as TestLevel,
    category: 'cfpb',
  },
  {
    id: 7,
    question: 'Quelle déduction est appliquée à la valeur locative cadastrale pour la CFPB ?',
    expectedArticles: ['Art. 257 bis'],
    mustContain: ['75%', 'déduction'],
    level: 'green' as TestLevel,
    category: 'cfpb',
  },
  {
    id: 8,
    question: 'Quel est le prix du m² en zone 1 pour la CFPB ?',
    expectedArticles: ['Art. 258 ter'],
    mustContain: ['250', 'FCFA'],
    level: 'green' as TestLevel,
    category: 'cfpb',
  },
  {
    id: 9,
    question: 'Quel est le taux maximum de la CFPB ?',
    expectedArticles: ['Art. 262'],
    mustContain: ['20%', '1 000 FCFA'],
    level: 'green' as TestLevel,
    category: 'cfpb',
  },
  {
    id: 49,
    question: 'Comment est déterminée la valeur locative des propriétés bâties ?',
    expectedArticles: ['Art. 258 bis'],
    mustContain: ['bail', 'comparaison'],
    level: 'yellow' as TestLevel,
    category: 'cfpb',
  },
  {
    id: 50,
    question: 'Quand déclarer les locataires pour la CFPB/CFPNB ?',
    expectedArticles: ['Art. 276'],
    mustContain: ['1er octobre', 'locataires'],
    level: 'yellow' as TestLevel,
    category: 'cfpb',
  },
  {
    id: 56,
    question: 'Que se passe-t-il si un immeuble d\'habitation change de destination ?',
    expectedArticles: ['Art. 254'],
    mustContain: ['5 ans', 'substitue'],
    level: 'red' as TestLevel,
    category: 'cfpb',
  },

  // ==================== CFPNB ====================
  {
    id: 10,
    question: 'Comment sont définies les propriétés urbaines et rurales pour la CFPNB ?',
    expectedArticles: ['Art. 264'],
    mustContain: ['urbaines', 'rurales', 'périmètre'],
    level: 'green' as TestLevel,
    category: 'cfpnb',
  },
  {
    id: 11,
    question: 'Les terrains autour des constructions sont-ils imposables ?',
    expectedArticles: ['Art. 265'],
    mustContain: ['3 fois', '5 fois', 'surface bâtie'],
    level: 'yellow' as TestLevel,
    category: 'cfpnb',
  },
  {
    id: 12,
    question: 'Quelle exemption pour les terrains plantés en hévéas ou palmiers à huile ?',
    expectedArticles: ['Art. 266'],
    mustContain: ['10 ans'],
    level: 'yellow' as TestLevel,
    category: 'cfpnb',
  },
  {
    id: 13,
    question: 'Quelles sont les durées d\'exemption pour les différentes cultures ?',
    expectedArticles: ['Art. 266'],
    mustContain: ['6 ans', '10 ans', '8 ans', '7 ans', '3 ans'],
    level: 'red' as TestLevel,
    category: 'cfpnb',
  },
  {
    id: 14,
    question: 'Quel est le délai pour déclarer une exemption de CFPNB rurale ?',
    expectedArticles: ['Art. 267'],
    mustContain: ['1er octobre'],
    level: 'yellow' as TestLevel,
    category: 'cfpnb',
  },
  {
    id: 15,
    question: 'Quelle est la base imposable de la CFPNB ?',
    expectedArticles: ['Art. 270', 'Art. 272'],
    mustContain: ['50%', 'valeur cadastrale'],
    level: 'yellow' as TestLevel,
    category: 'cfpnb',
  },
  {
    id: 16,
    question: 'Quel est le tarif par hectare pour les terrains cultivés en café ou palmiers ?',
    expectedArticles: ['Art. 272'],
    mustContain: ['2 000', 'FCFA'],
    level: 'green' as TestLevel,
    category: 'cfpnb',
  },
  {
    id: 17,
    question: 'Quel est le taux maximum de la CFPNB ?',
    expectedArticles: ['Art. 275'],
    mustContain: ['40%'],
    level: 'green' as TestLevel,
    category: 'cfpnb',
  },
  {
    id: 51,
    question: 'Les terrains maraîchers sont-ils exonérés de CFPNB ?',
    expectedArticles: ['Art. 265'],
    mustContain: ['5 hectares', '25 km'],
    level: 'yellow' as TestLevel,
    category: 'cfpnb',
  },
  {
    id: 52,
    question: 'Peut-on perdre une exonération temporaire de CFPNB ?',
    expectedArticles: ['Art. 268'],
    mustContain: ['retrait', 'élevage', 'agriculture'],
    level: 'yellow' as TestLevel,
    category: 'cfpnb',
  },

  // ==================== PATENTE ====================
  {
    id: 18,
    question: 'Qui est assujetti à la contribution de la patente ?',
    expectedArticles: ['Art. 277'],
    mustContain: ['commerce', 'industrie', 'activité'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 19,
    question: 'Sur quelle base est calculée la patente ?',
    expectedArticles: ['Art. 278'],
    mustContain: ['chiffre d\'affaires'],
    level: 'yellow' as TestLevel,
    category: 'patente',
  },
  {
    id: 20,
    question: 'Les associés de sociétés sont-ils exemptés de patente ?',
    expectedArticles: ['Art. 279'],
    mustContain: ['associés', 'SNC', 'SARL', 'SA'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 21,
    question: 'Les pêcheurs artisanaux paient-ils la patente ?',
    expectedArticles: ['Art. 279'],
    mustContain: ['pêcheurs', 'exempt'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 22,
    question: 'Combien de patentes sont dues pour plusieurs activités dans une même localité ?',
    expectedArticles: ['Art. 281', 'Art. 282'],
    mustContain: ['entités fiscales'],
    level: 'yellow' as TestLevel,
    category: 'patente',
  },
  {
    id: 23,
    question: 'Que doit contenir le titre de patente ?',
    expectedArticles: ['Art. 285'],
    mustContain: ['photo', 'NIU'],
    level: 'yellow' as TestLevel,
    category: 'patente',
  },
  {
    id: 24,
    question: 'La patente est-elle remboursable en cas de fermeture d\'entreprise ?',
    expectedArticles: ['Art. 287', 'Art. 289', 'Art. 290'],
    mustContain: ['non remboursable', 'année entière'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 25,
    question: 'Quelle pénalité pour défaut de justification du paiement de la patente ?',
    expectedArticles: ['Art. 293'],
    mustContain: ['100%', 'pénalité'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 26,
    question: 'Quel régime pour les sociétés étrangères sous ATE ?',
    expectedArticles: ['Art. 294'],
    mustContain: ['ATE', 'prorata temporis'],
    level: 'red' as TestLevel,
    category: 'patente',
  },
  {
    id: 27,
    question: 'Qu\'est-ce qu\'un marchand ambulant ?',
    expectedArticles: ['Art. 295'],
    mustContain: ['ambulant', 'mobile', 'territoire national'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 28,
    question: 'Combien de titres de patente pour un transporteur avec plusieurs véhicules ?',
    expectedArticles: ['Art. 296'],
    mustContain: ['véhicules', 'titres'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 29,
    question: 'Les marchandises peuvent-elles être saisies pour défaut de patente ?',
    expectedArticles: ['Art. 297'],
    mustContain: ['saisie', 'marchandises'],
    level: 'yellow' as TestLevel,
    category: 'patente',
  },
  {
    id: 30,
    question: 'Quand la patente est-elle exigible ?',
    expectedArticles: ['Art. 310'],
    mustContain: ['10', '20', 'avril'],
    level: 'yellow' as TestLevel,
    category: 'patente',
  },
  {
    id: 31,
    question: 'Quel délai de paiement pour les sociétés étrangères ?',
    expectedArticles: ['Art. 311'],
    mustContain: ['15 jours'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 32,
    question: 'Quel délai pour déclarer une nouvelle activité soumise à patente ?',
    expectedArticles: ['Art. 312'],
    mustContain: ['15 jours'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 33,
    question: 'Quelle sanction pour un entrepôt de marchandises non déclaré ?',
    expectedArticles: ['Art. 312'],
    mustContain: ['500 000', 'amende'],
    level: 'yellow' as TestLevel,
    category: 'patente',
  },
  {
    id: 34,
    question: 'Quel est le montant de la patente pour un CA < 1 million ?',
    expectedArticles: ['Art. 314'],
    mustContain: ['10 000', 'forfait'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 35,
    question: 'Quel taux de patente pour un CA de 50 millions ?',
    expectedArticles: ['Art. 314'],
    mustContain: ['0,750%', '0,650%', '0,450%'],
    level: 'red' as TestLevel,
    category: 'patente',
  },
  {
    id: 36,
    question: 'Quel régime de patente pour les sociétés pétrolières ?',
    expectedArticles: ['Art. 314'],
    mustContain: ['50%', 'droits'],
    level: 'yellow' as TestLevel,
    category: 'patente',
  },
  {
    id: 37,
    question: 'Quelle patente pour une société en stand-by ?',
    expectedArticles: ['Art. 278'],
    mustContain: ['25%', 'stand-by'],
    level: 'yellow' as TestLevel,
    category: 'patente',
  },
  {
    id: 53,
    question: 'Quand sont établies les matrices supplémentaires de patente ?',
    expectedArticles: ['Art. 304', 'Art. 306'],
    mustContain: ['trimestre'],
    level: 'yellow' as TestLevel,
    category: 'patente',
  },
  {
    id: 54,
    question: 'Quel délai pour déclarer une cessation d\'activité ?',
    expectedArticles: ['Art. 305'],
    mustContain: ['1er décembre'],
    level: 'yellow' as TestLevel,
    category: 'patente',
  },
  {
    id: 55,
    question: 'Quelle sanction pour des magasins auxiliaires non déclarés ?',
    expectedArticles: ['Art. 313'],
    mustContain: ['supplément', 'droits'],
    level: 'green' as TestLevel,
    category: 'patente',
  },
  {
    id: 60,
    question: 'Comment répartir la patente d\'une entreprise multi-établissements ?',
    expectedArticles: ['Art. 278', 'Art. 281'],
    mustContain: ['répartition', 'entités fiscales'],
    level: 'red' as TestLevel,
    category: 'patente',
  },

  // ==================== TAXE RÉGIONALE ====================
  {
    id: 38,
    question: 'Qui est assujetti à la taxe régionale ?',
    expectedArticles: ['Art. 321'],
    mustContain: ['18 ans', 'résidence'],
    level: 'green' as TestLevel,
    category: 'taxe_regionale',
  },
  {
    id: 39,
    question: 'Les étudiants de 18 à 25 ans sont-ils exemptés de la taxe régionale ?',
    expectedArticles: ['Art. 323'],
    mustContain: ['étudiants', 'certificat'],
    level: 'yellow' as TestLevel,
    category: 'taxe_regionale',
  },
  {
    id: 40,
    question: 'Les mères de famille nombreuse sont-elles exemptées ?',
    expectedArticles: ['Art. 323'],
    mustContain: ['5 enfants', 'exempt'],
    level: 'green' as TestLevel,
    category: 'taxe_regionale',
  },
  {
    id: 41,
    question: 'Comment est recouvrée la taxe régionale pour les salariés ?',
    expectedArticles: ['Art. 327'],
    mustContain: ['précompte', 'janvier', '120 000'],
    level: 'yellow' as TestLevel,
    category: 'taxe_regionale',
  },
  {
    id: 57,
    question: 'Les personnes sans ressources définies sont-elles taxées ?',
    expectedArticles: ['Art. 325'],
    mustContain: ['oisifs'],
    level: 'green' as TestLevel,
    category: 'taxe_regionale',
  },

  // ==================== SPECTACLES ====================
  {
    id: 42,
    question: 'Qui est soumis à la taxe sur les spectacles ?',
    expectedArticles: ['Art. 331'],
    mustContain: ['spectacles', 'jeux', 'divertissements'],
    level: 'green' as TestLevel,
    category: 'spectacles',
  },
  {
    id: 43,
    question: 'Les foires subventionnées sont-elles taxées ?',
    expectedArticles: ['Art. 332'],
    mustContain: ['foires', 'exempt'],
    level: 'green' as TestLevel,
    category: 'spectacles',
  },
  {
    id: 44,
    question: 'Quel est le taux de taxe sur les spectacles ?',
    expectedArticles: ['Art. 333'],
    mustContain: ['15%', '30%', '200'],
    level: 'green' as TestLevel,
    category: 'spectacles',
  },
  {
    id: 45,
    question: 'Quel est le tarif pour un bar-dancing permanent avec musiciens ?',
    expectedArticles: ['Art. 333'],
    mustContain: ['240 000', 'musiciens'],
    level: 'yellow' as TestLevel,
    category: 'spectacles',
  },
  {
    id: 46,
    question: 'Quel taux pour les cercles privés et maisons de jeu ?',
    expectedArticles: ['Art. 333', 'Art. 338'],
    mustContain: ['10%', 'recettes'],
    level: 'green' as TestLevel,
    category: 'spectacles',
  },
  {
    id: 47,
    question: 'Quel délai pour déclarer l\'ouverture d\'un spectacle ?',
    expectedArticles: ['Art. 340'],
    mustContain: ['24 heures'],
    level: 'green' as TestLevel,
    category: 'spectacles',
  },
  {
    id: 48,
    question: 'Quand déposer le relevé des recettes pour les spectacles ?',
    expectedArticles: ['Art. 340'],
    mustContain: ['15', 'jours'],
    level: 'yellow' as TestLevel,
    category: 'spectacles',
  },
  {
    id: 58,
    question: 'Les exploitants de bars-dancings doivent-ils fournir une caution ?',
    expectedArticles: ['Art. 340'],
    mustContain: ['caution'],
    level: 'yellow' as TestLevel,
    category: 'spectacles',
  },
  {
    id: 59,
    question: 'La taxe peut-elle être partagée en cas de cession d\'un bar-dancing ?',
    expectedArticles: ['Art. 337'],
    mustContain: ['prorata', '10 jours'],
    level: 'red' as TestLevel,
    category: 'spectacles',
  },
];

/**
 * Questions groupées par niveau
 */
export const IL_QUESTIONS_BY_LEVEL: Record<TestLevel, TestQuestion[]> = {
  green: IL_QUESTIONS.filter(q => q.level === 'green'),
  yellow: IL_QUESTIONS.filter(q => q.level === 'yellow'),
  red: IL_QUESTIONS.filter(q => q.level === 'red'),
  black: [],
  blue: [],
  chart: [],
  target: [],
};

/**
 * Questions groupées par section/impôt
 */
export const IL_QUESTIONS_BY_SECTION: Record<string, TestQuestion[]> = {
  generalites: IL_QUESTIONS.filter(q => q.category === 'generalites'),
  cfpb: IL_QUESTIONS.filter(q => q.category === 'cfpb'),
  cfpnb: IL_QUESTIONS.filter(q => q.category === 'cfpnb'),
  patente: IL_QUESTIONS.filter(q => q.category === 'patente'),
  taxe_regionale: IL_QUESTIONS.filter(q => q.category === 'taxe_regionale'),
  spectacles: IL_QUESTIONS.filter(q => q.category === 'spectacles'),
};

/**
 * Questions rapides pour tests (1 par section)
 */
export const QUICK_IL_QUESTIONS: TestQuestion[] = [
  IL_QUESTIONS[0],  // Généralités - répartition 85%/10%/5%
  IL_QUESTIONS[6],  // CFPB - déduction 75%
  IL_QUESTIONS[17], // CFPNB - taux 40%
  IL_QUESTIONS[18], // Patente - assujettis
  IL_QUESTIONS[38], // Taxe régionale - 18 ans
  IL_QUESTIONS[42], // Spectacles - taux 15%/30%
];

/**
 * Statistiques des questions IL
 */
export const IL_STATS = {
  total: IL_QUESTIONS.length,
  par_niveau: {
    green: IL_QUESTIONS_BY_LEVEL.green.length,
    yellow: IL_QUESTIONS_BY_LEVEL.yellow.length,
    red: IL_QUESTIONS_BY_LEVEL.red.length,
    black: 0,
  },
  par_section: {
    generalites: IL_QUESTIONS_BY_SECTION.generalites.length,
    cfpb: IL_QUESTIONS_BY_SECTION.cfpb.length,
    cfpnb: IL_QUESTIONS_BY_SECTION.cfpnb.length,
    patente: IL_QUESTIONS_BY_SECTION.patente.length,
    taxe_regionale: IL_QUESTIONS_BY_SECTION.taxe_regionale.length,
    spectacles: IL_QUESTIONS_BY_SECTION.spectacles.length,
  },
};
