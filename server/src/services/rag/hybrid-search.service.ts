// server/src/services/rag/hybrid-search.service.ts
import { QdrantClient } from '@qdrant/js-client-rest';
import { generateEmbedding } from './embeddings.service.js';
import { findArticlesForQuery } from '../../config/keyword-mappings.js';
import { getArticleMetadata } from '../../config/article-metadata.js';
import { KEYWORD_ARTICLE_MAP_IS, SYNONYMS_IS } from '../../config/keyword-mappings-is.js';
import { ARTICLE_METADATA_IS, ArticleMetadataIS } from '../../config/article-metadata-is.js';
import { KEYWORD_ARTICLE_MAP_2026, SYNONYMS_2026 } from '../../config/keyword-mappings-2026.js';
import { ARTICLE_METADATA_2026, ArticleMetadata2026 } from '../../config/article-metadata-2026.js';
import { KEYWORD_ARTICLE_MAP_IBA_2026, SYNONYMS_IBA_2026 } from '../../config/keyword-mappings-iba-2026.js';
import { ARTICLE_METADATA_IBA_2026, ArticleMetadataIBA2026 } from '../../config/article-metadata-iba-2026.js';
import { KEYWORD_ARTICLE_MAP_DC, SYNONYMS_DC } from '../../config/keyword-mappings-dc.js';
import { ARTICLE_METADATA_DC, ArticleMetadataDC } from '../../config/article-metadata-dc.js';
import { KEYWORD_ARTICLE_MAP_TD, SYNONYMS_TD } from '../../config/keyword-mappings-td.js';
import { ARTICLE_METADATA_TD, ArticleMetadataTD } from '../../config/article-metadata-td.js';
import { KEYWORD_ARTICLE_MAP_DD, SYNONYMS_DD } from '../../config/keyword-mappings-dd.js';
import { ARTICLE_METADATA_DD, ArticleMetadataDD } from '../../config/article-metadata-dd.js';
import { KEYWORD_ARTICLE_MAP_PV, SYNONYMS_PV } from '../../config/keyword-mappings-pv.js';
import { ARTICLE_METADATA_PV, ArticleMetadataPV } from '../../config/article-metadata-pv.js';
import { KEYWORD_ARTICLE_MAP_IL, SYNONYMS_IL } from '../../config/keyword-mappings-il.js';
import { ARTICLE_METADATA_IL, ArticleMetadataIL } from '../../config/article-metadata-il.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('HybridSearch');

const client = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
});

// Collection CGI unique (version en vigueur)
export const CGI_COLLECTION = 'cgi_2026';

// Pour compatibilité descendante
export const CGI_COLLECTIONS = {
  '2026': 'cgi_2026',
  'current': 'cgi_2026',
} as const;

type CGIVersion = keyof typeof CGI_COLLECTIONS;

const DEFAULT_COLLECTION = CGI_COLLECTION;

export interface ArticlePayload {
  numero: string;
  titre: string;
  contenu: string;
  mots_cles?: string[];
  tome?: string;
  chapitre?: string;
}

export interface SearchResult {
  id: string | number;
  score: number;
  payload: ArticlePayload;
  matchType: 'vector' | 'keyword' | 'both';
  priority: number;
  articleType?: string;
}

/**
 * Recherche d'articles par mots-cles pour CGI 2026
 */
function findArticlesForQuery2026(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const matchedArticles: string[] = [];
  const seen = new Set<string>();

  // Expansion de la requete avec synonymes
  let expandedQuery = normalizedQuery;
  for (const [term, synonyms] of Object.entries(SYNONYMS_2026)) {
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expandedQuery += ` ${term}`;
      }
    }
  }

  // Recherche dans le mapping 2026
  for (const [keyword, articles] of Object.entries(KEYWORD_ARTICLE_MAP_2026)) {
    if (expandedQuery.includes(keyword.toLowerCase())) {
      for (const article of articles) {
        if (!seen.has(article)) {
          seen.add(article);
          matchedArticles.push(article);
        }
      }
    }
  }

  return matchedArticles;
}

/**
 * Obtient les metadonnees d'un article pour CGI 2026
 */
function getArticleMetadata2026(numero: string): ArticleMetadata2026 | undefined {
  // Normaliser le numero
  const normalized = numero.replace(/^Art\.\s*/i, 'Art. ');
  return ARTICLE_METADATA_2026[normalized] || ARTICLE_METADATA_2026[numero];
}

