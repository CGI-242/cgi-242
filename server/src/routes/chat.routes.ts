// server/src/routes/chat.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import * as chatController from '../controllers/chat.controller.js';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);
router.use(tenantMiddleware);

// Envoyer un message avec l'orchestrateur multi-agent (2025/2026)
// Analyse l'intention et route vers le bon agent CGI
router.post(
  '/message',
  [
    body('content').notEmpty().withMessage('Le contenu est requis'),
    body('conversationId').optional().isUUID(),
    body('forceYear').optional().isIn([2025, 2026]).withMessage('forceYear doit être 2025 ou 2026'),
  ],
  validate,
  chatController.sendMessageOrchestrated
);

// Lister les conversations
router.get('/conversations', chatController.getConversations);

// Obtenir une conversation
router.get('/conversations/:id', chatController.getConversation);

// Supprimer une conversation
router.delete('/conversations/:id', chatController.deleteConversation);

export default router;
