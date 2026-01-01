// server/src/tests/test-questions-data.ts
// Questions de test pour valider le RAG CGI 242

export type TestLevel = 'green' | 'yellow' | 'red' | 'black' | 'blue' | 'chart' | 'target';

export interface TestQuestion {
  id: number;
  level: TestLevel;
  question: string;
  expectedArticles: string[];
  acceptableArticles?: string[];  // Articles alternatifs acceptables
  mustContain?: string[];  // Supporte les alternatives avec | (pipe)
  mustNotContain?: string[];
  category: string;
}

/**
 * Vérifie si un texte contient les patterns requis
 * Supporte les alternatives avec | (pipe) dans chaque pattern
 * Exemple: "vingt-quatre mois|24 mois|deux ans" = l'un de ces termes doit être présent
 */
export function checkContains(
  text: string,
  patterns: string[]
): { found: boolean; matched: string[]; missing: string[] } {
  const textLower = text.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const pattern of patterns) {
    // Supporte les alternatives avec |
    const alternatives = pattern.toLowerCase().split('|').map(alt => alt.trim());
    const foundAlt = alternatives.find(alt => textLower.includes(alt));

    if (foundAlt) {
      matched.push(pattern);
    } else {
      missing.push(pattern);
    }
  }

  return {
    found: missing.length === 0,
    matched,
    missing,
  };
}

export interface TestResult {
  id: number;
  question: string;
  level: TestLevel;
  passed: boolean;
  expectedArticles: string[];
  foundArticles: string[];
  articleMatch: boolean;
  contentMatch: boolean;
  response: string;
  responseTime: number;
  errors?: string[];
}

export interface TestReport {
  timestamp: string;
  totalQuestions: number;
  passed: number;
  failed: number;
  successRate: number;
  byLevel: Record<TestLevel, { total: number; passed: number; rate: number }>;
  results: TestResult[];
}

