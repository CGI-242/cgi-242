// server/src/routes/articles.routes.ts
import { Router } from 'express';
import { getArticles, getArticle, getCgiStructure } from '../controllers/articles.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/articles - Liste des articles avec pagination et filtres
router.get('/', getArticles);

// GET /api/articles/structure - Structure du CGI (tomes, chapitres)
router.get('/structure', getCgiStructure);

// GET /api/articles/:numero - Récupère un article par son numéro
router.get('/:numero', getArticle);

export default router;
