import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IrppResult } from '../services/irpp.service';

@Component({
  selector: 'app-irpp-result',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe],
  template: `
    @if (result) {
      <div class="space-y-4">
        <!-- Résumé principal -->
        <div class="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
          <h2 class="text-lg font-medium opacity-90 mb-4">IRPP à payer</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-3xl font-bold">{{ result.irppMensuel | number:'1.0-0' }}</p>
              <p class="text-sm opacity-75">FCFA / mois</p>
            </div>
            <div>
              <p class="text-3xl font-bold">{{ result.irppAnnuel | number:'1.0-0' }}</p>
              <p class="text-sm opacity-75">FCFA / an</p>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-white/20">
            <div class="flex justify-between text-sm">
              <span class="opacity-75">Taux effectif d'imposition</span>
              <span class="font-semibold">{{ result.tauxEffectif | number:'1.2-2' }}%</span>
            </div>
          </div>
        </div>

        <!-- Salaire net -->
        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 class="text-sm font-medium text-green-800 mb-2">Salaire net après IRPP</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xl font-bold text-green-700">{{ result.salaireNetMensuel | number:'1.0-0' }}</p>
              <p class="text-xs text-green-600">FCFA / mois</p>
            </div>
            <div>
              <p class="text-xl font-bold text-green-700">{{ result.salaireNetAnnuel | number:'1.0-0' }}</p>
              <p class="text-xs text-green-600">FCFA / an</p>
            </div>
          </div>
        </div>

        <!-- Détail du calcul -->
        <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">Détail du calcul</h3>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between py-2 border-b border-secondary-100">
              <span class="text-secondary-600">Revenu brut annuel</span>
              <span class="font-medium">{{ result.revenuBrutAnnuel | number:'1.0-0' }} FCFA</span>
            </div>

            <div class="flex justify-between py-2 border-b border-secondary-100">
              <div>
                <span class="text-secondary-600">Retenue CNSS (4%)</span>
                @if (result.plafondCnssApplique) {
                  <span class="ml-2 text-xs text-orange-600">(plafond atteint)</span>
                }
              </div>
              <span class="font-medium text-red-600">- {{ result.retenueCnss | number:'1.0-0' }} FCFA</span>
            </div>

            <div class="flex justify-between py-2 border-b border-secondary-100">
              <span class="text-secondary-600">Base après CNSS</span>
              <span class="font-medium">{{ result.baseApresCnss | number:'1.0-0' }} FCFA</span>
            </div>

            <div class="flex justify-between py-2 border-b border-secondary-100">
              <span class="text-secondary-600">Frais professionnels (20%)</span>
              <span class="font-medium text-red-600">- {{ result.fraisProfessionnels | number:'1.0-0' }} FCFA</span>
            </div>

            <div class="flex justify-between py-2 border-b border-secondary-100 bg-secondary-50 -mx-2 px-2 rounded">
              <span class="font-medium text-secondary-900">Revenu net imposable</span>
              <span class="font-bold">{{ result.revenuNetImposable | number:'1.0-0' }} FCFA</span>
            </div>

            <div class="flex justify-between py-2 border-b border-secondary-100">
              <span class="text-secondary-600">÷ {{ result.nombreParts }} parts = Revenu/part</span>
              <span class="font-medium">{{ result.revenuParPart | number:'1.0-0' }} FCFA</span>
            </div>

            <!-- Tranches -->
            <div class="py-2 border-b border-secondary-100">
              <p class="text-secondary-600 mb-2">Application du barème (Art. 95)</p>
              <div class="bg-secondary-50 rounded-lg p-3 space-y-2">
                @for (t of result.detailTranches; track t.tranche) {
                  <div class="flex justify-between text-xs">
                    <span>
                      <span class="text-secondary-500">{{ t.tranche }}</span>
                      <span class="text-secondary-400 mx-1">×</span>
                      <span class="font-medium">{{ t.taux }}%</span>
                    </span>
                    <span class="font-medium">{{ t.impot | number:'1.0-0' }} FCFA</span>
                  </div>
                }
                <div class="flex justify-between pt-2 border-t border-secondary-200 font-medium">
                  <span>IRPP par part</span>
                  <span>{{ result.irppParPart | number:'1.0-0' }} FCFA</span>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="flex justify-between py-3 bg-primary-50 -mx-2 px-4 rounded-lg">
              <span class="font-semibold text-primary-900">
                {{ result.irppParPart | number:'1.0-0' }} × {{ result.nombreParts }} parts
              </span>
              <span class="font-bold text-primary-700">{{ result.irppAnnuel | number:'1.0-0' }} FCFA</span>
            </div>
          </div>
        </div>

        <!-- Références légales -->
        <div class="bg-secondary-50 rounded-lg p-4 text-xs text-secondary-500">
          <p class="font-medium text-secondary-700 mb-1">Références CGI Congo-Brazzaville</p>
          <ul class="space-y-0.5">
            <li>Art. 40 - CNSS: 4% plafonné à 1 200 000 FCFA/mois</li>
            <li>Art. 41 - Frais professionnels: 20%</li>
            <li>Art. 91 - Quotient familial</li>
            <li>Art. 95 - Barème progressif</li>
          </ul>
        </div>
      </div>
    } @else {
      <!-- État vide -->
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 flex items-center justify-center">
        <div class="text-center">
          <div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-secondary-900 mb-1">Simulez votre IRPP</h3>
          <p class="text-secondary-500 text-sm">Remplissez le formulaire pour calculer votre impôt</p>
        </div>
      </div>
    }
  `,
})
export class IrppResultComponent {
  @Input() result: IrppResult | null = null;
}
