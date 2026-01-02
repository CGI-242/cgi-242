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

// MAPPING THÉMATIQUE : Thèmes exclusifs à une version du CGI
// Ces thèmes FORCENT l'utilisation d'un agent spécifique
const THEME_VERSION_EXCLUSIVE = {
  // ========== THÈMES EXCLUSIFS CGI 2025 ==========
  // L'IRPP n'existe que dans le CGI 2025 (remplacé par ITS en 2026)
  themes_2025_only: [
    'irpp',
    'impot sur le revenu des personnes physiques',
    'revenu global imposable',
    'residence fiscale',
    'domicile fiscal',
    'categories de revenus',
    'sept categories',
    '7 categories',
    'revenus fonciers',
    'benefices non commerciaux',
    'bnc',
    'benefices agricoles',
    'plus-values',
    'revenus des capitaux mobiliers',
    'bareme irpp',
    'tranche irpp',
    'taux irpp',
    'absence continue',
    'perte residence',
    '24 mois',
    'vingt-quatre mois',
    // Impôts locaux et taxes spécifiques 2025
    'tss',
    'taxe speciale sur les societes',
    'patente',
    'contribution des patentes',
    'cfpb',
    'cfpnb',
    'contribution fonciere',
    'taxe sur les spectacles',
    'taxe regionale',
    'taxe departementale',
  ],

  // ========== THÈMES EXCLUSIFS CGI 2026 ==========
  // Nouveaux impôts introduits par la réforme 2026
  themes_2026_only: [
    'its',
    'impot sur les traitements et salaires',
    'reforme its',
    'nouveau bareme its',
    'iba',
    'impot sur les benefices d\'affaires',
    'minimum de perception',
    '86b',
    '86c',
    'art. 86b',
    'art. 86c',
    'quartiers generaux',
    'holdings',
    'integration fiscale',
    'prix de transfert',
  ],
};

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
    IRPP: ['irpp', 'impôt sur le revenu', 'revenu des personnes physiques', 'barème irpp', 'résidence fiscale', 'catégories de revenus'],
    ITS: ['its', 'impôt sur les traitements', 'traitements et salaires', 'retenue salaire'],
    IS: ['is', 'impôt sur les sociétés', 'bénéfices sociétés', 'minimum de perception', '86b', '86c'],
    IBA: ['iba', 'impôt sur les bénéfices d\'affaires', 'bénéfices d\'affaires'],
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
 * Détecte si la question porte sur un thème EXCLUSIF à une version
 * Retourne 2025, 2026 ou null si pas de thème exclusif détecté
 */
function detectExclusiveTheme(query: string): 2025 | 2026 | null {
  const normalizedQuery = query.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/['']/g, "'");

  // Vérifier les thèmes exclusifs 2025
  for (const theme of THEME_VERSION_EXCLUSIVE.themes_2025_only) {
    const normalizedTheme = theme.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (normalizedQuery.includes(normalizedTheme)) {
      logger.info(`[IntentAnalyzer] Thème EXCLUSIF 2025 détecté: "${theme}"`);
      return 2025;
    }
  }

  // Vérifier les thèmes exclusifs 2026
  for (const theme of THEME_VERSION_EXCLUSIVE.themes_2026_only) {
    const normalizedTheme = theme.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (normalizedQuery.includes(normalizedTheme)) {
      logger.info(`[IntentAnalyzer] Thème EXCLUSIF 2026 détecté: "${theme}"`);
      return 2026;
    }
  }

  return null;
}

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

  // ============================================================
  // PRIORITÉ 1: Vérifier les thèmes EXCLUSIFS à une version
  // Ces thèmes FORCENT l'utilisation d'un agent spécifique
  // ============================================================
  const exclusiveYear = detectExclusiveTheme(query);
  if (exclusiveYear !== null) {
    logger.info(`[IntentAnalyzer] Thème EXCLUSIF détecté → Force CGI ${exclusiveYear}`);

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

    // Retourner directement avec la version forcée
    return {
      targetYear: exclusiveYear,
      isComparison: false,
      domain,
      confidence: 0.95, // Haute confiance pour thème exclusif
      detectedKeywords: [`theme_exclusif_${exclusiveYear}`],
    };
  }

  // ============================================================
  // PRIORITÉ 2: Analyse des mots-clés explicites
  // ============================================================

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
  // IMPORTANT: Ne retourner une année QUE si explicitement demandée
  // Sinon retourner null pour déclencher le fallback dual-agent
  let targetYear: 2025 | 2026 | null = null;

  if (!isComparison) {
    if (score2025 > score2026) {
      targetYear = 2025;
    } else if (score2026 > score2025) {
      targetYear = 2026;
    }
    // Si aucune version n'est explicitement demandée, targetYear reste null
    // L'orchestrateur interrogera alors les deux agents avec fallback
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
