// server/src/services/organization.admin.service.ts
// Fonctions admin pour les organisations (soft delete, restore, hard delete)

import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuditService } from './audit.service.js';

const logger = createLogger('OrganizationAdminService');

/**
 * Supprimer une organisation (soft delete)
 */
export async function softDeleteOrganization(organizationId: string, actorId: string): Promise<void> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true, slug: true },
  });

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      deletedAt: new Date(),
      deletedBy: actorId,
    },
  });

  logger.info(`Organisation supprimée: ${organizationId}`);

  await AuditService.log({
    actorId,
    action: 'ORG_DELETED',
    entityType: 'Organization',
    entityId: organizationId,
    organizationId,
    changes: {
      before: organization ? { name: organization.name, slug: organization.slug } : null,
      after: { deletedAt: new Date().toISOString(), deletedBy: actorId },
    },
  });
}

/**
 * Restaurer une organisation soft-deleted
 */
export async function restoreOrganization(organizationId: string, actorId: string) {
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      deletedAt: { not: null },
    },
  });

  if (!organization) {
    throw new AppError('Organisation non trouvée ou non supprimée', 404);
  }

  const restored = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      deletedAt: null,
      deletedBy: null,
    },
    include: {
      subscription: true,
      _count: { select: { members: true } },
    },
  });

  logger.info(`Organisation restaurée: ${organizationId} par ${actorId}`);

  await AuditService.log({
    actorId,
    action: 'ORG_RESTORED',
    entityType: 'Organization',
    entityId: organizationId,
    organizationId,
    changes: {
      before: { deletedAt: organization.deletedAt?.toISOString(), deletedBy: organization.deletedBy },
      after: { deletedAt: null, deletedBy: null },
    },
  });

  return restored;
}

/**
 * Lister les organisations supprimées (admin)
 */
export async function listDeletedOrganizations() {
  return prisma.organization.findMany({
    where: {
      deletedAt: { not: null },
    },
    include: {
      subscription: true,
      _count: { select: { members: true } },
    },
    orderBy: { deletedAt: 'desc' },
  });
}

/**
 * Supprimer définitivement une organisation (hard delete - admin uniquement)
 */
export async function hardDeleteOrganization(organizationId: string, actorId: string): Promise<void> {
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      deletedAt: { not: null },
    },
  });

  if (!organization) {
    throw new AppError('Organisation non trouvée ou non soft-deleted. Utilisez d\'abord soft delete.', 400);
  }

  await prisma.organization.delete({
    where: { id: organizationId },
  });

  logger.warn(`Organisation supprimée définitivement: ${organizationId} par ${actorId}`);

  await AuditService.log({
    actorId,
    action: 'ORG_DELETED',
    entityType: 'Organization',
    entityId: organizationId,
    changes: {
      before: { name: organization.name, slug: organization.slug },
      after: null,
    },
    metadata: { hardDelete: true },
  });
}
