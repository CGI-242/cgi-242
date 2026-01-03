// server/src/controllers/audit.controller.ts
import { Request, Response } from 'express';
import { AuditAction } from '@prisma/client';
import { AuditService } from '../services/audit.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/helpers.js';
import { isSuperAdmin } from '../middleware/auth.middleware.js';

/**
 * Récupérer les logs d'audit d'une organisation
 * Route: GET /api/organizations/:orgId/audit
 */
export const getOrganizationAudit = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const limit = parseInt(req.query.limit as string) || 100;

  const logs = await AuditService.getOrganizationAudit(orgId, limit);

  sendSuccess(res, logs);
});

/**
 * Récupérer les actions d'un utilisateur spécifique
 * Route: GET /api/audit/user/:userId
 */
export const getUserActions = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const requesterId = req.user!.id;
  const requesterEmail = req.user!.email;

  // Un utilisateur ne peut voir que ses propres actions (sauf super admin)
  if (userId !== requesterId && !isSuperAdmin(requesterEmail)) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  const limit = parseInt(req.query.limit as string) || 100;
  const logs = await AuditService.getUserActions(userId, limit);

  sendSuccess(res, logs);
});

/**
 * Récupérer l'historique d'une entité spécifique
 * Route: GET /api/audit/entity/:entityType/:entityId
 */
export const getEntityHistory = asyncHandler(async (req: Request, res: Response) => {
  const { entityType, entityId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;

  const logs = await AuditService.getEntityHistory(entityType, entityId, limit);

  sendSuccess(res, logs);
});

/**
 * Rechercher dans les logs d'audit avec filtres
 * Route: GET /api/audit/search
 */
export const searchAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const {
    organizationId,
    actorId,
    action,
    entityType,
    startDate,
    endDate,
    limit
  } = req.query;

  const logs = await AuditService.search({
    organizationId: organizationId as string,
    actorId: actorId as string,
    action: action as AuditAction | undefined,
    entityType: entityType as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    limit: limit ? parseInt(limit as string) : 100
  });

  sendSuccess(res, logs);
});

/**
 * Obtenir les statistiques des actions
 * Route: GET /api/audit/stats
 */
export const getAuditStats = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, days } = req.query;

  const stats = await AuditService.getActionStats(
    organizationId as string,
    days ? parseInt(days as string) : 30
  );

  sendSuccess(res, stats);
});

/**
 * Nettoyer les anciens logs (admin uniquement)
 * Route: DELETE /api/audit/cleanup
 */
export const cleanupAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const { olderThanDays } = req.query;

  const deletedCount = await AuditService.cleanupOldLogs(
    olderThanDays ? parseInt(olderThanDays as string) : 365
  );

  sendSuccess(res, { deletedCount }, `${deletedCount} logs supprimés`);
});
