import { OrganizationRole } from '@prisma/client';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuditService } from './audit.service.js';

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

      // Audit log - Transfert de propriété
      await AuditService.log({
        actorId: requesterId,
        action: 'OWNERSHIP_TRANSFERRED',
        entityType: 'OrganizationMember',
        entityId: memberId,
        organizationId,
        changes: {
          before: { role: requester.role },
          after: { role: 'OWNER' },
        },
        metadata: {
          actorRole: 'OWNER',
          newOwnerId: memberId,
          previousOwnerId: requesterId,
        },
      });

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

    // Audit log - Changement de rôle
    await AuditService.log({
      actorId: requesterId,
      action: 'MEMBER_ROLE_CHANGED',
      entityType: 'OrganizationMember',
      entityId: memberId,
      organizationId,
      changes: {
        before: { role: target.role },
        after: { role: newRole },
      },
      metadata: {
        actorRole: requester.role,
      },
    });

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

    // Audit log - Retrait de membre
    await AuditService.log({
      actorId: requesterId,
      action: 'MEMBER_REMOVED',
      entityType: 'OrganizationMember',
      entityId: memberId,
      organizationId,
      changes: {
        before: { role: target.role, status: 'active' },
        after: { status: 'removed' },
      },
      metadata: {
        removedByOther: memberId !== requesterId,
      },
    });
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