/**
 * Recherche d'articles par mots-cles pour CGI 2025 IS (chapitre 3)
 */
function findArticlesForQueryIS(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const matchedArticles: string[] = [];
  const seen = new Set<string>();

  // Expansion de la requete avec synonymes IS
  let expandedQuery = normalizedQuery;
  for (const [term, synonyms] of Object.entries(SYNONYMS_IS)) {
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expandedQuery += ` ${term}`;
      }
    }
  }

  // Recherche dans le mapping IS 2025
  for (const [keyword, articles] of Object.entries(KEYWORD_ARTICLE_MAP_IS)) {
    if (expandedQuery.includes(keyword.toLowerCase())) {
      for (const article of articles) {
        if (!seen.has(article)) {
          seen.add(article);
          matchedArticles.push(article);
        }
      }
    }
  }

  return matchedArticles;
}

/**
 * Obtient les metadonnees d'un article pour CGI 2025 IS
 */
function getArticleMetadataIS(numero: string): ArticleMetadataIS | undefined {
  // Normaliser le numero
  const normalized = numero.replace(/^Art\.\s*/i, 'Art. ');
  return ARTICLE_METADATA_IS[normalized] || ARTICLE_METADATA_IS[numero];
}

/**
 * Recherche d'articles par mots-cles pour CGI 2026 IBA (chapitre 2)
 */
function findArticlesForQueryIBA2026(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const matchedArticles: string[] = [];
  const seen = new Set<string>();

  // Expansion de la requete avec synonymes IBA
  let expandedQuery = normalizedQuery;
  for (const [term, synonyms] of Object.entries(SYNONYMS_IBA_2026)) {
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expandedQuery += ` ${term}`;
      }
    }
  }

  // Recherche dans le mapping IBA 2026
  for (const [keyword, articles] of Object.entries(KEYWORD_ARTICLE_MAP_IBA_2026)) {
    if (expandedQuery.includes(keyword.toLowerCase())) {
      for (const article of articles) {
        if (!seen.has(article)) {
          seen.add(article);
          matchedArticles.push(article);
        }
      }
    }
  }

  return matchedArticles;
}

/**
 * Obtient les metadonnees d'un article pour CGI 2026 IBA
 */
function getArticleMetadataIBA2026(numero: string): ArticleMetadataIBA2026 | undefined {
  // Normaliser le numero
  const normalized = numero.replace(/^Art\.\s*/i, 'Art. ');
  return ARTICLE_METADATA_IBA_2026[normalized] || ARTICLE_METADATA_IBA_2026[numero];
}

/**
 * Recherche d'articles par mots-cles pour CGI 2025 DC (chapitre 4 - Dispositions Communes)
 */
function findArticlesForQueryDC(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const matchedArticles: string[] = [];
  const seen = new Set<string>();

  // Expansion de la requete avec synonymes DC
  let expandedQuery = normalizedQuery;
  for (const [term, synonyms] of Object.entries(SYNONYMS_DC)) {
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expandedQuery += ` ${term}`;
      }
    }
  }

  // Recherche dans le mapping DC 2025
  for (const [keyword, articles] of Object.entries(KEYWORD_ARTICLE_MAP_DC)) {
    if (expandedQuery.includes(keyword.toLowerCase())) {
      for (const article of articles) {
        if (!seen.has(article)) {
          seen.add(article);
          matchedArticles.push(article);
        }
      }
    }
  }

  return matchedArticles;
}

/**
 * Obtient les metadonnees d'un article pour CGI 2025 DC (Dispositions Communes)
 */
function getArticleMetadataDC(numero: string): ArticleMetadataDC | undefined {
  // Normaliser le numero
  const normalized = numero.replace(/^Art\.\s*/i, 'Art. ');
  return ARTICLE_METADATA_DC[normalized] || ARTICLE_METADATA_DC[numero];
}

/**
 * Recherche d'articles par mots-cles pour CGI 2025 TD (chapitre 5 - Taxes Diverses)
 */
function findArticlesForQueryTD(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const matchedArticles: string[] = [];
  const seen = new Set<string>();

  // Expansion de la requete avec synonymes TD
  let expandedQuery = normalizedQuery;
  for (const [term, synonyms] of Object.entries(SYNONYMS_TD)) {
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expandedQuery += ` ${term}`;
      }
    }
  }

  // Recherche dans le mapping TD 2025
  for (const [keyword, articles] of Object.entries(KEYWORD_ARTICLE_MAP_TD)) {
    if (expandedQuery.includes(keyword.toLowerCase())) {
      for (const article of articles) {
        if (!seen.has(article)) {
          seen.add(article);
          matchedArticles.push(article);
        }
      }
    }
  }

  return matchedArticles;
}

