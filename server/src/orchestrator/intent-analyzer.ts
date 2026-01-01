// server/src/orchestrator/intent-analyzer.ts
import { createLogger } from '../utils/logger.js';

const logger = createLogger('IntentAnalyzer');

export interface QueryIntent {
  targetYear: 2025 | 2026 | null;
  isComparison: boolean;
  domain: FiscalDomain | null;
  confidence: number;
  detectedKeywords: string[];
}

export type FiscalDomain =
  | 'IRPP'
  | 'ITS'
  | 'IS'
  | 'TVA'
  | 'enregistrement'
  | 'patente'
  | 'taxes_locales'
  | 'contentieux'
  | 'general';

// Règles de routage
const ROUTING_RULES = {
  // Mots-clés pour 2025
  keywords_2025: [
    'avant la réforme',
    'ancien régime',
    '2025',
    'actuellement',
    'en vigueur jusqu',
    'irpp',
    'avant janvier 2026',
    'régime actuel',
  ],

  // Mots-clés pour 2026
  keywords_2026: [
    'après la réforme',
    'nouveau régime',
    '2026',
    'its',
    'nouvelle loi',
    'réforme its',
    'à partir de janvier 2026',
    'nouveau barème',
    'minimum de perception',
    'post-réforme',
  ],

  // Mots-clés de comparaison
  keywords_comparison: [
    'différence',
    'comparaison',
    'comparer',
    'changement',
    'évolution',
    'avant/après',
    'versus',
    'vs',
    'par rapport à',
    'modification',
    'qu\'est-ce qui change',
    'nouvelles dispositions',
  ],

  // Domaines fiscaux
  domains: {
    IRPP: ['irpp', 'impôt sur le revenu', 'revenu des personnes physiques', 'barème irpp'],
    ITS: ['its', 'impôt sur les traitements', 'traitements et salaires', 'retenue salaire'],
    IS: ['is', 'impôt sur les sociétés', 'bénéfices', 'minimum de perception', '86b', '86c'],
    TVA: ['tva', 'taxe sur la valeur ajoutée', 'déduction', 'crédit tva', '18%', '5%'],
    enregistrement: ['enregistrement', 'droits', 'mutation', 'timbre', 'acte'],
    patente: ['patente', 'contribution des patentes', 'activité commerciale'],
    taxes_locales: ['taxe régionale', 'taxe locale', 'collectivité', 'commune', 'département'],
    contentieux: ['réclamation', 'contentieux', 'litige', 'recours', 'contrôle fiscal'],
  },

  // Date de bascule
  cutoffDate: new Date('2026-01-01'),
};

/**
 * Analyse l'intention d'une requête utilisateur
 */
export function analyzeIntent(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const detectedKeywords: string[] = [];

  // Détecter l'année cible
  let score2025 = 0;
  let score2026 = 0;
  let isComparison = false;

  // Vérifier les mots-clés 2025
  for (const keyword of ROUTING_RULES.keywords_2025) {
    if (lowerQuery.includes(keyword.toLowerCase())) {
      score2025++;
      detectedKeywords.push(keyword);
    }
  }

  // Vérifier les mots-clés 2026
  for (const keyword of ROUTING_RULES.keywords_2026) {
    if (lowerQuery.includes(keyword.toLowerCase())) {
      score2026++;
      detectedKeywords.push(keyword);
    }
  }

  // Vérifier si c'est une comparaison
  for (const keyword of ROUTING_RULES.keywords_comparison) {
    if (lowerQuery.includes(keyword.toLowerCase())) {
      isComparison = true;
      detectedKeywords.push(keyword);
      break;
    }
  }

  // Si comparaison explicite ou mention des deux années
  if (lowerQuery.includes('2025') && lowerQuery.includes('2026')) {
    isComparison = true;
  }

  // Déterminer l'année cible
  let targetYear: 2025 | 2026 | null = null;

  if (!isComparison) {
    if (score2025 > score2026) {
      targetYear = 2025;
    } else if (score2026 > score2025) {
      targetYear = 2026;
    } else {
      // Par défaut selon la date système
      targetYear = new Date() < ROUTING_RULES.cutoffDate ? 2025 : 2026;
    }
  }

  // Détecter le domaine fiscal
  let domain: FiscalDomain | null = null;
  for (const [domainKey, keywords] of Object.entries(ROUTING_RULES.domains)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        domain = domainKey as FiscalDomain;
        break;
      }
    }
    if (domain) break;
  }

  // Calculer la confiance
  const totalKeywords = detectedKeywords.length;
  const confidence = totalKeywords > 0 ? Math.min(0.9, 0.5 + totalKeywords * 0.1) : 0.5;

  const intent: QueryIntent = {
    targetYear,
    isComparison,
    domain,
    confidence,
    detectedKeywords,
  };

  logger.info(`[IntentAnalyzer] Query: "${query.substring(0, 50)}..." -> Year: ${targetYear}, Comparison: ${isComparison}, Domain: ${domain}`);

  return intent;
}

/**
 * Détermine l'agent par défaut selon la date système
 */
export function getDefaultAgentYear(): 2025 | 2026 {
  return new Date() < ROUTING_RULES.cutoffDate ? 2025 : 2026;
}

export default { analyzeIntent, getDefaultAgentYear };
