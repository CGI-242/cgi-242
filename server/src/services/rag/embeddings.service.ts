// server/src/services/rag/embeddings.service.ts
import OpenAI from 'openai';
import { config } from '../../config/environment.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('EmbeddingsService');

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export interface EmbeddingResult {
  embedding: number[];
  tokensUsed: number;
}

/**
 * Génère un embedding pour un texte donné
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return {
    embedding: response.data[0].embedding,
    tokensUsed: response.usage?.total_tokens || 0,
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
