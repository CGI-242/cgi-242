import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  priceHT: number;
  tva: number;
  period: string;
  questionsPerMonth: number;
  maxMembers: number;
  features: string[];
}

const PLANS: Record<string, PlanDetails> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    price: 9900,
    priceHT: 8390,
    tva: 1510,
    period: 'mois',
    questionsPerMonth: 100,
    maxMembers: 1,
    features: ['100 questions/mois', 'Historique 30 jours', 'Export des réponses', 'Support email'],
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Professionnel',
    price: 29900,
    priceHT: 25339,
    tva: 4561,
    period: 'mois',
    questionsPerMonth: -1,
    maxMembers: 1,
    features: ['Questions illimitées', 'Historique illimité', 'Export PDF/Word', 'Support prioritaire', 'Simulateurs fiscaux'],
  },
  TEAM: {
    id: 'TEAM',
    name: 'Team',
    price: 79900,
    priceHT: 67712,
    tva: 12188,
    period: 'mois',
    questionsPerMonth: 500,
    maxMembers: 5,
    features: ['500 questions partagées', "Jusqu'à 5 membres", 'Dashboard équipe', 'Conversations partagées', 'Support prioritaire'],
  },
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2">
            <span class="text-xl font-bold text-blue-600">CGI 242</span>
          </a>
          <a routerLink="/subscription" class="text-gray-600 hover:text-blue-600 text-sm flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Retour aux offres
          </a>
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-4 py-8">
        @if (!plan()) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p class="text-gray-600">Plan non trouvé.</p>
            <a routerLink="/subscription" class="text-blue-600 hover:underline mt-2 inline-block">
              Voir les offres disponibles
            </a>
          </div>
        } @else {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <!-- Title -->
            <div class="bg-gray-900 text-white px-6 py-4">
              <h1 class="text-xl font-bold">Finaliser votre commande</h1>
            </div>

            <div class="p-6">
              <!-- Order Summary -->
              <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  Récapitulatif de la commande
                </h2>

                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p class="font-semibold text-gray-900">CGI 242 - Formule {{ plan()!.name }}</p>
                      <p class="text-sm text-gray-600">Abonnement mensuel</p>
                    </div>
                    <span class="text-blue-600 font-medium">{{ plan()!.price | number:'1.0-0' }} XAF</span>
                  </div>

                  <!-- Features -->
                  <div class="mb-4 pb-4 border-b border-gray-200">
                    <p class="text-sm font-medium text-gray-700 mb-2">Inclus dans cette offre :</p>
                    <ul class="text-sm text-gray-600 space-y-1">
                      @for (feature of plan()!.features; track feature) {
                        <li class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          {{ feature }}
                        </li>
                      }
                    </ul>
                  </div>

                  <!-- Pricing breakdown -->
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between text-gray-600">
                      <span>Abonnement mensuel HT</span>
                      <span>{{ plan()!.priceHT | number:'1.0-0' }} XAF</span>
                    </div>
                    <div class="flex justify-between text-gray-600">
                      <span>TVA (18%)</span>
                      <span>{{ plan()!.tva | number:'1.0-0' }} XAF</span>
                    </div>
                    <div class="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-300">
                      <span>Total TTC</span>
                      <span class="text-blue-600">{{ plan()!.price | number:'1.0-0' }} XAF</span>
                    </div>
                  </div>
                </div>

                <!-- Engagement info -->
                <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p class="text-sm text-blue-800">
                    <strong>Durée :</strong> Abonnement mensuel sans engagement, renouvelé automatiquement.
                    Résiliable à tout moment depuis votre espace client.
                  </p>
                </div>
              </div>

              <!-- CGV Acceptance -->
              <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Acceptation des conditions</h2>

                <div class="space-y-4">
                  <!-- CGV Checkbox -->
                  <label class="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      [(ngModel)]="acceptCGV"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">
                      J'ai lu et j'accepte les
                      <a routerLink="/cgv" target="_blank" class="text-blue-600 hover:underline font-medium">
                        Conditions Générales de Vente
                      </a>
                      <span class="text-red-500">*</span>
                    </span>
                  </label>

                  <!-- Privacy Checkbox -->
                  <label class="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      [(ngModel)]="acceptPrivacy"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">
                      J'accepte la
                      <a routerLink="/confidentialite" target="_blank" class="text-blue-600 hover:underline font-medium">
                        Politique de confidentialité
                      </a>
                      <span class="text-red-500">*</span>
                    </span>
                  </label>

                  <!-- Retractation notice -->
                  <label class="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      [(ngModel)]="acceptRetractation"
                      class="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">
                      Je reconnais que l'accès immédiat au service entraîne la renonciation à mon droit de rétractation
                      <span class="text-red-500">*</span>
                    </span>
                  </label>
                </div>

                @if (showValidationError()) {
                  <p class="mt-3 text-sm text-red-600 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    Veuillez accepter toutes les conditions pour continuer
                  </p>
                }
              </div>

              <!-- Payment Button -->
              <div class="space-y-4">
                <button
                  (click)="proceedToPayment()"
                  [disabled]="loading()"
                  class="w-full py-4 px-6 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
                  [class.bg-blue-600]="isFormValid()"
                  [class.hover:bg-blue-700]="isFormValid() && !loading()"
                  [class.text-white]="isFormValid()"
                  [class.bg-gray-300]="!isFormValid()"
                  [class.text-gray-500]="!isFormValid()"
                  [class.cursor-not-allowed]="!isFormValid() || loading()">
                  @if (loading()) {
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement en cours...
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    Commander avec obligation de paiement - {{ plan()!.price | number:'1.0-0' }} XAF
                  }
                </button>

                <!-- Security badge -->
                <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  Paiement sécurisé par CinetPay
                </div>

                <!-- Payment methods -->
                <div class="flex items-center justify-center gap-4 pt-2">
                  <span class="text-xs text-gray-400">Moyens de paiement :</span>
                  <div class="flex gap-2">
                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">MTN MoMo</span>
                    <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Airtel Money</span>
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Visa/MC</span>
                  </div>
                </div>
              </div>

              <!-- Error message -->
              @if (errorMessage()) {
                <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-red-700 text-sm">{{ errorMessage() }}</p>
                </div>
              }
            </div>
          </div>
        }
      </main>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private auth = inject(AuthService);

  plan = signal<PlanDetails | null>(null);
  loading = signal(false);
  submitted = signal(false); // Protection double-clic
  errorMessage = signal('');
  showValidationError = signal(false);

  acceptCGV = false;
  acceptPrivacy = false;
  acceptRetractation = false;

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('planId');
    if (planId && PLANS[planId]) {
      this.plan.set(PLANS[planId]);
    }
  }

  isFormValid(): boolean {
    return this.acceptCGV && this.acceptPrivacy && this.acceptRetractation;
  }

  proceedToPayment(): void {
    // Protection double-clic
    if (this.submitted() || this.loading()) {
      return;
    }

    if (!this.isFormValid()) {
      this.showValidationError.set(true);
      return;
    }

    this.showValidationError.set(false);
    this.submitted.set(true); // Marquer comme soumis
    this.loading.set(true);
    this.errorMessage.set('');

    const planData = this.plan();
    if (!planData) return;

    // Appel API pour créer le paiement
    this.api.post<{ paymentUrl: string; transactionId: string }>('/payments/create', {
      planId: planData.id,
      amount: planData.price,
      acceptedCGV: this.acceptCGV,
      acceptedPrivacy: this.acceptPrivacy,
      acceptedRetractation: this.acceptRetractation,
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data?.paymentUrl) {
          // Rediriger vers CinetPay
          window.location.href = res.data.paymentUrl;
        } else {
          // Mode démo: rediriger vers confirmation
          this.router.navigate(['/subscription/confirmation'], {
            queryParams: {
              plan: planData.id,
              amount: planData.price,
              status: 'success',
            },
          });
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Une erreur est survenue. Veuillez réessayer.');
      },
    });
  }
}