/**
 * Obtient les metadonnees d'un article pour CGI 2025 TD (Taxes Diverses)
 */
function getArticleMetadataTD(numero: string): ArticleMetadataTD | undefined {
  // Normaliser le numero
  const normalized = numero.replace(/^Art\.\s*/i, 'Art. ');
  return ARTICLE_METADATA_TD[normalized] || ARTICLE_METADATA_TD[numero];
}

/**
 * Recherche d'articles par mots-cles pour CGI 2025 DD (chapitre 6 - Dispositions Diverses)
 */
function findArticlesForQueryDD(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const matchedArticles: string[] = [];
  const seen = new Set<string>();

  // Expansion de la requete avec synonymes DD
  let expandedQuery = normalizedQuery;
  for (const [term, synonyms] of Object.entries(SYNONYMS_DD)) {
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expandedQuery += ` ${term}`;
      }
    }
  }

  // Recherche dans le mapping DD 2025
  for (const [keyword, articles] of Object.entries(KEYWORD_ARTICLE_MAP_DD)) {
    if (expandedQuery.includes(keyword.toLowerCase())) {
      for (const articleEntry of articles) {
        const article = articleEntry.article;
        if (!seen.has(article)) {
          seen.add(article);
          matchedArticles.push(article);
        }
      }
    }
  }

  return matchedArticles;
}

/**
 * Obtient les metadonnees d'un article pour CGI 2025 DD (Dispositions Diverses)
 */
function getArticleMetadataDD(numero: string): ArticleMetadataDD | undefined {
  // Normaliser le numero
  const normalized = numero.replace(/^Art\.\s*/i, 'Art. ');
  return ARTICLE_METADATA_DD.find(
    a => a.numero === normalized || a.numero === numero || a.numero === `Art. ${normalized.replace('Art. ', '')}`
  );
}

/**
 * Recherche d'articles par mots-cles pour CGI 2025 PV (chapitre 7 - Plus-values, BTP, Reassurance)
 */
function findArticlesForQueryPV(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const matchedArticles: string[] = [];
  const seen = new Set<string>();

  // Expansion de la requete avec synonymes PV
  let expandedQuery = normalizedQuery;
  for (const [term, synonyms] of Object.entries(SYNONYMS_PV)) {
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expandedQuery += ` ${term}`;
      }
    }
  }

  // Recherche dans le mapping PV 2025
  for (const [keyword, articles] of Object.entries(KEYWORD_ARTICLE_MAP_PV)) {
    if (expandedQuery.includes(keyword.toLowerCase())) {
      for (const articleEntry of articles) {
        const article = articleEntry.article;
        if (!seen.has(article)) {
          seen.add(article);
          matchedArticles.push(article);
        }
      }
    }
  }

  return matchedArticles;
}

/**
 * Obtient les metadonnees d'un article pour CGI 2025 PV (Plus-values, BTP, Reassurance)
 */
function getArticleMetadataPV(numero: string): ArticleMetadataPV | undefined {
  // Normaliser le numero
  const normalized = numero.replace(/^Art\.\s*/i, 'Art. ');
  return ARTICLE_METADATA_PV.find(
    a => a.numero === normalized || a.numero === numero || a.numero === `Art. ${normalized.replace('Art. ', '')}`
  );
}

/**
 * Recherche d'articles par mots-cles pour CGI 2025 IL (Partie 2 - Impots Locaux)
 */
function findArticlesForQueryIL(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const matchedArticles: string[] = [];
  const seen = new Set<string>();

  // Expansion de la requete avec synonymes IL
  let expandedQuery = normalizedQuery;
  for (const [term, synonyms] of Object.entries(SYNONYMS_IL)) {
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expandedQuery += ` ${term}`;
      }
    }
  }

  // Recherche dans le mapping IL 2025
  for (const [keyword, articles] of Object.entries(KEYWORD_ARTICLE_MAP_IL)) {
    if (expandedQuery.includes(keyword.toLowerCase())) {
      for (const articleEntry of articles) {
        const article = articleEntry.article;
        if (!seen.has(article)) {
          seen.add(article);
          matchedArticles.push(article);
        }
      }
    }
  }

  return matchedArticles;
}

