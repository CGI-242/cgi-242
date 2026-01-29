// server/src/controllers/mfa.verify.controller.ts
// Contrôleur de vérification MFA lors du login

import { Request, Response } from 'express';
import { mfaService } from '../services/mfa.service.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';
import { prisma } from '../config/database.js';
import { generateToken, generateRefreshToken, setAuthCookies } from '../middleware/auth.middleware.js';
import { AuditAction } from '@prisma/client';

const logger = createLogger('MFAVerifyController');

/**
 * POST /mfa/verify
 * Vérifier code MFA lors du login
 */
export const verifyMFA = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { mfaToken, code } = req.body;

    if (!mfaToken || !code) {
      return sendError(res, 'mfaToken et code requis', 400);
    }

    const jwt = await import('jsonwebtoken');
    const { config } = await import('../config/environment.js');

    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.default.verify(mfaToken, config.jwt.secret) as { userId: string; email: string };
    } catch {
      return sendError(res, 'Token MFA invalide ou expiré', 401);
    }

    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, mfaEnabled: true },
    });

    if (!user || !user.mfaEnabled) {
      return sendError(res, 'Utilisateur non trouvé ou MFA non activé', 400);
    }

    const result = await mfaService.verifyCode(userId, code);

    if (!result.success) {
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

    const accessToken = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);
    setAuthCookies(res, accessToken, refreshToken);

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
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
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
