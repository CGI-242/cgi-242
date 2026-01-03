import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IsService, IsInput, IsResult } from '../services/is.service';

@Component({
  selector: 'app-is-calculator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DecimalPipe],
  styles: [`
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `],
  template: `
    <div class="max-w-5xl mx-auto">
      <!-- Info CGI 2026 -->
      <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-sm font-semibold text-blue-800">CGI 2026 - IS (Art. 86A) et Minimum de perception (Art. 86B)</h3>
            <p class="text-xs text-blue-700 mt-1">
              <strong>Taux IS :</strong> 25% (général) ou 33% (personnes morales étrangères).<br>
              <strong>Minimum de perception :</strong> 1% (normal) ou 2% (si déficit 2 exercices consécutifs).
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-6">
        <!-- Formulaire -->
        <div class="w-1/2">
          <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 class="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              Simulateur IS
            </h2>

            <!-- Base minimum de perception -->
            <div class="mb-6 p-4 bg-secondary-50 rounded-lg">
              <h3 class="text-sm font-medium text-secondary-700 mb-3">Base du minimum de perception (Art. 86B al. 2)</h3>
              <div class="space-y-3">
                <div>
                  <label for="produitsExploitation" class="block text-xs text-secondary-500 mb-1">Produits d'exploitation</label>
                  <input
                    id="produitsExploitation"
                    type="number"
                    [(ngModel)]="input.produitsExploitation"
                    (ngModelChange)="calculer()"
                    placeholder="0"
                    class="w-full px-3 py-2 text-right text-sm border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>
                <div>
                  <label for="produitsFinanciers" class="block text-xs text-secondary-500 mb-1">Produits financiers</label>
                  <input
                    id="produitsFinanciers"
                    type="number"
                    [(ngModel)]="input.produitsFinanciers"
                    (ngModelChange)="calculer()"
                    placeholder="0"
                    class="w-full px-3 py-2 text-right text-sm border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>
                <div>
                  <label for="produitsHAO" class="block text-xs text-secondary-500 mb-1">Produits HAO (Hors Activité Ordinaire)</label>
                  <input
                    id="produitsHAO"
                    type="number"
                    [(ngModel)]="input.produitsHAO"
                    (ngModelChange)="calculer()"
                    placeholder="0"
                    class="w-full px-3 py-2 text-right text-sm border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>
                <div>
                  <label for="retenuesLiberatoires" class="block text-xs text-secondary-500 mb-1">Retenues à la source libératoires (à déduire)</label>
                  <input
                    id="retenuesLiberatoires"
                    type="number"
                    [(ngModel)]="input.retenuesLiberatoires"
                    (ngModelChange)="calculer()"
                    placeholder="0"
                    class="w-full px-3 py-2 text-right text-sm border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>
              </div>
            </div>

            <!-- Situation déficitaire -->
            <div class="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="input.deficitConsecutif"
                  (ngModelChange)="calculer()"
                  class="w-4 h-4 text-orange-600 rounded focus:ring-orange-500">
                <div>
                  <span class="text-sm font-medium text-orange-800">Déficit fiscal 2 exercices consécutifs</span>
                  <p class="text-xs text-orange-600">Taux majoré à 2% (Art. 86B al. 3)</p>
                </div>
              </label>
            </div>

            <!-- Type de contribuable (Art. 86A) -->
            <div class="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 class="text-sm font-medium text-purple-700 mb-3">Type de contribuable (Art. 86A)</h3>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="typeContribuable"
                    value="general"
                    [(ngModel)]="input.typeContribuable"
                    (ngModelChange)="calculer()"
                    class="w-4 h-4 text-purple-600 focus:ring-purple-500">
                  <div>
                    <span class="text-sm font-medium text-purple-800">Société résidente</span>
                    <p class="text-xs text-purple-600">Taux IS : 25%</p>
                  </div>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="typeContribuable"
                    value="etranger"
                    [(ngModel)]="input.typeContribuable"
                    (ngModelChange)="calculer()"
                    class="w-4 h-4 text-purple-600 focus:ring-purple-500">
                  <div>
                    <span class="text-sm font-medium text-purple-800">Personne morale étrangère</span>
                    <p class="text-xs text-purple-600">Taux IS : 33%</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Bénéfice imposable -->
            <div class="mb-6">
              <label for="beneficeImposable" class="block text-sm font-medium text-secondary-700 mb-2">
                Bénéfice imposable (pour calcul IS {{ input.typeContribuable === 'etranger' ? '33%' : '25%' }})
              </label>
              <input
                id="beneficeImposable"
                type="number"
                [(ngModel)]="input.beneficeImposable"
                (ngModelChange)="calculer()"
                placeholder="0"
                class="w-full px-4 py-3 text-right font-medium border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            </div>

            <!-- Références -->
            <div class="text-xs text-secondary-400">
              Art. 86A (Taux IS : 25% ou 33%), Art. 86B (Minimum de perception : 1% ou 2%)
            </div>
          </div>
        </div>

        <!-- Résultats -->
        <div class="w-1/2">
          <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Résultat
            </h3>

            @if (result()) {
              <div class="space-y-4">
                <!-- Base et taux -->
                <div class="p-3 bg-secondary-50 rounded-lg">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-secondary-600">Base minimum de perception</span>
                    <span class="font-mono font-medium">{{ result()!.baseMinimumPerception | number:'1.0-0' }} FCFA</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-secondary-600">Taux appliqué</span>
                    <span class="font-medium" [class.text-orange-600]="result()!.deficitConsecutif">
                      {{ result()!.tauxMinimum }}%
                      @if (result()!.deficitConsecutif) {
                        <span class="text-xs">(majoré)</span>
                      }
                    </span>
                  </div>
                </div>

                <!-- Minimum de perception annuel -->
                <div class="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-primary-800">Minimum de perception annuel</span>
                    <span class="text-xl font-bold font-mono text-primary-700">
                      {{ result()!.minimumPerceptionAnnuel | number:'1.0-0' }} FCFA
                    </span>
                  </div>
                </div>

                <!-- 4 Acomptes -->
                <div class="p-4 bg-secondary-50 rounded-lg">
                  <h4 class="text-sm font-semibold text-secondary-700 mb-3">4 Acomptes trimestriels (Art. 86B al. 5)</h4>
                  <div class="grid grid-cols-2 gap-2">
                    @for (acompte of result()!.acomptes; track acompte.echeance) {
                      <div class="flex justify-between items-center p-2 bg-white rounded border border-secondary-200">
                        <span class="text-xs text-secondary-600">{{ acompte.echeance }}</span>
                        <span class="text-sm font-mono font-medium">{{ acompte.montant | number:'1.0-0' }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- IS calculé vs Minimum -->
                <div class="border-t border-secondary-200 pt-4">
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-secondary-600">
                      IS calculé ({{ result()!.tauxIS }}%)
                      @if (result()!.typeContribuable === 'etranger') {
                        <span class="text-xs text-purple-600">(étranger)</span>
                      }
                    </span>
                    <span class="font-mono">{{ result()!.isCalcule | number:'1.0-0' }} FCFA</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-secondary-600">Minimum de perception</span>
                    <span class="font-mono">{{ result()!.minimumPerceptionAnnuel | number:'1.0-0' }} FCFA</span>
                  </div>
                </div>

                <!-- Alerte si minimum appliqué -->
                @if (result()!.minimumApplique) {
                  <div class="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                      <span class="text-sm font-medium text-orange-800">Minimum de perception applicable</span>
                    </div>
                    <p class="text-xs text-orange-700 mt-1">
                      L'IS calculé est inférieur au minimum (Art. 86B al. 7)
                    </p>
                  </div>
                }

                <!-- IS à payer -->
                <div class="p-4 rounded-lg"
                  [class.bg-red-50]="result()!.minimumApplique"
                  [class.border-red-200]="result()!.minimumApplique"
                  [class.bg-green-50]="!result()!.minimumApplique"
                  [class.border-green-200]="!result()!.minimumApplique"
                  [class.border]="true">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold"
                      [class.text-red-800]="result()!.minimumApplique"
                      [class.text-green-800]="!result()!.minimumApplique">
                      IS À PAYER
                    </span>
                    <span class="text-xl font-bold font-mono"
                      [class.text-red-700]="result()!.minimumApplique"
                      [class.text-green-700]="!result()!.minimumApplique">
                      {{ result()!.isDu | number:'1.0-0' }} FCFA
                    </span>
                  </div>
                </div>

                <!-- Déductibilité -->
                <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 class="text-sm font-semibold text-blue-800 mb-2">Déductibilité (Art. 86B al. 6)</h4>
                  <div class="text-xs text-blue-700">
                    @if (result()!.deficitConsecutif) {
                      <p>Taux 2% : seule 50% du minimum est déductible de l'IS</p>
                    } @else {
                      <p>Taux 1% : 100% du minimum est déductible de l'IS</p>
                    }
                    <p class="mt-1 font-medium">Montant déductible : {{ result()!.minimumDeductible | number:'1.0-0' }} FCFA</p>
                  </div>
                </div>
              </div>
            } @else {
              <div class="flex flex-col items-center justify-center h-64 text-secondary-400">
                <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                <p class="text-sm">Saisissez les données pour calculer l'IS</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class IsCalculatorComponent {
  private isService = inject(IsService);

  input: IsInput = {
    produitsExploitation: null,
    produitsFinanciers: null,
    produitsHAO: null,
    retenuesLiberatoires: null,
    beneficeImposable: null,
    deficitConsecutif: false,
    typeContribuable: 'general', // 25% par défaut (Art. 86A)
    version: '2026',
  };

  result = signal<IsResult | null>(null);

  calculer(): void {
    const hasData = (this.input.produitsExploitation && this.input.produitsExploitation > 0) ||
                    (this.input.produitsFinanciers && this.input.produitsFinanciers > 0) ||
                    (this.input.produitsHAO && this.input.produitsHAO > 0) ||
                    (this.input.beneficeImposable && this.input.beneficeImposable > 0);

    if (hasData) {
      const resultat = this.isService.calculerIS(this.input);
      this.result.set(resultat);
    } else {
      this.result.set(null);
    }
  }
}
