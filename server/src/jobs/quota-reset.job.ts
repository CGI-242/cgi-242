// server/src/jobs/quota-reset.job.ts
import cron from 'node-cron';
import { resetQuotaCounters } from '../middleware/tenant.middleware.js';
import { createLogger } from '../utils/logger.js';
import EmailService from '../services/email.service.js';

const logger = createLogger('QuotaResetJob');
const emailService = new EmailService();

/**
 * Cron job pour réinitialiser les quotas mensuels
 * S'exécute le 1er de chaque mois à 00:01 (heure du serveur)
 *
 * Format cron: minute heure jour mois jour-semaine
 * '1 0 1 * *' = 00:01 le 1er de chaque mois
 */
export function startQuotaResetJob() {
  // Exécuter le 1er de chaque mois à 00:01
  cron.schedule('1 0 1 * *', async () => {
    const startTime = Date.now();
    logger.info('Demarrage du reset mensuel des quotas...');

    try {
      await resetQuotaCounters();

      const duration = Date.now() - startTime;
      logger.info(`Reset mensuel des quotas termine avec succes en ${duration}ms`);

      // Envoyer notification admin
      await emailService.sendAdminNotification({
        type: 'QUOTA_RESET_SUCCESS',
        message: `Reset mensuel des quotas terminé avec succès en ${duration}ms`,
        details: {
          duration,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      const err = error as Error;
      logger.error('Erreur lors du reset mensuel des quotas:', error);

      // Alerter immédiatement l'équipe technique
      await emailService.sendAdminNotification({
        type: 'QUOTA_RESET_FAILED',
        message: 'Le reset mensuel des quotas a échoué',
        details: {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        }
      });

      // Ne pas throw pour ne pas crasher le serveur
      // L'admin devra reset manuellement si besoin
    }
  });

  logger.info('Cron job de reset quotas mensuel configure (1er du mois a 00:01)');
}

/**
 * Pour tests: Reset manuel des quotas
 * Utiliser avec précaution en production
 */
export async function manualQuotaReset() {
  logger.warn('⚠️  Reset manuel des quotas déclenché');

  try {
    await resetQuotaCounters();
    logger.info('✅ Reset manuel des quotas réussi');
    return { success: true, message: 'Quotas réinitialisés avec succès' };
  } catch (error) {
    logger.error('❌ Erreur reset manuel:', error);
    throw new Error('Échec du reset manuel des quotas');
  }
}
