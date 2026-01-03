// server/src/routes/audit.routes.ts
import { Router } from 'express';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/orgRole.middleware.js';
import * as auditController from '../controllers/audit.controller.js';

const router = Router();

// === Routes d'audit pour organisations ===

/**
 * GET /api/organizations/:orgId/audit
 * Récupérer les logs d'audit d'une organisation
 * Accès: ADMIN ou OWNER de l'organisation
 */
router.get(
  '/organizations/:orgId/audit',
  authMiddleware,
  requireAdmin,
  auditController.getOrganizationAudit
);

// === Routes d'audit générales ===

/**
 * GET /api/audit/user/:userId
 * Récupérer les actions d'un utilisateur
 * Accès: L'utilisateur lui-même ou un super admin
 */
router.get(
  '/audit/user/:userId',
  authMiddleware,
  auditController.getUserActions
);

/**
 * GET /api/audit/entity/:entityType/:entityId
 * Récupérer l'historique d'une entité
 * Accès: Utilisateur authentifié avec accès à l'entité
 */
router.get(
  '/audit/entity/:entityType/:entityId',
  authMiddleware,
  auditController.getEntityHistory
);

/**
 * GET /api/audit/search
 * Rechercher dans les logs d'audit
 * Query params: organizationId, actorId, action, entityType, startDate, endDate, limit
 * Accès: Super admin uniquement
 */
router.get(
  '/audit/search',
  authMiddleware,
  requireSuperAdmin,
  auditController.searchAuditLogs
);

/**
 * GET /api/audit/stats
 * Obtenir les statistiques des actions
 * Query params: organizationId, days
 * Accès: Super admin uniquement
 */
router.get(
  '/audit/stats',
  authMiddleware,
  requireSuperAdmin,
  auditController.getAuditStats
);

/**
 * DELETE /api/audit/cleanup
 * Nettoyer les anciens logs (RGPD)
 * Query params: olderThanDays (défaut: 365)
 * Accès: Super admin uniquement
 */
router.delete(
  '/audit/cleanup',
  authMiddleware,
  requireSuperAdmin,
  auditController.cleanupAuditLogs
);

export default router;
