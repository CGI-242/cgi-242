import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuditService } from '../services/audit.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';
import { setAuthCookies } from '../middleware/auth.middleware.js';

// Ré-exporter les fonctions de session depuis le module dédié
export { logout, refreshToken, logoutAll } from './auth.session.controller.js';

const authService = new AuthService();

// Helper pour extraire les métadonnées de la requête
const getAuditMetadata = (req: Request) => ({
  ip: req.ip || req.headers['x-forwarded-for'] as string,
  userAgent: req.headers['user-agent'],
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, profession } = req.body;

  const result = await authService.register({
    email,
    password,
    firstName,
    lastName,
    profession,
  });

  // Définir les tokens dans des cookies HttpOnly sécurisés
  setAuthCookies(res, result.accessToken, result.refreshToken);

  // Retourner les données utilisateur (sans les tokens dans le body pour sécurité)
  sendSuccess(res, {
    user: result.user,
    // Tokens inclus pour compatibilité avec clients existants (à retirer après migration)
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  }, SUCCESS_MESSAGES.REGISTER_SUCCESS, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  // Vérifier que l'utilisateur existe
  if (!result.user) {
    return sendError(res, 'Identifiants invalides', 401);
  }

  const user = result.user;

  // Vérifier si MFA est activé pour cet utilisateur
  const { prisma } = await import('../config/database.js');
  const userMfa = await prisma.user.findUnique({
    where: { id: user.id },
    select: { mfaEnabled: true },
  });

  if (userMfa?.mfaEnabled) {
    // MFA activé - ne pas générer de tokens, demander vérification MFA
    // Audit trail - login partiel (en attente de MFA)
    await AuditService.log({
      actorId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      changes: { before: null, after: { email, mfaPending: true } },
      metadata: getAuditMetadata(req),
    });

    return sendSuccess(res, {
      mfaRequired: true,
      userId: user.id,
      message: 'Vérification à deux facteurs requise',
    }, 'Vérification MFA requise');
  }

  // MFA non activé - connexion normale
  // Définir les tokens dans des cookies HttpOnly sécurisés
  setAuthCookies(res, result.accessToken, result.refreshToken);

  // Audit trail - succès
  await AuditService.log({
    actorId: user.id,
    action: 'LOGIN_SUCCESS',
    entityType: 'User',
    entityId: user.id,
    changes: { before: null, after: { email } },
    metadata: getAuditMetadata(req),
  });

  // Retourner les données utilisateur
  sendSuccess(res, {
    user,
    mfaRequired: false,
    // Tokens inclus pour compatibilité avec clients existants (à retirer après migration)
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  }, SUCCESS_MESSAGES.LOGIN_SUCCESS);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  sendSuccess(res, null, SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  await authService.resetPassword(token, password);

  sendSuccess(res, null, SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  // L'audit trail est déjà géré dans authService.verifyEmail
  await authService.verifyEmail(token as string);

  sendSuccess(res, null, SUCCESS_MESSAGES.EMAIL_VERIFIED);
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  await authService.resendVerificationEmail(userId);

  sendSuccess(res, null, 'Email de vérification envoyé');
});

// Route publique - renvoyer l'email de vérification par email
export const resendVerificationPublic = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, 'Email requis', 400);
  }

  await authService.resendVerificationEmailByEmail(email);

  // Toujours retourner succès pour éviter l'énumération d'emails
  sendSuccess(res, null, 'Si un compte existe avec cet email, un lien de vérification a été envoyé.');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(userId, currentPassword, newPassword);

  // Audit trail
  await AuditService.log({
    actorId: userId,
    action: 'PASSWORD_CHANGED',
    entityType: 'User',
    entityId: userId,
    changes: { before: null, after: { passwordChanged: true } },
    metadata: getAuditMetadata(req),
  });

  sendSuccess(res, null, 'Mot de passe modifié avec succès');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, { user: req.user });
});

/**
 * Mettre à jour le profil utilisateur
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { firstName, lastName, profession } = req.body;

  const { prisma } = await import('../config/database.js');

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(profession !== undefined && { profession }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      profession: true,
      isEmailVerified: true,
    },
  });

  // Audit trail
  await AuditService.log({
    actorId: userId,
    action: 'SETTINGS_CHANGED',
    entityType: 'User',
    entityId: userId,
    changes: {
      before: { firstName: req.user!.firstName, lastName: req.user!.lastName, profession: req.user!.profession },
      after: { firstName: updatedUser.firstName, lastName: updatedUser.lastName, profession: updatedUser.profession },
    },
    metadata: getAuditMetadata(req),
  });

  sendSuccess(res, { user: updatedUser }, 'Profil mis à jour avec succès');
});

