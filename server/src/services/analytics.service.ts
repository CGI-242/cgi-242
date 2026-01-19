// server/src/services/analytics.service.ts
// Service d'analytics pour les tableaux de bord

import { prisma } from '../config/database.js';
import { subDays, startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';
import {
  getAggregatedStats,
  getTopSearches,
  getRecentActivity,
  getActiveUsersCount,
  calculateChange,
} from './analytics.helpers.js';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DashboardStats {
  overview: {
    totalQuestions: number;
    totalArticlesViewed: number;
    totalConversations: number;
    totalMembers?: number;
    activeUsers: number;
  };
  usage: {
    questionsUsed: number;
    questionsLimit: number;
    percentUsed: number;
  };
  trends: {
    questionsChange: number;
    articlesChange: number;
    conversationsChange: number;
  };
  topArticles: Array<{ articleId: string; query: string; count: number }>;
  recentActivity: Array<{ action: string; date: string; count: number }>;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface MetricData {
  metric: string;
  data: TimeSeriesPoint[];
  total: number;
  average: number;
}

export class AnalyticsService {
  /**
   * Obtenir les statistiques du tableau de bord pour un utilisateur
   */
  async getUserDashboard(userId: string): Promise<DashboardStats> {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    const [currentStats, previousStats, subscription, searchHistory, recentActivity] =
      await Promise.all([
        getAggregatedStats(userId, undefined, thirtyDaysAgo, now),
        getAggregatedStats(userId, undefined, sixtyDaysAgo, thirtyDaysAgo),
        prisma.subscription.findFirst({
          where: { userId, type: 'PERSONAL' },
        }),
        getTopSearches(userId, undefined, 10),
        getRecentActivity(userId, undefined, 7),
      ]);

    const questionsLimit = subscription?.questionsPerMonth || 10;
    const questionsUsed = subscription?.questionsUsed || 0;

    return {
      overview: {
        totalQuestions: currentStats.questions,
        totalArticlesViewed: currentStats.articles,
        totalConversations: currentStats.conversations,
        activeUsers: 1,
      },
      usage: {
        questionsUsed,
        questionsLimit,
        percentUsed: Math.round((questionsUsed / questionsLimit) * 100),
      },
      trends: {
        questionsChange: calculateChange(currentStats.questions, previousStats.questions),
        articlesChange: calculateChange(currentStats.articles, previousStats.articles),
        conversationsChange: calculateChange(currentStats.conversations, previousStats.conversations),
      },
      topArticles: searchHistory,
      recentActivity,
    };
  }

  /**
   * Obtenir les statistiques du tableau de bord pour une organisation
   */
  async getOrganizationDashboard(organizationId: string): Promise<DashboardStats> {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    const [currentStats, previousStats, subscription, memberCount, searchHistory, recentActivity, activeUsersCount] =
      await Promise.all([
        getAggregatedStats(undefined, organizationId, thirtyDaysAgo, now),
        getAggregatedStats(undefined, organizationId, sixtyDaysAgo, thirtyDaysAgo),
        prisma.subscription.findFirst({
          where: { organizationId, type: 'ORGANIZATION' },
        }),
        prisma.organizationMember.count({ where: { organizationId } }),
        getTopSearches(undefined, organizationId, 10),
        getRecentActivity(undefined, organizationId, 7),
        getActiveUsersCount(organizationId, thirtyDaysAgo),
      ]);

    const questionsLimit = subscription?.questionsPerMonth || 10;
    const questionsUsed = subscription?.questionsUsed || 0;

    return {
      overview: {
        totalQuestions: currentStats.questions,
        totalArticlesViewed: currentStats.articles,
        totalConversations: currentStats.conversations,
        totalMembers: memberCount,
        activeUsers: activeUsersCount,
      },
      usage: {
        questionsUsed,
        questionsLimit,
        percentUsed: Math.round((questionsUsed / questionsLimit) * 100),
      },
      trends: {
        questionsChange: calculateChange(currentStats.questions, previousStats.questions),
        articlesChange: calculateChange(currentStats.articles, previousStats.articles),
        conversationsChange: calculateChange(currentStats.conversations, previousStats.conversations),
      },
      topArticles: searchHistory,
      recentActivity,
    };
  }

  /**
   * Obtenir des données temporelles pour un graphique
   */
  async getTimeSeries(
    metric: 'questions' | 'articles' | 'conversations' | 'tokens',
    userId?: string,
    organizationId?: string,
    days = 30
  ): Promise<MetricData> {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    const stats = await prisma.usageStats.groupBy({
      by: ['date'],
      where: {
        date: { gte: startOfDay(startDate), lte: endOfDay(endDate) },
        ...(userId && { userId }),
        ...(organizationId && { organizationId }),
      },
      _sum: {
        questionsAsked: true,
        articlesViewed: true,
        tokensUsed: true,
      },
    });

    const statsMap = new Map(stats.map((s) => [format(s.date, 'yyyy-MM-dd'), s._sum]));

    const data: TimeSeriesPoint[] = dates.map((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayStats = statsMap.get(dateKey);
      let value = 0;

      if (dayStats) {
        switch (metric) {
          case 'questions': value = dayStats.questionsAsked || 0; break;
          case 'articles': value = dayStats.articlesViewed || 0; break;
          case 'tokens': value = dayStats.tokensUsed || 0; break;
        }
      }

      return { date: dateKey, value };
    });

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const average = data.length > 0 ? Math.round(total / data.length) : 0;

    return { metric, data, total, average };
  }

  /**
   * Obtenir les statistiques par membre
   */
  async getMemberStats(organizationId: string): Promise<Array<{
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    questionsAsked: number;
    articlesViewed: number;
    lastActive: Date | null;
  }>> {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, lastLoginAt: true },
        },
      },
    });

    const userIds = members.map((m) => m.userId);

    const statsGrouped = await prisma.usageStats.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, organizationId, date: { gte: thirtyDaysAgo } },
      _sum: { questionsAsked: true, articlesViewed: true },
    });

    const statsMap = new Map(
      statsGrouped.map((s) => [s.userId, { questionsAsked: s._sum.questionsAsked || 0, articlesViewed: s._sum.articlesViewed || 0 }])
    );

    return members
      .map((member) => {
        const stats = statsMap.get(member.userId) || { questionsAsked: 0, articlesViewed: 0 };
        return {
          userId: member.userId,
          email: member.user.email,
          firstName: member.user.firstName || '',
          lastName: member.user.lastName || '',
          role: member.role,
          questionsAsked: stats.questionsAsked,
          articlesViewed: stats.articlesViewed,
          lastActive: member.user.lastLoginAt,
        };
      })
      .sort((a, b) => b.questionsAsked - a.questionsAsked);
  }

  /**
   * Exporter les données analytics
   */
  async exportAnalytics(userId?: string, organizationId?: string, startDate?: Date, endDate?: Date): Promise<object> {
    const start = startDate || subDays(new Date(), 30);
    const end = endDate || new Date();

    const [usageStats, searchHistory, auditLogs] = await Promise.all([
      prisma.usageStats.findMany({
        where: { date: { gte: start, lte: end }, ...(userId && { userId }), ...(organizationId && { organizationId }) },
        orderBy: { date: 'asc' },
      }),
      prisma.searchHistory.findMany({
        where: { createdAt: { gte: start, lte: end }, ...(userId && { userId }) },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.auditLog.findMany({
        where: { createdAt: { gte: start, lte: end }, ...(organizationId && { organizationId }) },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    return { exportDate: new Date().toISOString(), dateRange: { startDate: start, endDate: end }, usageStats, searchHistory, auditLogs };
  }
}

export const analyticsService = new AnalyticsService();
export default AnalyticsService;
