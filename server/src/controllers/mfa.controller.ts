/**
 * Contrôleur MFA/2FA
 *
 * Endpoints pour la gestion de l'authentification à deux facteurs:
 * - GET /mfa/status - Statut MFA de l'utilisateur
 * - POST /mfa/setup - Générer QR code et secret
 * - POST /mfa/enable - Activer MFA avec vérification
 * - POST /mfa/verify - Vérifier code lors du login
 * - POST /mfa/disable - Désactiver MFA
 * - POST /mfa/backup-codes/regenerate - Régénérer codes backup
 */

import { Request, Response } from 'express';
import { mfaService } from '../services/mfa.service.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';
import { prisma } from '../config/database.js';
import { generateToken, generateRefreshToken, setAuthCookies } from '../middleware/auth.middleware.js';
import { AuditAction } from '@prisma/client';

const logger = createLogger('MFAController');

// Store temporaire pour les secrets en attente de validation (5 min TTL)
// En production, utiliser Redis
const pendingSetups = new Map<string, { secret: string; backupCodes: string[]; expiresAt: number }>();

// Nettoyer les setups expirés toutes les minutes
setInterval(() => {
  const now = Date.now();
  for (const [userId, setup] of pendingSetups.entries()) {
    if (setup.expiresAt < now) {
      pendingSetups.delete(userId);
    }
  }
}, 60000);

/**
 * GET /mfa/status
 * Obtenir le statut MFA de l'utilisateur connecté
 */
export const getMFAStatus = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) {
      return sendError(res, 'Non authentifié', 401);
    }

    const status = await mfaService.getMFAStatus(req.user.id);

    return sendSuccess(res, {
      mfa: {
        enabled: status.enabled,
        verifiedAt: status.verifiedAt,
        backupCodesRemaining: status.backupCodesRemaining,
      },
    });
  } catch (error) {
    logger.error('Erreur getMFAStatus:', error);
    return sendError(res, 'Erreur lors de la récupération du statut MFA', 500);
  }
};

/**
 * POST /mfa/setup
 * Générer un nouveau secret MFA et QR code
 */
export const setupMFA = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) {
      return sendError(res, 'Non authentifié', 401);
    }

    // Vérifier si MFA est déjà activé
    const isEnabled = await mfaService.isMFAEnabled(req.user.id);
    if (isEnabled) {
      return sendError(res, 'MFA est déjà activé. Désactivez-le d\'abord.', 400);
    }

    // Générer le setup
    const setup = await mfaService.generateSetup(req.user.id, req.user.email);

    // Stocker temporairement pour validation
    pendingSetups.set(req.user.id, {
      secret: setup.secret,
      backupCodes: setup.backupCodes,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    return sendSuccess(res, {
      qrCode: setup.qrCodeDataUrl,
      backupCodes: setup.backupCodes,
      message: 'Scannez le QR code avec votre application authenticator, puis entrez le code pour activer le MFA.',
    });
  } catch (error) {
    logger.error('Erreur setupMFA:', error);
    return sendError(res, 'Erreur lors de la configuration MFA', 500);
  }
};

/**
 * POST /mfa/enable
 * Activer MFA après vérification du premier code
 */
export const enableMFA = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) {
      return sendError(res, 'Non authentifié', 401);
    }

    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return sendError(res, 'Code de vérification requis', 400);
    }

    // Récupérer le setup en attente
    const pendingSetup = pendingSetups.get(req.user.id);
    if (!pendingSetup) {
      return sendError(res, 'Aucune configuration MFA en attente. Veuillez recommencer le setup.', 400);
    }

    // Vérifier l'expiration
    if (pendingSetup.expiresAt < Date.now()) {
      pendingSetups.delete(req.user.id);
      return sendError(res, 'Configuration MFA expirée. Veuillez recommencer.', 400);
    }

    // Activer MFA
    const success = await mfaService.enableMFA(
      req.user.id,
      pendingSetup.secret,
      code,
      pendingSetup.backupCodes
    );

    if (!success) {
      return sendError(res, 'Code de vérification invalide', 400);
    }

    // Nettoyer le setup en attente
    pendingSetups.delete(req.user.id);

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        actorEmail: req.user.email,
        action: AuditAction.MFA_ENABLED,
        entityType: 'User',
        entityId: req.user.id,
        changes: { mfaEnabled: true },
      },
    });

    logger.info(`MFA activé pour l'utilisateur ${req.user.email}`);

    return sendSuccess(res, {
      message: 'Authentification à deux facteurs activée avec succès.',
      backupCodesRemaining: pendingSetup.backupCodes.length,
    });
  } catch (error) {
    logger.error('Erreur enableMFA:', error);
    return sendError(res, 'Erreur lors de l\'activation MFA', 500);
  }
};

