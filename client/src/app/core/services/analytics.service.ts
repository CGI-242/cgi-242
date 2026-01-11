import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

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
  topArticles: { articleId: string; query: string; count: number }[];
  recentActivity: { action: string; date: string; count: number }[];
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

export interface MemberStat {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  questionsAsked: number;
  articlesViewed: number;
  lastActive: string | null;
}

interface AnalyticsState {
  dashboard: DashboardStats | null;
  timeSeries: Record<string, MetricData>;
  memberStats: MemberStat[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  private stateSignal = signal<AnalyticsState>({
    dashboard: null,
    timeSeries: {},
    memberStats: [],
    loading: false,
    error: null,
  });

  // Computed signals pour accès facile
  dashboard = computed(() => this.stateSignal().dashboard);
  memberStats = computed(() => this.stateSignal().memberStats);
  isLoading = computed(() => this.stateSignal().loading);
  error = computed(() => this.stateSignal().error);

  /**
   * Charge les données du tableau de bord
   */
  async loadDashboard(): Promise<DashboardStats | null> {
    this.stateSignal.update((s) => ({ ...s, loading: true, error: null }));

    try {
      const response = await firstValueFrom(
        this.http.get<{ data: DashboardStats }>(
          `${environment.apiUrl}/analytics/dashboard`,
          { withCredentials: true }
        )
      );

      this.stateSignal.update((s) => ({
        ...s,
        dashboard: response.data,
        loading: false,
      }));

      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de chargement';
      this.stateSignal.update((s) => ({
        ...s,
        loading: false,
        error: message,
      }));
      return null;
    }
  }

  /**
   * Charge les données temporelles pour un métrique
   */
  async loadTimeSeries(
    metric: 'questions' | 'articles' | 'conversations' | 'tokens',
    days = 30
  ): Promise<MetricData | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: MetricData }>(
          `${environment.apiUrl}/analytics/timeseries/${metric}?days=${days}`,
          { withCredentials: true }
        )
      );

      this.stateSignal.update((s) => ({
        ...s,
        timeSeries: { ...s.timeSeries, [metric]: response.data },
      }));

      return response.data;
    } catch (err) {
      console.error(`Erreur chargement time series ${metric}:`, err);
      return null;
    }
  }

  /**
   * Récupère les données time series d'un métrique depuis le cache
   */
  getTimeSeries(metric: string): MetricData | undefined {
    return this.stateSignal().timeSeries[metric];
  }

  /**
   * Charge les statistiques par membre (admin org)
   */
  async loadMemberStats(): Promise<MemberStat[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: MemberStat[] }>(
          `${environment.apiUrl}/analytics/members`,
          { withCredentials: true }
        )
      );

      this.stateSignal.update((s) => ({
        ...s,
        memberStats: response.data,
      }));

      return response.data;
    } catch (err) {
      console.error('Erreur chargement member stats:', err);
      return [];
    }
  }

  /**
   * Exporte les données analytics
   */
  async exportData(startDate?: Date, endDate?: Date): Promise<object | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await firstValueFrom(
        this.http.get<{ data: object }>(
          `${environment.apiUrl}/analytics/export?${params}`,
          { withCredentials: true }
        )
      );

      return response.data;
    } catch (err) {
      console.error('Erreur export analytics:', err);
      return null;
    }
  }

  /**
   * Formate un nombre pour affichage
   */
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  /**
   * Obtient une classe CSS pour le trend (positif/négatif)
   */
  getTrendClass(change: number): string {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  }

  /**
   * Formate le trend pour affichage
   */
  formatTrend(change: number): string {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  }
}