/**
 * Obtient les metadonnees d'un article pour CGI 2025 IL (Impots Locaux)
 */
function getArticleMetadataIL(numero: string): ArticleMetadataIL | undefined {
  // Normaliser le numero
  const normalized = numero.replace(/^Art\.\s*/i, 'Art. ');
  return ARTICLE_METADATA_IL.find(
    a => a.numero === normalized || a.numero === numero || a.numero === `Art. ${normalized.replace('Art. ', '')}`
  );
}

/**
 * Extrait les articles correspondants via keyword matching
 * Utilise le mapping selon la version du CGI
 * Pour 2025, recherche dans IRPP (chap. 1), IS (chap. 3), DC (chap. 4), TD (chap. 5), DD (chap. 6), PV (chap. 7) et IL (Partie 2)
 * Pour 2026, recherche dans IS (chapitre 1) ET IBA/IRCM/IRF/ITS (chapitre 2)
 */
function extractKeywordMatches(query: string, version: CGIVersion = '2025'): string[] {
  let articles: string[];
  const seen = new Set<string>();

  if (version === '2026') {
    // Pour 2026, combiner IS (chapitre 1) et IBA/IRCM/IRF/ITS (chapitre 2)
    const isArticles = findArticlesForQuery2026(query);
    const ibaArticles = findArticlesForQueryIBA2026(query);
    articles = [];
    for (const art of [...isArticles, ...ibaArticles]) {
      if (!seen.has(art)) {
        seen.add(art);
        articles.push(art);
      }
    }
  } else {
    // Pour 2025, combiner IRPP (chap. 1), IS (chap. 3), DC (chap. 4), TD (chap. 5), DD (chap. 6), PV (chap. 7) et IL (Partie 2)
    const irppArticles = findArticlesForQuery(query);
    const isArticles = findArticlesForQueryIS(query);
    const dcArticles = findArticlesForQueryDC(query);
    const tdArticles = findArticlesForQueryTD(query);
    const ddArticles = findArticlesForQueryDD(query);
    const pvArticles = findArticlesForQueryPV(query);
    const ilArticles = findArticlesForQueryIL(query);
    articles = [];
    for (const art of [...irppArticles, ...isArticles, ...dcArticles, ...tdArticles, ...ddArticles, ...pvArticles, ...ilArticles]) {
      if (!seen.has(art)) {
        seen.add(art);
        articles.push(art);
      }
    }
  }

  if (articles.length > 0) {
    logger.debug(`[HybridSearch] Keyword matches (${version}): ${articles.slice(0, 5).join(', ')}`);
  }

  return articles;
}

/**
 * Normalise le numéro d'article pour la recherche dans Qdrant
 */
function normalizeArticleNumber(numero: string): string {
  // Retire "Art. " si présent
  return numero.replace(/^Art\.\s*/i, '');
}

/**
 * Recherche des articles par numéro exact dans Qdrant
 */
