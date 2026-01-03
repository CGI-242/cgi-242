import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItsResult, TrancheDetail } from '../services/its.service';

@Component({
  selector: 'app-its-bareme',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-8 h-full">
      <h3 class="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        Bareme ITS 2026 (Art. 116)
      </h3>

      <!-- Tableau du bareme -->
      <div class="overflow-hidden rounded-lg border border-secondary-200">
        <table class="w-full text-sm">
          <thead class="bg-secondary-100">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-secondary-600">TRANCHE</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-secondary-600">TAUX</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-secondary-600">BASE</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-secondary-600">IMPOT</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-secondary-200">
            @if (result && result.detailTranches.length > 0) {
              @for (tranche of result.detailTranches; track tranche.tranche; let i = $index) {
                <tr [class.bg-primary-50]="tranche.baseImposable > 0" [class.bg-white]="tranche.baseImposable === 0">
                  <td class="px-4 py-3 text-secondary-700">
                    <div class="text-sm">
                      {{ tranche.min | number:'1.0-0' }} a {{ getBorneSup(tranche) | number:'1.0-0' }}
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    @if (i === 0) {
                      <!-- Premiere tranche : forfait -->
                      <span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {{ tranche.tauxAffiche }}
                      </span>
                    } @else {
                      <span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium"
                        [class.bg-yellow-100]="tranche.taux <= 10"
                        [class.text-yellow-800]="tranche.taux <= 10"
                        [class.bg-orange-100]="tranche.taux > 10 && tranche.taux <= 20"
                        [class.text-orange-800]="tranche.taux > 10 && tranche.taux <= 20"
                        [class.bg-red-100]="tranche.taux > 20"
                        [class.text-red-800]="tranche.taux > 20">
                        {{ tranche.taux }}%
                      </span>
                    }
                  </td>
                  <td class="px-4 py-3 text-right font-mono text-secondary-700">
                    @if (tranche.baseImposable > 0) {
                      {{ tranche.baseImposable | number:'1.0-0' }}
                    } @else {
                      <span class="text-secondary-400">-</span>
                    }
                  </td>
                  <td class="px-4 py-3 text-right font-mono font-medium"
                    [class.text-red-600]="tranche.impot > 0"
                    [class.text-secondary-400]="tranche.impot === 0">
                    @if (tranche.impot > 0) {
                      {{ tranche.impot | number:'1.0-0' }}
                    } @else {
                      -
                    }
                  </td>
                </tr>
              }
            } @else {
              <!-- Bareme vide (sans calcul) -->
              <tr class="bg-white">
                <td class="px-4 py-3 text-secondary-700 text-sm">0 a 615 000</td>
                <td class="px-4 py-3 text-center"><span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">1 200 FCFA</span></td>
                <td class="px-4 py-3 text-right text-secondary-400">-</td>
                <td class="px-4 py-3 text-right text-secondary-400">-</td>
              </tr>
              <tr class="bg-secondary-50">
                <td class="px-4 py-3 text-secondary-700 text-sm">615 001 a 1 500 000</td>
                <td class="px-4 py-3 text-center"><span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">10%</span></td>
                <td class="px-4 py-3 text-right text-secondary-400">-</td>
                <td class="px-4 py-3 text-right text-secondary-400">-</td>
              </tr>
              <tr class="bg-white">
                <td class="px-4 py-3 text-secondary-700 text-sm">1 500 001 a 3 500 000</td>
                <td class="px-4 py-3 text-center"><span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">15%</span></td>
                <td class="px-4 py-3 text-right text-secondary-400">-</td>
                <td class="px-4 py-3 text-right text-secondary-400">-</td>
              </tr>
              <tr class="bg-secondary-50">
                <td class="px-4 py-3 text-secondary-700 text-sm">3 500 001 a 5 000 000</td>
                <td class="px-4 py-3 text-center"><span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">20%</span></td>
                <td class="px-4 py-3 text-right text-secondary-400">-</td>
                <td class="px-4 py-3 text-right text-secondary-400">-</td>
              </tr>
              <tr class="bg-white">
                <td class="px-4 py-3 text-secondary-700 text-sm">5 000 001 et +</td>
                <td class="px-4 py-3 text-center"><span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-100 text-red-800">30%</span></td>
                <td class="px-4 py-3 text-right text-secondary-400">-</td>
                <td class="px-4 py-3 text-right text-secondary-400">-</td>
              </tr>
            }
          </tbody>
          <tfoot class="bg-red-50 border-t-2 border-red-200">
            <tr>
              <td colspan="2" class="px-4 py-4 font-semibold text-red-800">SOMME DES TRANCHES</td>
              <td class="px-4 py-4 text-right"></td>
              <td class="px-4 py-4 text-right font-mono font-bold text-lg text-red-700">
                {{ result?.itsParPart ?? 0 | number:'1.0-0' }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Calcul final -->
      @if (result) {
        <div class="mt-6 p-5 bg-primary-50 rounded-lg border border-primary-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-primary-700">Somme des tranches</span>
            <span class="font-mono font-medium text-primary-800">{{ result.itsParPart | number:'1.0-0' }}</span>
          </div>
          @if (result.chargeFamilleAppliquee) {
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-primary-700">x Nombre de parts</span>
              <span class="font-mono font-medium text-primary-800">{{ result.nombreParts }}</span>
            </div>
          }
          <div class="border-t border-primary-300 pt-3 mt-3">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-primary-800">ITS ANNUEL</span>
              <span class="font-mono font-bold text-xl text-primary-900">{{ result.itsAnnuel | number:'1.0-0' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-primary-700">ITS MENSUEL (/ 12)</span>
              <span class="font-mono font-medium text-primary-800">{{ result.itsMensuel | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Taux effectif -->
        <div class="mt-4 flex items-center justify-between px-4 py-3 bg-secondary-100 rounded-lg">
          <span class="text-sm text-secondary-600">Taux effectif d'imposition</span>
          <span class="font-semibold text-lg text-secondary-800">{{ result.tauxEffectif | number:'1.2-2' }}%</span>
        </div>

        <!-- Indicateurs speciaux -->
        @if (result.minimumApplique || result.plafondCnssApplique || result.chargeFamilleAppliquee) {
          <div class="mt-4 space-y-2">
            @if (result.minimumApplique) {
              <div class="flex items-center gap-2 text-xs text-amber-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Minimum ITS de 1 200 FCFA applique
              </div>
            }
            @if (result.plafondCnssApplique) {
              <div class="flex items-center gap-2 text-xs text-blue-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Plafond CNSS de 1 200 000 FCFA/mois applique
              </div>
            }
            @if (result.chargeFamilleAppliquee) {
              <div class="flex items-center gap-2 text-xs text-green-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Exception 2026 : charges de famille appliquees ({{ result.nombreParts }} parts)
              </div>
            }
          </div>
        }
      }

      <!-- Info -->
      <div class="mt-4 text-xs text-secondary-400">
        Le bareme s'applique au quotient familial (revenu / parts).
        @if (!result?.chargeFamilleAppliquee) {
          <br>ITS standard : 1 part (sans charges de famille).
        }
      </div>
    </div>
  `,
})
export class ItsBaremeComponent {
  @Input() result: ItsResult | null = null;

  getBorneSup(tranche: TrancheDetail): number {
    if (!this.result) return tranche.max || 0;

    const quotient = this.result.revenuParPart;

    // Si le quotient familial est dans cette tranche, afficher le quotient comme borne sup
    if (quotient >= tranche.min && (tranche.max === null || quotient <= tranche.max)) {
      return quotient;
    }

    // Sinon afficher la borne max de la tranche
    return tranche.max || quotient;
  }
}
