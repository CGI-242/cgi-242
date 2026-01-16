import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { prisma } from '../config/database.js';
import { sendError } from '../utils/helpers.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { AuthUser } from '../types/express.js';
import { createLogger } from '../utils/logger.js';
import { tokenBlacklistService } from '../services/tokenBlacklist.service.js';
import {
  extractToken,
  ACCESS_TOKEN_COOKIE,
} from './auth.tokens.js';

// Ré-exporter les fonctions de tokens depuis le module dédié
export {
  extractToken,
  extractRefreshToken,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from './auth.tokens.js';

const authLogger = createLogger('AuthMiddleware');

interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
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

    // Vérifier si le token est blacklisté (logout, révocation, etc.)
    const isTokenValid = await tokenBlacklistService.isTokenValid(token);
    if (!isTokenValid) {
      authLogger.warn(`Token blacklisté détecté pour userId: ${decoded.userId}`);
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

export default authMiddleware;