/**
 * POST /mfa/verify
 * Vérifier code MFA lors du login
 * Appelé après login réussi si MFA est activé
 */
export const verifyMFA = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return sendError(res, 'userId et code requis', 400);
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mfaEnabled: true,
      },
    });

    if (!user || !user.mfaEnabled) {
      return sendError(res, 'Utilisateur non trouvé ou MFA non activé', 400);
    }

    // Vérifier le code
    const result = await mfaService.verifyCode(userId, code);

    if (!result.success) {
      // Audit log
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          actorEmail: user.email,
          action: AuditAction.MFA_FAILED,
          entityType: 'User',
          entityId: userId,
          changes: { reason: 'invalid_code' },
        },
      });

      return sendError(res, 'Code de vérification invalide', 401);
    }

    // Générer les tokens
    const accessToken = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    // Définir les cookies sécurisés
    setAuthCookies(res, accessToken, refreshToken);

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        actorEmail: user.email,
        action: AuditAction.MFA_VERIFIED,
        entityType: 'User',
        entityId: userId,
        changes: { backupCodeUsed: result.backupCodeUsed },
      },
    });

    logger.info(`MFA vérifié pour ${user.email}${result.backupCodeUsed ? ' (backup code)' : ''}`);

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      message: result.backupCodeUsed
        ? 'Connexion réussie. Attention: vous avez utilisé un code de backup.'
        : 'Connexion réussie.',
    });
  } catch (error) {
    logger.error('Erreur verifyMFA:', error);
    return sendError(res, 'Erreur lors de la vérification MFA', 500);
  }
};

/**
 * POST /mfa/disable
 * Désactiver MFA (nécessite mot de passe)
 */
export const disableMFA = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) {
      return sendError(res, 'Non authentifié', 401);
    }

    const { password } = req.body;

    if (!password) {
      return sendError(res, 'Mot de passe requis pour désactiver le MFA', 400);
    }

    const success = await mfaService.disableMFA(req.user.id, password);

    if (!success) {
      return sendError(res, 'Mot de passe incorrect', 401);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        actorEmail: req.user.email,
        action: AuditAction.MFA_DISABLED,
        entityType: 'User',
        entityId: req.user.id,
        changes: { mfaEnabled: false },
      },
    });

    logger.info(`MFA désactivé pour l'utilisateur ${req.user.email}`);

    return sendSuccess(res, {
      message: 'Authentification à deux facteurs désactivée.',
    });
  } catch (error) {
    logger.error('Erreur disableMFA:', error);
    return sendError(res, 'Erreur lors de la désactivation MFA', 500);
  }
};

/**
 * POST /mfa/backup-codes/regenerate
 * Régénérer les codes de backup (nécessite code MFA valide)
 */
export const regenerateBackupCodes = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) {
      return sendError(res, 'Non authentifié', 401);
    }

    const { code } = req.body;

    if (!code) {
      return sendError(res, 'Code MFA requis pour régénérer les codes de backup', 400);
    }

    const newCodes = await mfaService.regenerateBackupCodes(req.user.id, code);

    if (!newCodes) {
      return sendError(res, 'Code MFA invalide', 401);
    }

    logger.info(`Codes de backup régénérés pour ${req.user.email}`);

    return sendSuccess(res, {
      backupCodes: newCodes,
      message: 'Nouveaux codes de backup générés. Les anciens codes ne sont plus valides.',
    });
  } catch (error) {
    logger.error('Erreur regenerateBackupCodes:', error);
    return sendError(res, 'Erreur lors de la régénération des codes', 500);
  }
};

export default {
  getMFAStatus,
  setupMFA,
  enableMFA,
  verifyMFA,
  disableMFA,
  regenerateBackupCodes,
};
