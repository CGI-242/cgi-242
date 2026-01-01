import { Request, Response, NextFunction } from 'express';
import { OrganizationRole } from '@prisma/client';
import { sendError } from '../utils/helpers.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { hasMinimumRole, getRoleLabel } from '../types/tenant.types.js';

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
 * Middleware pour vérifier des permissions personnalisées
 *
 * Les permissions sont stockées dans le champ `permissions` de OrganizationMember
 * Format: { "canInvite": true, "canDelete": false, ... }
 */
export const requirePermission = (permissionKey: string) => {
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

    // OWNER a toutes les permissions
    if (tenant.organizationRole === 'OWNER') {
      return next();
    }

    // ADMIN a toutes les permissions sauf transfert de propriété
    if (
      tenant.organizationRole === 'ADMIN' &&
      permissionKey !== 'transferOwnership'
    ) {
      return next();
    }

    // Pour les autres rôles, vérifier les permissions personnalisées
    // Cette logique peut être étendue pour lire les permissions depuis la BDD
    return sendError(
      res,
      `Permission requise: ${permissionKey}`,
      403
    );
  };
};

export default requireOrgRole;
