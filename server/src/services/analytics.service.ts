import { prisma } from '../config/database.js';
import { subDays, startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';

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

    // Statistiques actuelles (30 derniers jours)
    const [currentStats, previousStats, subscription, searchHistory, recentActivity] =
      await Promise.all([
        this.getAggregatedStats(userId, undefined, thirtyDaysAgo, now),
        this.getAggregatedStats(userId, undefined, sixtyDaysAgo, thirtyDaysAgo),
        prisma.subscription.findFirst({
          where: { userId, type: 'PERSONAL' },
        }),
        this.getTopSearches(userId, undefined, 10),
        this.getRecentActivity(userId, undefined, 7),
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
        questionsChange: this.calculateChange(
          currentStats.questions,
          previousStats.questions
        ),
        articlesChange: this.calculateChange(
          currentStats.articles,
          previousStats.articles
        ),
        conversationsChange: this.calculateChange(
          currentStats.conversations,
          previousStats.conversations
        ),
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

    const [
      currentStats,
      previousStats,
      subscription,
      memberCount,
      searchHistory,
      recentActivity,
      activeUsersCount,
    ] = await Promise.all([
      this.getAggregatedStats(undefined, organizationId, thirtyDaysAgo, now),
      this.getAggregatedStats(undefined, organizationId, sixtyDaysAgo, thirtyDaysAgo),
      prisma.subscription.findFirst({
        where: { organizationId, type: 'ORGANIZATION' },
      }),
      prisma.organizationMember.count({
        where: { organizationId },
      }),
      this.getTopSearches(undefined, organizationId, 10),
      this.getRecentActivity(undefined, organizationId, 7),
      this.getActiveUsersCount(organizationId, thirtyDaysAgo),
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
        questionsChange: this.calculateChange(
          currentStats.questions,
          previousStats.questions
        ),
        articlesChange: this.calculateChange(
          currentStats.articles,
          previousStats.articles
        ),
        conversationsChange: this.calculateChange(
          currentStats.conversations,
          previousStats.conversations
        ),
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

    // Générer toutes les dates de la période
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    // Récupérer les données agrégées par jour
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

    // Créer un map pour un accès rapide
    const statsMap = new Map(
      stats.map((s) => [format(s.date, 'yyyy-MM-dd'), s._sum])
    );

    // Remplir les données avec les valeurs ou 0
    const data: TimeSeriesPoint[] = dates.map((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayStats = statsMap.get(dateKey);

      let value = 0;
      if (dayStats) {
        switch (metric) {
          case 'questions':
            value = dayStats.questionsAsked || 0;
            break;
          case 'articles':
            value = dayStats.articlesViewed || 0;
            break;
          case 'tokens':
            value = dayStats.tokensUsed || 0;
            break;
        }
      }

      // Pour les conversations, compter différemment
      if (metric === 'conversations') {
        // On le fera via une requête séparée si nécessaire
      }

      return { date: dateKey, value };
    });

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const average = data.length > 0 ? Math.round(total / data.length) : 0;

    return { metric, data, total, average };
  }

  /**
   * Obtenir les statistiques par membre (pour admins d'organisation)
   */
  async getMemberStats(organizationId: string): Promise<
    Array<{
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      questionsAsked: number;
      articlesViewed: number;
      lastActive: Date | null;
    }>
  > {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            lastLoginAt: true,
          },
        },
      },
    });

    const memberStats = await Promise.all(
      members.map(async (member) => {
        const stats = await prisma.usageStats.aggregate({
          where: {
            userId: member.userId,
            organizationId,
            date: { gte: thirtyDaysAgo },
          },
          _sum: {
            questionsAsked: true,
            articlesViewed: true,
          },
        });

        return {
          userId: member.userId,
          email: member.user.email,
          firstName: member.user.firstName || '',
          lastName: member.user.lastName || '',
          role: member.role,
          questionsAsked: stats._sum.questionsAsked || 0,
          articlesViewed: stats._sum.articlesViewed || 0,
          lastActive: member.user.lastLoginAt,
        };
      })
    );

    return memberStats.sort((a, b) => b.questionsAsked - a.questionsAsked);
  }

  /**
   * Exporter les données analytics en format JSON
   */
  async exportAnalytics(
    userId?: string,
    organizationId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<object> {
    const start = startDate || subDays(new Date(), 30);
    const end = endDate || new Date();

    const [usageStats, searchHistory, auditLogs] = await Promise.all([
      prisma.usageStats.findMany({
        where: {
          date: { gte: start, lte: end },
          ...(userId && { userId }),
          ...(organizationId && { organizationId }),
        },
        orderBy: { date: 'asc' },
      }),
      prisma.searchHistory.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          ...(userId && { userId }),
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.auditLog.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          ...(organizationId && { organizationId }),
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    return {
      exportDate: new Date().toISOString(),
      dateRange: { startDate: start, endDate: end },
      usageStats,
      searchHistory,
      auditLogs,
    };
  }

  // =====================================
  // Méthodes privées
  // =====================================

  private async getAggregatedStats(
    userId?: string,
    organizationId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ questions: number; articles: number; conversations: number }> {
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
          ...(userId && { userId }),
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

  private async getTopSearches(
    userId?: string,
    organizationId?: string,
    limit = 10
  ): Promise<Array<{ articleId: string; query: string; count: number }>> {
    const searches = await prisma.searchHistory.groupBy({
      by: ['articleId', 'query'],
      where: {
        ...(userId && { userId }),
        // Note: searchHistory n'a pas de lien direct avec org, mais via user
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

  private async getRecentActivity(
    userId?: string,
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

  private async getActiveUsersCount(
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

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}

export const analyticsService = new AnalyticsService();
export default AnalyticsService;
