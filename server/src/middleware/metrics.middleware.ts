/**
 * Middleware de collecte des métriques HTTP
 * Enregistre automatiquement les métriques pour chaque requête
 */

import { Request, Response, NextFunction } from 'express';
import {
  httpRequestDuration,
  httpRequestTotal,
  httpRequestsInProgress,
  httpResponseSize,
} from '../services/metrics.service.js';

/**
 * Normalise le chemin de la route pour éviter une explosion de labels
 * Exemple: /api/users/123 -> /api/users/:id
 */
function normalizePath(path: string): string {
  return path
    // UUIDs
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
    // IDs numériques
    .replace(/\/\d+/g, '/:id')
    // Tokens longs
    .replace(/\/[a-zA-Z0-9]{20,}/g, '/:token')
    // Versions d'articles (2025, 2026)
    .replace(/\/(2025|2026)\//g, '/:version/')
    // Nettoyer les doubles slashes
    .replace(/\/+/g, '/');
}

/**
 * Middleware de métriques HTTP
 * À placer au début de la chaîne de middlewares
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Ne pas mesurer l'endpoint /metrics lui-même
  if (req.path === '/metrics' || req.path === '/health') {
    return next();
  }

  const startTime = process.hrtime.bigint();
  const method = req.method;

  // Incrémenter les requêtes en cours
  httpRequestsInProgress.inc({ method });

  // Intercepter la fin de la réponse
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationSeconds = Number(endTime - startTime) / 1e9;

    const route = normalizePath(req.route?.path || req.path);
    const statusCode = res.statusCode.toString();

    // Enregistrer les métriques
    httpRequestDuration.observe({ method, route, status_code: statusCode }, durationSeconds);
    httpRequestTotal.inc({ method, route, status_code: statusCode });

    // Taille de la réponse
    const contentLength = res.get('content-length');
    if (contentLength) {
      httpResponseSize.observe({ method, route }, parseInt(contentLength, 10));
    }

    // Décrémenter les requêtes en cours
    httpRequestsInProgress.dec({ method });
  });

  // En cas d'erreur (connexion fermée prématurément)
  res.on('close', () => {
    if (!res.writableEnded) {
      httpRequestsInProgress.dec({ method });
    }
  });

  next();
}

export default metricsMiddleware;
