// server/src/tests/test-questions-dd.ts
// Questions de test pour le Chapitre 6 - Dispositions diverses (CGI 2025)

import { TestQuestion, TestLevel } from './test-questions-data.js';

// ==================== OBLIGATIONS EMPLOYEURS (Art. 172-182) ====================
const GREEN_QUESTIONS_EMPLOYEURS: TestQuestion[] = [
  {
    id: 1,
    level: 'green',
    question: 'Quel est le delai de versement des retenues en cas de deces de l\'employeur ?',
    expectedArticles: ['173'],
    mustContain: ['15 premiers jours|15 jours', 'mois suivant', 'deces'],
    category: 'Employeurs - Deces',
  },
  {
    id: 2,
    level: 'green',
    question: 'Quand et a qui doit etre remis l\'etat annuel des salaires ?',
    expectedArticles: ['176'],
    mustContain: ['janvier', 'inspecteur divisionnaire|contributions'],
    category: 'Employeurs - Etat annuel',
  },
  {
    id: 3,
    level: 'green',
    question: 'A partir de quel seuil la declaration nominative des salaires est-elle obligatoire ?',
    expectedArticles: ['177'],
    mustContain: ['120 000 FCFA|120000'],
    category: 'Employeurs - Seuil declaration',
  },
  {
    id: 4,
    level: 'green',
    question: 'Quels employeurs doivent souscrire une declaration mensuelle ?',
    expectedArticles: ['177 bis'],
    mustContain: ['plus de 3 personnes|3 personnes', 'mensuelle'],
    category: 'Employeurs - Declaration mensuelle',
  },
  {
    id: 5,
    level: 'green',
    question: 'Combien de temps conserver les documents relatifs aux retenues ?',
    expectedArticles: ['172'],
    mustContain: ['4 ans|quatre ans', 'conservation'],
    category: 'Employeurs - Conservation',
  },
];

const YELLOW_QUESTIONS_EMPLOYEURS: TestQuestion[] = [
  {
    id: 6,
    level: 'yellow',
    question: 'Quelles obligations a un employeur concernant les retenues a la source ?',
    expectedArticles: ['172'],
    mustContain: ['retenue|prelevement', 'livre paie|livre de paie'],
    category: 'Employeurs - Retenue source',
  },
  {
    id: 7,
    level: 'yellow',
    question: 'Dans quel delai les retenues sur salaires doivent-elles etre versees ?',
    expectedArticles: ['173'],
    mustContain: ['20 jours', 'mois suivant'],
    category: 'Employeurs - Delai versement',
  },
  {
    id: 8,
    level: 'yellow',
    question: 'Comment s\'effectue le versement des retenues ?',
    expectedArticles: ['174'],
    mustContain: ['bordereau', '3 exemplaires|trois exemplaires'],
    category: 'Employeurs - Bordereau',
  },
  {
    id: 9,
    level: 'yellow',
    question: 'Quelles remunerations diverses doivent etre declarees ?',
    expectedArticles: ['179'],
    mustContain: ['commissions|vacations|honoraires', '5 000 FCFA|5000'],
    category: 'Employeurs - Remunerations diverses',
  },
  {
    id: 10,
    level: 'yellow',
    question: 'Quel est le delai de declaration en cas de cession ou cessation d\'entreprise ?',
    expectedArticles: ['181'],
    mustContain: ['10 jours|dix jours'],
    category: 'Employeurs - Cession cessation',
  },
  {
    id: 11,
    level: 'yellow',
    question: 'Quel delai pour declarer les salaires en cas de deces de l\'employeur ?',
    expectedArticles: ['181'],
    mustContain: ['6 mois|six mois'],
    category: 'Employeurs - Deces declaration',
  },
  {
    id: 12,
    level: 'yellow',
    question: 'Un salarie peut-il obtenir le remboursement d\'un trop-percu de retenue ?',
    expectedArticles: ['182'],
    mustContain: ['reclamation', '1er avril|premier avril'],
    category: 'Employeurs - Regularisation',
  },
];

