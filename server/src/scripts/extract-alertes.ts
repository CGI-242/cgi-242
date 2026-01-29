// server/src/scripts/extract-alertes.ts
/**
 * Script d'extraction des alertes fiscales depuis les articles du CGI
 *
 * Usage:
 *   npx tsx src/scripts/extract-alertes.ts [version]
 *
 * Exemples:
 *   npx tsx src/scripts/extract-alertes.ts           # Version 2026 par défaut
 *   npx tsx src/scripts/extract-alertes.ts 2025     # Version spécifique
 */

import { AlertesFiscalesService } from '../services/alertes-fiscales.service.js';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ExtractAlertesScript');

async function main() {
  const args = process.argv.slice(2);
  const version = args[0] || '2026';

  logger.info('=== Extraction des Alertes Fiscales ===');
  logger.info(`Version CGI: ${version}`);
  logger.info('');

  try {
    // Vérifier la connexion à la base de données
    await prisma.$connect();
    logger.info('Connexion à la base de données établie');

    // Compter les articles existants pour cette version
    const articleCount = await prisma.article.count({
      where: { version },
    });
    logger.info(`Articles disponibles pour la version ${version}: ${articleCount}`);

    if (articleCount === 0) {
      logger.warn(`Aucun article trouvé pour la version ${version}`);
      logger.info('Assurez-vous d\'avoir ingéré les articles avant d\'exécuter ce script');
      process.exit(1);
    }

    // Lancer l'extraction
    logger.info('');
    logger.info('Début de l\'extraction...');
    const startTime = Date.now();

    const result = await AlertesFiscalesService.extractAndIngest(version);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Afficher les résultats
    logger.info('');
    logger.info('=== Résultat de l\'extraction ===');
    logger.info(`Total alertes traitées: ${result.total}`);
    logger.info(`Nouvelles alertes insérées: ${result.inserted}`);
    logger.info(`Alertes mises à jour: ${result.updated}`);
    logger.info(`Durée: ${duration}s`);

    // Afficher les statistiques par type
    logger.info('');
    logger.info('=== Statistiques par type ===');
    const statsByType = await AlertesFiscalesService.countByType(version);
    for (const [type, count] of Object.entries(statsByType)) {
      if (count > 0) {
        logger.info(`${type}: ${count}`);
      }
    }

    // Afficher les statistiques par catégorie
    logger.info('');
    logger.info('=== Statistiques par catégorie ===');
    const statsByCategorie = await AlertesFiscalesService.countByCategorie(version);
    for (const [categorie, count] of Object.entries(statsByCategorie)) {
      if (count > 0) {
        logger.info(`${categorie}: ${count}`);
      }
    }

    // Vérification finale
    const totalAlertes = await prisma.alerteFiscale.count({
      where: { version, actif: true },
    });
    logger.info('');
    logger.info(`Total alertes actives en base: ${totalAlertes}`);

    await prisma.$disconnect();
    logger.info('');
    logger.info('Extraction terminée avec succès');
    process.exit(0);
  } catch (error) {
    logger.error('Erreur lors de l\'extraction:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise);
  logger.error('Reason:', reason);
  process.exit(1);
});

main();
