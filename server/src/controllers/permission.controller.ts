import { Request, Response } from 'express';
import { permissionService } from '../services/permission.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/helpers.js';
import { isValidPermission, Permission } from '../types/permission.types.js';

/**
 * GET /api/permissions
 * Liste toutes les permissions disponibles avec leurs descriptions
 */
export const getAllPermissions = asyncHandler(async (req: Request, res: Response) => {
  const permissions = permissionService.getAllPermissions();
  sendSuccess(res, permissions);
});

/**
 * GET /api/permissions/my
 * Récupère les permissions effectives de l'utilisateur courant
 */
export const getMyPermissions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const organizationId = req.tenant?.organizationId;

  const permissions = await permissionService.getAllEffectivePermissions(
    userId,
    organizationId
  );

  sendSuccess(res, permissions);
});

/**
 * GET /api/permissions/check/:permission
 * Vérifie si l'utilisateur a une permission spécifique
 */
export const checkPermission = asyncHandler(async (req: Request, res: Response) => {
  const { permission } = req.params;
  const userId = req.user!.id;
  const organizationId = req.tenant?.organizationId;

  if (!isValidPermission(permission)) {
    return sendSuccess(res, { hasPermission: false, reason: 'Permission invalide' });
  }

  const hasPermission = await permissionService.hasAnySourcePermission(
    userId,
    permission as Permission,
    organizationId
  );

  sendSuccess(res, { permission, hasPermission });
});

/**
 * GET /api/organizations/:orgId/members/:userId/permissions
 * Récupère les permissions effectives d'un membre
 */
export const getMemberPermissions = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId: memberId } = req.params;

  const permissions = await permissionService.getEffectivePermissions(orgId, memberId);

  sendSuccess(res, { memberId, permissions });
});

/**
 * PUT /api/organizations/:orgId/members/:userId/permissions
 * Met à jour les permissions personnalisées d'un membre
 */
export const updateMemberPermissions = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId: memberId } = req.params;
  const { permissions } = req.body;
  const actorId = req.user!.id;

  await permissionService.updateMemberPermissions(orgId, memberId, permissions, actorId);

  const updatedPermissions = await permissionService.getEffectivePermissions(orgId, memberId);

  sendSuccess(res, { memberId, permissions: updatedPermissions }, 'Permissions mises à jour');
});

/**
 * POST /api/organizations/:orgId/members/:userId/permissions/grant
 * Accorde une permission spécifique à un membre
 */
export const grantPermission = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId: memberId } = req.params;
  const { permission } = req.body;
  const actorId = req.user!.id;

  if (!isValidPermission(permission)) {
    return sendSuccess(res, { error: 'Permission invalide' }, '', 400);
  }

  await permissionService.grantPermission(orgId, memberId, permission, actorId);

  sendSuccess(res, null, 'Permission accordée');
});

/**
 * POST /api/organizations/:orgId/members/:userId/permissions/revoke
 * Retire une permission spécifique à un membre
 */
export const revokePermission = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId: memberId } = req.params;
  const { permission } = req.body;
  const actorId = req.user!.id;

  if (!isValidPermission(permission)) {
    return sendSuccess(res, { error: 'Permission invalide' }, '', 400);
  }

  await permissionService.revokePermission(orgId, memberId, permission, actorId);

  sendSuccess(res, null, 'Permission retirée');
});

/**
 * POST /api/organizations/:orgId/members/:userId/permissions/reset
 * Réinitialise les permissions aux valeurs par défaut du rôle
 */
export const resetPermissions = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId: memberId } = req.params;
  const actorId = req.user!.id;

  await permissionService.resetToDefaults(orgId, memberId, actorId);

  const permissions = await permissionService.getEffectivePermissions(orgId, memberId);

  sendSuccess(res, { memberId, permissions }, 'Permissions réinitialisées');
});