const RED_QUESTIONS_EMPLOYEURS: TestQuestion[] = [
  {
    id: 13,
    level: 'red',
    question: 'Que doit contenir l\'etat annuel des salaires ?',
    expectedArticles: ['176'],
    mustContain: ['NIU|numero identification', 'fiche individuelle'],
    category: 'Employeurs - Contenu etat annuel',
  },
  {
    id: 14,
    level: 'red',
    question: 'Les debirentiers versant des pensions ont-ils des obligations declaratives ?',
    expectedArticles: ['178'],
    mustContain: ['pensions', 'rentes viageres|rentes', 'Art. 176|article 176'],
    category: 'Employeurs - Pensions rentes',
  },
];

// ==================== RETENUE 10% COMMISSIONS (Art. 183-183 ter) ====================
const GREEN_QUESTIONS_COMMISSIONS: TestQuestion[] = [
  {
    id: 15,
    level: 'green',
    question: 'Quel est le taux de retenue sur les commissions et honoraires verses aux residents ?',
    expectedArticles: ['183'],
    mustContain: ['10%|dix pourcent'],
    category: 'Retenue 10% - Taux',
  },
  {
    id: 16,
    level: 'green',
    question: 'Dans quel delai les retenues sur droits d\'auteur doivent-elles etre reversees ?',
    expectedArticles: ['183 bis'],
    mustContain: ['15 jours|quinze jours'],
    category: 'Droits auteur - Delai',
  },
  {
    id: 17,
    level: 'green',
    question: 'A partir de quel seuil les droits d\'auteur doivent-ils etre declares ?',
    expectedArticles: ['180'],
    mustContain: ['5 000 FCFA|5000'],
    category: 'Droits auteur - Seuil',
  },
  {
    id: 18,
    level: 'green',
    question: 'L\'employeur doit-il remettre une attestation au salarie concernant les retenues ?',
    expectedArticles: ['183'],
    mustContain: ['attestation', 'retenues'],
    category: 'Attestation',
  },
];

const YELLOW_QUESTIONS_COMMISSIONS: TestQuestion[] = [
  {
    id: 19,
    level: 'yellow',
    question: 'Qui doit operer la retenue de 10% sur les commissions ?',
    expectedArticles: ['183'],
    mustContain: ['grossistes|institutions publiques', 'prestations'],
    category: 'Retenue 10% - Champ',
  },
  {
    id: 20,
    level: 'yellow',
    question: 'La retenue de 10% sur commissions est-elle un impot definitif ?',
    expectedArticles: ['183'],
    mustContain: ['acompte', 'IRPP'],
    category: 'Retenue 10% - Nature acompte',
  },
  {
    id: 21,
    level: 'yellow',
    question: 'Quelles sanctions en cas de defaut de retenue ou de reversement ?',
    expectedArticles: ['183'],
    mustContain: ['amende', '5%|cinq pourcent'],
    category: 'Retenue 10% - Sanctions',
  },
  {
    id: 22,
    level: 'yellow',
    question: 'Quelles obligations declaratives pour les commissionnaires en douanes ?',
    expectedArticles: ['183 ter'],
    mustContain: ['15 du mois|avant le 15', '500 000 FCFA|500000'],
    category: 'Commissionnaires douanes',
  },
];

// ==================== SNC ET AUTRES (Art. 184-185 bis) ====================
const GREEN_QUESTIONS_SNC: TestQuestion[] = [
  {
    id: 23,
    level: 'green',
    question: 'Quelles declarations pour les societes de personnes (SNC) ?',
    expectedArticles: ['184'],
    mustContain: ['repartition|distribution', 'benefices'],
    category: 'SNC',
  },
  {
    id: 24,
    level: 'green',
    question: 'Un resident percevant des revenus de source etrangere a-t-il des obligations declaratives ?',
    expectedArticles: ['185'],
    mustContain: ['renseignements', 'Art. 176|article 176'],
    category: 'Source etrangere',
  },
];

