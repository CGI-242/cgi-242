import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';
import {
  AnalyticsService,
  DashboardStats,
  MetricData,
} from '../../core/services/analytics.service';
import { TenantService } from '../../core/services/tenant.service';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Tableau de bord Analytics</h1>
        <p class="text-gray-500">
          {{ isOrganization() ? 'Statistiques de votre organisation' : 'Vos statistiques personnelles' }}
        </p>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Error state -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-700">{{ error() }}</p>
          <button
            (click)="loadData()"
            class="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      }

      <!-- Stats Cards -->
      @if (dashboard()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          @for (card of statCards(); track card.title) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-4">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center"
                  [class]="card.color"
                >
                  <span class="text-2xl">{{ card.icon }}</span>
                </div>
                <span
                  class="text-sm font-medium px-2 py-1 rounded-full"
                  [class]="getTrendClass(card.change)"
                >
                  {{ formatTrend(card.change) }}
                </span>
              </div>
              <h3 class="text-gray-500 text-sm font-medium">{{ card.title }}</h3>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ card.value }}</p>
            </div>
          }
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Questions Chart -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Questions posées
            </h3>
            @if (questionsChartData()) {
              <canvas
                baseChart
                [data]="questionsChartData()!"
                [type]="lineChartType"
                [options]="lineChartOptions"
              ></canvas>
            }
          </div>

          <!-- Articles Chart -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Articles consultés
            </h3>
            @if (articlesChartData()) {
              <canvas
                baseChart
                [data]="articlesChartData()!"
                [type]="lineChartType"
                [options]="lineChartOptions"
              ></canvas>
            }
          </div>
        </div>

        <!-- Usage Progress -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              Utilisation du quota
            </h3>
            <span class="text-sm text-gray-500">
              {{ dashboard()!.usage.questionsUsed }} / {{ dashboard()!.usage.questionsLimit }} questions
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-4">
            <div
              class="h-4 rounded-full transition-all duration-500"
              [class]="getUsageBarClass(dashboard()!.usage.percentUsed)"
              [style.width.%]="dashboard()!.usage.percentUsed"
            ></div>
          </div>
          <p class="text-sm text-gray-500 mt-2">
            {{ dashboard()!.usage.percentUsed }}% utilisé ce mois
          </p>
        </div>

        <!-- Top Articles & Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Top Articles -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Articles les plus recherchés
            </h3>
            @if (dashboard()!.topArticles.length > 0) {
              <div class="space-y-3">
                @for (article of dashboard()!.topArticles.slice(0, 5); track article.articleId) {
                  <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span class="text-gray-700 truncate flex-1 mr-4">
                      {{ article.query }}
                    </span>
                    <span class="text-gray-500 text-sm">
                      {{ article.count }} recherches
                    </span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-500 text-center py-4">
                Aucune recherche récente
              </p>
            }
          </div>

          <!-- Recent Activity -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Activité récente
            </h3>
            @if (dashboard()!.recentActivity.length > 0) {
              <div class="space-y-3">
                @for (activity of dashboard()!.recentActivity.slice(0, 5); track activity.action) {
                  <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span class="text-gray-700">
                      {{ formatActivityAction(activity.action) }}
                    </span>
                    <span class="text-gray-500 text-sm">
                      {{ activity.count }}x
                    </span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-500 text-center py-4">
                Aucune activité récente
              </p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AnalyticsDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private tenantService = inject(TenantService);

  loading = this.analyticsService.isLoading;
  error = this.analyticsService.error;
  dashboard = this.analyticsService.dashboard;
  isOrganization = this.tenantService.isOrganization;

  // Chart configuration
  lineChartType: ChartType = 'line';
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 7 },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
      },
    },
  };

  questionsChartData = signal<ChartData<'line'> | null>(null);
  articlesChartData = signal<ChartData<'line'> | null>(null);

  statCards = computed<StatCard[]>(() => {
    const d = this.dashboard();
    if (!d) return [];

    return [
      {
        title: 'Questions posées',
        value: d.overview.totalQuestions,
        change: d.trends.questionsChange,
        icon: '💬',
        color: 'bg-blue-100',
      },
      {
        title: 'Articles consultés',
        value: d.overview.totalArticlesViewed,
        change: d.trends.articlesChange,
        icon: '📄',
        color: 'bg-green-100',
      },
      {
        title: 'Conversations',
        value: d.overview.totalConversations,
        change: d.trends.conversationsChange,
        icon: '🗣️',
        color: 'bg-purple-100',
      },
      {
        title: d.overview.totalMembers !== undefined ? 'Membres actifs' : 'Temps économisé',
        value:
          d.overview.totalMembers !== undefined
            ? `${d.overview.activeUsers}/${d.overview.totalMembers}`
            : `${Math.round(d.overview.totalQuestions * 5)}min`,
        change: 0,
        icon: d.overview.totalMembers !== undefined ? '👥' : '⏱️',
        color: 'bg-orange-100',
      },
    ];
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    await this.analyticsService.loadDashboard();
    await Promise.all([
      this.loadQuestionsChart(),
      this.loadArticlesChart(),
    ]);
  }

  private async loadQuestionsChart(): Promise<void> {
    const data = await this.analyticsService.loadTimeSeries('questions', 30);
    if (data) {
      this.questionsChartData.set({
        labels: data.data.map((d) => this.formatDate(d.date)),
        datasets: [
          {
            data: data.data.map((d) => d.value),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    }
  }

  private async loadArticlesChart(): Promise<void> {
    const data = await this.analyticsService.loadTimeSeries('articles', 30);
    if (data) {
      this.articlesChartData.set({
        labels: data.data.map((d) => this.formatDate(d.date)),
        datasets: [
          {
            data: data.data.map((d) => d.value),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    }
  }

  getTrendClass(change: number): string {
    if (change > 0) return 'bg-green-100 text-green-700';
    if (change < 0) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  }

  formatTrend(change: number): string {
    if (change === 0) return '—';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  }

  getUsageBarClass(percent: number): string {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  formatActivityAction(action: string): string {
    const labels: Record<string, string> = {
      CONVERSATION_CREATED: 'Nouvelle conversation',
      ORG_UPDATED: 'Organisation mise à jour',
      MEMBER_INVITED: 'Membre invité',
      MEMBER_JOINED: 'Membre rejoint',
      LOGIN_SUCCESS: 'Connexion',
      DATA_EXPORTED: 'Export de données',
    };
    return labels[action] || action.replace(/_/g, ' ').toLowerCase();
  }
}