// Niveau 1 - Questions factuelles directes (18 questions)
const GREEN_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    level: 'green',
    question: "Quelles sont les sept catégories de revenus qui composent le revenu net global imposable à l'IRPP ?",
    expectedArticles: ['1'],
    mustContain: ['revenus fonciers|fonciers', 'bénéfices|bénéfice', 'salaires|salaire'],
    category: 'Principes généraux',
  },
  {
    id: 2,
    level: 'green',
    question: "Quelle est la durée d'absence continue qui entraîne la perte de résidence fiscale au Congo ?",
    expectedArticles: ['2'],
    mustContain: ['vingt-quatre mois|24 mois|deux ans'],
    category: 'Principes généraux',
  },
  {
    id: 3,
    level: 'green',
    question: "Qui sont les personnes affranchies de l'impôt selon l'article 3 ?",
    expectedArticles: ['3'],
    mustContain: ['ambassadeur|diplomatique|consul'],
    category: 'Principes généraux',
  },
  {
    id: 4,
    level: 'green',
    question: "Dans quels cas une femme mariée fait-elle l'objet d'une imposition distincte ?",
    expectedArticles: ['4'],
    mustContain: ['sépar|distinct'],
    category: 'Principes généraux',
  },
  {
    id: 5,
    level: 'green',
    question: "Comment est déterminé le lieu d'imposition d'un contribuable ayant plusieurs résidences au Congo ?",
    expectedArticles: ['8'],
    mustContain: ['résidence|domicile', 'lieu|imposition'],
    category: 'Principes généraux',
  },
  {
    id: 6,
    level: 'green',
    question: "Quel est le taux de la déduction forfaitaire applicable aux revenus fonciers bruts ?",
    expectedArticles: ['13 quater'],
    acceptableArticles: ['13', '12'],
    mustContain: ['%|pour cent|pourcent', 'déduction|forfaitaire|abattement'],
    category: 'Revenus fonciers',
  },
  {
    id: 7,
    level: 'green',
    question: "Quel est le taux d'abattement forfaitaire applicable aux revenus tirés de la location du droit d'affichage ?",
    expectedArticles: ['13 quater'],
    acceptableArticles: ['13', '12'],
    mustContain: ['%|pour cent', 'abattement|déduction|forfaitaire'],
    category: 'Revenus fonciers',
  },
  {
    id: 8,
    level: 'green',
    question: "Quelle est la durée de l'option irrévocable pour les frais réels en matière de revenus fonciers ?",
    expectedArticles: ['13 quater'],
    acceptableArticles: ['13'],
    mustContain: ['an|année|ans', 'irrévocable|option'],
    category: 'Revenus fonciers',
  },
  {
    id: 9,
    level: 'green',
    question: "Quel est le seuil de chiffre d'affaires pour être soumis au régime du forfait ?",
    expectedArticles: ['26'],
    mustContain: ['100 000 000|100 millions|cent millions|100.000.000|forfait'],
    category: 'Régimes d\'imposition',
  },
  {
    id: 10,
    level: 'green',
    question: "Quelles catégories de contribuables sont exclues du régime forfaitaire ?",
    expectedArticles: ['26'],
    mustContain: ['sociétés|société|grossistes|grossiste|importateurs|importateur|boulangers|boulanger|forfait'],
    category: 'Régimes d\'imposition',
  },
  {
    id: 11,
    level: 'green',
    question: "Quel est le montant de l'amende pour défaut de tenue des registres comptables ?",
    expectedArticles: ['28'],
    mustContain: ['amende|sanction|pénalité'],
    category: 'Régimes d\'imposition',
  },
  {
    id: 12,
    level: 'green',
    question: "Combien de temps les documents comptables doivent-ils être conservés ?",
    expectedArticles: ['31'],
    acceptableArticles: ['28', '30', '26'],
    mustContain: ['dix ans|10 ans|années|an'],
    category: 'Régimes d\'imposition',
  },
  {
    id: 13,
    level: 'green',
    question: "Quel est le pourcentage d'évaluation forfaitaire du logement comme avantage en nature ?",
    expectedArticles: ['39'],
    mustContain: ['%|pour cent', 'logement|hébergement'],
    category: 'Traitements et salaires',
  },
  {
    id: 14,
    level: 'green',
    question: "Quel est le taux de déduction forfaitaire pour l'assiette de l'IRPP sur les salaires ?",
    expectedArticles: ['41'],
    mustContain: ['%|pour cent', 'déduction|forfaitaire|abattement'],
    category: 'Traitements et salaires',
  },
  {
    id: 15,
    level: 'green',
    question: "Quelles sont les allocations familiales maximales par enfant versées par un employeur privé ?",
    expectedArticles: ['38'],
    mustContain: ['allocation|familiale', 'enfant|charge'],
    category: 'Traitements et salaires',
  },
  {
    id: 16,
    level: 'green',
    question: "Quels sont les taux d'imposition du barème IRPP et leurs tranches ?",
    expectedArticles: ['95'],
    mustContain: ['1%|1 %|un pour cent', '10%|10 %|dix', '25%|25 %|vingt-cinq', '40%|40 %|quarante'],
    category: 'Barème et quotient familial',
  },
  {
    id: 17,
    level: 'green',
    question: "Quel est le nombre maximum de parts fiscales autorisé ?",
    expectedArticles: ['91'],
    mustContain: ['part', 'maximum|plafond|limite|6,5|six'],
    category: 'Barème et quotient familial',
  },
  {
    id: 18,
    level: 'green',
    question: "Combien de parts a un contribuable marié avec 3 enfants à charge ?",
    expectedArticles: ['91'],
    mustContain: ['3,5|3.5|trois et demi|trois parts et demie|3 parts et demie'],
    category: 'Barème et quotient familial',
  },
];