const YELLOW_QUESTIONS_SNC: TestQuestion[] = [
  {
    id: 25,
    level: 'yellow',
    question: 'Les salaries etrangers en mission courte sont-ils imposables ?',
    expectedArticles: ['185 bis'],
    mustContain: ['2 semaines|deux semaines', 'non|pas'],
    category: 'Societes 126 ter - Exception',
  },
];

const RED_QUESTIONS_SNC: TestQuestion[] = [
  {
    id: 26,
    level: 'red',
    question: 'Quelles obligations pour les societes etrangeres de l\'Art. 126 ter ?',
    expectedArticles: ['185 bis'],
    mustContain: ['126 ter', 'retenue', 'IRPP'],
    category: 'Societes 126 ter',
  },
];

// ==================== NON-RESIDENTS (Art. 185 ter) ====================
const GREEN_QUESTIONS_NR: TestQuestion[] = [
  {
    id: 27,
    level: 'green',
    question: 'Quel est le taux general de retenue sur les revenus des non-residents ?',
    expectedArticles: ['185 ter-C'],
    mustContain: ['20%|vingt pourcent'],
    category: 'Non-residents - Taux general',
  },
  {
    id: 28,
    level: 'green',
    question: 'Sur quelle base est calculee la retenue des non-residents ?',
    expectedArticles: ['185 ter-B'],
    mustContain: ['brut', 'hors TVA'],
    category: 'Non-residents - Base',
  },
  {
    id: 29,
    level: 'green',
    question: 'La retenue sur non-residents est-elle liberatoire ?',
    expectedArticles: ['185 ter-F'],
    mustContain: ['liberatoire', 'IS|impot societes'],
    category: 'Non-residents - Liberatoire',
  },
];

const YELLOW_QUESTIONS_NR: TestQuestion[] = [
  {
    id: 30,
    level: 'yellow',
    question: 'Quand s\'applique le taux de 10% pour les non-residents ?',
    expectedArticles: ['185 ter-C'],
    mustContain: ['10%|dix pourcent', 'CEMAC|prestations ponctuelles|audiovisuel'],
    category: 'Non-residents - Taux moyen',
  },
  {
    id: 31,
    level: 'yellow',
    question: 'Quel est le fait generateur de la retenue sur non-residents ?',
    expectedArticles: ['185 ter-D'],
    mustContain: ['facture', 'paiement'],
    category: 'Non-residents - Fait generateur',
  },
  {
    id: 32,
    level: 'yellow',
    question: 'Quand reverser la retenue sur les non-residents ?',
    expectedArticles: ['185 ter-E'],
    mustContain: ['mois suivant', 'annexe|declarative'],
    category: 'Non-residents - Reversement',
  },
  {
    id: 33,
    level: 'yellow',
    question: 'Que se passe-t-il si les sommes versees aux non-residents ne sont pas deductibles ?',
    expectedArticles: ['185 ter-D'],
    mustContain: ['distributions', 'benefices'],
    category: 'Non-residents - Charges non deductibles',
  },
  {
    id: 34,
    level: 'yellow',
    question: 'Quel taux maximum pour les paiements a des residents CEMAC ?',
    expectedArticles: ['185 ter-A'],
    mustContain: ['10%|dix pourcent', 'CEMAC'],
    category: 'Non-residents - CEMAC',
  },
  {
    id: 35,
    level: 'yellow',
    question: 'Les plateformes de streaming sont-elles soumises au taux reduit ?',
    expectedArticles: ['185 ter-C'],
    mustContain: ['10%|dix pourcent', 'audiovisuel|streaming'],
    category: 'Non-residents - Audiovisuel',
  },
];

