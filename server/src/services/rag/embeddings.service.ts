// server/src/services/rag/embeddings.service.ts
import OpenAI from 'openai';
import { config } from '../../config/environment.js';
import { createLogger } from '../../utils/logger.js';
import { redisService, CACHE_TTL, CACHE_PREFIX, hashText } from '../redis.service.js';

const logger = createLogger('EmbeddingsService');

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export interface EmbeddingResult {
  embedding: number[];
  tokensUsed: number;
  cached?: boolean;
}

/**
 * Génère un embedding pour un texte donné (avec cache Redis)
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  // Générer la clé de cache
  const cacheKey = `${CACHE_PREFIX.EMBEDDING}${hashText(text)}`;

  // Vérifier le cache
  const cached = await redisService.get<number[]>(cacheKey);
  if (cached) {
    logger.debug(`Embedding cache HIT for text hash: ${hashText(text)}`);
    return {
      embedding: cached,
      tokensUsed: 0,
      cached: true,
    };
  }

  // Générer l'embedding via API
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  const embedding = response.data[0].embedding;
  const tokensUsed = response.usage?.total_tokens || 0;

  // Stocker dans le cache (7 jours)
  await redisService.set(cacheKey, embedding, CACHE_TTL.EMBEDDING);
  logger.debug(`Embedding cache MISS - stored for text hash: ${hashText(text)}`);

  return {
    embedding,
    tokensUsed,
    cached: false,
  };
}

/**
 * Génère des embeddings pour plusieurs textes
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  const BATCH_SIZE = 100;
  const results: EmbeddingResult[] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });

    const tokensPerItem = Math.floor((response.usage?.total_tokens || 0) / batch.length);

    for (const data of response.data) {
      results.push({
        embedding: data.embedding,
        tokensUsed: tokensPerItem,
      });
    }

    logger.info(`Embeddings batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)}`);
  }

  return results;
}

/**
 * Calcule la similarité cosinus entre deux vecteurs
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Les vecteurs doivent avoir la même dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default {
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity,
};
