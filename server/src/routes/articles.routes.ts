// server/src/routes/articles.routes.ts
import { Router } from 'express';
import { getArticles, getArticle, getCgiStructure } from '../controllers/articles.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { httpCache, CACHE_PRESETS } from '../middleware/cache.middleware.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/articles - Liste des articles avec pagination et filtres
// Cache 5 min + stale-while-revalidate pour UX fluide
router.get('/', httpCache(CACHE_PRESETS.ARTICLE_LIST), getArticles);

// GET /api/articles/structure - Structure du CGI (tomes, chapitres)
// Cache long (24h) car structure stable
router.get('/structure', httpCache(CACHE_PRESETS.STATIC), getCgiStructure);

// GET /api/articles/:numero - Récupère un article par son numéro
// Cache 1h avec ETag pour revalidation
router.get('/:numero', httpCache(CACHE_PRESETS.ARTICLE), getArticle);

export default router;
