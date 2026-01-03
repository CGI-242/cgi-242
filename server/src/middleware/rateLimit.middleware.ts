import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from '../services/redis.service.js';
import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';

/**
 * Crée un store Redis pour le rate limiting distribué
 * Permet le scaling horizontal avec plusieurs instances
 */
function createRedisStore(prefix: string) {
  const client = getRedisClient();

  // Si Redis n'est pas disponible, utiliser le store en mémoire (fallback)
  if (!client) {
    logger.warn(`[RateLimit] Redis non disponible, utilisation du store en mémoire pour ${prefix}`);
    return undefined;
  }

  return new RedisStore({
    // @ts-expect-error - Le type sendCommand est compatible avec ioredis
    sendCommand: (...args: string[]) => client.call(...args),
    prefix: `rl:${prefix}:`,
  });
}

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
  store: createRedisStore('global'),
  keyGenerator: (req) => {
    // Utiliser X-Forwarded-For si derrière un proxy (nginx)
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
  store: createRedisStore('auth'),
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
  store: createRedisStore('sensitive'),
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
  store: createRedisStore('ai'),
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
  store: createRedisStore('user'),
  keyGenerator: (req) => {
    // Utiliser l'ID utilisateur si disponible, sinon l'IP
    return req.user?.id || req.ip || 'unknown';
  },
});

export default globalRateLimiter;
