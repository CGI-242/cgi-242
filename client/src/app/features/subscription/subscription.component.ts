import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceLabel?: string;
  period: string;
  features: string[];
  questionsPerMonth: number;
  questionsPerDay: number;
  users: number;
  usersLabel?: string;
  recommended?: boolean;
  isCustom?: boolean;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="sidebarCollapsed" />

        <main
          class="flex-1 transition-all duration-300 p-4"
          [class.ml-64]="!sidebarCollapsed"
          [class.ml-14]="sidebarCollapsed">

          <div class="max-w-5xl mx-auto">
            <div class="text-center mb-8">
              <h1 class="text-2xl font-bold text-secondary-900">Choisissez votre abonnement</h1>
              <p class="text-secondary-600 mt-2">Selectionnez le plan adapte a vos besoins</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (plan of plans; track plan.id) {
                <div
                  class="card p-6 relative"
                  [class.border-primary-500]="plan.recommended"
                  [class.border-2]="plan.recommended">

                  @if (plan.recommended) {
                    <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span class="bg-primary-600 text-white text-xs px-3 py-1 rounded-full">
                        Recommande
                      </span>
                    </div>
                  }

                  <div class="text-center mb-6">
                    <h3 class="text-lg font-semibold text-secondary-900">{{ plan.name }}</h3>
                    <div class="mt-4">
                      @if (plan.isCustom) {
                        <span class="text-2xl font-bold text-secondary-900">{{ plan.priceLabel }}</span>
                      } @else {
                        <span class="text-3xl font-bold text-secondary-900">{{ plan.price | number }}</span>
                        <span class="text-secondary-500"> FCFA/{{ plan.period }}</span>
                      }
                    </div>
                    <p class="text-sm text-secondary-600 mt-2">
                      {{ plan.questionsPerDay }} questions/jour
                    </p>
                    <p class="text-xs text-secondary-500">
                      {{ plan.usersLabel || (plan.users + ' utilisateur' + (plan.users > 1 ? 's' : '')) }}
                    </p>
                  </div>

                  <ul class="space-y-3 mb-6">
                    @for (feature of plan.features; track feature) {
                      <li class="flex items-start gap-2 text-sm text-secondary-700">
                        <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        {{ feature }}
                      </li>
                    }
                  </ul>

                  @if (plan.isCustom) {
                    <a
                      href="mailto:contact@cgi242.com?subject=Demande%20de%20devis%20CGI%20242"
                      class="block w-full py-2 px-4 rounded-lg font-medium transition-colors text-center bg-secondary-100 text-secondary-700 hover:bg-secondary-200">
                      Nous contacter
                    </a>
                  } @else {
                    <button
                      (click)="selectPlan(plan)"
                      [disabled]="loading() || currentPlan() === plan.id"
                      class="w-full py-2 px-4 rounded-lg font-medium transition-colors"
                      [class.bg-primary-600]="plan.recommended"
                      [class.text-white]="plan.recommended"
                      [class.hover:bg-primary-700]="plan.recommended"
                      [class.bg-secondary-100]="!plan.recommended"
                      [class.text-secondary-700]="!plan.recommended"
                      [class.hover:bg-secondary-200]="!plan.recommended"
                      [class.opacity-50]="currentPlan() === plan.id">
                      @if (currentPlan() === plan.id) {
                        Plan actuel
                      } @else if (loading()) {
                        Chargement...
                      } @else {
                        Choisir ce plan
                      }
                    </button>
                  }
                </div>
              }
            </div>

            @if (message()) {
              <div class="mt-6 p-4 rounded-lg"
                   [class.bg-green-100]="!error()"
                   [class.text-green-700]="!error()"
                   [class.bg-red-100]="error()"
                   [class.text-red-700]="error()">
                {{ message() }}
              </div>
            }
          </div>
        </main>
      </div>
    </div>
  `,
})
export class SubscriptionComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  sidebarCollapsed = false;
  loading = signal(false);
  message = signal('');
  error = signal(false);
  currentPlan = signal('FREE');

  plans: Plan[] = [
    {
      id: 'FREE',
      name: 'Gratuit',
      price: 0,
      period: 'an',
      questionsPerMonth: 60,
      questionsPerDay: 3,
      users: 1,
      features: [
        'FAQ uniquement',
        'Pas de simulateurs',
        'Pas de CGI 2026',
      ],
    },
    {
      id: 'BASIC',
      name: 'Basic',
      price: 50000,
      period: 'an',
      questionsPerMonth: 200,
      questionsPerDay: 10,
      users: 1,
      features: [
        'Recherche vocale',
        '8 simulateurs fiscaux',
        'Acces CGI 2026',
        'Historique 30 jours',
        'Support email',
      ],
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: 225000,
      period: 'an',
      questionsPerMonth: 1000,
      questionsPerDay: 50,
      users: 5,
      recommended: true,
      features: [
        'Recherche vocale',
        '8 simulateurs fiscaux',
        'Acces CGI 2026',
        'Historique 1 an',
        'Support email 48h',
      ],
    },
    {
      id: 'CUSTOM',
      name: 'Sur devis',
      price: 0,
      priceLabel: 'Sur devis',
      period: 'an',
      questionsPerMonth: 2500,
      questionsPerDay: 100,
      users: 10,
      usersLabel: '10+ utilisateurs',
      isCustom: true,
      features: [
        'Recherche vocale',
        '8 simulateurs fiscaux',
        'Acces CGI 2026',
        'Historique 2 ans',
        'Support telephone',
      ],
    },
  ];

  ngOnInit(): void {
    this.loadCurrentPlan();
  }

  private loadCurrentPlan(): void {
    this.api.get<{ plan: string }>('/stats/usage').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.currentPlan.set(res.data.plan || 'FREE');
        }
      },
    });
  }

  selectPlan(plan: Plan): void {
    if (plan.id === this.currentPlan()) return;

    this.loading.set(true);
    this.message.set('');
    this.error.set(false);

    this.api.post<{ success: boolean }>('/subscription/upgrade', { plan: plan.id }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.currentPlan.set(plan.id);
          this.message.set(`Abonnement mis a jour vers ${plan.name}`);
          this.error.set(false);
        } else {
          this.message.set('Erreur lors de la mise a jour');
          this.error.set(true);
        }
      },
      error: () => {
        this.loading.set(false);
        this.message.set('Erreur lors de la mise a jour');
        this.error.set(true);
      },
    });
  }
}