// Niveau 2 - Questions d'application et de calcul (8 questions)
const YELLOW_QUESTIONS: TestQuestion[] = [
  {
    id: 19,
    level: 'yellow',
    question: "Un contribuable célibataire sans enfant a un revenu net imposable de 5 000 000 FCFA. Calculez son IRPP.",
    expectedArticles: ['91', '95'],
    mustContain: ['1 part|une part|célibataire', 'barème|impôt|irpp'],
    category: 'Calculs d\'impôt',
  },
  {
    id: 20,
    level: 'yellow',
    question: "Un couple marié avec 2 enfants déclare un revenu global de 8 000 000 FCFA. Déterminez le nombre de parts et calculez l'impôt.",
    expectedArticles: ['91', '95'],
    mustContain: ['3 parts|trois parts', 'impôt|irpp'],
    category: 'Calculs d\'impôt',
  },
  {
    id: 21,
    level: 'yellow',
    question: "Un salarié perçoit un salaire brut mensuel de 800 000 FCFA avec un logement de fonction. Calculez l'avantage en nature logement.",
    expectedArticles: ['39'],
    mustContain: ['avantage|nature', 'logement|15%|15 %'],
    category: 'Calculs d\'impôt',
  },
  {
    id: 22,
    level: 'yellow',
    question: "Une personne quitte le Congo le 15 juin 2025. Quelles sont ses obligations déclaratives et dans quels délais ?",
    expectedArticles: ['75'],
    mustContain: ['trente jours|30 jours|un mois', 'déclaration|déclarer'],
    category: 'Situations fiscales',
  },
  {
    id: 23,
    level: 'yellow',
    question: "Un contribuable au forfait réalise un CA de 120 millions FCFA en N puis 90 millions en N+1. Quand passe-t-il au régime réel ?",
    expectedArticles: ['26', '30'],
    mustContain: ['réel|forfait', 'exercice|année|immédiatement|premier'],
    category: 'Situations fiscales',
  },
  {
    id: 24,
    level: 'yellow',
    question: "Un exploitant décède le 10 mars. Dans quel délai les ayants droit doivent-ils produire la déclaration de revenus ?",
    expectedArticles: ['98-2', '101'],
    acceptableArticles: ['98-1', '98', '99'],
    mustContain: ['six mois|6 mois|mois'],
    category: 'Situations fiscales',
  },
  {
    id: 25,
    level: 'yellow',
    question: "Un fonds de commerce acquis il y a 7 ans est cédé avec une plus-value de 15 000 000 FCFA. Quelle fraction est imposable ?",
    expectedArticles: ['63'],
    mustContain: ['plus-value|cession', 'imposable|imposition|fraction'],
    category: 'Plus-values',
  },
  {
    id: 26,
    level: 'yellow',
    question: "Une plus-value immobilière de 20 000 000 FCFA est réalisée sur un bien détenu depuis 12 ans. Quel est le taux applicable ?",
    expectedArticles: ['63 ter'],
    mustContain: ['plus-value|immobilière', '%|taux|abattement'],
    category: 'Plus-values',
  },
];

// Niveau 3 - Questions complexes et cas pratiques (10 questions)
const RED_QUESTIONS: TestQuestion[] = [
  {
    id: 27,
    level: 'red',
    question: "Cas Monsieur KOUMBA : Marié, 4 enfants, perçoit : Salaire annuel 12 000 000 FCFA, Revenus fonciers bruts 3 600 000 FCFA, Dividendes 2 000 000 FCFA. Déterminez le revenu global imposable.",
    expectedArticles: ['91', '95', '13 quater', '97'],
    mustContain: ['revenu', 'imposable'],
    category: 'Cas pratiques multi-catégories',
  },
  {
    id: 28,
    level: 'red',
    question: "Cas Madame MBONGO : Femme mariée, séparée de biens, ne vivant pas avec son mari, 2 enfants à sa charge. Elle exerce une profession libérale. Comment est-elle imposée ?",
    expectedArticles: ['4', '42'],
    mustContain: ['imposé', 'sépar'],
    category: 'Cas pratiques multi-catégories',
  },
  {
    id: 29,
    level: 'red',
    question: "Cas Société en nom collectif : Une SNC réalise un bénéfice de 50 000 000 FCFA. L'associé A détient 60% des parts et l'associé B 40%. Comment sont-ils imposés ?",
    expectedArticles: ['6'],
    mustContain: ['associé', 'part', 'imposé'],
    category: 'Cas pratiques multi-catégories',
  },
  {
    id: 30,
    level: 'red',
    question: "Un contribuable français travaille 8 mois par an au Congo depuis 3 ans mais maintient sa résidence principale en France. Est-il considéré comme résident fiscal congolais ?",
    expectedArticles: ['2'],
    mustContain: ['résident', 'fiscal'],
    category: 'Questions d\'interprétation juridique',
  },
  {
    id: 31,
    level: 'red',
    question: "Une entreprise verse des allocations pour frais d'emploi représentant 25% du salaire brut. Quelle part est exonérée d'IRPP ?",
    expectedArticles: ['38'],
    mustContain: ['exonér', 'allocation'],
    category: 'Questions d\'interprétation juridique',
  },
  {
    id: 32,
    level: 'red',
    question: "Un gérant majoritaire de SARL perçoit une rémunération de 24 000 000 FCFA. Est-il imposé comme salarié ou dans une autre catégorie ?",
    expectedArticles: ['76'],
    acceptableArticles: ['37', '42', '110'],
    mustContain: ['gérant|rémunération', 'imposé|catégorie|bnc|salarié'],
    category: 'Questions d\'interprétation juridique',
  },
  {
    id: 33,
    level: 'red',
    question: "Un contribuable détient des bons de caisse ayant supporté le précompte de 15%. Doit-il déclarer ces revenus dans sa déclaration IRPP ?",
    expectedArticles: ['61'],
    acceptableArticles: ['50', '58', '97'],
    mustContain: ['bons|créances|15%|précompte', 'libératoire|déclarer|déclaration'],
    category: 'Questions d\'interprétation juridique',
  },
  {
    id: 34,
    level: 'red',
    question: "Une école privée dégage un bénéfice de 20 000 000 FCFA. Quel abattement s'applique pour déterminer le bénéfice imposable ?",
    expectedArticles: ['34 ter'],
    acceptableArticles: ['34'],
    mustContain: ['abattement|réduction|%', 'école|enseignement'],
    category: 'Régimes spéciaux et exonérations',
  },
  {
    id: 35,
    level: 'red',
    question: "Un agriculteur pratiquant la pisciculture en eau douce réalise un bénéfice de 5 000 000 FCFA. Est-il imposable à l'IRPP ?",
    expectedArticles: ['36-B'],
    acceptableArticles: ['36', '36-A'],
    mustContain: ['exonéré|exonération|pas imposable|non imposable|agricole'],
    category: 'Régimes spéciaux et exonérations',
  },
  {
    id: 36,
    level: 'red',
    question: "Un fonctionnaire congolais travaillant pour une organisation internationale à Brazzaville perçoit également des revenus locatifs. Comment ces différents revenus sont-ils traités ?",
    expectedArticles: ['90'],
    acceptableArticles: ['37', '12', '60'],
    mustContain: ['revenu|locatif|international', 'imposable|exonéré|traité'],
    category: 'Régimes spéciaux et exonérations',
  },
];

