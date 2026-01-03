import { OrganizationRole } from '@prisma/client';
import { addDays } from 'date-fns';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { ERROR_MESSAGES, INVITATION_EXPIRY_DAYS } from '../utils/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { EmailService } from './email.service.js';
import { AuditService } from './audit.service.js';

const logger = createLogger('InvitationService');

export class InvitationService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Inviter un membre dans l'organisation
   */
  async create(
    organizationId: string,
    invitedById: string,
    email: string,
    role: OrganizationRole = 'MEMBER'
  ) {
    // Vérifier si déjà membre
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: { userId: existingUser.id, organizationId },
        },
      });

      if (existingMember) {
        throw new AppError(ERROR_MESSAGES.ALREADY_MEMBER, 409);
      }
    }

    // Vérifier les limites
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscription: true,
        members: true,
        invitations: { where: { status: 'PENDING' } },
      },
    });

    if (!org) {
      throw new AppError(ERROR_MESSAGES.ORG_NOT_FOUND, 404);
    }

    const maxMembers = org.subscription?.maxMembers || 3;
    const currentCount = org.members.length + org.invitations.length;

    if (maxMembers !== -1 && currentCount >= maxMembers) {
      throw new AppError(
        `${ERROR_MESSAGES.MEMBER_LIMIT_REACHED}. Limite: ${maxMembers}.`,
        403
      );
    }

    const invitation = await prisma.invitation.upsert({
      where: { email_organizationId: { email, organizationId } },
      update: {
        role,
        status: 'PENDING',
        expiresAt: addDays(new Date(), INVITATION_EXPIRY_DAYS),
        invitedById,
      },
      create: {
        email,
        role,
        organizationId,
        invitedById,
        expiresAt: addDays(new Date(), INVITATION_EXPIRY_DAYS),
      },
      include: {
        organization: true,
        invitedBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    try {
      await this.emailService.sendInvitation(invitation);
    } catch (error) {
      logger.error("Erreur d'envoi de l'email d'invitation:", error);
    }

    logger.info(`Invitation envoyée: ${email} -> ${org.name} (role: ${role})`);

    // Audit log - Invitation membre
    await AuditService.log({
      actorId: invitedById,
      action: 'MEMBER_INVITED',
      entityType: 'Invitation',
      entityId: invitation.id,
      organizationId,
      changes: {
        before: null,
        after: { email, role },
      },
      metadata: {
        invitedEmail: email,
        invitedRole: role,
      },
    });

    return invitation;
  }

  /**
   * Accepter une invitation
   */
  async accept(token: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invitation) {
      throw new AppError(ERROR_MESSAGES.INVITATION_NOT_FOUND, 404);
    }

    if (invitation.status !== 'PENDING') {
      throw new AppError("Cette invitation n'est plus valide", 400);
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new AppError('Cette invitation a expiré', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new AppError("Cette invitation ne vous est pas destinée", 403);
    }

    const [member] = await prisma.$transaction([
      prisma.organizationMember.create({
        data: {
          userId,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
        include: {
          organization: true,
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      }),
    ]);

    logger.info(`Invitation acceptée: ${user.email} a rejoint ${invitation.organization.name}`);

    // Audit log - Membre a rejoint l'organisation
    await AuditService.log({
      actorId: userId,
      action: 'MEMBER_JOINED',
      entityType: 'OrganizationMember',
      entityId: member.id,
      organizationId: invitation.organizationId,
      changes: {
        before: { status: 'invited' },
        after: { status: 'active', role: invitation.role },
      },
      metadata: {
        invitationId: invitation.id,
        invitedBy: invitation.invitedById,
      },
    });

    return member;
  }

  /**
   * Annuler une invitation
   */
  async cancel(invitationId: string) {
    const invitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' },
    });

    logger.info(`Invitation annulée: ${invitationId}`);
    return invitation;
  }

  /**
   * Obtenir les invitations pendantes
   */
  async getPending(organizationId: string) {
    return prisma.invitation.findMany({
      where: { organizationId, status: 'PENDING' },
      include: {
        invitedBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default InvitationService;
