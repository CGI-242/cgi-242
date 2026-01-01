// server/src/services/rag/hybrid-search.service.ts
import { QdrantClient } from '@qdrant/js-client-rest';
import { generateEmbedding } from './embeddings.service.js';
import { findArticlesForQuery } from '../../config/keyword-mappings.js';
import { getArticleMetadata } from '../../config/article-metadata.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('HybridSearch');

const client = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
});

// Collections par version du CGI
export const CGI_COLLECTIONS = {
  '2025': 'cgi_2025',
  '2026': 'cgi_2026',
  'legacy': 'cgi_articles',
} as const;

type CGIVersion = keyof typeof CGI_COLLECTIONS;

const DEFAULT_COLLECTION = CGI_COLLECTIONS['2025'];

export interface SearchResult {
  id: string | number;
  score: number;
  payload: {
    numero: string;
    titre: string;
    contenu: string;
    mots_cles?: string[];
    tome?: string;
    chapitre?: string;
  };
  matchType: 'vector' | 'keyword' | 'both';
  priority: number;
  articleType?: string;
}

/**
 * Extrait les articles correspondants via keyword matching
 * Utilise le nouveau mapping enrichi avec priorités
 */
function extractKeywordMatches(query: string): string[] {
  const articles = findArticlesForQuery(query);

  if (articles.length > 0) {
    logger.debug(`[HybridSearch] Keyword matches: ${articles.slice(0, 5).join(', ')}`);
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
  collectionName: string = DEFAULT_COLLECTION
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
        const payloadNumero = (point.payload as any).numero;
        const metadata = getArticleMetadata(`Art. ${payloadNumero}`) ||
                        getArticleMetadata(payloadNumero);

        results.push({
          id: point.id,
          score: 1.0, // Score maximum pour keyword match
          payload: point.payload as SearchResult['payload'],
          matchType: 'keyword',
          priority: metadata?.priority || 2,
          articleType: metadata?.type,
        });

        logger.debug(`[HybridSearch] Art. ${payloadNumero} trouvé (P${metadata?.priority || 2}, ${metadata?.type || 'unknown'})`);
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
  collectionName: string = DEFAULT_COLLECTION
): Promise<SearchResult[]> {
  try {
    const { embedding } = await generateEmbedding(query);

    const searchResult = await client.search(collectionName, {
      vector: embedding,
      limit,
      with_payload: true,
    });

    return searchResult.map((result) => {
      const payloadNumero = (result.payload as any).numero;
      const metadata = getArticleMetadata(`Art. ${payloadNumero}`) ||
                      getArticleMetadata(payloadNumero);

      return {
        id: result.id,
        score: result.score,
        payload: result.payload as SearchResult['payload'],
        matchType: 'vector' as const,
        priority: metadata?.priority || 2,
        articleType: metadata?.type,
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
  logger.info(`[HybridSearch] Query: "${query.substring(0, 50)}..." (collection: ${collectionName})`);

  // 1. Recherche par keywords (avec métadonnées)
  const keywordArticles = extractKeywordMatches(query);
  logger.info(`[HybridSearch] Keywords matched: ${keywordArticles.length > 0 ? keywordArticles.slice(0, 5).join(', ') : 'aucun'}`);

  const keywordResults = await searchByArticleNumbers(keywordArticles, collectionName);
  logger.info(`[HybridSearch] Keyword results: ${keywordResults.length}`);

  // 2. Recherche vectorielle
  const vectorLimit = Math.max(limit, limit - keywordResults.length + 3);
  const vectorResults = await searchByVector(query, vectorLimit, collectionName);
  logger.info(`[HybridSearch] Vector results: ${vectorResults.length}`);

  // 3. Fusionner avec priorisation intelligente
  const merged = mergeResults(keywordResults, vectorResults, limit);

  logger.info(
    `[HybridSearch] Final: ${merged.map((r) => `${r.payload.numero}(P${r.priority},${r.matchType})`).join(', ')}`
  );

  return merged;
}

export default { hybridSearch };
