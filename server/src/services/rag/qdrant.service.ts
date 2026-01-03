// server/src/services/rag/qdrant.service.ts
import { QdrantClient } from '@qdrant/js-client-rest';
import { createLogger } from '../../utils/logger.js';
import { redisService, CACHE_TTL, CACHE_PREFIX, hashText } from '../redis.service.js';

const logger = createLogger('QdrantService');

const COLLECTION_NAME = 'cgi_articles';
const VECTOR_SIZE = 1536; // text-embedding-3-small

let client: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!client) {
    client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
    });
  }
  return client;
}

export interface ArticleVector {
  id: string;
  vector: number[];
  payload: {
    articleId: string;
    numero: string;
    titre?: string;
    contenu: string;
    tome?: string;
    chapitre?: string;
    version?: string;
    keywords: string[];
  };
}

/**
 * Initialise la collection Qdrant
 */
export async function initializeCollection(): Promise<void> {
  const qdrant = getQdrantClient();

  const collections = await qdrant.getCollections();
  const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

  if (!exists) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
      },
    });
    logger.info(`Collection ${COLLECTION_NAME} créée`);
  }
}

/**
 * Insère un vecteur d'article
 */
export async function upsertArticleVector(article: ArticleVector): Promise<void> {
  const qdrant = getQdrantClient();

  await qdrant.upsert(COLLECTION_NAME, {
    points: [
      {
        id: article.id,
        vector: article.vector,
        payload: article.payload,
      },
    ],
  });
}

/**
 * Insère plusieurs vecteurs d'articles
 */
export async function upsertArticleVectors(articles: ArticleVector[]): Promise<void> {
  const qdrant = getQdrantClient();
  const BATCH_SIZE = 100;

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);

    await qdrant.upsert(COLLECTION_NAME, {
      points: batch.map(article => ({
        id: article.id,
        vector: article.vector,
        payload: article.payload,
      })),
    });

    logger.info(`Batch ${Math.floor(i / BATCH_SIZE) + 1} inséré`);
  }
}

export interface SearchResult {
  id: string;
  score: number;
  payload: ArticleVector['payload'];
}

// Seuil de score minimum pour filtrer les résultats peu pertinents
const SCORE_THRESHOLD = 0.7;

/**
 * Recherche les articles similaires (avec cache Redis et monitoring)
 */
export async function searchSimilarArticles(
  queryVector: number[],
  limit: number = 5,
  scoreThreshold: number = SCORE_THRESHOLD,
  version: string = '2026'
): Promise<SearchResult[]> {
  // Générer une clé de cache basée sur le hash du vecteur
  const vectorHash = hashText(queryVector.slice(0, 10).join(','));
  const cacheKey = `${CACHE_PREFIX.SEARCH}${vectorHash}:${limit}:${version}`;

  // Vérifier le cache
  const cached = await redisService.get<SearchResult[]>(cacheKey);
  if (cached) {
    logger.debug(`Search cache HIT for vector hash: ${vectorHash}`);
    return cached;
  }

  const qdrant = getQdrantClient();

  // Monitoring: mesurer le temps de recherche
  const startTime = Date.now();

  const results = await qdrant.search(COLLECTION_NAME, {
    vector: queryVector,
    limit,
    with_payload: true,
    with_vector: false,           // Économie bande passante (pas besoin des vecteurs)
    score_threshold: scoreThreshold, // Filtrer résultats peu pertinents
    filter: {
      must: [{ key: 'version', match: { value: version } }],
    },
  });

  const searchDuration = Date.now() - startTime;

  // Log monitoring avec niveau approprié
  if (searchDuration > 500) {
    logger.warn(`Qdrant search slow: ${searchDuration}ms (${results.length} results)`);
  } else {
    logger.info(`Qdrant search: ${searchDuration}ms (${results.length} results, threshold: ${scoreThreshold})`);
  }

  const searchResults = results.map(result => ({
    id: String(result.id),
    score: result.score,
    payload: result.payload as ArticleVector['payload'],
  }));

  // Stocker dans le cache (1 heure)
  await redisService.set(cacheKey, searchResults, CACHE_TTL.SEARCH_RESULT);
  logger.debug(`Search cache MISS - stored for vector hash: ${vectorHash}`);

  return searchResults;
}

/**
 * Supprime tous les vecteurs
 */
export async function clearCollection(): Promise<void> {
  const qdrant = getQdrantClient();

  await qdrant.deleteCollection(COLLECTION_NAME);
  await initializeCollection();
  logger.info('Collection réinitialisée');
}

/**
 * Liste tous les articles avec pagination et filtres
 */
export async function listArticles(options: {
  limit?: number;
  offset?: number;
  tome?: string;
  chapitre?: string;
}): Promise<{ articles: SearchResult[]; total: number }> {
  const qdrant = getQdrantClient();
  const { limit = 50, offset = 0, tome, chapitre } = options;

  // Construire le filtre
  const filter: { must: Array<{ key: string; match: { value: string } }> } = { must: [] };
  if (tome) {
    filter.must.push({ key: 'tome', match: { value: tome } });
  }
  if (chapitre) {
    filter.must.push({ key: 'chapitre', match: { value: chapitre } });
  }

  // Scroll pour récupérer les articles
  const results = await qdrant.scroll(COLLECTION_NAME, {
    limit,
    offset,
    with_payload: true,
    with_vector: false,
    filter: filter.must.length > 0 ? filter : undefined,
  });

  // Compter le total
  const countResult = await qdrant.count(COLLECTION_NAME, {
    filter: filter.must.length > 0 ? filter : undefined,
    exact: true,
  });

  const articles = results.points.map(point => ({
    id: String(point.id),
    score: 1,
    payload: point.payload as ArticleVector['payload'],
  }));

  // Trier par numéro d'article
  articles.sort((a, b) => {
    const numA = parseInt(a.payload.numero.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.payload.numero.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  return { articles, total: countResult.count };
}

/**
 * Récupère un article par son numéro
 */
export async function getArticleByNumero(numero: string): Promise<SearchResult | null> {
  const qdrant = getQdrantClient();

  const results = await qdrant.scroll(COLLECTION_NAME, {
    limit: 1,
    with_payload: true,
    with_vector: false,
    filter: {
      must: [{ key: 'numero', match: { value: numero } }],
    },
  });

  if (results.points.length === 0) return null;

  const point = results.points[0];
  return {
    id: String(point.id),
    score: 1,
    payload: point.payload as ArticleVector['payload'],
  };
}

/**
 * Liste les tomes et chapitres disponibles
 */
export async function getStructure(): Promise<{ tomes: string[]; chapitres: string[] }> {
  const qdrant = getQdrantClient();

  // Récupérer tous les articles pour extraire la structure
  const results = await qdrant.scroll(COLLECTION_NAME, {
    limit: 1000,
    with_payload: true,
    with_vector: false,
  });

  const tomes = new Set<string>();
  const chapitres = new Set<string>();

  results.points.forEach(point => {
    const payload = point.payload as ArticleVector['payload'];
    if (payload.tome) tomes.add(payload.tome);
    if (payload.chapitre) chapitres.add(payload.chapitre);
  });

  return {
    tomes: Array.from(tomes).sort(),
    chapitres: Array.from(chapitres).sort(),
  };
}

export default {
  getQdrantClient,
  initializeCollection,
  upsertArticleVector,
  upsertArticleVectors,
  searchSimilarArticles,
  clearCollection,
  listArticles,
  getArticleByNumero,
  getStructure,
};
