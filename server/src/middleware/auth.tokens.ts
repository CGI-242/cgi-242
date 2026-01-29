// server/src/middleware/auth.tokens.ts
// Gestion des tokens JWT et cookies d'authentification

import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/environment.js';

// Noms des cookies
export const ACCESS_TOKEN_COOKIE = 'cgi_access_token';
export const REFRESH_TOKEN_COOKIE = 'cgi_refresh_token';

/**
 * Extraire le token depuis les cookies OU le header Authorization
 * Priorité: Cookie HttpOnly > Header Authorization (pour compatibilité)
 */
export function extractToken(req: Request): string | null {
  // 1. Essayer d'abord les cookies HttpOnly (plus sécurisé)
  if (req.cookies && req.cookies[ACCESS_TOKEN_COOKIE]) {
    return req.cookies[ACCESS_TOKEN_COOKIE];
  }

  // 2. Fallback sur le header Authorization (compatibilité pendant migration)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Extraire le refresh token depuis les cookies
 */
export function extractRefreshToken(req: Request): string | null {
  if (req.cookies && req.cookies[REFRESH_TOKEN_COOKIE]) {
    return req.cookies[REFRESH_TOKEN_COOKIE];
  }
  return null;
}

/**
 * Générer un token JWT
 * @param expiresIn - Durée personnalisée (ex: '5m', '1h') ou utilise la config par défaut
 */
export function generateToken(userId: string, email: string, expiresIn?: string): string {
  const options: SignOptions = { expiresIn: (expiresIn || config.jwt.expiresIn) as SignOptions['expiresIn'] };
  return jwt.sign({ userId, email }, config.jwt.secret, options);
}

/**
 * Générer un refresh token
 */
export function generateRefreshToken(userId: string): string {
  const options: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ userId, type: 'refresh' }, config.jwt.secret, options);
}

/**
 * Vérifier un refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      type: string;
    };
    if (decoded.type !== 'refresh') {
      return null;
    }
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

/**
 * Options de base pour les cookies sécurisés
 */
function getSecureCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/',
    maxAge,
    ...(config.cookie.domain && { domain: config.cookie.domain }),
  };
}

/**
 * Définir les tokens dans des cookies HttpOnly sécurisés
 */
export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  // Access token - durée courte (15 minutes par défaut)
  const accessMaxAge = 15 * 60 * 1000;
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, getSecureCookieOptions(accessMaxAge));

  // Refresh token - durée plus longue (7 jours par défaut)
  const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getSecureCookieOptions(refreshMaxAge));
}

/**
 * Supprimer les cookies d'authentification (logout)
 */
export function clearAuthCookies(res: Response): void {
  const clearOptions = {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/',
    ...(config.cookie.domain && { domain: config.cookie.domain }),
  };

  res.clearCookie(ACCESS_TOKEN_COOKIE, clearOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, clearOptions);
}