// Niveau 4 - Questions pièges et cas limites (9 questions)
const BLACK_QUESTIONS: TestQuestion[] = [
  {
    id: 37,
    level: 'black',
    question: "Un veuf sans enfant à charge bénéficie-t-il automatiquement de 2 parts pendant toute sa vie ?",
    expectedArticles: ['91'],
    mustContain: ['veuf|veuve|décès', 'deux années|2 ans|deux ans|années suivant|part'],
    category: 'Questions pièges',
  },
  {
    id: 38,
    level: 'black',
    question: "La taxe immobilière sur les loyers est déductible de l'IRPP. Que se passe-t-il si cette taxe est supérieure à l'IRPP dû ?",
    expectedArticles: ['89'],
    mustContain: ['taxe|immobilière', 'imputable|déductible|excédent|limite'],
    category: 'Questions pièges',
  },
  {
    id: 39,
    level: 'black',
    question: "Un contribuable peut-il déduire les pensions alimentaires versées volontairement à ses parents sans décision de justice ?",
    expectedArticles: ['66'],
    mustContain: ['pension|alimentaire', 'décision de justice|jugement|tribunal|judiciaire'],
    category: 'Questions pièges',
  },
  {
    id: 40,
    level: 'black',
    question: "Les intérêts d'emprunt pour l'acquisition d'une résidence secondaire sont-ils déductibles du revenu global ?",
    expectedArticles: ['66'],
    mustContain: ['intérêt|emprunt', 'habitation principale|résidence principale|principale|secondaire'],
    category: 'Questions pièges',
  },
  {
    id: 41,
    level: 'black',
    question: "Un contribuable au régime réel peut-il opter pour le forfait si son CA passe sous le seuil ?",
    expectedArticles: ['26'],
    mustContain: ['régime|forfait', 'option|opter|revenir'],
    category: 'Questions pièges',
  },
  {
    id: 42,
    level: 'black',
    question: "Une société anonyme verse des rémunérations à des personnes dont elle ne révèle pas l'identité. Quel est le régime fiscal applicable ?",
    expectedArticles: ['7'],
    mustContain: ['rémunération|versement', 'identité|révélé|occulte'],
    category: 'Cas limites et articulation des textes',
  },
  {
    id: 43,
    level: 'black',
    question: "Un artiste étranger non résident organise lui-même un concert à Brazzaville. Quelles sont ses obligations fiscales ?",
    expectedArticles: ['49'],
    acceptableArticles: ['48', '96'],
    mustContain: ['artiste|spectacle|concert', 'retenue|impôt|obligation'],
    category: 'Cas limites et articulation des textes',
  },
  {
    id: 44,
    level: 'black',
    question: "Le conjoint d'un exploitant individuel travaille 6 mois au Congo et 6 mois à l'étranger. Quel salaire peut être déduit ?",
    expectedArticles: ['64'],
    mustContain: ['conjoint|époux|épouse', 'salaire|rémunération', 'déduit|déductible'],
    category: 'Cas limites et articulation des textes',
  },
  {
    id: 45,
    level: 'black',
    question: "Un contribuable a un revenu exceptionnel qui dépasse la moyenne de ses revenus des 3 dernières années. Peut-il demander un étalement ?",
    expectedArticles: ['71'],
    mustContain: ['revenu exceptionnel|exceptionnels', 'étalement|quotient|réparti'],
    category: 'Cas limites et articulation des textes',
  },
];

