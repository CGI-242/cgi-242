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
   */
  async getById(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
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
   */
  async getBySlug(slug: string) {
    const organization = await prisma.organization.findUnique({
      where: { slug },
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
   */
  async getByUserId(userId: string) {
    return prisma.organizationMember.findMany({
      where: { userId },
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
}

export default OrganizationService;