async function searchByArticleNumbers(
  articleNumbers: string[],
  collectionName: string = DEFAULT_COLLECTION,
  version: CGIVersion = '2025'
): Promise<SearchResult[]> {
  if (articleNumbers.length === 0) return [];

  const results: SearchResult[] = [];
  const seenNumeros = new Set<string>();

  // Limiter à 5 premiers articles keyword (les plus pertinents)
  for (const numero of articleNumbers.slice(0, 5)) {
    const normalizedNum = normalizeArticleNumber(numero);

    if (seenNumeros.has(normalizedNum)) continue;
    seenNumeros.add(normalizedNum);

    try {
      const scrollResult = await client.scroll(collectionName, {
        filter: {
          should: [
            { key: 'numero', match: { value: normalizedNum } },
            { key: 'numero', match: { value: `Art. ${normalizedNum}` } },
          ],
        },
        limit: 1,
        with_payload: true,
        with_vector: false,
      });

      if (scrollResult.points.length > 0) {
        const point = scrollResult.points[0];
        const rawPayload = point.payload as Record<string, string | string[] | undefined>;
        const payload: ArticlePayload = {
          numero: String(rawPayload.numero || ''),
          titre: String(rawPayload.titre || ''),
          contenu: String(rawPayload.contenu || ''),
          mots_cles: Array.isArray(rawPayload.mots_cles) ? rawPayload.mots_cles : undefined,
          tome: rawPayload.tome ? String(rawPayload.tome) : undefined,
          chapitre: rawPayload.chapitre ? String(rawPayload.chapitre) : undefined,
        };
        const payloadNumero = payload.numero;

        // Utiliser les metadonnees selon la version
        let articleType: string | undefined;
        let priority = 2;

        if (version === '2026') {
          // Pour 2026, chercher dans IS puis IBA
          const metadataIS = getArticleMetadata2026(`Art. ${payloadNumero}`) || getArticleMetadata2026(payloadNumero);
          const metadataIBA = getArticleMetadataIBA2026(`Art. ${payloadNumero}`) || getArticleMetadataIBA2026(payloadNumero);
          const metadata = metadataIS || metadataIBA;
          priority = metadata?.priority || 2;
          articleType = metadata?.themes?.[0];
        } else {
          // Pour 2025, chercher dans IRPP, IS, DC, TD, DD, PV puis IL
          const metadataIRPP = getArticleMetadata(`Art. ${payloadNumero}`) || getArticleMetadata(payloadNumero);
          const metadataIS = getArticleMetadataIS(`Art. ${payloadNumero}`) || getArticleMetadataIS(payloadNumero);
          const metadataDC = getArticleMetadataDC(`Art. ${payloadNumero}`) || getArticleMetadataDC(payloadNumero);
          const metadataTD = getArticleMetadataTD(`Art. ${payloadNumero}`) || getArticleMetadataTD(payloadNumero);
          const metadataDD = getArticleMetadataDD(`Art. ${payloadNumero}`) || getArticleMetadataDD(payloadNumero);
          const metadataPV = getArticleMetadataPV(`Art. ${payloadNumero}`) || getArticleMetadataPV(payloadNumero);
          const metadataIL = getArticleMetadataIL(`Art. ${payloadNumero}`) || getArticleMetadataIL(payloadNumero);
          const metadata = metadataIRPP || metadataIS || metadataDC || metadataTD || metadataDD || metadataPV || metadataIL;
          priority = metadata?.priority || 2;
          articleType = metadataIRPP?.type || metadataIS?.themes?.[0] || metadataDC?.themes?.[0] || metadataTD?.themes?.[0] || metadataDD?.themes?.[0] || metadataPV?.themes?.[0] || metadataIL?.themes?.[0];
        }

        results.push({
          id: point.id,
          score: 1.0, // Score maximum pour keyword match
          payload,
          matchType: 'keyword',
          priority,
          articleType,
        });

        logger.debug(`[HybridSearch] Art. ${payloadNumero} trouvé (P${priority})`);
      }
    } catch (error) {
      logger.error(`[HybridSearch] Erreur recherche article ${numero}:`, error);
    }
  }

  return results;
}

/**
 * Recherche vectorielle standard
 */
