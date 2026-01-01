import { PrismaClient } from '@prisma/client';
import { config } from './environment.js';
import { createLogger } from '../utils/logger.js';

const dbLogger = createLogger('Database');

// Singleton Prisma Client
let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Éviter les multiples instances en développement (hot reload)
if (config.isProduction) {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

// Connexion à la base de données
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    dbLogger.info('Connexion à la base de données établie');
  } catch (error) {
    dbLogger.error('Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
}

// Déconnexion propre
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  dbLogger.info('Déconnexion de la base de données');
}

// Middleware pour le logging des requêtes lentes
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  const duration = after - before;
  if (duration > 1000) {
    dbLogger.warn(`Requête lente (${duration}ms): ${params.model}.${params.action}`);
  }

  return result;
});

export { prisma };
export default prisma;
