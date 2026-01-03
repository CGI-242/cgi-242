import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { prisma } from '../config/database.js';
import { sendError } from '../utils/helpers.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { AuthUser } from '../types/express.js';
import { createLogger } from '../utils/logger.js';

const authLogger = createLogger('AuthMiddleware');

// Noms des cookies
const ACCESS_TOKEN_COOKIE = 'cgi_access_token';
const REFRESH_TOKEN_COOKIE = 'cgi_refresh_token';

interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Extraire le token depuis les cookies OU le header Authorization
 * Priorité: Cookie HttpOnly > Header Authorization (pour compatibilité)
 */
function extractToken(req: Request): string | null {
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
 * Middleware d'authentification JWT
 * Vérifie le token (cookie HttpOnly ou header) et attache l'utilisateur à la requête
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Récupérer le token depuis cookie ou header
    const token = extractToken(req);

    if (!token) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    // Vérifier et décoder le token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return sendError(res, ERROR_MESSAGES.TOKEN_EXPIRED, 401);
      }
      return sendError(res, ERROR_MESSAGES.TOKEN_INVALID, 401);
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 401);
    }

    // Attacher l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    } as AuthUser;

    next();
  } catch (error) {
    authLogger.error('Auth middleware error:', error);
    return sendError(res, ERROR_MESSAGES.INTERNAL_ERROR, 500);
  }
};

/**
 * Middleware optionnel d'authentification
 * Attache l'utilisateur s'il est authentifié, mais ne bloque pas sinon
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        } as AuthUser;
      }
    } catch {
      // Token invalide, on continue sans utilisateur
    }

    next();
  } catch (error) {
    authLogger.error('Optional auth middleware error:', error);
    next();
  }
};

/**
 * Middleware pour vérifier que l'email est vérifié
 */
export const requireEmailVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  if (!req.user) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { isEmailVerified: true },
  });

  if (!user?.isEmailVerified) {
    return sendError(res, ERROR_MESSAGES.EMAIL_NOT_VERIFIED, 403);
  }

  next();
};

/**
 * Générer un token JWT
 */
export function generateToken(userId: string, email: string): string {
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'] };
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
 * Middleware pour vérifier que l'utilisateur est un super admin
 * Les super admins sont définis dans SUPER_ADMIN_EMAILS
 */
export const requireSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  if (!req.user) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  const isSuperAdmin = config.superAdmins.includes(req.user.email);

  if (!isSuperAdmin) {
    authLogger.warn(`Accès super admin refusé pour ${req.user.email}`);
    return sendError(res, 'Accès réservé aux super administrateurs', 403);
  }

  next();
};

/**
 * Vérifier si un utilisateur est super admin (helper)
 */
export function isSuperAdmin(email: string): boolean {
  return config.superAdmins.includes(email);
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
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  // Access token - durée courte (15 minutes par défaut)
  const accessMaxAge = 15 * 60 * 1000; // 15 minutes en ms
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, getSecureCookieOptions(accessMaxAge));

  // Refresh token - durée plus longue (7 jours par défaut)
  const refreshMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours en ms
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

/**
 * Extraire le refresh token depuis les cookies
 */
export function extractRefreshToken(req: Request): string | null {
  if (req.cookies && req.cookies[REFRESH_TOKEN_COOKIE]) {
    return req.cookies[REFRESH_TOKEN_COOKIE];
  }
  return null;
}

// Export des noms de cookies pour usage externe
export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };

export default authMiddleware;
