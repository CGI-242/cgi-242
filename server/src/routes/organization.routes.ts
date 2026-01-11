import { Router } from 'express';
import * as orgController from '../controllers/organization.controller.js';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';
import { requireOwner, requireAdmin } from '../middleware/orgRole.middleware.js';
import { validate, sanitizeUUID } from '../middleware/validation.middleware.js';
import { organizationValidators, invitationValidators } from '../utils/validators.js';
import { sensitiveRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// === Routes sans contexte d'organisation ===

// POST /api/organizations - Créer une organisation
router.post(
  '/',
  sensitiveRateLimiter,
  organizationValidators.create,
  validate,
  orgController.create
);

// GET /api/organizations - Liste des organisations de l'utilisateur
router.get('/', orgController.listUserOrganizations);

// POST /api/organizations/accept-invitation - Accepter une invitation
router.post(
  '/accept-invitation',
  invitationValidators.accept,
  validate,
  orgController.acceptInvitation
);

// === Routes avec contexte d'organisation ===

// GET /api/organizations/:orgId - Détails d'une organisation
router.get(
  '/:orgId',
  sanitizeUUID('orgId'),
  tenantMiddleware,
  orgController.getDetails
);

// PUT /api/organizations/:orgId - Mettre à jour (ADMIN+)
router.put(
  '/:orgId',
  sanitizeUUID('orgId'),
  tenantMiddleware,
  requireAdmin,
  organizationValidators.update,
  validate,
  orgController.update
);

// DELETE /api/organizations/:orgId - Supprimer (OWNER only)
router.delete(
  '/:orgId',
  sanitizeUUID('orgId'),
  tenantMiddleware,
  requireOwner,
  orgController.deleteOrg
);

// === Gestion des membres ===

// GET /api/organizations/:orgId/members - Liste des membres
router.get(
  '/:orgId/members',
  sanitizeUUID('orgId'),
  tenantMiddleware,
  orgController.listMembers
);

// POST /api/organizations/:orgId/members/invite - Inviter (ADMIN+)
router.post(
  '/:orgId/members/invite',
  sanitizeUUID('orgId'),
  tenantMiddleware,
  requireAdmin,
  invitationValidators.create,
  validate,
  orgController.inviteMember
);

// PUT /api/organizations/:orgId/members/:userId/role - Modifier rôle (ADMIN+)
router.put(
  '/:orgId/members/:userId/role',
  sanitizeUUID('orgId'),
  sanitizeUUID('userId'),
  tenantMiddleware,
  requireAdmin,
  orgController.updateMemberRole
);

// DELETE /api/organizations/:orgId/members/:userId - Retirer membre (ADMIN+)
router.delete(
  '/:orgId/members/:userId',
  sanitizeUUID('orgId'),
  sanitizeUUID('userId'),
  tenantMiddleware,
  requireAdmin,
  orgController.removeMember
);

// === Invitations ===

// GET /api/organizations/:orgId/invitations - Liste des invitations pendantes
router.get(
  '/:orgId/invitations',
  sanitizeUUID('orgId'),
  tenantMiddleware,
  requireAdmin,
  orgController.listInvitations
);

// DELETE /api/organizations/:orgId/invitations/:invitationId - Annuler invitation
router.delete(
  '/:orgId/invitations/:invitationId',
  sanitizeUUID('orgId'),
  sanitizeUUID('invitationId'),
  tenantMiddleware,
  requireAdmin,
  orgController.cancelInvitation
);

// === Routes Admin (Super Admin uniquement) ===

// GET /api/organizations/admin/deleted - Liste des organisations supprimées
router.get(
  '/admin/deleted',
  requireSuperAdmin,
  orgController.listDeletedOrganizations
);

// POST /api/organizations/admin/:orgId/restore - Restaurer une organisation
router.post(
  '/admin/:orgId/restore',
  sanitizeUUID('orgId'),
  requireSuperAdmin,
  orgController.restoreOrganization
);

// DELETE /api/organizations/admin/:orgId/hard-delete - Suppression définitive
router.delete(
  '/admin/:orgId/hard-delete',
  sanitizeUUID('orgId'),
  requireSuperAdmin,
  sensitiveRateLimiter,
  orgController.hardDeleteOrganization
);

export default router;
