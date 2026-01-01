import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { prisma } from '../config/database.js';
import { sendError } from '../utils/helpers.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { AuthUser } from '../types/express.js';
import { createLogger } from '../utils/logger.js';

const authLogger = createLogger('AuthMiddleware');

interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Middleware d'authentification JWT
 * Vérifie le token et attache l'utilisateur à la requête
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

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
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

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

export default authMiddleware;
