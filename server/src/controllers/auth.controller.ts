import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuditService } from '../services/audit.service.js';
import { tokenBlacklistService } from '../services/tokenBlacklist.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import {
  setAuthCookies,
  clearAuthCookies,
  extractRefreshToken,
  verifyRefreshToken,
  generateToken,
  generateRefreshToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../middleware/auth.middleware.js';

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

  // Vérifier si MFA est activé pour cet utilisateur
  const { prisma } = await import('../config/database.js');
  const userMfa = await prisma.user.findUnique({
    where: { id: result.user.id },
    select: { mfaEnabled: true },
  });

  if (userMfa?.mfaEnabled) {
    // MFA activé - ne pas générer de tokens, demander vérification MFA
    // Audit trail - login partiel (en attente de MFA)
    await AuditService.log({
      actorId: result.user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: result.user.id,
      changes: { before: null, after: { email, mfaPending: true } },
      metadata: getAuditMetadata(req),
    });

    return sendSuccess(res, {
      mfaRequired: true,
      userId: result.user.id,
      message: 'Vérification à deux facteurs requise',
    }, 'Vérification MFA requise');
  }

  // MFA non activé - connexion normale
  // Définir les tokens dans des cookies HttpOnly sécurisés
  setAuthCookies(res, result.accessToken, result.refreshToken);

  // Audit trail - succès
  await AuditService.log({
    actorId: result.user.id,
    action: 'LOGIN_SUCCESS',
    entityType: 'User',
    entityId: result.user.id,
    changes: { before: null, after: { email } },
    metadata: getAuditMetadata(req),
  });

  // Retourner les données utilisateur
  sendSuccess(res, {
    user: result.user,
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

/**
 * Déconnexion - supprime les cookies et blackliste les tokens
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Récupérer les tokens avant de les supprimer (pour les blacklister)
  const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  // Blacklister les tokens pour les invalider immédiatement
  // Même si quelqu'un a copié le token, il ne pourra plus l'utiliser
  if (accessToken) {
    await tokenBlacklistService.blacklistToken(accessToken, 'logout');
  }
  if (refreshToken) {
    await tokenBlacklistService.blacklistToken(refreshToken, 'logout');
  }

  // Supprimer les cookies HttpOnly
  clearAuthCookies(res);

  // Audit trail - déconnexion
  if (req.user) {
    await AuditService.log({
      actorId: req.user.id,
      action: 'LOGIN_SUCCESS', // Utiliser LOGIN_SUCCESS car LOGOUT n'existe pas dans l'enum
      entityType: 'User',
      entityId: req.user.id,
      changes: { before: { loggedIn: true }, after: { loggedIn: false } },
      metadata: {
        ...getAuditMetadata(req),
        eventType: 'logout',
        tokensBlacklisted: true,
      },
    });
  }

  sendSuccess(res, null, 'Déconnexion réussie');
});

/**
 * Rafraîchir le token d'accès avec le refresh token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  // Extraire le refresh token depuis les cookies
  const refreshTokenValue = extractRefreshToken(req);

  if (!refreshTokenValue) {
    return sendError(res, 'Refresh token manquant', 401);
  }

  // Vérifier si le refresh token est blacklisté
  const isValid = await tokenBlacklistService.isTokenValid(refreshTokenValue);
  if (!isValid) {
    clearAuthCookies(res);
    return sendError(res, ERROR_MESSAGES.TOKEN_INVALID, 401);
  }

  // Vérifier le refresh token (signature et expiration)
  const payload = verifyRefreshToken(refreshTokenValue);

  if (!payload) {
    // Supprimer les cookies invalides
    clearAuthCookies(res);
    return sendError(res, ERROR_MESSAGES.TOKEN_INVALID, 401);
  }

  // Récupérer l'utilisateur
  const { prisma } = await import('../config/database.js');
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true },
  });

  if (!user) {
    clearAuthCookies(res);
    return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 401);
  }

  // Blacklister l'ancien refresh token (rotation de token)
  // Empêche la réutilisation de l'ancien token
  await tokenBlacklistService.blacklistToken(refreshTokenValue, 'token_rotation');

  // Générer de nouveaux tokens
  const newAccessToken = generateToken(user.id, user.email);
  const newRefreshToken = generateRefreshToken(user.id);

  // Mettre à jour les cookies
  setAuthCookies(res, newAccessToken, newRefreshToken);

  sendSuccess(res, {
    // Tokens inclus pour compatibilité (à retirer après migration frontend)
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }, 'Token rafraîchi');
});

/**
 * Déconnecter de toutes les sessions
 * Invalide tous les tokens existants de l'utilisateur
 */
export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  const userId = req.user.id;

  // Récupérer les tokens actuels
  const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  // Révoquer tous les accès (blacklist tokens actuels + invalidation globale)
  await tokenBlacklistService.revokeAllAccess(userId, accessToken, refreshToken);

  // Supprimer les cookies de cette session
  clearAuthCookies(res);

  // Audit trail
  await AuditService.log({
    actorId: userId,
    action: 'LOGIN_SUCCESS',
    entityType: 'User',
    entityId: userId,
    changes: { before: { sessions: 'active' }, after: { sessions: 'all_revoked' } },
    metadata: {
      ...getAuditMetadata(req),
      eventType: 'logout_all_sessions',
    },
  });

  sendSuccess(res, null, 'Déconnexion de toutes les sessions réussie');
});
