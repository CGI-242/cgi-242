import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceHT: number;
  tva: number;
  period: 'mois' | 'an';
  features: string[];
  questionsPerMonth: number;
  maxMembers: number;
  recommended?: boolean;
  isEnterprise?: boolean;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="sidebarCollapsed" />

        <main
          class="flex-1 transition-all duration-300 p-6"
          [class.ml-64]="!sidebarCollapsed"
          [class.ml-14]="sidebarCollapsed">

          <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-10">
              <h1 class="text-3xl font-bold text-gray-900">Choisissez votre abonnement</h1>
              <p class="text-gray-600 mt-2">Tous les prix sont affichés TTC (TVA 18% incluse)</p>
            </div>

            <!-- Plans Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              @for (plan of plans; track plan.id) {
                <div
                  class="bg-white rounded-xl shadow-sm border-2 p-6 relative flex flex-col"
                  [class.border-blue-500]="plan.recommended"
                  [class.border-gray-100]="!plan.recommended">

                  <!-- Badge Recommandé -->
                  @if (plan.recommended) {
                    <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span class="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Recommandé
                      </span>
                    </div>
                  }

                  <!-- Plan Header -->
                  <div class="text-center mb-6">
                    <h3 class="text-lg font-semibold text-gray-900">{{ plan.name }}</h3>

                    <div class="mt-4">
                      @if (plan.isEnterprise) {
                        <span class="text-2xl font-bold text-gray-900">Sur devis</span>
                      } @else if (plan.price === 0) {
                        <span class="text-3xl font-bold text-gray-900">Gratuit</span>
                      } @else {
                        <div>
                          <span class="text-3xl font-bold text-gray-900">{{ plan.price | number:'1.0-0' }}</span>
                          <span class="text-gray-500 text-sm"> XAF/{{ plan.period }}</span>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">
                          {{ plan.priceHT | number:'1.0-0' }} XAF HT + {{ plan.tva | number:'1.0-0' }} XAF TVA
                        </p>
                      }
                    </div>

                    <!-- Quota -->
                    <div class="mt-3 py-2 px-3 bg-gray-50 rounded-lg">
                      <p class="text-sm text-gray-700">
                        @if (plan.questionsPerMonth === -1) {
                          <span class="font-medium">Questions illimitées</span>
                        } @else {
                          <span class="font-medium">{{ plan.questionsPerMonth }}</span> questions/mois
                        }
                      </p>
                      <p class="text-xs text-gray-500">
                        @if (plan.maxMembers === -1) {
                          Membres illimités
                        } @else {
                          {{ plan.maxMembers }} membre{{ plan.maxMembers > 1 ? 's' : '' }}
                        }
                      </p>
                    </div>
                  </div>

                  <!-- Features -->
                  <ul class="space-y-3 mb-6 flex-1">
                    @for (feature of plan.features; track feature) {
                      <li class="flex items-start gap-2 text-sm text-gray-700">
                        <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        {{ feature }}
                      </li>
                    }
                  </ul>

                  <!-- CTA Button -->
                  @if (plan.isEnterprise) {
                    <a
                      href="mailto:contact@normx-ai.com?subject=Demande%20de%20devis%20Enterprise%20CGI%20242"
                      class="block w-full py-3 px-4 rounded-lg font-medium text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                      Nous contacter
                    </a>
                  } @else if (plan.price === 0) {
                    <button
                      [disabled]="currentPlan() === plan.id"
                      class="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700"
                      [class.opacity-50]="currentPlan() === plan.id"
                      [class.cursor-not-allowed]="currentPlan() === plan.id">
                      @if (currentPlan() === plan.id) {
                        Plan actuel
                      } @else {
                        Commencer gratuitement
                      }
                    </button>
                  } @else {
                    <button
                      (click)="goToCheckout(plan)"
                      [disabled]="currentPlan() === plan.id"
                      class="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                      [class.bg-blue-600]="plan.recommended"
                      [class.text-white]="plan.recommended"
                      [class.hover:bg-blue-700]="plan.recommended && currentPlan() !== plan.id"
                      [class.bg-gray-900]="!plan.recommended"
                      [class.text-white]="!plan.recommended"
                      [class.hover:bg-gray-800]="!plan.recommended && currentPlan() !== plan.id"
                      [class.opacity-50]="currentPlan() === plan.id"
                      [class.cursor-not-allowed]="currentPlan() === plan.id">
                      @if (currentPlan() === plan.id) {
                        Plan actuel
                      } @else {
                        Souscrire à {{ plan.price | number:'1.0-0' }} XAF
                      }
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Info légale -->
            <div class="mt-10 text-center text-sm text-gray-500">
              <p>Abonnement mensuel sans engagement. Résiliable à tout moment.</p>
              <p class="mt-1">
                En souscrivant, vous acceptez nos
                <a routerLink="/cgv" class="text-blue-600 hover:underline">CGV</a> et notre
                <a routerLink="/confidentialite" class="text-blue-600 hover:underline">Politique de confidentialité</a>.
              </p>
            </div>
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
  currentPlan = signal('FREE');

  // Prix TTC avec TVA 18%
  plans: Plan[] = [
    {
      id: 'FREE',
      name: 'Gratuit',
      price: 0,
      priceHT: 0,
      tva: 0,
      period: 'mois',
      questionsPerMonth: 10,
      maxMembers: 1,
      features: [
        'Accès aux articles du CGI',
        'Citations des sources',
        '10 questions/mois',
      ],
    },
    {
      id: 'STARTER',
      name: 'Starter',
      price: 9900,
      priceHT: 8390,
      tva: 1510,
      period: 'mois',
      questionsPerMonth: 100,
      maxMembers: 1,
      features: [
        '100 questions/mois',
        'Historique 30 jours',
        'Export des réponses',
        'Support email',
      ],
    },
    {
      id: 'PROFESSIONAL',
      name: 'Professionnel',
      price: 29900,
      priceHT: 25339,
      tva: 4561,
      period: 'mois',
      questionsPerMonth: -1,
      maxMembers: 1,
      recommended: true,
      features: [
        'Questions illimitées',
        'Historique illimité',
        'Export PDF/Word',
        'Support prioritaire',
        'Simulateurs fiscaux',
      ],
    },
    {
      id: 'TEAM',
      name: 'Team',
      price: 79900,
      priceHT: 67712,
      tva: 12188,
      period: 'mois',
      questionsPerMonth: 500,
      maxMembers: 5,
      features: [
        '500 questions partagées',
        "Jusqu'à 5 membres",
        'Dashboard équipe',
        'Conversations partagées',
        'Support prioritaire',
      ],
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: 0,
      priceHT: 0,
      tva: 0,
      period: 'mois',
      questionsPerMonth: -1,
      maxMembers: -1,
      isEnterprise: true,
      features: [
        'Questions illimitées',
        'Membres illimités',
        'SSO / SAML',
        'API dédiée',
        'SLA garanti',
        'Account manager',
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

  goToCheckout(plan: Plan): void {
    this.router.navigate(['/subscription/checkout', plan.id]);
  }
}
