// server/src/services/analytics.helpers.ts
// Fonctions utilitaires pour les analytics

import { prisma } from '../config/database.js';
import { subDays, format } from 'date-fns';

export interface AggregatedStats {
  questions: number;
  articles: number;
  conversations: number;
}

/**
 * Obtenir les statistiques agrégées
 */
export async function getAggregatedStats(
  userId?: string,
  organizationId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<AggregatedStats> {
  const [usageAgg, conversationsCount] = await Promise.all([
    prisma.usageStats.aggregate({
      where: {
        ...(userId && { userId }),
        ...(organizationId && { organizationId }),
        ...(startDate && endDate && { date: { gte: startDate, lte: endDate } }),
      },
      _sum: {
        questionsAsked: true,
        articlesViewed: true,
      },
    }),
    prisma.conversation.count({
      where: {
        ...(userId && { creatorId: userId }),
        ...(organizationId && { organizationId }),
        ...(startDate && endDate && { createdAt: { gte: startDate, lte: endDate } }),
      },
    }),
  ]);

  return {
    questions: usageAgg._sum.questionsAsked || 0,
    articles: usageAgg._sum.articlesViewed || 0,
    conversations: conversationsCount,
  };
}

/**
 * Obtenir les recherches les plus fréquentes
 */
export async function getTopSearches(
  userId?: string,
  _organizationId?: string,
  limit = 10
): Promise<Array<{ articleId: string; query: string; count: number }>> {
  const searches = await prisma.searchHistory.groupBy({
    by: ['articleId', 'query'],
    where: {
      ...(userId && { userId }),
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });

  return searches.map((s) => ({
    articleId: s.articleId || '',
    query: s.query,
    count: s._count.id,
  }));
}

/**
 * Obtenir l'activité récente
 */
export async function getRecentActivity(
  _userId?: string,
  organizationId?: string,
  days = 7
): Promise<Array<{ action: string; date: string; count: number }>> {
  const startDate = subDays(new Date(), days);

  const activity = await prisma.auditLog.groupBy({
    by: ['action'],
    where: {
      createdAt: { gte: startDate },
      ...(organizationId && { organizationId }),
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  return activity.map((a) => ({
    action: a.action,
    date: format(startDate, 'yyyy-MM-dd'),
    count: a._count.id,
  }));
}

/**
 * Compter les utilisateurs actifs
 */
export async function getActiveUsersCount(
  organizationId: string,
  since: Date
): Promise<number> {
  const activeUsers = await prisma.usageStats.findMany({
    where: {
      organizationId,
      date: { gte: since },
    },
    distinct: ['userId'],
    select: { userId: true },
  });

  return activeUsers.length;
}

/**
 * Calculer le changement en pourcentage
 */
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
