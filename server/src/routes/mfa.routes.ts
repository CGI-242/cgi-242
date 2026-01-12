import { Router } from 'express';
import * as mfaController from '../controllers/mfa.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Routes authentifiées pour la gestion MFA
// GET /mfa/status - Statut MFA de l'utilisateur
router.get('/status', authMiddleware, mfaController.getMFAStatus);

// POST /mfa/setup - Générer QR code et secret
router.post('/setup', authMiddleware, csrfProtection, mfaController.setupMFA);

// POST /mfa/enable - Activer MFA après vérification du code
router.post('/enable', authMiddleware, csrfProtection, mfaController.enableMFA);

// POST /mfa/disable - Désactiver MFA (nécessite mot de passe)
router.post('/disable', authMiddleware, csrfProtection, mfaController.disableMFA);

// POST /mfa/backup-codes/regenerate - Régénérer les codes de backup
router.post('/backup-codes/regenerate', authMiddleware, csrfProtection, mfaController.regenerateBackupCodes);

// Route publique pour vérifier MFA lors du login
// POST /mfa/verify - Vérifier code MFA (appelé après login si MFA activé)
router.post('/verify', authRateLimiter, csrfProtection, mfaController.verifyMFA);

export default router;
