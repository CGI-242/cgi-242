/**
 * Service de Health Checks
 * Vérifie l'état de tous les services critiques
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger.js';
import { redisService } from './redis.service.js';
import { getLogStats } from '../utils/logger.js';
import { getMetricsStats } from './metrics.service.js';
import { isSentryEnabled } from './sentry.service.js';

const logger = createLogger('HealthService');

// Client Prisma pour les checks DB
const prisma = new PrismaClient();

// Types
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface HealthReport {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  serverId: string;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    qdrant: HealthCheck;
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      loadAverage: number[];
    };
  };
  services: {
    logging: boolean;
    metrics: boolean;
    sentry: boolean;
  };
}

// Timestamp de démarrage
const startTime = Date.now();

/**
 * Vérifie la connexion à la base de données PostgreSQL
 */
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return {
      status: latency > 1000 ? 'degraded' : 'healthy',
      latency,
      message: latency > 1000 ? 'High latency detected' : 'Connected',
    };
  } catch (error) {
    logger.error('Database health check failed', error);
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Vérifie la connexion à Redis
 */
async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    const isHealthy = await redisService.ping();
    const latency = Date.now() - start;

    if (!isHealthy) {
      return {
        status: 'unhealthy',
        latency,
        message: 'Redis ping failed',
      };
    }

    const stats = await redisService.getStats();

    return {
      status: latency > 100 ? 'degraded' : 'healthy',
      latency,
      message: 'Connected',
      details: {
        keys: stats.keys,
        memory: stats.memory,
      },
    };
  } catch (error) {
    logger.error('Redis health check failed', error);
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Vérifie la connexion à Qdrant
 */
async function checkQdrant(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    // Import dynamique pour éviter les erreurs de chargement
    const { QdrantClient } = await import('@qdrant/js-client-rest');
    const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
    const client = new QdrantClient({ url: qdrantUrl });

    // Vérifier que Qdrant répond
    const collections = await client.getCollections();
    const latency = Date.now() - start;

    return {
      status: latency > 500 ? 'degraded' : 'healthy',
      latency,
      message: 'Connected',
      details: {
        collections: collections.collections.length,
      },
    };
  } catch (error) {
    logger.error('Qdrant health check failed', error);
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Récupère les informations système
 */
function getSystemInfo() {
  const memUsage = process.memoryUsage();
  const totalMem = require('os').totalmem();
  const loadAvg = require('os').loadavg();

  return {
    memory: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
    cpu: {
      loadAverage: loadAvg,
    },
  };
}

/**
 * Détermine le statut global basé sur les checks
 */
function determineOverallStatus(checks: HealthReport['checks']): 'ok' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map(c => c.status);

  if (statuses.includes('unhealthy')) {
    // Si la DB est down, c'est critique
    if (checks.database.status === 'unhealthy') {
      return 'unhealthy';
    }
    return 'degraded';
  }

  if (statuses.includes('degraded')) {
    return 'degraded';
  }

  return 'ok';
}

/**
 * Rapport de santé complet
 */
export async function getHealthReport(): Promise<HealthReport> {
  const [database, redis, qdrant] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkQdrant(),
  ]);

  const checks = { database, redis, qdrant };

  return {
    status: determineOverallStatus(checks),
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || '1.0.0',
    serverId: process.env.SERVER_ID || 'default',
    checks,
    system: getSystemInfo(),
    services: {
      logging: true,
      metrics: true,
      sentry: isSentryEnabled(),
    },
  };
}

/**
 * Check rapide pour liveness probe (Kubernetes)
 * Vérifie uniquement que le processus Node.js fonctionne
 */
export function getLivenessCheck(): { status: 'ok'; uptime: number } {
  return {
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };
}

/**
 * Check pour readiness probe (Kubernetes)
 * Vérifie que l'application est prête à recevoir du trafic
 */
export async function getReadinessCheck(): Promise<{
  ready: boolean;
  checks: { database: boolean; redis: boolean };
}> {
  const [dbCheck, redisCheck] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);

  const dbReady = dbCheck.status !== 'unhealthy';
  const redisReady = redisCheck.status !== 'unhealthy';

  return {
    ready: dbReady, // Redis est optionnel
    checks: {
      database: dbReady,
      redis: redisReady,
    },
  };
}

/**
 * Check startup probe (Kubernetes)
 * Vérifie que l'application a démarré correctement
 */
export async function getStartupCheck(): Promise<{
  started: boolean;
  duration: number;
}> {
  try {
    // Vérifier que la DB est accessible
    await prisma.$queryRaw`SELECT 1`;

    return {
      started: true,
      duration: Date.now() - startTime,
    };
  } catch {
    return {
      started: false,
      duration: Date.now() - startTime,
    };
  }
}

export default {
  getHealthReport,
  getLivenessCheck,
  getReadinessCheck,
  getStartupCheck,
};