async function searchByVector(
  query: string,
  limit: number,
  collectionName: string = DEFAULT_COLLECTION,
  version: CGIVersion = '2025'
): Promise<SearchResult[]> {
  try {
    const { embedding } = await generateEmbedding(query);

    const searchResult = await client.search(collectionName, {
      vector: embedding,
      limit,
      with_payload: true,
    });

    return searchResult.map((result) => {
      const rawPayload = result.payload as Record<string, string | string[] | undefined>;
      const payload: ArticlePayload = {
        numero: String(rawPayload.numero || ''),
        titre: String(rawPayload.titre || ''),
        contenu: String(rawPayload.contenu || ''),
        mots_cles: Array.isArray(rawPayload.mots_cles) ? rawPayload.mots_cles : undefined,
        tome: rawPayload.tome ? String(rawPayload.tome) : undefined,
        chapitre: rawPayload.chapitre ? String(rawPayload.chapitre) : undefined,
      };
      const payloadNumero = payload.numero;

      // Utiliser les metadonnees selon la version
      let articleType: string | undefined;
      let priority = 2;

      if (version === '2026') {
        // Pour 2026, chercher dans IS puis IBA
        const metadataIS = getArticleMetadata2026(`Art. ${payloadNumero}`) || getArticleMetadata2026(payloadNumero);
        const metadataIBA = getArticleMetadataIBA2026(`Art. ${payloadNumero}`) || getArticleMetadataIBA2026(payloadNumero);
        const metadata = metadataIS || metadataIBA;
        priority = metadata?.priority || 2;
        articleType = metadata?.themes?.[0];
      } else {
        // Pour 2025, chercher dans IRPP, IS, DC, TD, DD, PV puis IL
        const metadataIRPP = getArticleMetadata(`Art. ${payloadNumero}`) || getArticleMetadata(payloadNumero);
        const metadataIS = getArticleMetadataIS(`Art. ${payloadNumero}`) || getArticleMetadataIS(payloadNumero);
        const metadataDC = getArticleMetadataDC(`Art. ${payloadNumero}`) || getArticleMetadataDC(payloadNumero);
        const metadataTD = getArticleMetadataTD(`Art. ${payloadNumero}`) || getArticleMetadataTD(payloadNumero);
        const metadataDD = getArticleMetadataDD(`Art. ${payloadNumero}`) || getArticleMetadataDD(payloadNumero);
        const metadataPV = getArticleMetadataPV(`Art. ${payloadNumero}`) || getArticleMetadataPV(payloadNumero);
        const metadataIL = getArticleMetadataIL(`Art. ${payloadNumero}`) || getArticleMetadataIL(payloadNumero);
        const metadata = metadataIRPP || metadataIS || metadataDC || metadataTD || metadataDD || metadataPV || metadataIL;
        priority = metadata?.priority || 2;
        articleType = metadataIRPP?.type || metadataIS?.themes?.[0] || metadataDC?.themes?.[0] || metadataTD?.themes?.[0] || metadataDD?.themes?.[0] || metadataPV?.themes?.[0] || metadataIL?.themes?.[0];
      }

      return {
        id: result.id,
        score: result.score,
        payload,
        matchType: 'vector' as const,
        priority,
        articleType,
      };
    });
  } catch (error) {
    logger.error('[HybridSearch] Erreur recherche vectorielle:', error);
    return [];
  }
}

/**
 * Fusionne les résultats avec priorisation intelligente
 *
 * RÈGLES DE PRIORISATION :
 * 1. Priority 1 avant 2 avant 3
 * 2. Type 'définition' avant 'application'
 * 3. Keyword matches avant vector matches (à priorité égale)
 */
function mergeResults(
  keywordResults: SearchResult[],
  vectorResults: SearchResult[],
  maxResults: number
): SearchResult[] {
  const seen = new Set<string>();
  const merged: SearchResult[] = [];

  // 1. Ajouter les résultats keyword (déjà triés par pertinence)
  for (const result of keywordResults) {
    const key = result.payload.numero;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(result);
    }
  }

  // 2. Ajouter les résultats vectoriels non dupliqués
  for (const result of vectorResults) {
    const key = result.payload.numero;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(result);
    } else {
      // Marquer comme match hybride si trouvé par les deux méthodes
      const existing = merged.find((r) => r.payload.numero === key);
      if (existing && existing.matchType === 'keyword') {
        existing.matchType = 'both';
        existing.score = Math.max(existing.score, result.score);
      }
    }
  }

  // 3. Trier par priorité et type
  merged.sort((a, b) => {
    // D'abord par priorité (1 avant 2 avant 3)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    // Ensuite : définition avant application
    const typeOrder: Record<string, number> = {
      'définition': 0,
      'calcul': 1,
      'exonération': 1,
      'procédure': 2,
      'application': 3,
      'sanction': 4
    };
    const typeA = typeOrder[a.articleType || ''] ?? 5;
    const typeB = typeOrder[b.articleType || ''] ?? 5;
    if (typeA !== typeB) {
      return typeA - typeB;
    }

    // Enfin : keyword/both avant vector seul
    const matchOrder: Record<string, number> = { 'keyword': 0, 'both': 0, 'vector': 1 };
    return (matchOrder[a.matchType] ?? 1) - (matchOrder[b.matchType] ?? 1);
  });

  return merged.slice(0, maxResults);
}

/**
 * Règles de priorité spéciales pour certaines combinaisons de mots-clés
 * Ces règles forcent certains articles en première position
 */
