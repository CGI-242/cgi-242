// server/src/controllers/articles.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { getStructure } from '../services/rag/qdrant.service.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ArticlesController');

// Ordre des suffixes latins pour le tri correct des articles
const LATIN_SUFFIX_ORDER: Record<string, number> = {
  '': 0,
  'bis': 1,
  'ter': 2,
  'quater': 3,
  'quinquies': 4,
  'sexies': 5,
  'septies': 6,
  'octies': 7,
  'nonies': 8,
  'decies': 9,
  'undecies': 10,
  'duodecies': 11,
};

/**
 * Calcule l'ordre d'un suffixe (latin ou lettre)
 */
function getSuffixOrder(suffixStr: string): number {
  const suffix = suffixStr.toLowerCase().trim().replace(/^-/, '');

  // Vérifier si c'est un suffixe latin
  if (LATIN_SUFFIX_ORDER[suffix] !== undefined) {
    return LATIN_SUFFIX_ORDER[suffix];
  }

  // Vérifier si c'est une lettre seule (A, B, C...) - ordre alphabétique après les suffixes latins
  if (/^[a-z]$/.test(suffix)) {
    return 100 + suffix.charCodeAt(0) - 97; // A=100, B=101, etc.
  }

  return 999;
}

/**
 * Trie les articles par numéro avec gestion des suffixes latins et lettres
 * Ex: 31, 31 bis, 31 ter, ... 31 nonies, 36-A, 36-B
 */
function sortArticlesByNumero<T extends { numero: string }>(articles: T[]): T[] {
  return articles.sort((a, b) => {
    const parseNumero = (num: string) => {
      const match = num.match(/^(\d+)\s*[-]?\s*(.*)$/);
      if (!match) return { base: 0, suffix: 0 };
      const base = parseInt(match[1], 10);
      const suffix = getSuffixOrder(match[2]);
      return { base, suffix };
    };

    const numA = parseNumero(a.numero);
    const numB = parseNumero(b.numero);

    if (numA.base !== numB.base) {
      return numA.base - numB.base;
    }
    return numA.suffix - numB.suffix;
  });
}

/**
 * Liste les articles du CGI avec pagination et filtres
 * Utilise Prisma pour récupérer le contenu complet (non tronqué)
 */
export async function getArticles(req: Request, res: Response): Promise<void> {
  try {
    const { limit = '50', offset = '0', tome, chapitre, search, version = '2025' } = req.query;

    const where: Record<string, unknown> = {};
    // Filtre par version (2025 ou 2026)
    where.version = version as string;
    if (tome) where.tome = tome as string;
    if (chapitre) where.chapitre = { contains: chapitre as string };
    if (search && typeof search === 'string') {
      where.OR = [
        { numero: { contains: search, mode: 'insensitive' } },
        { titre: { contains: search, mode: 'insensitive' } },
        { contenu: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [articlesRaw, total] = await Promise.all([
      prisma.article.findMany({
        where,
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10),
        select: {
          id: true,
          numero: true,
          titre: true,
          chapeau: true,
          contenu: true,
          tome: true,
          chapitre: true,
          version: true,
        },
      }),
      prisma.article.count({ where }),
    ]);

    // Tri correct avec gestion des suffixes latins (bis, ter, ... nonies)
    const articles = sortArticlesByNumero(articlesRaw);

    sendSuccess(res, {
      articles,
      total,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });
  } catch (error) {
    logger.error('Erreur getArticles:', error);
    sendError(res, 'Erreur lors de la récupération des articles', 500);
  }
}

/**
 * Récupère un article par son numéro
 * Utilise Prisma pour récupérer le contenu complet
 */
export async function getArticle(req: Request, res: Response): Promise<void> {
  try {
    const { numero } = req.params;
    const { version = '2025', tome = '1' } = req.query;

    const article = await prisma.article.findUnique({
      where: {
        numero_version_tome: {
          numero,
          version: version as string,
          tome: tome as string
        }
      },
      select: {
        id: true,
        numero: true,
        titre: true,
        chapeau: true,
        contenu: true,
        tome: true,
        chapitre: true,
        version: true,
      },
    });

    if (!article) {
      sendError(res, 'Article non trouvé', 404);
      return;
    }

    sendSuccess(res, article);
  } catch (error) {
    logger.error('Erreur getArticle:', error);
    sendError(res, 'Erreur lors de la récupération de l\'article', 500);
  }
}

/**
 * Récupère la structure du CGI (tomes et chapitres)
 */
export async function getCgiStructure(req: Request, res: Response): Promise<void> {
  try {
    const structure = await getStructure();
    sendSuccess(res, structure);
  } catch (error) {
    logger.error('Erreur getCgiStructure:', error);
    sendError(res, 'Erreur lors de la récupération de la structure', 500);
  }
}
