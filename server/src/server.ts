import { createApp } from './app.js';
import { config, validateEnvironment } from './config/environment.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createLogger } from './utils/logger.js';
import { startQuotaResetJob } from './jobs/quota-reset.job.js';
import { redisService } from './services/redis.service.js';

const logger = createLogger('Server');

async function bootstrap(): Promise<void> {
  try {
    // Valider les variables d'environnement
    validateEnvironment();

    // Connecter à la base de données
    await connectDatabase();

    // Connecter à Redis (optionnel, continue sans si indisponible)
    await redisService.connect();
    const redisStatus = redisService.isAvailable() ? '✅ Connected' : '⚠️ Unavailable (running without cache)';

    // Créer l'application Express
    const app = createApp();

    // Démarrer le serveur
    const server = app.listen(config.port, () => {
      logger.info(`
========================================
🚀 CGI 242 Server
========================================
Environment: ${config.nodeEnv}
Port: ${config.port}
API: ${config.backendUrl}${config.apiPrefix}
Frontend: ${config.frontendUrl}
Redis: ${redisStatus}
========================================
      `);

      // Démarrer le cron job pour reset quotas mensuel
      startQuotaResetJob();
    });

    // Gestion de l'arrêt propre
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} reçu. Arrêt en cours...`);

      server.close(async () => {
        logger.info('Serveur HTTP fermé');
        await redisService.disconnect();
        await disconnectDatabase();
        process.exit(0);
      });

      // Forcer l'arrêt après 10 secondes
      setTimeout(() => {
        logger.error("Arrêt forcé après timeout");
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Gestion des erreurs non capturées
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', { reason, promise });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

bootstrap();