function applyPriorityRules(query: string, results: SearchResult[]): SearchResult[] {
  const queryLower = query.toLowerCase();

  // RÈGLE 1: Bons de caisse + précompte/déclarer → Art. 61 PRIORITAIRE
  const isBonsCaisseQuery =
    (queryLower.includes('bons') && queryLower.includes('caisse')) ||
    queryLower.includes('bons de caisse');
  const isPrecompteOrDeclarer =
    queryLower.includes('précompte') ||
    queryLower.includes('precompte') ||
    queryLower.includes('déclarer') ||
    queryLower.includes('declarer') ||
    queryLower.includes('déclaration') ||
    queryLower.includes('declaration') ||
    queryLower.includes('irpp') ||
    queryLower.includes('libératoire') ||
    queryLower.includes('liberatoire') ||
    queryLower.includes('15%');

  if (isBonsCaisseQuery && isPrecompteOrDeclarer) {
    logger.info('[HybridSearch] PRIORITY RULE: Bons de caisse + précompte → Art. 61 prioritaire');

    // Trouver Art. 61 dans les résultats
    const art61Index = results.findIndex(r => r.payload.numero === '61');
    if (art61Index > 0) {
      // Déplacer Art. 61 en première position
      const art61 = results[art61Index];
      art61.priority = 0; // Priorité maximale
      results.splice(art61Index, 1);
      results.unshift(art61);
      logger.info('[HybridSearch] Art. 61 moved to first position');
    } else if (art61Index === -1) {
      logger.warn('[HybridSearch] Art. 61 not found in results - should be added');
    }

    // Rétrograder Art. 76 s'il est présent (il ne s'applique pas aux précomptes libératoires)
    const art76Index = results.findIndex(r => r.payload.numero === '76');
    if (art76Index !== -1 && art76Index < 3) {
      const art76 = results[art76Index];
      art76.priority = 5; // Basse priorité
      // Le déplacer vers la fin
      results.splice(art76Index, 1);
      results.push(art76);
      logger.info('[HybridSearch] Art. 76 demoted (précompte libératoire exception)');
    }
  }

  // RÈGLE 2: Artiste étranger + concert/spectacle → Art. 49 PRIORITAIRE
  const isArtisteQuery =
    queryLower.includes('artiste') &&
    (queryLower.includes('étranger') || queryLower.includes('etranger') ||
     queryLower.includes('non résident') || queryLower.includes('non resident'));
  const isConcertSpectacle =
    queryLower.includes('concert') ||
    queryLower.includes('spectacle') ||
    queryLower.includes('brazzaville');

  if (isArtisteQuery && isConcertSpectacle) {
    logger.info('[HybridSearch] PRIORITY RULE: Artiste étranger → Art. 49 prioritaire');

    const art49Index = results.findIndex(r => r.payload.numero === '49');
    if (art49Index > 0) {
      const art49 = results[art49Index];
      art49.priority = 0;
      results.splice(art49Index, 1);
      results.unshift(art49);
      logger.info('[HybridSearch] Art. 49 moved to first position');
    }
  }

  return results;
}

/**
 * Recherche hybride : keyword + vectorielle avec priorisation intelligente
 * @param query - La requête utilisateur
 * @param limit - Nombre maximum de résultats
 * @param version - Version du CGI ('2025', '2026', ou 'legacy')
 */
export async function hybridSearch(
  query: string,
  limit = 8,
  version: CGIVersion = '2025'
): Promise<SearchResult[]> {
  const collectionName = CGI_COLLECTIONS[version];
  logger.info(`[HybridSearch] Query: "${query.substring(0, 50)}..." (collection: ${collectionName}, version: ${version})`);

  // 1. Recherche par keywords (avec métadonnées selon version)
  const keywordArticles = extractKeywordMatches(query, version);
  logger.info(`[HybridSearch] Keywords matched: ${keywordArticles.length > 0 ? keywordArticles.slice(0, 5).join(', ') : 'aucun'}`);

  const keywordResults = await searchByArticleNumbers(keywordArticles, collectionName, version);
  logger.info(`[HybridSearch] Keyword results: ${keywordResults.length}`);

  // 2. Recherche vectorielle (avec métadonnées selon version)
  const vectorLimit = Math.max(limit, limit - keywordResults.length + 3);
  const vectorResults = await searchByVector(query, vectorLimit, collectionName, version);
  logger.info(`[HybridSearch] Vector results: ${vectorResults.length}`);

  // 3. Fusionner avec priorisation intelligente
  let merged = mergeResults(keywordResults, vectorResults, limit);

  // 4. Appliquer les règles de priorité spéciales
  merged = applyPriorityRules(query, merged);

  logger.info(
    `[HybridSearch] Final: ${merged.map((r) => `${r.payload.numero}(P${r.priority},${r.matchType})`).join(', ')}`
  );

  return merged;
}

export default { hybridSearch };