const RED_QUESTIONS_NR: TestQuestion[] = [
  {
    id: 36,
    level: 'red',
    question: 'Quels revenus des non-residents sont soumis a retenue au Congo ?',
    expectedArticles: ['185 ter-A'],
    mustContain: ['brevets|marques', 'assistance technique'],
    category: 'Non-residents - Champ',
  },
  {
    id: 37,
    level: 'red',
    question: 'Quand s\'applique le taux reduit de 5,75% ?',
    expectedArticles: ['185 ter-C'],
    mustContain: ['5,75%|5.75%', 'Angola|zone Angola'],
    category: 'Non-residents - Taux reduit',
  },
  {
    id: 38,
    level: 'red',
    question: 'Quand s\'applique le taux specifique de 5% ?',
    expectedArticles: ['185 ter-C'],
    mustContain: ['5%|cinq pourcent', 'interets', 'emprunts|petroliers'],
    category: 'Non-residents - Taux specifique',
  },
];

// ==================== BLACK (Cas limites) ====================
const BLACK_QUESTIONS_DD: TestQuestion[] = [
  {
    id: 39,
    level: 'black',
    question: 'Comment sont regularises les versements des retenues ?',
    expectedArticles: ['175'],
    mustContain: ['role|rôle'],
    category: 'Role regularisation',
  },
  {
    id: 40,
    level: 'black',
    question: 'Les societes petrolieres ont-elles des obligations declaratives specifiques ?',
    expectedArticles: ['179'],
    mustContain: ['sous-traitants', 'prestations'],
    category: 'Societes petrolieres',
  },
];

// Export complet
export const DD_QUESTIONS: TestQuestion[] = [
  ...GREEN_QUESTIONS_EMPLOYEURS,
  ...YELLOW_QUESTIONS_EMPLOYEURS,
  ...RED_QUESTIONS_EMPLOYEURS,
  ...GREEN_QUESTIONS_COMMISSIONS,
  ...YELLOW_QUESTIONS_COMMISSIONS,
  ...GREEN_QUESTIONS_SNC,
  ...YELLOW_QUESTIONS_SNC,
  ...RED_QUESTIONS_SNC,
  ...GREEN_QUESTIONS_NR,
  ...YELLOW_QUESTIONS_NR,
  ...RED_QUESTIONS_NR,
  ...BLACK_QUESTIONS_DD,
];

export const DD_QUESTIONS_BY_LEVEL: Record<string, TestQuestion[]> = {
  green: [
    ...GREEN_QUESTIONS_EMPLOYEURS,
    ...GREEN_QUESTIONS_COMMISSIONS,
    ...GREEN_QUESTIONS_SNC,
    ...GREEN_QUESTIONS_NR,
  ],
  yellow: [
    ...YELLOW_QUESTIONS_EMPLOYEURS,
    ...YELLOW_QUESTIONS_COMMISSIONS,
    ...YELLOW_QUESTIONS_SNC,
    ...YELLOW_QUESTIONS_NR,
  ],
  red: [
    ...RED_QUESTIONS_EMPLOYEURS,
    ...RED_QUESTIONS_SNC,
    ...RED_QUESTIONS_NR,
  ],
  black: BLACK_QUESTIONS_DD,
};

export const DD_QUESTIONS_BY_SECTION: Record<string, TestQuestion[]> = {
  employeurs: [...GREEN_QUESTIONS_EMPLOYEURS, ...YELLOW_QUESTIONS_EMPLOYEURS, ...RED_QUESTIONS_EMPLOYEURS],
  commissions: [...GREEN_QUESTIONS_COMMISSIONS, ...YELLOW_QUESTIONS_COMMISSIONS],
  snc: [...GREEN_QUESTIONS_SNC, ...YELLOW_QUESTIONS_SNC, ...RED_QUESTIONS_SNC],
  non_residents: [...GREEN_QUESTIONS_NR, ...YELLOW_QUESTIONS_NR, ...RED_QUESTIONS_NR],
  divers: BLACK_QUESTIONS_DD,
};

export const QUICK_DD_IDS = [15, 27, 7, 37];
export const QUICK_DD_QUESTIONS = DD_QUESTIONS.filter(q => QUICK_DD_IDS.includes(q.id));