// Questions thématiques transversales (9 questions)
const BLUE_QUESTIONS: TestQuestion[] = [
  {
    id: 46,
    level: 'blue',
    question: "Listez tous les délais de déclaration mentionnés pour l'IRPP (déclaration annuelle, cessation, décès, etc.).",
    expectedArticles: ['80', '75', '98-1', '101'],
    mustContain: ['délai', 'déclaration'],
    category: 'Obligations déclaratives',
  },
  {
    id: 47,
    level: 'blue',
    question: "Quelles sont les conséquences du défaut de déclaration selon les différents articles ?",
    expectedArticles: ['86', '33'],
    mustContain: ['défaut', 'déclaration', 'conséquence'],
    category: 'Obligations déclaratives',
  },
  {
    id: 48,
    level: 'blue',
    question: "Un contribuable peut-il contester une taxation d'office ? À quelles conditions ?",
    expectedArticles: ['88'],
    mustContain: ['taxation', 'office', 'contester'],
    category: 'Obligations déclaratives',
  },
  {
    id: 49,
    level: 'blue',
    question: "Quelles différences existe-t-il entre le régime du forfait et le régime réel concernant les obligations comptables ?",
    expectedArticles: ['26', '28', '30', '31'],
    mustContain: ['forfait', 'réel', 'obligation'],
    category: 'Comparaisons et articulations',
  },
  {
    id: 50,
    level: 'blue',
    question: "Comment s'articulent l'IRPP et l'IRVM pour éviter la double imposition ?",
    expectedArticles: ['97'],
    mustContain: ['IRPP', 'IRVM', 'double'],
    category: 'Comparaisons et articulations',
  },
  {
    id: 51,
    level: 'blue',
    question: "Quelles sont les différences de traitement fiscal entre un salarié et un gérant majoritaire de SARL ?",
    expectedArticles: ['37', '76'],
    mustContain: ['salarié', 'gérant', 'différence'],
    category: 'Comparaisons et articulations',
  },
  {
    id: 52,
    level: 'blue',
    question: "Décrivez la procédure contradictoire en matière de fixation du bénéfice forfaitaire.",
    expectedArticles: ['27'],
    mustContain: ['procédure', 'contradictoire', 'forfait'],
    category: 'Questions de procédure',
  },
  {
    id: 53,
    level: 'blue',
    question: "Quels sont les pouvoirs de l'administration fiscale en matière de vérification des déclarations ?",
    expectedArticles: ['82'],
    mustContain: ['administration', 'vérification', 'pouvoir'],
    category: 'Questions de procédure',
  },
  {
    id: 54,
    level: 'blue',
    question: "Dans quels cas l'administration peut-elle procéder à une rectification d'office ?",
    expectedArticles: ['33'],
    mustContain: ['rectification', 'office'],
    category: 'Questions de procédure',
  },
];

// Questions pour tester la cohérence du système (6 questions)
const CHART_QUESTIONS: TestQuestion[] = [
  {
    id: 55,
    level: 'chart',
    question: "Identifiez les articles abrogés dans le chapitre IRPP. Cela pose-t-il des problèmes d'interprétation ?",
    expectedArticles: [],
    mustContain: ['abrogé'],
    category: 'Tests de cohérence',
  },
  {
    id: 56,
    level: 'chart',
    question: "L'article 26 mentionne la déclaration n°294. Que doit-elle contenir exactement ?",
    expectedArticles: ['26', '28'],
    mustContain: ['déclaration', '294'],
    category: 'Tests de cohérence',
  },
  {
    id: 57,
    level: 'chart',
    question: "Les articles font référence au système minimal de trésorerie (SMT) OHADA. Quels sont les documents comptables requis ?",
    expectedArticles: ['26', '28'],
    mustContain: ['SMT', 'OHADA', 'comptable'],
    category: 'Tests de cohérence',
  },
  {
    id: 58,
    level: 'chart',
    question: "Comment se calcule la base de référence pour l'évaluation des avantages en nature ?",
    expectedArticles: ['39'],
    mustContain: ['avantage', 'nature', 'base'],
    category: 'Tests de cohérence',
  },
  {
    id: 59,
    level: 'chart',
    question: "Existe-t-il des incohérences entre les différents articles concernant les délais ?",
    expectedArticles: [],
    mustContain: ['délai'],
    category: 'Tests de cohérence',
  },
  {
    id: 60,
    level: 'chart',
    question: "Le barème d'évaluation du train de vie (Art. 89 bis) s'applique-t-il automatiquement ou sous conditions ?",
    expectedArticles: ['89 bis'],
    mustContain: ['train de vie', 'condition'],
    category: 'Tests de cohérence',
  },
];

