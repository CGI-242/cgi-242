import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

interface Plan {
  id: string;
  name: string;
  price: number;
  launchPrice: number;
  period: 'an';
  features: string[];
  questionsPerMonth: number;
  exportsPerMonth: number; // -1 = illimité
  maxMembers: number;
  recommended?: boolean;
  isEnterprise?: boolean;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeaderComponent, SidebarComponent, BreadcrumbComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-secondary-900 transition-colors duration-300">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="sidebarCollapsed" />

        <main
          class="flex-1 transition-all duration-300 p-6"
          [class.ml-52]="!sidebarCollapsed"
          [class.ml-14]="sidebarCollapsed">

          <div class="max-w-6xl mx-auto">
            <!-- Breadcrumb -->
            <div class="mb-4">
              <app-breadcrumb />
            </div>

            <!-- Header -->
            <div class="text-center mb-6">
              <h1 class="text-3xl font-bold text-gray-900">Choisissez votre abonnement</h1>
              <p class="text-gray-600 mt-2">Abonnement annuel - TVA 18% incluse</p>
            </div>

            <!-- Offre de lancement -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 mb-8 max-w-xl mx-auto text-center">
              <p class="font-semibold">Offre de lancement - Jusqu'au 31 mars 2026</p>
              <p class="text-sm opacity-90">Jusqu'a -20% sur tous les abonnements !</p>
            </div>

            <!-- Plans Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              @for (plan of plans; track plan.id) {
                <div
                  class="bg-white rounded-xl shadow-sm border-2 p-6 relative flex flex-col"
                  [class.border-blue-500]="plan.recommended"
                  [class.scale-105]="plan.recommended"
                  [class.shadow-xl]="plan.recommended"
                  [class.border-gray-100]="!plan.recommended">

                  <!-- Badge Recommandé -->
                  @if (plan.recommended) {
                    <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span class="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Populaire
                      </span>
                    </div>
                  }

                  <!-- Plan Header -->
                  <div class="text-center mb-6">
                    <h3 class="text-lg font-semibold text-gray-900">{{ plan.name }}</h3>

                    <div class="mt-4">
                      @if (plan.isEnterprise) {
                        <span class="text-2xl font-bold text-gray-900">Sur devis</span>
                      } @else {
                        <div>
                          <span class="text-sm text-gray-400 line-through">{{ plan.price | number:'1.0-0' }} XAF</span>
                          <div>
                            <span class="text-3xl font-bold text-gray-900">{{ plan.launchPrice | number:'1.0-0' }}</span>
                            <span class="text-gray-500 text-sm"> XAF/{{ plan.period }}</span>
                          </div>
                          <p class="text-xs text-green-600 font-medium mt-1">
                            Offre lancement -{{ plan.price - plan.launchPrice | number:'1.0-0' }} XAF
                          </p>
                        </div>
                      }
                    </div>

                    <!-- Quota -->
                    <div class="mt-3 py-2 px-3 bg-gray-50 rounded-lg space-y-1">
                      <p class="text-sm text-gray-700">
                        @if (plan.questionsPerMonth === -1) {
                          <span class="font-medium">Questions IA illimitees</span>
                        } @else if (plan.questionsPerMonth === 0) {
                          <span class="font-medium text-gray-400">Pas d'assistant IA</span>
                        } @else {
                          <span class="font-medium">{{ plan.questionsPerMonth }}</span> questions IA/mois
                        }
                      </p>
                      <p class="text-sm text-gray-700">
                        @if (plan.exportsPerMonth === -1) {
                          <span class="font-medium">Exports PDF illimites</span>
                        } @else {
                          <span class="font-medium">{{ plan.exportsPerMonth }}</span> exports PDF/mois
                        }
                      </p>
                      <p class="text-xs text-gray-500">
                        @if (plan.maxMembers === -1) {
                          Utilisateurs illimites
                        } @else {
                          {{ plan.maxMembers }} utilisateur{{ plan.maxMembers > 1 ? 's' : '' }}
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
                        Souscrire a {{ plan.launchPrice | number:'1.0-0' }} XAF
                      }
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Packs IA -->
            <div class="mt-12 bg-white rounded-xl p-6 border border-gray-200">
              <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">Packs Questions IA (Recharges)</h2>
              <p class="text-gray-600 text-center mb-6">Pour les utilisateurs qui ont epuise leur quota mensuel</p>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                @for (pack of aiPacks; track pack.id) {
                  <div class="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                    <p class="font-semibold text-gray-900">{{ pack.name }}</p>
                    <p class="text-2xl font-bold text-blue-600 my-2">{{ pack.questions }}</p>
                    <p class="text-sm text-gray-500">questions</p>
                    <p class="text-lg font-semibold text-gray-900 mt-2">{{ pack.price | number:'1.0-0' }} XAF</p>
                    <p class="text-xs text-gray-400">{{ pack.pricePerQuestion }} XAF/question</p>
                  </div>
                }
              </div>
            </div>

            <!-- Info légale -->
            <div class="mt-10 text-center text-sm text-gray-500">
              <p>Abonnement annuel sans engagement. Resiliable a tout moment.</p>
              <p class="mt-1">Remboursement sous 7 jours si non satisfait.</p>
              <p class="mt-1">
                En souscrivant, vous acceptez nos
                <a routerLink="/cgv" class="text-blue-600 hover:underline">CGV</a> et notre
                <a routerLink="/confidentialite" class="text-blue-600 hover:underline">Politique de confidentialite</a>.
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

  // Grille tarifaire officielle CGI 242 - Janvier 2026
  plans: Plan[] = [
    {
      id: 'FREE',
      name: 'STANDARD',
      price: 60000,
      launchPrice: 50000,
      period: 'an',
      questionsPerMonth: 0,
      exportsPerMonth: 5,
      maxMembers: 1,
      features: [
        'Recherche CGI illimitee',
        'Tous les simulateurs fiscaux',
        'Calendrier fiscal + alertes',
        'Support email (72h)',
      ],
    },
    {
      id: 'STARTER',
      name: 'PRO',
      price: 90000,
      launchPrice: 75000,
      period: 'an',
      questionsPerMonth: 50,
      exportsPerMonth: 20,
      maxMembers: 1,
      recommended: true,
      features: [
        'Tout STANDARD inclus',
        'Veille fiscale',
        'Support email (48h)',
      ],
    },
    {
      id: 'PROFESSIONAL',
      name: 'EXPERT',
      price: 120000,
      launchPrice: 100000,
      period: 'an',
      questionsPerMonth: 100,
      exportsPerMonth: -1,
      maxMembers: 1,
      features: [
        'Tout PRO inclus',
        'Support prioritaire (24h)',
      ],
    },
  ];

  // Packs de recharges IA
  aiPacks = [
    { id: 'PACK_20', name: 'STARTER', questions: 20, price: 5000, pricePerQuestion: 250 },
    { id: 'PACK_50', name: 'STANDARD', questions: 50, price: 10000, pricePerQuestion: 200 },
    { id: 'PACK_100', name: 'PRO', questions: 100, price: 18000, pricePerQuestion: 180 },
    { id: 'PACK_200', name: 'MEGA', questions: 200, price: 30000, pricePerQuestion: 150 },
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
