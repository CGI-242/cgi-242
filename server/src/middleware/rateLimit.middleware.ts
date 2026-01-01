import rateLimit from 'express-rate-limit';
import { config } from '../config/environment.js';

/**
 * Rate limiter global
 * Limite le nombre de requêtes par IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes par défaut
  max: config.rateLimit.maxRequests, // 100 requêtes par fenêtre
  message: {
    success: false,
    error: 'Trop de requêtes. Veuillez réessayer plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Utiliser X-Forwarded-For si derrière un proxy
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown'
    );
  },
  skip: (_req) => {
    // Skip en développement si configuré
    return config.isDevelopment && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Rate limiter strict pour l'authentification
 * Limite les tentatives de connexion pour prévenir le brute force
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: {
    success: false,
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Limiter par IP + email pour être plus précis
    const email = req.body?.email || '';
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';
    return `${ip}:${email}`;
  },
  skipSuccessfulRequests: true, // Ne pas compter les succès
});

/**
 * Rate limiter pour les opérations sensibles
 * (création d'organisation, invitations, etc.)
 */
export const sensitiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 opérations par heure
  message: {
    success: false,
    error: 'Limite d\'opérations atteinte. Veuillez réessayer plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter pour les requêtes IA
 * Plus strict car ces requêtes sont coûteuses
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requêtes par minute
  message: {
    success: false,
    error: 'Trop de requêtes IA. Veuillez patienter quelques instants.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter par utilisateur authentifié
 * Utilise l'ID utilisateur au lieu de l'IP
 */
export const userRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requêtes par minute
  message: {
    success: false,
    error: 'Trop de requêtes. Veuillez patienter quelques instants.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Utiliser l'ID utilisateur si disponible, sinon l'IP
    return req.user?.id || req.ip || 'unknown';
  },
});

export default globalRateLimiter;