// Questions ouvertes pour améliorer le système (5 questions)
const TARGET_QUESTIONS: TestQuestion[] = [
  {
    id: 61,
    level: 'target',
    question: "Quelles informations manquent dans le chapitre IRPP pour pouvoir répondre à toutes les questions pratiques d'un contribuable ?",
    expectedArticles: [],
    mustContain: ['information', 'manque'],
    category: 'Amélioration continue',
  },
  {
    id: 62,
    level: 'target',
    question: "Quels sont les renvois à d'autres parties du CGI qui nécessiteraient d'être documentés ?",
    expectedArticles: [],
    mustContain: ['renvoi', 'CGI'],
    category: 'Amélioration continue',
  },
  {
    id: 63,
    level: 'target',
    question: "Comment traiter les cas non prévus explicitement par les textes fiscaux ?",
    expectedArticles: [],
    mustContain: ['cas', 'prévu'],
    category: 'Amélioration continue',
  },
  {
    id: 64,
    level: 'target',
    question: "Quelles sont les zones d'ambiguïté dans la rédaction des articles du CGI ?",
    expectedArticles: [],
    mustContain: ['ambiguïté', 'rédaction'],
    category: 'Amélioration continue',
  },
  {
    id: 65,
    level: 'target',
    question: "Comment interpréter les articles sans objet par rapport aux articles abrogés ?",
    expectedArticles: [],
    mustContain: ['sans objet', 'abrogé'],
    category: 'Amélioration continue',
  },
];

// Export de toutes les questions
export const ALL_QUESTIONS: TestQuestion[] = [
  ...GREEN_QUESTIONS,
  ...YELLOW_QUESTIONS,
  ...RED_QUESTIONS,
  ...BLACK_QUESTIONS,
  ...BLUE_QUESTIONS,
  ...CHART_QUESTIONS,
  ...TARGET_QUESTIONS,
];

// Export par niveau pour tests ciblés
export const QUESTIONS_BY_LEVEL: Record<TestLevel, TestQuestion[]> = {
  green: GREEN_QUESTIONS,
  yellow: YELLOW_QUESTIONS,
  red: RED_QUESTIONS,
  black: BLACK_QUESTIONS,
  blue: BLUE_QUESTIONS,
  chart: CHART_QUESTIONS,
  target: TARGET_QUESTIONS,
};

// Objectifs de réussite par niveau
export const TARGET_RATES: Record<TestLevel, number> = {
  green: 95,   // Questions factuelles : > 95%
  yellow: 85,  // Questions d'application : > 85%
  red: 70,     // Questions complexes : > 70%
  black: 60,   // Questions pièges : > 60%
  blue: 75,    // Questions transversales : > 75%
  chart: 70,   // Questions de cohérence : > 70%
  target: 50,  // Questions ouvertes : > 50%
};

// Noms des niveaux pour affichage
export const LEVEL_NAMES: Record<TestLevel, string> = {
  green: 'Niveau 1 - Factuelles directes',
  yellow: 'Niveau 2 - Application et calculs',
  red: 'Niveau 3 - Cas pratiques complexes',
  black: 'Niveau 4 - Questions pièges',
  blue: 'Transversal - Thématiques',
  chart: 'Cohérence - Tests système',
  target: 'Ouvertes - Amélioration',
};

// Questions rapides pour tests de régression (10 questions clés)
export const QUICK_TEST_IDS = [1, 2, 9, 13, 16, 19, 27, 37, 46, 55];
export const QUICK_QUESTIONS = ALL_QUESTIONS.filter(q => QUICK_TEST_IDS.includes(q.id));
