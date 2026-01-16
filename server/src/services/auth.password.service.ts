// server/src/services/auth.password.service.ts
// Fonctions de gestion des mots de passe

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { prisma } from '../config/database.js';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import { ERROR_MESSAGES, PASSWORD_RESET_EXPIRY_HOURS } from '../utils/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { EmailService } from './email.service.js';
import { AuditService } from './audit.service.js';

const logger = createLogger('AuthPasswordService');

/**
 * Demander la réinitialisation du mot de passe
 */
export async function forgotPassword(email: string, emailService: EmailService): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return; // Ne pas révéler si l'email existe
  }

  const resetToken = uuidv4();
  const resetExpires = addHours(new Date(), PASSWORD_RESET_EXPIRY_HOURS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    },
  });

  try {
    await emailService.sendPasswordReset({
      email: user.email,
      token: resetToken,
      firstName: user.firstName,
    });
  } catch (error) {
    logger.error("Erreur d'envoi de l'email de réinitialisation:", error);
  }

  logger.info(`Demande de réinitialisation de mot de passe: ${email}`);
}

/**
 * Réinitialiser le mot de passe
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError(ERROR_MESSAGES.TOKEN_INVALID, 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  logger.info(`Mot de passe réinitialisé: ${user.email}`);

  await AuditService.log({
    actorId: user.id,
    action: 'PASSWORD_CHANGED',
    entityType: 'User',
    entityId: user.id,
    changes: {
      before: { hasPassword: true },
      after: { hasPassword: true, resetAt: new Date().toISOString() },
    },
    metadata: { method: 'password_reset_token' },
  });
}

/**
 * Changer le mot de passe (utilisateur connecté)
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError('Mot de passe actuel incorrect', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  logger.info(`Mot de passe changé: ${user.email}`);
}
