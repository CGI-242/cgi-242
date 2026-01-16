// server/src/controllers/mfa.controller.ts
// Contrôleur MFA/2FA principal

import { Request, Response } from 'express';
import { mfaService } from '../services/mfa.service.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';
import { prisma } from '../config/database.js';
import { AuditAction } from '@prisma/client';

// Ré-exporter verifyMFA depuis le module dédié
export { verifyMFA } from './mfa.verify.controller.js';

const logger = createLogger('MFAController');

// Store temporaire pour les secrets en attente (5 min TTL)
const pendingSetups = new Map<string, { secret: string; backupCodes: string[]; expiresAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [userId, setup] of pendingSetups.entries()) {
    if (setup.expiresAt < now) pendingSetups.delete(userId);
  }
}, 60000);

/**
 * GET /mfa/status - Statut MFA de l'utilisateur
 */
export const getMFAStatus = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) return sendError(res, 'Non authentifié', 401);

    const status = await mfaService.getMFAStatus(req.user.id);
    return sendSuccess(res, {
      mfa: { enabled: status.enabled, verifiedAt: status.verifiedAt, backupCodesRemaining: status.backupCodesRemaining },
    });
  } catch (error) {
    logger.error('Erreur getMFAStatus:', error);
    return sendError(res, 'Erreur lors de la récupération du statut MFA', 500);
  }
};

/**
 * POST /mfa/setup - Générer QR code et secret
 */
export const setupMFA = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) return sendError(res, 'Non authentifié', 401);

    const isEnabled = await mfaService.isMFAEnabled(req.user.id);
    if (isEnabled) return sendError(res, 'MFA est déjà activé. Désactivez-le d\'abord.', 400);

    const setup = await mfaService.generateSetup(req.user.id, req.user.email);
    pendingSetups.set(req.user.id, {
      secret: setup.secret,
      backupCodes: setup.backupCodes,
      expiresAt: Date.now() + 5 * 60 * 1000,
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
 * POST /mfa/enable - Activer MFA après vérification
 */
export const enableMFA = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) return sendError(res, 'Non authentifié', 401);

    const { code } = req.body;
    if (!code || typeof code !== 'string') return sendError(res, 'Code de vérification requis', 400);

    const pendingSetup = pendingSetups.get(req.user.id);
    if (!pendingSetup) return sendError(res, 'Aucune configuration MFA en attente. Veuillez recommencer le setup.', 400);
    if (pendingSetup.expiresAt < Date.now()) {
      pendingSetups.delete(req.user.id);
      return sendError(res, 'Configuration MFA expirée. Veuillez recommencer.', 400);
    }

    const success = await mfaService.enableMFA(req.user.id, pendingSetup.secret, code, pendingSetup.backupCodes);
    if (!success) return sendError(res, 'Code de vérification invalide', 400);

    pendingSetups.delete(req.user.id);

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id, actorEmail: req.user.email,
        action: AuditAction.MFA_ENABLED, entityType: 'User', entityId: req.user.id,
        changes: { mfaEnabled: true },
      },
    });

    logger.info(`MFA activé pour l'utilisateur ${req.user.email}`);
    return sendSuccess(res, { message: 'Authentification à deux facteurs activée avec succès.', backupCodesRemaining: pendingSetup.backupCodes.length });
  } catch (error) {
    logger.error('Erreur enableMFA:', error);
    return sendError(res, 'Erreur lors de l\'activation MFA', 500);
  }
};

/**
 * POST /mfa/disable - Désactiver MFA
 */
export const disableMFA = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) return sendError(res, 'Non authentifié', 401);

    const { password } = req.body;
    if (!password) return sendError(res, 'Mot de passe requis pour désactiver le MFA', 400);

    const success = await mfaService.disableMFA(req.user.id, password);
    if (!success) return sendError(res, 'Mot de passe incorrect', 401);

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id, actorEmail: req.user.email,
        action: AuditAction.MFA_DISABLED, entityType: 'User', entityId: req.user.id,
        changes: { mfaEnabled: false },
      },
    });

    logger.info(`MFA désactivé pour l'utilisateur ${req.user.email}`);
    return sendSuccess(res, { message: 'Authentification à deux facteurs désactivée.' });
  } catch (error) {
    logger.error('Erreur disableMFA:', error);
    return sendError(res, 'Erreur lors de la désactivation MFA', 500);
  }
};

/**
 * POST /mfa/backup-codes/regenerate - Régénérer codes backup
 */
export const regenerateBackupCodes = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) return sendError(res, 'Non authentifié', 401);

    const { code } = req.body;
    if (!code) return sendError(res, 'Code MFA requis pour régénérer les codes de backup', 400);

    const newCodes = await mfaService.regenerateBackupCodes(req.user.id, code);
    if (!newCodes) return sendError(res, 'Code MFA invalide', 401);

    logger.info(`Codes de backup régénérés pour ${req.user.email}`);
    return sendSuccess(res, { backupCodes: newCodes, message: 'Nouveaux codes de backup générés. Les anciens codes ne sont plus valides.' });
  } catch (error) {
    logger.error('Erreur regenerateBackupCodes:', error);
    return sendError(res, 'Erreur lors de la régénération des codes', 500);
  }
};

export default { getMFAStatus, setupMFA, enableMFA, verifyMFA: () => {}, disableMFA, regenerateBackupCodes };
