import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface PlanInfo {
  id: string;
  name: string;
  price: number; // Prix TTC (offre lancement)
  priceHT: number;
  tva: number;
  period: string;
}

// Grille tarifaire officielle CGI 242 - Janvier 2026 (prix offre lancement TTC)
const PLANS: Record<string, PlanInfo> = {
  FREE: { id: 'FREE', name: 'STANDARD', price: 50000, priceHT: 42373, tva: 7627, period: 'an' },
  STARTER: { id: 'STARTER', name: 'PRO', price: 75000, priceHT: 63559, tva: 11441, period: 'an' },
  PROFESSIONAL: { id: 'PROFESSIONAL', name: 'EXPERT', price: 100000, priceHT: 84746, tva: 15254, period: 'an' },
};

@Component({
  selector: 'app-confirmation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2">
            <span class="text-xl font-bold text-blue-600">CGI 242</span>
          </a>
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-4 py-8">
        @if (status() === 'success') {
          <!-- Success State -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <!-- Success Header -->
            <div class="bg-green-500 text-white px-6 py-8 text-center">
              <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h1 class="text-2xl font-bold">Paiement réussi !</h1>
              <p class="text-green-100 mt-2">Votre abonnement est maintenant actif</p>
            </div>

            <div class="p-6">
              <!-- Order Summary -->
              <div class="mb-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Récapitulatif de votre commande</h2>

                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="flex justify-between mb-2">
                    <span class="text-gray-600">Offre</span>
                    <span class="font-medium text-gray-900">CGI 242 - {{ plan()?.name }}</span>
                  </div>
                  <div class="flex justify-between mb-2">
                    <span class="text-gray-600">Numéro de commande</span>
                    <span class="font-mono text-gray-900">{{ orderNumber() }}</span>
                  </div>
                  <div class="flex justify-between mb-2">
                    <span class="text-gray-600">Date</span>
                    <span class="text-gray-900">{{ today | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <div class="border-t border-gray-200 mt-3 pt-3">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Montant HT</span>
                      <span>{{ plan()?.priceHT | number:'1.0-0' }} XAF</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">TVA (18%)</span>
                      <span>{{ plan()?.tva | number:'1.0-0' }} XAF</span>
                    </div>
                    <div class="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                      <span>Total TTC</span>
                      <span class="text-green-600">{{ plan()?.price | number:'1.0-0' }} XAF</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Invoice Section -->
              <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <div>
                    <p class="font-medium text-blue-900">Facture envoyée par email</p>
                    <p class="text-sm text-blue-700 mt-1">
                      Une facture au format PDF a été envoyée à votre adresse email.
                      Vous pouvez également la télécharger depuis votre espace client.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div class="mb-6">
                <h3 class="font-medium text-gray-900 mb-3">Prochaines étapes :</h3>
                <ul class="space-y-3">
                  <li class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                    <span class="text-gray-700">Accédez à votre tableau de bord pour commencer</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                    <span class="text-gray-700">Posez vos premières questions fiscales à l'assistant IA</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                    <span class="text-gray-700">Explorez les simulateurs fiscaux (IRPP, ITS, IS...)</span>
                  </li>
                </ul>
              </div>

              <!-- CTA Buttons -->
              <div class="flex flex-col sm:flex-row gap-3">
                <a
                  routerLink="/dashboard"
                  class="flex-1 py-3 px-4 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Accéder au tableau de bord
                </a>
                <a
                  routerLink="/chat"
                  class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Poser une question
                </a>
              </div>
            </div>
          </div>
        } @else if (status() === 'failed') {
          <!-- Failed State -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="bg-red-500 text-white px-6 py-8 text-center">
              <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <h1 class="text-2xl font-bold">Paiement échoué</h1>
              <p class="text-red-100 mt-2">Le paiement n'a pas pu être effectué</p>
            </div>

            <div class="p-6 text-center">
              <p class="text-gray-600 mb-6">
                Une erreur est survenue lors du traitement de votre paiement.
                Veuillez réessayer ou utiliser un autre moyen de paiement.
              </p>

              <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  routerLink="/subscription"
                  class="py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Réessayer
                </a>
                <a
                  href="mailto:contact@normx-ai.com"
                  class="py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Contacter le support
                </a>
              </div>
            </div>
          </div>
        } @else {
          <!-- Pending/Unknown State -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 class="text-xl font-bold text-gray-900">Paiement en cours de traitement</h1>
            <p class="text-gray-600 mt-2 mb-6">
              Votre paiement est en cours de vérification. Vous recevrez un email de confirmation.
            </p>
            <a
              routerLink="/dashboard"
              class="inline-block py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Retour au tableau de bord
            </a>
          </div>
        }

        <!-- Help Section -->
        <div class="mt-8 text-center text-sm text-gray-500">
          <p>
            Une question ? Contactez-nous à
            <a href="mailto:contact@normx-ai.com" class="text-blue-600 hover:underline">contact&#64;normx-ai.com</a>
          </p>
        </div>
      </main>
    </div>
  `,
})
export class ConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  status = signal<'success' | 'failed' | 'pending'>('pending');
  plan = signal<PlanInfo | null>(null);
  orderNumber = signal('');
  today = new Date();

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    // Get status
    const statusParam = params['status'];
    if (statusParam === 'success') {
      this.status.set('success');
    } else if (statusParam === 'failed' || statusParam === 'error') {
      this.status.set('failed');
    }

    // Get plan info
    const planId = params['plan'];
    if (planId && PLANS[planId]) {
      this.plan.set(PLANS[planId]);
    }

    // Generate order number
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(6, '0');
    this.orderNumber.set(`FAC-${year}-${random}`);
  }
}
