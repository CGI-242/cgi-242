// server/src/services/auth.email.service.ts
// Fonctions de vérification d'email pour l'authentification

import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { EmailService } from './email.service.js';
import { AuditService } from './audit.service.js';

const logger = createLogger('AuthEmailService');

/**
 * Vérifier l'email d'un utilisateur
 */
export async function verifyEmail(token: string, emailService: EmailService): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    throw new AppError(ERROR_MESSAGES.TOKEN_INVALID, 400);
  }

  if (user.isEmailVerified) {
    return;
  }

  if (user.emailVerifyExpires && new Date() > user.emailVerifyExpires) {
    throw new AppError('Le lien de vérification a expiré. Veuillez demander un nouveau lien.', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
    },
  });

  logger.info(`Email vérifié: ${user.email}`);

  await AuditService.log({
    actorId: user.id,
    action: 'EMAIL_VERIFIED',
    entityType: 'User',
    entityId: user.id,
    changes: {
      before: { isEmailVerified: false },
      after: { isEmailVerified: true },
    },
  });
}

/**
 * Renvoyer l'email de vérification (utilisateur connecté)
 */
export async function resendVerificationEmail(userId: string, emailService: EmailService): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email déjà vérifié', 400);
  }

  const emailVerifyToken = uuidv4();
  const emailVerifyExpires = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken, emailVerifyExpires },
  });

  try {
    await emailService.sendVerificationEmail({
      email: user.email,
      token: emailVerifyToken,
      firstName: user.firstName,
      isResend: true,
    });
  } catch (error) {
    logger.error("Erreur d'envoi de l'email de vérification:", error);
    throw new AppError("Erreur lors de l'envoi de l'email", 500);
  }

  logger.info(`Email de vérification renvoyé: ${user.email}`);
}

/**
 * Renvoyer l'email de vérification par email (route publique)
 */
export async function resendVerificationEmailByEmail(email: string, emailService: EmailService): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    logger.info(`Tentative de renvoi email pour compte inexistant: ${email}`);
    return;
  }

  if (user.isEmailVerified) {
    logger.info(`Tentative de renvoi email pour compte déjà vérifié: ${email}`);
    return;
  }

  const emailVerifyToken = uuidv4();
  const emailVerifyExpires = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken, emailVerifyExpires },
  });

  try {
    await emailService.sendVerificationEmail({
      email: user.email,
      token: emailVerifyToken,
      firstName: user.firstName,
      isResend: true,
    });
  } catch (error) {
    logger.error("Erreur d'envoi de l'email de vérification:", error);
  }

  logger.info(`Email de vérification renvoyé (public): ${user.email}`);
}
