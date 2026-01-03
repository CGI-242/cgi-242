/**
 * Database Service avec support Read Replicas
 * Permet le scaling horizontal de la base de données
 *
 * Architecture:
 * - Master: Toutes les opérations d'écriture (INSERT, UPDATE, DELETE)
 * - Replicas: Opérations de lecture (SELECT) - load balanced
 */

import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('DatabaseService');

// URLs des bases de données
const DATABASE_URL = process.env.DATABASE_URL!;
const DATABASE_REPLICA_URLS = process.env.DATABASE_REPLICA_URLS
  ? process.env.DATABASE_REPLICA_URLS.split(',').map(url => url.trim())
  : [];

// Client Prisma de base
const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['error'],
});

/**
 * Client Prisma avec extension Read Replicas
 * Si des replicas sont configurés, les lectures sont distribuées
 */
function createPrismaClient() {
  if (DATABASE_REPLICA_URLS.length === 0) {
    logger.info('Running with single database (no replicas configured)');
    return basePrisma;
  }

  logger.info(`Configuring ${DATABASE_REPLICA_URLS.length} read replica(s)`);

  // Extension avec replicas
  return basePrisma.$extends(
    readReplicas({
      url: DATABASE_REPLICA_URLS,
    })
  );
}

// Client Prisma singleton avec replicas
export const prisma = createPrismaClient();

// Export du client de base pour les cas spéciaux (migrations, etc.)
export const prismaBase = basePrisma;

/**
 * Force la lecture sur le master (pour les cas de cohérence forte)
 * Utiliser après une écriture si une lecture immédiate est nécessaire
 */
export async function readFromMaster<T>(
  operation: (client: PrismaClient) => Promise<T>
): Promise<T> {
  // Si pas de replicas, le client normal est utilisé
  if (DATABASE_REPLICA_URLS.length === 0) {
    return operation(basePrisma);
  }

  // Utiliser $primary() pour forcer le master
  // @ts-expect-error - L'extension ajoute $primary() au client
  return operation(prisma.$primary());
}

/**
 * Health check de la base de données
 */
export async function checkDatabaseHealth(): Promise<{
  master: boolean;
  replicas: { url: string; healthy: boolean }[];
}> {
  const health = {
    master: false,
    replicas: [] as { url: string; healthy: boolean }[],
  };

  // Check master
  try {
    await basePrisma.$queryRaw`SELECT 1`;
    health.master = true;
  } catch (error) {
    logger.error('Master database health check failed:', error);
  }

  // Check replicas
  for (const replicaUrl of DATABASE_REPLICA_URLS) {
    const replicaClient = new PrismaClient({
      datasources: { db: { url: replicaUrl } },
    });

    try {
      await replicaClient.$queryRaw`SELECT 1`;
      health.replicas.push({ url: maskUrl(replicaUrl), healthy: true });
    } catch {
      health.replicas.push({ url: maskUrl(replicaUrl), healthy: false });
    } finally {
      await replicaClient.$disconnect();
    }
  }

  return health;
}

/**
 * Masque l'URL pour les logs (cache le mot de passe)
 */
function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.password = '***';
    return parsed.toString();
  } catch {
    return 'invalid-url';
  }
}

/**
 * Statistiques de connexion
 */
export function getDatabaseStats() {
  return {
    masterUrl: maskUrl(DATABASE_URL),
    replicaCount: DATABASE_REPLICA_URLS.length,
    replicaUrls: DATABASE_REPLICA_URLS.map(maskUrl),
  };
}

/**
 * Ferme toutes les connexions
 */
export async function disconnectDatabase(): Promise<void> {
  await basePrisma.$disconnect();
  logger.info('Database connections closed');
}

export default prisma;
