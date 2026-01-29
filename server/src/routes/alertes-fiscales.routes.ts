// server/src/routes/alertes-fiscales.routes.ts
import { Router } from 'express';
import {
  getAlertes,
  getAlerteById,
  getAlertesForArticle,
  getStatsByType,
  getStatsByCategorie,
  extractAlertes,
} from '../controllers/alertes-fiscales.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { httpCache, CACHE_PRESETS } from '../middleware/cache.middleware.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/alertes-fiscales - Liste des alertes fiscales avec filtres
// Cache 5 min pour performance
router.get('/', httpCache(CACHE_PRESETS.ARTICLE_LIST), getAlertes);

// GET /api/alertes-fiscales/stats/by-type - Statistiques par type
// Cache 1h car données agrégées stables
router.get('/stats/by-type', httpCache(CACHE_PRESETS.ARTICLE), getStatsByType);

// GET /api/alertes-fiscales/stats/by-categorie - Statistiques par catégorie
// Cache 1h car données agrégées stables
router.get('/stats/by-categorie', httpCache(CACHE_PRESETS.ARTICLE), getStatsByCategorie);

// GET /api/alertes-fiscales/article/:numero - Alertes d'un article spécifique
// Cache 5 min
router.get('/article/:numero', httpCache(CACHE_PRESETS.ARTICLE_LIST), getAlertesForArticle);

// GET /api/alertes-fiscales/:id - Récupère une alerte par son ID
// Cache 1h avec ETag
router.get('/:id', httpCache(CACHE_PRESETS.ARTICLE), getAlerteById);

// POST /api/alertes-fiscales/extract - Lance l'extraction (admin only)
// Pas de cache pour les mutations
router.post('/extract', extractAlertes);

export default router;
