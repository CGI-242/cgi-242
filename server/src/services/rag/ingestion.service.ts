// server/src/services/rag/ingestion.service.ts
import { prisma } from '../../config/database.js';
import { generateEmbeddings } from './embeddings.service.js';
import { initializeCollection, upsertArticleVectors, ArticleVector } from './qdrant.service.js';
import { createLogger } from '../../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('IngestionService');

interface ArticleSourceMeta {
  document?: string;
  pays?: string;
  edition?: string;
  version?: string; // Support du champ version en plus de edition
  tome?: number;
  partie?: number;
  livre?: number;
  chapitre?: number;
  chapitre_titre?: string;
  titre?: string; // Support du champ titre pour section
  section?: number;
  section_titre?: string;
  page_source?: number;
  source?: string;
}

interface ArticleSource {
  article: string;
  titre?: string;
  chapeau?: string;
  texte: string[];
  mots_cles?: string[];
  statut?: string;
  section?: string;
}

interface SousSection {
  sous_section?: number;
  titre?: string;
  articles?: ArticleSource[];
  paragraphes?: Array<{
    paragraphe?: number;
    titre?: string;
    articles?: ArticleSource[];
  }>;
}

interface SourceFile {
  meta: ArticleSourceMeta;
  articles?: ArticleSource[];
  sous_sections?: SousSection[];
}

export interface ArticleJSON {
  numero: string;
  titre?: string;
  chapeau?: string;
  contenu: string;
  tome?: string;
  partie?: string;
  livre?: string;
  chapitre?: string;
  section?: string;
  version?: string;
  keywords?: string[];
}

export interface IngestionResult {
  total: number;
  inserted: number;
  updated: number;
  errors: number;
  tokensUsed: number;
}

function parseArticleNumber(article: string): string {
  // Nettoyer le préfixe "Art." ou "Article"
  let numero = article.replace(/^Art(?:icle)?\.?\s*/i, '').trim();

  // Supprimer les ordinaux français "1er" → "1", "2ème" → "2"
  // mais garder les suffixes alphabétiques majuscules (91E, 92E, etc.)
  numero = numero.replace(/^(\d+)(?:er|ère|ème)(\s|$)/i, '$1$2');

  // Si le résultat est vide, retourner l'original nettoyé
  if (!numero) {
    return article.trim();
  }

  return numero;
}

interface Section {
  section?: number;
  titre?: string;
  articles?: ArticleSource[];
  sous_sections?: SousSection[];
}

function extractArticlesFromSource(source: SourceFile & { sections?: Section[] }): ArticleSource[] {
  const allArticles: ArticleSource[] = [];

  // Fonction helper pour ajouter le contexte de section aux articles
  const addWithSection = (articles: ArticleSource[], sectionTitle?: string) => {
    for (const art of articles) {
      // Si l'article n'a pas de section string, ajouter le titre de section
      if (!art.section || typeof art.section !== 'string') {
        allArticles.push({ ...art, section: sectionTitle });
      } else {
        allArticles.push(art);
      }
    }
  };

  // Articles directs à la racine
  if (source.articles) {
    allArticles.push(...source.articles);
  }

  // Articles dans les sections (format unifié 2025/2026)
  if (source.sections) {
    for (const section of source.sections) {
      const sectionTitle = section.titre || (section.section ? `Section ${section.section}` : undefined);
      // Articles directs dans la section
      if (section.articles) {
        addWithSection(section.articles, sectionTitle);
      }
      // Articles dans les sous-sections de la section
      if (section.sous_sections) {
        for (const sousSection of section.sous_sections) {
          const sousSectionTitle = sousSection.titre || sectionTitle;
          if (sousSection.articles) {
            addWithSection(sousSection.articles, sousSectionTitle);
          }
        }
      }
    }
  }

  // Articles dans les sous-sections (ancien format)
  if (source.sous_sections) {
    for (const sousSection of source.sous_sections) {
      const sectionTitle = sousSection.titre || (sousSection.sous_section ? `Sous-section ${sousSection.sous_section}` : undefined);
      if (sousSection.articles) {
        addWithSection(sousSection.articles, sectionTitle);
      }
      // Articles dans les paragraphes des sous-sections
      if (sousSection.paragraphes) {
        for (const paragraphe of sousSection.paragraphes) {
          const paraTitle = paragraphe.titre || sectionTitle;
          if (paragraphe.articles) {
            addWithSection(paragraphe.articles, paraTitle);
          }
        }
      }
    }
  }

  return allArticles;
}

function transformSourceToArticles(source: SourceFile): ArticleJSON[] {
  const { meta } = source;
  const articles = extractArticlesFromSource(source);

  // Filtrer les articles sans numéro (entrées invalides)
  const validArticles = articles.filter((art) => art.article && typeof art.article === 'string');

  return validArticles.map((art) => ({
    numero: parseArticleNumber(art.article),
    titre: art.titre,
    chapeau: art.chapeau,
    contenu: art.texte.join('\n'),
    tome: meta.tome?.toString(),
    partie: meta.partie ? `Partie ${meta.partie}` : undefined,
    livre: meta.livre ? `Livre ${meta.livre}` : undefined,
    chapitre: meta.chapitre_titre || (meta.chapitre ? `Chapitre ${meta.chapitre}` : undefined),
    // Priorité à la section de l'article (string), sinon celle du meta
    // S'assurer que section est toujours une string ou undefined
    // Note: meta.titre est le numéro du Titre (int), pas un titre de section
    section: typeof art.section === 'string' ? art.section
           : meta.section_titre
           || (typeof meta.titre === 'string' ? meta.titre : undefined)
           || (meta.section ? `Section ${meta.section}` : undefined),
    // Supporte version OU edition pour la compatibilité CGI 2025/2026
    version: meta.version || meta.edition || '2025',
    keywords: art.mots_cles || [],
  }));
}

function prepareArticleText(article: ArticleJSON): string {
  const parts: string[] = [];
  if (article.numero) parts.push(`Article ${article.numero}`);
  if (article.titre) parts.push(article.titre);
  if (article.tome) parts.push(`Tome: ${article.tome}`);
  if (article.chapitre) parts.push(`Chapitre: ${article.chapitre}`);
  parts.push(article.contenu);
  if (article.keywords?.length) parts.push(`Mots-clés: ${article.keywords.join(', ')}`);
  return parts.join('\n');
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
            keywords: article.keywords || [],
          };

          let dbArticle;
          if (existing) {
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
