// server/src/controllers/stats.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('StatsController');

interface UsageStats {
  questionsUsed: number;
  questionsLimit: number;
  articlesViewed: number;
  conversationsCount: number;
}

/**
 * Obtenir les statistiques d'utilisation
 */
export async function getUsageStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const tenant = req.tenant;

    if (!userId) {
      sendError(res, 'Non autorisé', 401);
      return;
    }

    let questionsLimit = 10;
    let questionsUsed = 0;
    let conversationsCount = 0;
    let articlesViewed = 0;

    if (tenant?.type === 'organization' && tenant.organizationId) {
      const subscription = await prisma.subscription.findUnique({
        where: { organizationId: tenant.organizationId },
      });

      questionsLimit = subscription?.questionsPerMonth ?? 10;
      questionsUsed = subscription?.questionsUsed ?? 0;

      conversationsCount = await prisma.conversation.count({
        where: { organizationId: tenant.organizationId },
      });

      const searchCount = await prisma.searchHistory.count({
        where: {
          user: {
            memberships: {
              some: { organizationId: tenant.organizationId },
            },
          },
        },
      });
      articlesViewed = searchCount;
    } else {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      questionsLimit = subscription?.questionsPerMonth ?? 10;
      questionsUsed = subscription?.questionsUsed ?? 0;

      conversationsCount = await prisma.conversation.count({
        where: { creatorId: userId, organizationId: null },
      });

      articlesViewed = await prisma.searchHistory.count({
        where: { userId },
      });
    }

    const stats: UsageStats = {
      questionsUsed,
      questionsLimit,
      articlesViewed,
      conversationsCount,
    };

    sendSuccess(res, stats);
  } catch (error) {
    logger.error('Erreur getUsageStats:', error);
    sendError(res, 'Erreur lors de la récupération des stats', 500);
  }
}
