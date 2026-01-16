// server/src/services/permission.service.ts
// Service de gestion des permissions basées sur les rôles

import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { AppError } from '../middleware/error.middleware.js';
import {
  Permission,
  PermissionSet,
  PERMISSIONS,
  DEFAULT_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_CATEGORIES,
  PLAN_PERMISSIONS,
  isValidPermission,
  getDefaultPermissions,
} from '../types/permission.types.js';
import { AuditService } from './audit.service.js';
import {
  hasPlanPermission,
  getAllEffectivePermissions as getPlanEffectivePermissions,
  EffectivePermissions,
} from './permission.plan.service.js';

const logger = createLogger('PermissionService');

export class PermissionService {
  /**
   * Vérifie si un membre a une permission spécifique
   */
  async hasPermission(
    organizationId: string,
    userId: string,
    permission: Permission
  ): Promise<boolean> {
    if (!isValidPermission(permission)) {
      logger.warn(`Permission invalide demandée: ${permission}`);
      return false;
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { organizationId, userId } },
      select: { role: true, permissions: true },
    });

    if (!member) return false;
    if (member.role === 'OWNER') return true;

    const customPermissions = (member.permissions as PermissionSet) || {};
    if (permission in customPermissions) {
      return customPermissions[permission] === true;
    }

    return getDefaultPermissions(member.role).includes(permission);
  }

  /**
   * Vérifie plusieurs permissions à la fois
   */
  async hasAllPermissions(
    organizationId: string,
    userId: string,
    permissions: Permission[]
  ): Promise<boolean> {
    for (const perm of permissions) {
      if (!(await this.hasPermission(organizationId, userId, perm))) return false;
    }
    return true;
  }

  /**
   * Vérifie si le membre a au moins une des permissions
   */
  async hasAnyPermission(
    organizationId: string,
    userId: string,
    permissions: Permission[]
  ): Promise<boolean> {
    for (const perm of permissions) {
      if (await this.hasPermission(organizationId, userId, perm)) return true;
    }
    return false;
  }

  /**
   * Récupère toutes les permissions effectives d'un membre
   */
  async getEffectivePermissions(organizationId: string, userId: string): Promise<Permission[]> {
    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { organizationId, userId } },
      select: { role: true, permissions: true },
    });

    if (!member) return [];
    if (member.role === 'OWNER') return Object.values(PERMISSIONS);

    const defaultPerms = new Set(getDefaultPermissions(member.role));
    const customPermissions = (member.permissions as PermissionSet) || {};

    for (const [perm, granted] of Object.entries(customPermissions)) {
      if (isValidPermission(perm)) {
        if (granted) defaultPerms.add(perm);
        else defaultPerms.delete(perm);
      }
    }

    return Array.from(defaultPerms);
  }

  /**
   * Met à jour les permissions personnalisées d'un membre
   */
  async updateMemberPermissions(
    organizationId: string,
    memberId: string,
    permissions: PermissionSet,
    actorId: string
  ): Promise<void> {
    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { organizationId, userId: memberId } },
      select: { role: true, permissions: true },
    });

    if (!member) throw new AppError('Membre non trouvé', 404);
    if (member.role === 'OWNER') {
      throw new AppError('Impossible de modifier les permissions du propriétaire', 403);
    }

    const validPermissions: PermissionSet = {};
    for (const [key, value] of Object.entries(permissions)) {
      if (isValidPermission(key) && typeof value === 'boolean') {
        validPermissions[key] = value;
      }
    }

    const beforePermissions = member.permissions || {};

    await prisma.organizationMember.update({
      where: { userId_organizationId: { organizationId, userId: memberId } },
      data: { permissions: validPermissions },
    });

    logger.info(`Permissions mises à jour pour ${memberId} dans ${organizationId}`);

    await AuditService.log({
      actorId,
      action: 'MEMBER_PERMISSIONS_UPDATED',
      entityType: 'OrganizationMember',
      entityId: memberId,
      organizationId,
      changes: {
        before: beforePermissions as Record<string, boolean> | null,
        after: validPermissions as Record<string, boolean>,
      },
    });
  }

  /**
   * Ajoute une permission à un membre
   */
  async grantPermission(
    organizationId: string,
    memberId: string,
    permission: Permission,
    actorId: string
  ): Promise<void> {
    if (!isValidPermission(permission)) {
      throw new AppError(`Permission invalide: ${permission}`, 400);
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { organizationId, userId: memberId } },
      select: { permissions: true, role: true },
    });

    if (!member) throw new AppError('Membre non trouvé', 404);
    if (member.role === 'OWNER') {
      throw new AppError('Le propriétaire a déjà toutes les permissions', 400);
    }

    const currentPermissions = (member.permissions as PermissionSet) || {};
    currentPermissions[permission] = true;

    await prisma.organizationMember.update({
      where: { userId_organizationId: { organizationId, userId: memberId } },
      data: { permissions: currentPermissions },
    });

    await AuditService.log({
      actorId,
      action: 'PERMISSION_GRANTED',
      entityType: 'OrganizationMember',
      entityId: memberId,
      organizationId,
      changes: { before: null, after: { permission, granted: true } },
    });
  }

  /**
   * Retire une permission à un membre
   */
  async revokePermission(
    organizationId: string,
    memberId: string,
    permission: Permission,
    actorId: string
  ): Promise<void> {
    if (!isValidPermission(permission)) {
      throw new AppError(`Permission invalide: ${permission}`, 400);
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { organizationId, userId: memberId } },
      select: { permissions: true, role: true },
    });

    if (!member) throw new AppError('Membre non trouvé', 404);
    if (member.role === 'OWNER') {
      throw new AppError('Impossible de retirer des permissions au propriétaire', 403);
    }

    const currentPermissions = (member.permissions as PermissionSet) || {};
    currentPermissions[permission] = false;

    await prisma.organizationMember.update({
      where: { userId_organizationId: { organizationId, userId: memberId } },
      data: { permissions: currentPermissions },
    });

    await AuditService.log({
      actorId,
      action: 'PERMISSION_REVOKED',
      entityType: 'OrganizationMember',
      entityId: memberId,
      organizationId,
      changes: { before: null, after: { permission, granted: false } },
    });
  }

  /**
   * Réinitialise les permissions aux valeurs par défaut du rôle
   */
  async resetToDefaults(organizationId: string, memberId: string, actorId: string): Promise<void> {
    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { organizationId, userId: memberId } },
      select: { permissions: true, role: true },
    });

    if (!member) throw new AppError('Membre non trouvé', 404);

    const beforePermissions = member.permissions;

    await prisma.organizationMember.update({
      where: { userId_organizationId: { organizationId, userId: memberId } },
      data: { permissions: {} },
    });

    await AuditService.log({
      actorId,
      action: 'PERMISSIONS_RESET',
      entityType: 'OrganizationMember',
      entityId: memberId,
      organizationId,
      changes: { before: beforePermissions as Record<string, boolean> | null, after: {} },
    });
  }

  /**
   * Récupère la liste de toutes les permissions disponibles
   */
  getAllPermissions() {
    return {
      permissions: PERMISSIONS,
      descriptions: PERMISSION_DESCRIPTIONS,
      categories: PERMISSION_CATEGORIES,
      roleDefaults: DEFAULT_PERMISSIONS,
      planDefaults: PLAN_PERMISSIONS,
    };
  }

  // === PLAN-BASED PERMISSIONS ===

  hasPlanPermission = hasPlanPermission;

  async getAllEffectivePermissions(
    userId: string,
    organizationId?: string
  ): Promise<EffectivePermissions> {
    const rolePermissions = organizationId
      ? await this.getEffectivePermissions(organizationId, userId)
      : [];
    return getPlanEffectivePermissions(userId, organizationId, rolePermissions);
  }

  async hasAnySourcePermission(
    userId: string,
    permission: Permission,
    organizationId?: string
  ): Promise<boolean> {
    if (await hasPlanPermission(userId, permission, organizationId)) return true;
    if (organizationId && await this.hasPermission(organizationId, userId, permission)) return true;
    return false;
  }
}

export const permissionService = new PermissionService();
export default PermissionService;
