import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { generateSlug } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuditService } from './audit.service.js';

const logger = createLogger('OrganizationService');

export interface CreateOrganizationData {
  name: string;
  slug?: string;
  website?: string;
  phone?: string;
  address?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  website?: string;
  phone?: string;
  address?: string;
  logo?: string;
  settings?: Prisma.InputJsonValue;
}

export class OrganizationService {
  /**
   * Créer une nouvelle organisation
   */
  async create(userId: string, data: CreateOrganizationData) {
    const slug = data.slug || generateSlug(data.name);

    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new AppError(ERROR_MESSAGES.SLUG_ALREADY_EXISTS, 409);
    }

    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug,
        website: data.website,
        phone: data.phone,
        address: data.address,
        members: {
          create: { userId, role: 'OWNER' },
        },
        subscription: {
          create: {
            type: 'ORGANIZATION',
            plan: 'FREE',
            questionsPerMonth: 10,
            maxMembers: 3,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        subscription: true,
      },
    });

    logger.info(`Organisation créée: ${organization.name} (${organization.id})`);

    // Audit log - Création organisation
    await AuditService.log({
      actorId: userId,
      action: 'ORG_CREATED',
      entityType: 'Organization',
      entityId: organization.id,
      organizationId: organization.id,
      changes: {
        before: null,
        after: { name: organization.name, slug: organization.slug },
      },
      metadata: {
        actorRole: 'OWNER',
      },
    });

    return organization;
  }

  /**
   * Obtenir une organisation par son ID
   * @param includeDeleted - Inclure les organisations soft-deleted (admin)
   */
  async getById(organizationId: string, includeDeleted = false) {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ...(!includeDeleted && { deletedAt: null }),
      },
      include: {
        subscription: true,
        _count: { select: { members: true } },
      },
    });

    if (!organization) {
      throw new AppError(ERROR_MESSAGES.ORG_NOT_FOUND, 404);
    }

    return organization;
  }

  /**
   * Obtenir une organisation par son slug
   * @param includeDeleted - Inclure les organisations soft-deleted (admin)
   */
  async getBySlug(slug: string, includeDeleted = false) {
    const organization = await prisma.organization.findFirst({
      where: {
        slug,
        ...(!includeDeleted && { deletedAt: null }),
      },
      include: {
        subscription: true,
        _count: { select: { members: true } },
      },
    });

    if (!organization) {
      throw new AppError(ERROR_MESSAGES.ORG_NOT_FOUND, 404);
    }

    return organization;
  }

  /**
   * Mettre à jour une organisation
   */
  async update(organizationId: string, data: UpdateOrganizationData, actorId: string) {
    // Récupérer l'état avant mise à jour pour l'audit (sans settings car JsonValue incompatible)
    const before = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, website: true, phone: true, address: true, logo: true },
    });

    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data,
      include: { subscription: true },
    });

    logger.info(`Organisation mise à jour: ${organization.id}`);

    // Audit log - Mise à jour organisation (simplifier pour compatibilité types)
    await AuditService.log({
      actorId,
      action: 'ORG_UPDATED',
      entityType: 'Organization',
      entityId: organization.id,
      organizationId: organization.id,
      changes: {
        before: before ? {
          name: before.name,
          website: before.website,
          phone: before.phone,
          address: before.address,
          logo: before.logo,
        } : null,
        after: {
          name: data.name,
          website: data.website,
          phone: data.phone,
          address: data.address,
          logo: data.logo,
        },
      },
    });

    return organization;
  }

  /**
   * Supprimer une organisation (soft delete)
   */
  async delete(organizationId: string, actorId: string) {
    // Récupérer l'organisation avant suppression pour l'audit
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, slug: true },
    });

    // Soft delete
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        deletedAt: new Date(),
        deletedBy: actorId,
      },
    });

    logger.info(`Organisation supprimée: ${organizationId}`);

    // Audit log - Suppression organisation
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
   * Obtenir les organisations d'un utilisateur
   * Exclut les organisations soft-deleted
   */
  async getByUserId(userId: string) {
    return prisma.organizationMember.findMany({
      where: {
        userId,
        organization: {
          deletedAt: null,
        },
      },
      include: {
        organization: {
          include: {
            subscription: true,
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  /**
   * Restaurer une organisation soft-deleted
   */
  async restore(organizationId: string, actorId: string) {
    // Vérifier que l'organisation existe et est supprimée
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        deletedAt: { not: null },
      },
    });

    if (!organization) {
      throw new AppError('Organisation non trouvée ou non supprimée', 404);
    }

    // Restaurer l'organisation
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

    // Audit log
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
  async listDeleted() {
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
  async hardDelete(organizationId: string, actorId: string) {
    // Vérifier que l'organisation est déjà soft-deleted
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        deletedAt: { not: null },
      },
    });

    if (!organization) {
      throw new AppError('Organisation non trouvée ou non soft-deleted. Utilisez d\'abord soft delete.', 400);
    }

    // Supprimer définitivement (cascade delete configuré dans Prisma)
    await prisma.organization.delete({
      where: { id: organizationId },
    });

    logger.warn(`Organisation supprimée définitivement: ${organizationId} par ${actorId}`);

    // Audit log
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
}

export default OrganizationService;
