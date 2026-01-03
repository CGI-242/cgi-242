// server/src/middleware/csrf.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('CSRFMiddleware');

// Configuration Double CSRF (pattern recommandé pour SPA)
const {
  generateCsrfToken,
  doubleCsrfProtection,
  invalidCsrfTokenError,
} = doubleCsrf({
  getSecret: () => config.csrf.secret,
  cookieName: 'cgi.csrf', // Nom du cookie CSRF
  cookieOptions: {
    httpOnly: true,
    sameSite: config.cookie.sameSite,
    secure: config.cookie.secure,
    path: '/',
  },
  size: 64, // Taille du token
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Ces méthodes n'ont pas besoin de CSRF
  getSessionIdentifier: (req: Request) => {
    // Utiliser l'IP + User-Agent comme identifiant de session (si pas de session)
    // Ou l'ID utilisateur si disponible
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    if (userId) return userId;
    return `${req.ip || 'unknown'}-${req.headers['user-agent'] || 'unknown'}`;
  },
  getCsrfTokenFromRequest: (req: Request) => {
    // Chercher le token dans le header X-CSRF-Token ou x-csrf-token
    return req.headers['x-csrf-token'] as string || req.headers['x-xsrf-token'] as string;
  },
});

/**
 * Middleware de protection CSRF
 * À appliquer sur les routes qui modifient des données (POST, PUT, DELETE, PATCH)
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  if (!config.csrf.enabled) {
    return next();
  }

  try {
    doubleCsrfProtection(req, res, (err) => {
      if (err) {
        if (err === invalidCsrfTokenError) {
          logger.warn(`CSRF token invalide: ${req.method} ${req.path} - IP: ${req.ip}`);
          res.status(403).json({
            success: false,
            error: 'Token CSRF invalide ou manquant',
            code: 'CSRF_INVALID',
          });
          return;
        }
        next(err);
        return;
      }
      next();
    });
  } catch (error) {
    logger.error('Erreur CSRF middleware:', error);
    next(error);
  }
};

/**
 * Route pour obtenir un token CSRF
 * Le client doit appeler cette route et stocker le token pour les requêtes suivantes
 */
export const getCsrfToken = (req: Request, res: Response): void => {
  try {
    const token = generateCsrfToken(req, res);
    res.json({
      success: true,
      data: { csrfToken: token },
    });
  } catch (error) {
    logger.error('Erreur génération CSRF token:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération du token CSRF',
    });
  }
};

/**
 * Middleware pour injecter le token CSRF dans les réponses
 * Utile pour les formulaires traditionnels (non-SPA)
 */
export const injectCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  if (!config.csrf.enabled) {
    return next();
  }

  try {
    // Générer et attacher le token à la requête pour utilisation dans les templates
    const token = generateCsrfToken(req, res);
    res.locals.csrfToken = token;
    next();
  } catch (error) {
    logger.error('Erreur injection CSRF token:', error);
    next();
  }
};

export { generateCsrfToken };
