import { OrganizationRole } from '@prisma/client';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { AppError } from '../middleware/error.middleware.js';

const logger = createLogger('MemberService');

export class MemberService {
  /**
   * Obtenir les membres d'une organisation
   */
  async getByOrganization(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            profession: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });
  }

  /**
   * Mettre à jour le rôle d'un membre
   */
  async updateRole(
    organizationId: string,
    memberId: string,
    newRole: OrganizationRole,
    requesterId: string
  ) {
    const requester = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId: requesterId, organizationId },
      },
    });

    if (!requester || !['OWNER', 'ADMIN'].includes(requester.role)) {
      throw new AppError(ERROR_MESSAGES.INSUFFICIENT_ROLE, 403);
    }

    const target = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId: memberId, organizationId },
      },
    });

    if (!target) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    if (target.role === 'OWNER' && newRole !== 'OWNER') {
      throw new AppError(ERROR_MESSAGES.CANNOT_DEMOTE_OWNER, 403);
    }

    // Transfert de propriété
    if (newRole === 'OWNER') {
      if (requester.role !== 'OWNER') {
        throw new AppError(ERROR_MESSAGES.ONLY_OWNER_CAN_TRANSFER, 403);
      }

      await prisma.$transaction([
        prisma.organizationMember.update({
          where: { userId_organizationId: { userId: requesterId, organizationId } },
          data: { role: 'ADMIN' },
        }),
        prisma.organizationMember.update({
          where: { userId_organizationId: { userId: memberId, organizationId } },
          data: { role: 'OWNER' },
        }),
      ]);

      logger.info(`Propriété transférée: ${requesterId} -> ${memberId}`);

      return prisma.organizationMember.findUnique({
        where: { userId_organizationId: { userId: memberId, organizationId } },
        include: { user: true },
      });
    }

    const updated = await prisma.organizationMember.update({
      where: { userId_organizationId: { userId: memberId, organizationId } },
      data: { role: newRole },
      include: { user: true },
    });

    logger.info(`Rôle mis à jour: ${memberId} -> ${newRole}`);
    return updated;
  }

  /**
   * Retirer un membre de l'organisation
   */
  async remove(organizationId: string, memberId: string, requesterId: string) {
    const target = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId: memberId, organizationId },
      },
    });

    if (!target) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    if (target.role === 'OWNER') {
      throw new AppError(ERROR_MESSAGES.CANNOT_REMOVE_OWNER, 403);
    }

    if (memberId !== requesterId) {
      const requester = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: { userId: requesterId, organizationId },
        },
      });

      if (!requester || !['OWNER', 'ADMIN'].includes(requester.role)) {
        throw new AppError(ERROR_MESSAGES.INSUFFICIENT_ROLE, 403);
      }
    }

    await prisma.organizationMember.delete({
      where: {
        userId_organizationId: { userId: memberId, organizationId },
      },
    });

    logger.info(`Membre retiré: ${memberId} de l'org ${organizationId}`);
  }

  /**
   * Vérifier si un utilisateur est membre
   */
  async isMember(userId: string, organizationId: string): Promise<boolean> {
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    return !!member;
  }

  /**
   * Obtenir le rôle d'un membre
   */
  async getRole(userId: string, organizationId: string): Promise<OrganizationRole | null> {
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    return member?.role || null;
  }
}

export default MemberService;
