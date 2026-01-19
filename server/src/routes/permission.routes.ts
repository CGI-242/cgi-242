import { Router } from 'express';
import * as permissionController from '../controllers/permission.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';
import { requireAdmin } from '../middleware/orgRole.middleware.js';
import { validate, sanitizeUUID } from '../middleware/validation.middleware.js';
import { body } from 'express-validator';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// === Routes publiques (utilisateur connecté) ===

// GET /api/permissions - Liste toutes les permissions disponibles
router.get('/', permissionController.getAllPermissions);

// GET /api/permissions/my - Mes permissions effectives
router.get('/my', tenantMiddleware, permissionController.getMyPermissions);

// GET /api/permissions/check/:permission - Vérifier une permission
router.get(
  '/check/:permission',
  tenantMiddleware,
  permissionController.checkPermission
);

// === Routes avec contexte organisation ===

// GET /api/organizations/:orgId/permissions/members/:userId
// Récupérer les permissions d'un membre
router.get(
  '/org/:orgId/members/:userId',
  sanitizeUUID('orgId'),
  sanitizeUUID('userId'),
  tenantMiddleware,
  requireAdmin,
  permissionController.getMemberPermissions
);

// PUT /api/organizations/:orgId/permissions/members/:userId
// Mettre à jour les permissions d'un membre
router.put(
  '/org/:orgId/members/:userId',
  sanitizeUUID('orgId'),
  sanitizeUUID('userId'),
  tenantMiddleware,
  requireAdmin,
  [
    body('permissions').isObject().withMessage('permissions doit être un objet'),
  ],
  validate,
  permissionController.updateMemberPermissions
);

// POST /api/permissions/org/:orgId/members/:userId/grant
// Accorder une permission spécifique
router.post(
  '/org/:orgId/members/:userId/grant',
  sanitizeUUID('orgId'),
  sanitizeUUID('userId'),
  tenantMiddleware,
  requireAdmin,
  [
    body('permission').isString().notEmpty().withMessage('permission requis'),
  ],
  validate,
  permissionController.grantPermission
);

// POST /api/permissions/org/:orgId/members/:userId/revoke
// Retirer une permission spécifique
router.post(
  '/org/:orgId/members/:userId/revoke',
  sanitizeUUID('orgId'),
  sanitizeUUID('userId'),
  tenantMiddleware,
  requireAdmin,
  [
    body('permission').isString().notEmpty().withMessage('permission requis'),
  ],
  validate,
  permissionController.revokePermission
);

// POST /api/permissions/org/:orgId/members/:userId/reset
// Réinitialiser les permissions aux valeurs par défaut
router.post(
  '/org/:orgId/members/:userId/reset',
  sanitizeUUID('orgId'),
  sanitizeUUID('userId'),
  tenantMiddleware,
  requireAdmin,
  permissionController.resetPermissions
);

export default router;
