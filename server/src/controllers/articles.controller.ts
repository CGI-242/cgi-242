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
 * Parse un suffixe composé (ex: "A bis", "B ter") et retourne un tuple [lettre, latin]
 * - lettre: 0 si pas de lettre, sinon A=1, B=2, etc.
 * - latin: 0 si pas de suffixe latin, sinon bis=1, ter=2, etc.
 */
function parseSuffix(suffixStr: string): { letter: number; latin: number } {
  // Retirer les annotations comme "(L.F. 2025)" avant de traiter le suffixe
  const cleanedSuffix = suffixStr.replace(/\s*\([^)]*\)\s*/g, '');
  const suffix = cleanedSuffix.toLowerCase().trim().replace(/^-/, '');

  if (!suffix) {
    return { letter: 0, latin: 0 };
  }

  // Regex pour parser "A", "A bis", "bis", etc.
  const match = suffix.match(/^([a-z])?\s*(bis|ter|quater|quinquies|sexies|septies|octies|nonies|decies|undecies|duodecies)?$/);

  if (!match) {
    // Suffixe non reconnu, le mettre à la fin
    return { letter: 999, latin: 999 };
  }

  const letterPart = match[1];
  const latinPart = match[2];

  const letter = letterPart ? (letterPart.charCodeAt(0) - 96) : 0; // a=1, b=2, etc.
  const latin = latinPart ? (LATIN_SUFFIX_ORDER[latinPart] ?? 0) : 0;

  return { letter, latin };
}

/**
 * Trie les articles par numéro avec gestion des suffixes latins et lettres
 * Ordre: 111, 111 bis, 111 ter, 111-A, 111-A bis, 111-A ter, 111-B, 111-B bis, etc.
 */
function sortArticlesByNumero<T extends { numero: string }>(articles: T[]): T[] {
  return articles.sort((a, b) => {
    const parseNumero = (num: string) => {
      const match = num.match(/^(\d+)\s*[-]?\s*(.*)$/);
      if (!match) return { base: 0, letter: 0, latin: 0 };
      const base = parseInt(match[1], 10);
      const { letter, latin } = parseSuffix(match[2]);
      return { base, letter, latin };
    };

    const numA = parseNumero(a.numero);
    const numB = parseNumero(b.numero);

    // Comparer d'abord le numéro de base
    if (numA.base !== numB.base) {
      return numA.base - numB.base;
    }
    // Puis la lettre (A, B, C...)
    if (numA.letter !== numB.letter) {
      return numA.letter - numB.letter;
    }
    // Enfin le suffixe latin (bis, ter...)
    return numA.latin - numB.latin;
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
