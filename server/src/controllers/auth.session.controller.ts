// server/src/controllers/auth.session.controller.ts
// Gestion des sessions: logout, refresh token, logout all

import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service.js';
import { tokenBlacklistService } from '../services/tokenBlacklist.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
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

// Helper pour extraire les métadonnées de la requête
const getAuditMetadata = (req: Request) => ({
  ip: req.ip || (req.headers['x-forwarded-for'] as string),
  userAgent: req.headers['user-agent'],
});

/**
 * Déconnexion - supprime les cookies et blackliste les tokens
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Récupérer les tokens avant de les supprimer (pour les blacklister)
  const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  // Blacklister les tokens pour les invalider immédiatement
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
      action: 'LOGIN_SUCCESS',
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
  await tokenBlacklistService.blacklistToken(refreshTokenValue, 'token_rotation');

  // Générer de nouveaux tokens
  const newAccessToken = generateToken(user.id, user.email);
  const newRefreshToken = generateRefreshToken(user.id);

  // Mettre à jour les cookies
  setAuthCookies(res, newAccessToken, newRefreshToken);

  sendSuccess(res, {
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
  const refreshTokenValue = req.cookies?.[REFRESH_TOKEN_COOKIE];

  // Révoquer tous les accès
  await tokenBlacklistService.revokeAllAccess(userId, accessToken, refreshTokenValue);

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
