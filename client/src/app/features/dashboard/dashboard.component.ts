import { Component, inject, signal, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TenantService } from '@core/services/tenant.service';
import { ApiService } from '@core/services/api.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';

interface UsageStats {
  questionsUsed: number;
  questionsLimit: number;
  articlesViewed: number;
  conversationsCount: number;
  plan: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="sidebarCollapsed" />

        <main
          class="flex-1 transition-all duration-300 p-4"
          [class.ml-64]="!sidebarCollapsed"
          [class.ml-14]="sidebarCollapsed">
          <div class="px-2">
            <!-- Header -->
            <div class="mb-8">
              <h1 class="text-2xl font-bold text-secondary-900">
                Bonjour, {{ authService.userFullName() }} !
              </h1>
              <p class="text-secondary-600 mt-1">
                Voici un aperçu de votre utilisation de CGI 242
              </p>
            </div>

            <!-- Stats cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div class="card p-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-secondary-600">Questions posées</p>
                    <p class="text-2xl font-bold text-secondary-900">
                      {{ stats().questionsUsed }}
                      <span class="text-sm font-normal text-secondary-500">/ {{ stats().questionsLimit }}</span>
                    </p>
                  </div>
                </div>
                <div class="mt-4">
                  <div class="h-2 bg-secondary-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary-600 rounded-full transition-all"
                      [style.width.%]="getUsagePercentage()">
                    </div>
                  </div>
                </div>
              </div>

              <div class="card p-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-secondary-600">Articles consultés</p>
                    <p class="text-2xl font-bold text-secondary-900">{{ stats().articlesViewed }}</p>
                  </div>
                </div>
              </div>

              <div class="card p-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-secondary-600">Conversations</p>
                    <p class="text-2xl font-bold text-secondary-900">{{ stats().conversationsCount }}</p>
                  </div>
                </div>
              </div>

              <div class="card p-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-secondary-600">Temps économisé</p>
                    <p class="text-2xl font-bold text-secondary-900">~{{ getTimeSaved() }}h</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="card p-6">
                <h3 class="font-semibold text-secondary-900 mb-4">Actions rapides</h3>
                <div class="space-y-3">
                  <a routerLink="/code/2025" class="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition">
                    <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-secondary-900">Consulter le CGI 2025</p>
                      <p class="text-sm text-secondary-500">Code Général des Impôts en vigueur</p>
                    </div>
                  </a>
                  <a routerLink="/chat" class="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-secondary-900">Poser une question IA</p>
                      <p class="text-sm text-secondary-500">Assistant fiscal intelligent</p>
                    </div>
                  </a>
                  @if (tenantService.isOrganization()) {
                    <a routerLink="/organization/members" class="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition">
                      <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium text-secondary-900">Gérer l'équipe</p>
                        <p class="text-sm text-secondary-500">Inviter ou gérer les membres</p>
                      </div>
                    </a>
                  }
                </div>
              </div>

              <div class="card p-6">
                <h3 class="font-semibold text-secondary-900 mb-4">Votre abonnement</h3>
                <div class="p-4 bg-primary-50 rounded-lg">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-primary-900">{{ getPlanLabel() }}</span>
                    <span class="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">{{ getStatusLabel() }}</span>
                  </div>
                  <p class="text-sm text-primary-700 mb-4">
                    {{ stats().questionsLimit - stats().questionsUsed }} questions restantes ce mois
                  </p>
                  @if (stats().plan === 'FREE') {
                    <a routerLink="/subscription" class="btn-primary w-full text-center">
                      Passer au Premium
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  authService = inject(AuthService);
  tenantService = inject(TenantService);

  sidebarCollapsed = false;
  loading = signal(true);

  stats = signal<UsageStats>({
    questionsUsed: 0,
    questionsLimit: 10,
    articlesViewed: 0,
    conversationsCount: 0,
    plan: 'FREE',
    status: 'ACTIVE',
  });

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.apiService.get<UsageStats>('/stats/usage')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.stats.set(response.data);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  getUsagePercentage(): number {
    const s = this.stats();
    if (s.questionsLimit <= 0) return 0;
    return Math.min(100, (s.questionsUsed / s.questionsLimit) * 100);
  }

  getTimeSaved(): number {
    return Math.round(this.stats().questionsUsed * 0.5);
  }

  getPlanLabel(): string {
    const planLabels: Record<string, string> = {
      FREE: 'Plan Gratuit',
      BASIC: 'Plan Basic',
      PRO: 'Plan Pro',
      ENTERPRISE: 'Plan Entreprise',
    };
    return planLabels[this.stats().plan] || 'Plan Gratuit';
  }

  getStatusLabel(): string {
    const statusLabels: Record<string, string> = {
      ACTIVE: 'Actif',
      TRIAL: 'Essai',
      CANCELLED: 'Annulé',
      EXPIRED: 'Expiré',
    };
    return statusLabels[this.stats().status] || 'Actif';
  }
}
