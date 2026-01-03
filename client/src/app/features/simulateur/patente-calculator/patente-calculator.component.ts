import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatenteService, PatenteInput, PatenteResult } from '../services/patente.service';

@Component({
  selector: 'app-patente-calculator',
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
      <!-- Info CGI 2025 -->
      <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-sm font-semibold text-blue-800">CGI 2025 - Contribution des Patentes (Art. 277-307)</h3>
            <p class="text-xs text-blue-700 mt-1">
              <strong>Base :</strong> Chiffre d'affaires HT de l'exercice precedent.<br>
              <strong>Reduction :</strong> 50% du montant liquide (Art. 306).<br>
              <strong>Echeance :</strong> 10-20 avril (ou 2 fractions si > 100.000 FCFA).
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Simulateur Patente
            </h2>

            <!-- Regime fiscal -->
            <div class="mb-6 p-4 bg-secondary-50 rounded-lg">
              <h3 class="text-sm font-medium text-secondary-700 mb-3">Regime fiscal (Art. 278)</h3>
              <div class="grid grid-cols-2 gap-2">
                @for (option of regimeOptions; track option.value) {
                  <label class="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-secondary-100">
                    <input
                      type="radio"
                      name="regime"
                      [value]="option.value"
                      [(ngModel)]="input.regime"
                      (ngModelChange)="calculer()"
                      class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                    <span class="text-sm text-secondary-700">{{ option.label }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Situation stand-by -->
            <div class="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="input.isStandBy"
                  (ngModelChange)="calculer()"
                  class="w-4 h-4 text-orange-600 rounded focus:ring-orange-500">
                <div>
                  <span class="text-sm font-medium text-orange-800">Entreprise en stand-by</span>
                  <p class="text-xs text-orange-600">25% de la derniere patente (Art. 278 al. 6)</p>
                </div>
              </label>

              @if (input.isStandBy) {
                <div class="mt-3">
                  <label class="block text-xs text-orange-700 mb-1">Derniere patente payee (FCFA)</label>
                  <input
                    type="number"
                    [(ngModel)]="input.dernierePatente"
                    (ngModelChange)="calculer()"
                    placeholder="0"
                    class="w-full px-3 py-2 text-right text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                </div>
              }
            </div>

            <!-- Chiffre d'affaires -->
            @if (!input.isStandBy) {
              <div class="mb-6">
                <label for="chiffreAffaires" class="block text-sm font-medium text-secondary-700 mb-2">
                  Chiffre d'affaires HT (exercice N-1)
                </label>
                <input
                  id="chiffreAffaires"
                  type="number"
                  [(ngModel)]="input.chiffreAffaires"
                  (ngModelChange)="calculer()"
                  placeholder="0"
                  class="w-full px-4 py-3 text-right font-medium border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <p class="text-xs text-secondary-500 mt-1">
                  Entreprise nouvelle : CA previsionnel (Art. 278 al. 7)
                </p>
              </div>

              <!-- Entreprise nouvelle -->
              <div class="mb-6">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="input.isEntrepriseNouvelle"
                    class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500">
                  <div>
                    <span class="text-sm font-medium text-secondary-700">Entreprise nouvelle</span>
                    <p class="text-xs text-secondary-500">Base = CA previsionnel</p>
                  </div>
                </label>
              </div>

              <!-- Nombre d'entites fiscales -->
              <div class="mb-6">
                <label for="entites" class="block text-sm font-medium text-secondary-700 mb-2">
                  Nombre d'entites fiscales (Art. 281)
                </label>
                <input
                  id="entites"
                  type="number"
                  min="1"
                  [(ngModel)]="input.nombreEntitesFiscales"
                  (ngModelChange)="calculer()"
                  placeholder="1"
                  class="w-full px-4 py-3 text-right border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <p class="text-xs text-secondary-500 mt-1">
                  Etablissements, chantiers, vehicules de transport
                </p>
              </div>
            }

            <!-- References -->
            <div class="text-xs text-secondary-400">
              Art. 277-307 CGI 2025 - Contribution des patentes
            </div>
          </div>
        </div>

        <!-- Resultats -->
        <div class="w-1/2">
          <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Resultat
            </h3>

            @if (result()) {
              <div class="space-y-4">
                <!-- Infos de base -->
                <div class="p-3 bg-secondary-50 rounded-lg">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-secondary-600">Regime</span>
                    <span class="font-medium text-secondary-800">{{ result()!.regime }}</span>
                  </div>
                  @if (!input.isStandBy) {
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-secondary-600">Chiffre d'affaires</span>
                      <span class="font-mono font-medium">{{ result()!.chiffreAffaires | number:'1.0-0' }} FCFA</span>
                    </div>
                  }
                </div>

                <!-- Detail par tranche -->
                @if (result()!.tranches.length > 0) {
                  <div class="p-4 bg-secondary-50 rounded-lg">
                    <h4 class="text-sm font-semibold text-secondary-700 mb-3">Detail par tranche (Art. 306)</h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                      @for (tranche of result()!.tranches; track tranche.tranche) {
                        <div class="flex justify-between items-center p-2 bg-white rounded border border-secondary-200 text-xs">
                          <div>
                            <span class="text-secondary-600">{{ tranche.tranche }}</span>
                            <span class="text-secondary-400 ml-1">({{ tranche.taux | number:'1.3-3' }}%)</span>
                          </div>
                          <span class="font-mono font-medium">{{ tranche.montant | number:'1.0-0' }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Calcul -->
                <div class="border-t border-secondary-200 pt-4 space-y-2">
                  <div class="flex justify-between items-center py-1">
                    <span class="text-sm text-secondary-600">Patente brute</span>
                    <span class="font-mono">{{ result()!.patenteBrute | number:'1.0-0' }} FCFA</span>
                  </div>

                  @if (result()!.reductionStandBy > 0) {
                    <div class="flex justify-between items-center py-1 text-orange-600">
                      <span class="text-sm">Reduction stand-by (75%)</span>
                      <span class="font-mono">- {{ result()!.reductionStandBy | number:'1.0-0' }} FCFA</span>
                    </div>
                  }

                  <div class="flex justify-between items-center py-1 text-green-600">
                    <span class="text-sm">Reduction 50% (Art. 306)</span>
                    <span class="font-mono">- {{ result()!.reduction50Pourcent | number:'1.0-0' }} FCFA</span>
                  </div>
                </div>

                <!-- Patente nette -->
                <div class="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-primary-800">PATENTE NETTE</span>
                    <span class="text-xl font-bold font-mono text-primary-700">
                      {{ result()!.patenteNette | number:'1.0-0' }} FCFA
                    </span>
                  </div>
                </div>

                <!-- Repartition par entite -->
                @if (result()!.nombreEntites > 1) {
                  <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 class="text-sm font-semibold text-purple-800 mb-2">
                      Repartition ({{ result()!.nombreEntites }} entites)
                    </h4>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-purple-700">Patente par entite</span>
                      <span class="font-mono font-medium text-purple-800">
                        {{ result()!.patenteParEntite | number:'1.0-0' }} FCFA
                      </span>
                    </div>
                  </div>
                }

                <!-- Echeance -->
                <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-sm font-medium text-blue-800">Echeance : {{ result()!.dateEcheance }}</span>
                  </div>
                  @if (result()!.patenteNette > 100000) {
                    <p class="text-xs text-blue-700 mt-1">
                      Paiement en 2 fractions possibles (Art. 307)
                    </p>
                  }
                </div>

                <!-- References -->
                <div class="p-3 bg-secondary-50 rounded-lg">
                  <h4 class="text-xs font-semibold text-secondary-600 mb-2">References CGI</h4>
                  <ul class="text-xs text-secondary-500 space-y-1">
                    @for (ref of result()!.references; track ref) {
                      <li>{{ ref }}</li>
                    }
                  </ul>
                </div>
              </div>
            } @else {
              <div class="flex flex-col items-center justify-center h-64 text-secondary-400">
                <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                <p class="text-sm">Saisissez le CA pour calculer la patente</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Bareme complet -->
      <div class="mt-6 bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <h3 class="text-lg font-semibold text-secondary-900 mb-4">Bareme de la Patente (Art. 306 - L.F.2023)</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-secondary-50">
                <th class="px-4 py-2 text-left font-medium text-secondary-700">Tranche de CA (FCFA)</th>
                <th class="px-4 py-2 text-right font-medium text-secondary-700">Taux</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-secondary-100">
              <tr><td class="px-4 py-2">0 - 1.000.000</td><td class="px-4 py-2 text-right font-mono">0%</td></tr>
              <tr><td class="px-4 py-2">1.000.001 - 20.000.000</td><td class="px-4 py-2 text-right font-mono">0,750%</td></tr>
              <tr><td class="px-4 py-2">20.000.001 - 40.000.000</td><td class="px-4 py-2 text-right font-mono">0,650%</td></tr>
              <tr><td class="px-4 py-2">40.000.001 - 100.000.000</td><td class="px-4 py-2 text-right font-mono">0,450%</td></tr>
              <tr><td class="px-4 py-2">100.000.001 - 300.000.000</td><td class="px-4 py-2 text-right font-mono">0,200%</td></tr>
              <tr><td class="px-4 py-2">300.000.001 - 500.000.000</td><td class="px-4 py-2 text-right font-mono">0,150%</td></tr>
              <tr><td class="px-4 py-2">500.000.001 - 1.000.000.000</td><td class="px-4 py-2 text-right font-mono">0,140%</td></tr>
              <tr><td class="px-4 py-2">1.000.000.001 - 3.000.000.000</td><td class="px-4 py-2 text-right font-mono">0,135%</td></tr>
              <tr><td class="px-4 py-2">3.000.000.001 - 20.000.000.000</td><td class="px-4 py-2 text-right font-mono">0,125%</td></tr>
              <tr><td class="px-4 py-2">> 20.000.000.000</td><td class="px-4 py-2 text-right font-mono">0,045%</td></tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-secondary-500 mt-3">
          <strong>Note :</strong> La contribution n'est exigible qu'a hauteur de 50% du montant des droits liquides (Art. 306 dernier alinea).
        </p>
      </div>
    </div>
  `,
})
export class PatenteCalculatorComponent {
  private patenteService = inject(PatenteService);

  regimeOptions = [
    { value: 'reel', label: 'Regime du reel' },
    { value: 'forfait', label: 'Regime forfaitaire' },
    { value: 'tpe', label: 'Tres petites entreprises' },
    { value: 'pe', label: 'Petites entreprises' },
  ];

  input: PatenteInput = {
    chiffreAffaires: null,
    regime: 'reel',
    isEntrepriseNouvelle: false,
    isStandBy: false,
    dernierePatente: null,
    nombreEntitesFiscales: 1,
  };

  result = signal<PatenteResult | null>(null);

  calculer(): void {
    const hasData = (this.input.chiffreAffaires && this.input.chiffreAffaires > 0) ||
                    (this.input.isStandBy && this.input.dernierePatente && this.input.dernierePatente > 0);

    if (hasData) {
      const resultat = this.patenteService.calculerPatente(this.input);
      this.result.set(resultat);
    } else {
      this.result.set(null);
    }
  }
}
