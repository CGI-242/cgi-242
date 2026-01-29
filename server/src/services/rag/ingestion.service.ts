// server/src/services/rag/ingestion.service.ts
import { prisma } from '../../config/database.js';
import { ArticleStatut } from '@prisma/client';
import { generateEmbeddings } from './embeddings.service.js';
import { initializeCollection, upsertArticleVectors, ArticleVector } from './qdrant.service.js';
import { createLogger } from '../../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import {
  ArticleJSON,
  SourceFile,
  transformSourceToArticles,
  prepareArticleText,
} from './ingestion.parsers.js';

// Ré-exporter les types pour les consommateurs existants
export type { ArticleJSON, SourceFile } from './ingestion.parsers.js';

// Fonction pour mapper les valeurs string vers l'enum Prisma
function mapStatutToEnum(statut: string | undefined): ArticleStatut {
  const statutLower = (statut || 'en vigueur').toLowerCase().trim();
  if (statutLower === 'abrogé' || statutLower === 'abroge') {
    return ArticleStatut.ABROGE;
  }
  if (statutLower === 'modifié' || statutLower === 'modifie') {
    return ArticleStatut.MODIFIE;
  }
  return ArticleStatut.EN_VIGUEUR;
}

const logger = createLogger('IngestionService');

export interface IngestionResult {
  total: number;
  inserted: number;
  updated: number;
  errors: number;
  tokensUsed: number;
}

export async function ingestFromSource(sources: SourceFile[]): Promise<IngestionResult> {
  const allArticles: ArticleJSON[] = [];
  for (const source of sources) {
    allArticles.push(...transformSourceToArticles(source));
  }
  return ingestArticles(allArticles);
}

export async function ingestArticles(articles: ArticleJSON[]): Promise<IngestionResult> {
  const result: IngestionResult = {
    total: articles.length,
    inserted: 0,
    updated: 0,
    errors: 0,
    tokensUsed: 0,
  };

  await initializeCollection();
  logger.info(`Début ingestion de ${articles.length} articles`);

  const BATCH_SIZE = 20;

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const texts = batch.map(prepareArticleText);

    try {
      const embeddings = await generateEmbeddings(texts);
      const vectors: ArticleVector[] = [];

      for (let j = 0; j < batch.length; j++) {
        const article = batch[j];
        const embedding = embeddings[j];
        result.tokensUsed += embedding.tokensUsed;

        try {
          const version = article.version || '2025';
          const tome = article.tome || '1';
          const existing = await prisma.article.findUnique({
            where: {
              numero_version_tome: {
                numero: article.numero,
                version: version,
                tome: tome
              }
            },
          });

          const articleStatutEnum = mapStatutToEnum(article.statut);
          const articleData = {
            numero: article.numero,
            titre: article.titre,
            chapeau: article.chapeau,
            contenu: article.contenu,
            tome: tome,
            partie: article.partie,
            livre: article.livre,
            chapitre: article.chapitre,
            section: article.section,
            version: version,
            statut: articleStatutEnum,
            keywords: article.keywords || [],
          };

          let dbArticle;
          if (existing) {
            // Ne pas écraser un article "en vigueur" par un article "abrogé"
            const existingStatut = existing.statut || ArticleStatut.EN_VIGUEUR;
            if (existingStatut === ArticleStatut.EN_VIGUEUR && articleStatutEnum === ArticleStatut.ABROGE) {
              logger.debug(`Skip: Article ${article.numero} (en vigueur) non écrasé par version abrogée`);
              dbArticle = existing;
            } else {
              dbArticle = await prisma.article.update({
                where: {
                  numero_version_tome: {
                    numero: article.numero,
                    version: version,
                    tome: tome
                  }
                },
                data: articleData,
              });
              result.updated++;
            }
          } else {
            dbArticle = await prisma.article.create({ data: articleData });
            result.inserted++;
          }

          vectors.push({
            id: uuidv4(),
            vector: embedding.embedding,
            payload: {
              articleId: dbArticle.id,
              numero: article.numero,
              titre: article.titre,
              contenu: article.contenu.substring(0, 1000),
              tome: article.tome,
              chapitre: article.chapitre,
              version: version,
              keywords: article.keywords || [],
            },
          });
        } catch (err) {
          logger.error(`Erreur article ${article.numero}:`, err);
          result.errors++;
        }
      }

      if (vectors.length > 0) {
        await upsertArticleVectors(vectors);
      }

      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(articles.length / BATCH_SIZE);
      logger.info(`Batch ${batchNum}/${totalBatches} traité`);
    } catch (err) {
      logger.error('Erreur batch embeddings:', err);
      result.errors += batch.length;
    }
  }

  logger.info(`Ingestion terminée: ${result.inserted} insérés, ${result.updated} mis à jour`);
  return result;
}

export default { ingestArticles, ingestFromSource };
