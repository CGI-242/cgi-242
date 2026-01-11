import { Request, Response } from 'express';
import { OrganizationService } from '../services/organization.service.js';
import { MemberService } from '../services/member.service.js';
import { InvitationService } from '../services/invitation.service.js';
import { AuditService } from '../services/audit.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/helpers.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

const orgService = new OrganizationService();
const memberService = new MemberService();
const invitationService = new InvitationService();

// Helper pour extraire les métadonnées de la requête
const getAuditMetadata = (req: Request) => ({
  ip: req.ip || req.headers['x-forwarded-for'] as string,
  userAgent: req.headers['user-agent'],
});

// === Organisation CRUD ===

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name, slug, website, phone, address } = req.body;

  const organization = await orgService.create(userId, {
    name,
    slug,
    website,
    phone,
    address,
  });

  // Audit trail
  await AuditService.log({
    actorId: userId,
    action: 'ORG_CREATED',
    entityType: 'Organization',
    entityId: organization.id,
    organizationId: organization.id,
    changes: { before: null, after: { name, slug } },
    metadata: getAuditMetadata(req),
  });

  sendSuccess(res, organization, SUCCESS_MESSAGES.ORG_CREATED, 201);
});

export const getDetails = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;

  const organization = await orgService.getById(orgId);

  sendSuccess(res, organization);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const userId = req.user!.id;
  const { name, website, phone, address, logo, settings } = req.body;

  // Récupérer l'état avant modification pour l'audit
  const before = await orgService.getById(orgId);

  const organization = await orgService.update(orgId, {
    name,
    website,
    phone,
    address,
    logo,
    settings,
  }, userId);

  // Audit trail
  await AuditService.log({
    actorId: userId,
    action: 'ORG_UPDATED',
    entityType: 'Organization',
    entityId: orgId,
    organizationId: orgId,
    changes: {
      before: { name: before?.name, website: before?.website, phone: before?.phone },
      after: { name, website, phone }
    },
    metadata: getAuditMetadata(req),
  });

  sendSuccess(res, organization, SUCCESS_MESSAGES.ORG_UPDATED);
});

export const deleteOrg = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const userId = req.user!.id;

  // Récupérer l'état avant suppression pour l'audit
  const before = await orgService.getById(orgId);

  // La méthode delete gère déjà l'audit en interne
  await orgService.delete(orgId, userId);

  // Audit trail supplémentaire (avec metadata de la requête)
  await AuditService.log({
    actorId: userId,
    action: 'ORG_DELETED',
    entityType: 'Organization',
    entityId: orgId,
    organizationId: orgId,
    changes: { before: { name: before?.name, slug: before?.slug }, after: null },
    metadata: getAuditMetadata(req),
  });

  sendSuccess(res, null, SUCCESS_MESSAGES.ORG_DELETED);
});

export const listUserOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const memberships = await orgService.getByUserId(userId);

  sendSuccess(res, memberships);
});

// === Membres ===

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;

  const members = await memberService.getByOrganization(orgId);

  sendSuccess(res, members);
});

export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId: memberId } = req.params;
  const { role } = req.body;
  const requesterId = req.user!.id;

  // Récupérer le rôle avant modification
  const beforeMember = await memberService.getByOrganization(orgId);
  const oldMember = beforeMember.find(m => m.userId === memberId);
  const oldRole = oldMember?.role;

  const member = await memberService.updateRole(orgId, memberId, role, requesterId);

  // Audit trail
  await AuditService.log({
    actorId: requesterId,
    action: 'MEMBER_ROLE_CHANGED',
    entityType: 'OrganizationMember',
    entityId: memberId,
    organizationId: orgId,
    changes: { before: { role: oldRole }, after: { role } },
    metadata: { ...getAuditMetadata(req), targetUserId: memberId },
  });

  sendSuccess(res, member);
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const { orgId, userId: memberId } = req.params;
  const requesterId = req.user!.id;

  await memberService.remove(orgId, memberId, requesterId);

  // Audit trail
  await AuditService.log({
    actorId: requesterId,
    action: 'MEMBER_REMOVED',
    entityType: 'OrganizationMember',
    entityId: memberId,
    organizationId: orgId,
    changes: { before: { memberId }, after: null },
    metadata: { ...getAuditMetadata(req), removedUserId: memberId },
  });

  sendSuccess(res, null, SUCCESS_MESSAGES.MEMBER_REMOVED);
});

// === Invitations ===

export const inviteMember = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { email, role } = req.body;
  const invitedById = req.user!.id;

  const invitation = await invitationService.create(orgId, invitedById, email, role);

  // Audit trail
  await AuditService.log({
    actorId: invitedById,
    action: 'MEMBER_INVITED',
    entityType: 'Invitation',
    entityId: invitation.id,
    organizationId: orgId,
    changes: { before: null, after: { email, role } },
    metadata: { ...getAuditMetadata(req), invitedEmail: email },
  });

  sendSuccess(res, invitation, SUCCESS_MESSAGES.INVITATION_SENT, 201);
});

export const acceptInvitation = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = req.user!.id;

  const member = await invitationService.accept(token, userId);

  // Audit trail
  await AuditService.log({
    actorId: userId,
    action: 'MEMBER_JOINED',
    entityType: 'OrganizationMember',
    entityId: member.id,
    organizationId: member.organizationId,
    changes: { before: null, after: { role: member.role } },
    metadata: getAuditMetadata(req),
  });

  sendSuccess(res, member, SUCCESS_MESSAGES.INVITATION_ACCEPTED);
});

export const listInvitations = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;

  const invitations = await invitationService.getPending(orgId);

  sendSuccess(res, invitations);
});

export const cancelInvitation = asyncHandler(async (req: Request, res: Response) => {
  const { invitationId } = req.params;

  await invitationService.cancel(invitationId);

  sendSuccess(res, null, 'Invitation annulée');
});

// === Admin - Soft Delete Management ===

export const listDeletedOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const deletedOrgs = await orgService.listDeleted();

  sendSuccess(res, deletedOrgs);
});

export const restoreOrganization = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const userId = req.user!.id;

  const organization = await orgService.restore(orgId, userId);

  // Audit trail
  await AuditService.log({
    actorId: userId,
    action: 'ORG_RESTORED',
    entityType: 'Organization',
    entityId: orgId,
    organizationId: orgId,
    changes: { before: { deleted: true }, after: { deleted: false } },
    metadata: getAuditMetadata(req),
  });

  sendSuccess(res, organization, 'Organisation restaurée avec succès');
});

export const hardDeleteOrganization = asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const userId = req.user!.id;

  await orgService.hardDelete(orgId, userId);

  sendSuccess(res, null, 'Organisation supprimée définitivement');
});
