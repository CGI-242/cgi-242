import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { generateSlug } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { AppError } from '../middleware/error.middleware.js';

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
  async update(organizationId: string, data: UpdateOrganizationData) {
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data,
      include: { subscription: true },
    });

    logger.info(`Organisation mise à jour: ${organization.id}`);
    return organization;
  }

  /**
   * Supprimer une organisation
   */
  async delete(organizationId: string) {
    await prisma.organization.delete({
      where: { id: organizationId },
    });

    logger.info(`Organisation supprimée: ${organizationId}`);
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
