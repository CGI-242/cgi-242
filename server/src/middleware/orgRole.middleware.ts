import { Request, Response, NextFunction } from 'express';
import { OrganizationRole } from '@prisma/client';
import { sendError } from '../utils/helpers.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { hasMinimumRole, getRoleLabel } from '../types/tenant.types.js';
import { permissionService } from '../services/permission.service.js';
import { Permission, PERMISSION_DESCRIPTIONS } from '../types/permission.types.js';

/**
 * Middleware factory pour vérifier le rôle minimum dans une organisation
 *
 * Usage:
 * router.post('/members/invite', requireOrgRole('ADMIN'), controller.inviteMember);
 */
export const requireOrgRole = (minimumRole: OrganizationRole) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const tenant = req.tenant;

    if (!tenant) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    // Vérifier que nous sommes dans un contexte d'organisation
    if (tenant.type !== 'organization') {
      return sendError(
        res,
        'Cette action requiert un contexte d\'organisation',
        400
      );
    }

    // Vérifier le rôle
    const userRole = tenant.organizationRole as OrganizationRole;

    if (!userRole) {
      return sendError(res, ERROR_MESSAGES.NOT_ORG_MEMBER, 403);
    }

    if (!hasMinimumRole(userRole, minimumRole)) {
      return sendError(
        res,
        `${ERROR_MESSAGES.INSUFFICIENT_ROLE}. Requis: ${getRoleLabel(minimumRole)}, Actuel: ${getRoleLabel(userRole)}`,
        403
      );
    }

    next();
  };
};

/**
 * Raccourcis pour les rôles communs
 */
export const requireOwner = requireOrgRole('OWNER');
export const requireAdmin = requireOrgRole('ADMIN');
export const requireMember = requireOrgRole('MEMBER');
export const requireViewer = requireOrgRole('VIEWER');

/**
 * Middleware pour vérifier que l'utilisateur est propriétaire OU agit sur lui-même
 * Utile pour les actions comme "quitter l'organisation"
 */
export const requireOwnerOrSelf = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const tenant = req.tenant;
  const targetUserId = req.params.userId;

  if (!tenant) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  if (tenant.type !== 'organization') {
    return sendError(
      res,
      'Cette action requiert un contexte d\'organisation',
      400
    );
  }

  const userRole = tenant.organizationRole as OrganizationRole;

  // L'utilisateur peut agir sur lui-même ou doit être OWNER
  if (targetUserId === tenant.userId || userRole === 'OWNER') {
    return next();
  }

  return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
};

/**
 * Middleware pour vérifier que l'utilisateur est ADMIN+ OU agit sur lui-même
 */
export const requireAdminOrSelf = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const tenant = req.tenant;
  const targetUserId = req.params.userId;

  if (!tenant) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  if (tenant.type !== 'organization') {
    return sendError(
      res,
      'Cette action requiert un contexte d\'organisation',
      400
    );
  }

  const userRole = tenant.organizationRole as OrganizationRole;

  // L'utilisateur peut agir sur lui-même ou doit être ADMIN+
  if (targetUserId === tenant.userId || hasMinimumRole(userRole, 'ADMIN')) {
    return next();
  }

  return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
};

/**
 * Middleware pour vérifier des permissions granulaires
 *
 * Les permissions sont stockées dans le champ `permissions` de OrganizationMember
 * et évaluées par le PermissionService
 */
export const requirePermission = (permission: Permission) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    const tenant = req.tenant;

    if (!tenant) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    if (tenant.type !== 'organization') {
      return sendError(
        res,
        'Cette action requiert un contexte d\'organisation',
        400
      );
    }

    if (!tenant.organizationId) {
      return sendError(res, ERROR_MESSAGES.ORG_NOT_FOUND, 404);
    }

    // Vérifier la permission via le service
    const hasPermission = await permissionService.hasPermission(
      tenant.organizationId,
      tenant.userId,
      permission
    );

    if (!hasPermission) {
      const permDesc = PERMISSION_DESCRIPTIONS[permission];
      const label = permDesc?.label || permission;
      return sendError(
        res,
        `Permission requise: ${label}`,
        403
      );
    }

    next();
  };
};

/**
 * Middleware pour vérifier plusieurs permissions (toutes requises)
 */
export const requireAllPermissions = (...permissions: Permission[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    const tenant = req.tenant;

    if (!tenant || tenant.type !== 'organization' || !tenant.organizationId) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const hasAll = await permissionService.hasAllPermissions(
      tenant.organizationId,
      tenant.userId,
      permissions
    );

    if (!hasAll) {
      return sendError(res, 'Permissions insuffisantes', 403);
    }

    next();
  };
};

/**
 * Middleware pour vérifier au moins une permission parmi plusieurs
 */
export const requireAnyPermission = (...permissions: Permission[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    const tenant = req.tenant;

    if (!tenant || tenant.type !== 'organization' || !tenant.organizationId) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const hasAny = await permissionService.hasAnyPermission(
      tenant.organizationId,
      tenant.userId,
      permissions
    );

    if (!hasAny) {
      return sendError(res, 'Permissions insuffisantes', 403);
    }

    next();
  };
};

export default requireOrgRole;
