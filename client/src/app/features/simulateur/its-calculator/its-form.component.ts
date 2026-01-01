import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItsInput, ItsResult, ItsService } from '../services/its.service';

@Component({
  selector: 'app-its-form',
  standalone: true,
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
    <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
      <h2 class="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
        Calculateur ITS 2026
        <span class="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Nouveau</span>
      </h2>

      <!-- Info ITS 2026 -->
      <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="text-sm text-blue-800 font-medium">ITS - Impot sur les Traitements et Salaires (Art. 116)</p>
            <p class="text-xs text-blue-600 mt-1">Nouveau bareme 2026 avec forfait de 1 200 FCFA pour les revenus jusqu'a 615 000 FCFA.</p>
          </div>
        </div>
      </div>

      <!-- Situation familiale -->
      <div class="mb-6 p-4 bg-secondary-50 rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-secondary-700">Situation familiale</h3>
          <!-- Checkbox Exception 2026 -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              [(ngModel)]="input.appliquerChargeFamille"
              (ngModelChange)="onInputChange()"
              class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500">
            <span class="text-xs text-secondary-600">Appliquer charges de famille (Exception 2026)</span>
          </label>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label for="situationFamiliale" class="block text-xs text-secondary-500 mb-1">Statut</label>
            <select
              id="situationFamiliale"
              [(ngModel)]="input.situationFamiliale"
              (ngModelChange)="onInputChange()"
              [disabled]="!input.appliquerChargeFamille"
              class="w-full px-3 py-2 text-sm border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-secondary-100 disabled:cursor-not-allowed">
              <option value="celibataire">Celibataire</option>
              <option value="marie">Marie(e)</option>
              <option value="divorce">Divorce(e)</option>
              <option value="veuf">Veuf/Veuve</option>
            </select>
          </div>
          <div>
            <label for="nombreEnfants" class="block text-xs text-secondary-500 mb-1">Enfants a charge</label>
            <input
              id="nombreEnfants"
              type="number"
              [(ngModel)]="input.nombreEnfants"
              (ngModelChange)="onInputChange()"
              [disabled]="!input.appliquerChargeFamille"
              min="0" max="20"
              class="w-full px-3 py-2 text-sm border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-secondary-100 disabled:cursor-not-allowed">
          </div>
          <div>
            <span class="block text-xs text-secondary-500 mb-1">Nombre de parts</span>
            <div class="px-3 py-2 text-sm font-bold text-primary-700 bg-primary-100 border border-primary-200 rounded-lg text-center">
              {{ nombreParts }}
            </div>
          </div>
        </div>
        @if (!input.appliquerChargeFamille) {
          <p class="mt-2 text-xs text-amber-600 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            Par defaut, ITS ne tient pas compte des charges de famille (quotient = 1)
          </p>
        }
      </div>

      <!-- Onglets -->
      <div class="flex border-b border-secondary-200 mb-4">
        <button
          (click)="onTabChange('mensuel')"
          [class.border-primary-500]="activeTab === 'mensuel'"
          [class.text-primary-600]="activeTab === 'mensuel'"
          [class.border-transparent]="activeTab !== 'mensuel'"
          [class.text-secondary-500]="activeTab !== 'mensuel'"
          class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors">
          Mensuel
        </button>
        <button
          (click)="onTabChange('annuel')"
          [class.border-primary-500]="activeTab === 'annuel'"
          [class.text-primary-600]="activeTab === 'annuel'"
          [class.border-transparent]="activeTab !== 'annuel'"
          [class.text-secondary-500]="activeTab !== 'annuel'"
          class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors">
          Annuel
        </button>
      </div>

      <!-- Contenu onglet MENSUEL -->
      @if (activeTab === 'mensuel') {
      <div class="space-y-1">
        <!-- Section Mensuel -->
        <div class="bg-primary-50 px-4 py-2 rounded-t-lg">
          <span class="text-sm font-semibold text-primary-800">CALCUL MENSUEL</span>
        </div>

        <!-- Salaire brut mensuel - SAISIE -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border border-secondary-200">
          <span class="text-sm font-medium text-secondary-700">SALAIRE BRUT (Mensuel)</span>
          <div class="relative w-48">
            <input
              type="number"
              [(ngModel)]="input.salaireBrut"
              (ngModelChange)="onInputChange()"
              class="w-full px-3 py-2 text-right font-medium border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-primary-50"
              placeholder="">
          </div>
        </div>

        <!-- CNSS Mensuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-secondary-50 border-x border-secondary-200">
          <span class="text-sm text-secondary-600">C.N.S.S. (Mensuel) - 4%</span>
          <span class="text-sm font-medium text-red-600 w-48 text-right">
            - {{ (result?.retenueCnss ?? 0) / 12 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Net imposable mensuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border border-secondary-200">
          <span class="text-sm text-secondary-600">NET IMPOSABLE [Mensuel] (80%)</span>
          <span class="text-sm font-medium w-48 text-right">
            {{ (result?.revenuNetImposable ?? 0) / 12 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Section Annuel (calcule) -->
        <div class="bg-secondary-100 px-4 py-2 mt-4">
          <span class="text-sm font-semibold text-secondary-700">CALCUL ANNUEL</span>
        </div>

        <!-- Salaire brut annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border-x border-secondary-200">
          <span class="text-sm text-secondary-600">SALAIRE BRUT (Annuel)</span>
          <span class="text-sm font-medium w-48 text-right">
            {{ result?.revenuBrutAnnuel ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- CNSS Annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-secondary-50 border-x border-secondary-200">
          <span class="text-sm text-secondary-600">C.N.S.S. (Annuel)</span>
          <span class="text-sm font-medium text-red-600 w-48 text-right">
            - {{ result?.retenueCnss ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Salaire net annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border-x border-secondary-200">
          <span class="text-sm text-secondary-600">SALAIRE NET (Annuel)</span>
          <span class="text-sm font-medium w-48 text-right">
            {{ result?.baseApresCnss ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Net imposable annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-primary-50 border border-primary-200">
          <span class="text-sm font-medium text-primary-800">NET IMPOSABLE [Annuel] (80%)</span>
          <span class="text-sm font-bold text-primary-700 w-48 text-right">
            {{ result?.revenuNetImposable ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Quotient familial -->
        <div class="flex items-center justify-between px-4 py-3 bg-secondary-100 border-x border-b border-secondary-200 mt-4">
          <div>
            <span class="text-sm font-medium text-secondary-700">QUOTIENT FAMILIAL</span>
            <p class="text-xs text-secondary-500">Net imposable / {{ nombreParts }} parts</p>
          </div>
          <span class="text-lg font-bold text-primary-600 w-48 text-right">
            {{ result?.revenuParPart ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Section Impot -->
        <div class="bg-red-50 px-4 py-2 mt-4">
          <span class="text-sm font-semibold text-red-800">IMPOT A PAYER</span>
        </div>

        <!-- ITS annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border-x border-secondary-200">
          <span class="text-sm text-secondary-600">ITS (Annuel)</span>
          <span class="text-sm font-medium w-48 text-right">
            {{ result?.itsAnnuel ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- ITS mensuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-red-100 border border-red-200 rounded-b-lg">
          <span class="text-sm font-semibold text-red-800">ITS (Mensuel)</span>
          <span class="text-lg font-bold text-red-700 w-48 text-right">
            {{ result?.itsMensuel ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Salaire net -->
        @if (result) {
          <div class="flex items-center justify-between px-4 py-3 bg-green-100 border border-green-200 rounded-lg mt-4">
            <span class="text-sm font-semibold text-green-800">SALAIRE NET (Mensuel)</span>
            <span class="text-lg font-bold text-green-700 w-48 text-right">
              {{ result.salaireNetMensuel | number:'1.0-0' }}
            </span>
          </div>
        }
      </div>
      }

      <!-- Contenu onglet ANNUEL -->
      @if (activeTab === 'annuel') {
      <div class="space-y-1">
        <!-- Salaire brut annuel - SAISIE -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border border-secondary-200 rounded-t-lg">
          <div>
            <span class="text-sm font-medium text-secondary-700">SALAIRE BRUT ANNUEL</span>
            <p class="text-xs text-secondary-400">Somme des bruts mensuels</p>
          </div>
          <div class="relative w-48">
            <input
              type="number"
              [(ngModel)]="salaireBrutAnnuel"
              (ngModelChange)="onAnnuelInputChange()"
              class="w-full px-3 py-2 text-right font-medium border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-primary-50"
              placeholder="">
          </div>
        </div>

        <!-- CNSS Annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-secondary-50 border-x border-secondary-200">
          <span class="text-sm text-secondary-600">C.N.S.S.</span>
          <span class="text-sm font-medium text-red-600 w-48 text-right">
            - {{ resultAnnuel?.retenueCnss ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Salaire net annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border-x border-secondary-200">
          <span class="text-sm text-secondary-600">SALAIRE NET</span>
          <span class="text-sm font-medium w-48 text-right">
            {{ resultAnnuel?.baseApresCnss ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Net imposable annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-primary-50 border border-primary-200">
          <span class="text-sm font-medium text-primary-800">NET IMPOSABLE (80%)</span>
          <span class="text-sm font-bold text-primary-700 w-48 text-right">
            {{ resultAnnuel?.revenuNetImposable ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Quotient familial -->
        <div class="flex items-center justify-between px-4 py-3 bg-secondary-100 border-x border-secondary-200 mt-4">
          <div>
            <span class="text-sm font-medium text-secondary-700">QUOTIENT FAMILIAL</span>
            <p class="text-xs text-secondary-500">Net imposable / {{ nombreParts }} parts</p>
          </div>
          <span class="text-lg font-bold text-primary-600 w-48 text-right">
            {{ resultAnnuel?.revenuParPart ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- ITS annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200">
          <span class="text-sm font-semibold text-red-800">ITS ANNUEL</span>
          <span class="text-lg font-bold text-red-700 w-48 text-right">
            {{ resultAnnuel?.itsAnnuel ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Salaire net annuel -->
        @if (resultAnnuel) {
          <div class="flex items-center justify-between px-4 py-3 bg-green-100 border border-green-200 rounded-lg mt-4">
            <span class="text-sm font-semibold text-green-800">SALAIRE NET ANNUEL</span>
            <span class="text-lg font-bold text-green-700 w-48 text-right">
              {{ resultAnnuel.salaireNetAnnuel | number:'1.0-0' }}
            </span>
          </div>
        }
      </div>
      }

      <!-- Avertissements -->
      @if (result?.smigApplique) {
        <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <p class="font-medium">Salaire inferieur au SMIG (70 400 FCFA/mois)</p>
          @if (result?.minimumApplique) {
            <p class="text-xs mt-1">Le minimum ITS de 1 200 FCFA/an est applique.</p>
          }
        </div>
      }

      <!-- References -->
      <div class="mt-4 text-xs text-secondary-400">
        Art. 40 (CNSS 4%), Art. 41 (Frais 20%), Art. 116 (Bareme ITS 2026)
      </div>
    </div>
  `,
})
export class ItsFormComponent {
  @Input() input!: ItsInput;
  @Input() result: ItsResult | null = null;
  @Output() inputChange = new EventEmitter<void>();
  @Output() annuelResultChange = new EventEmitter<ItsResult | null>();
  @Output() tabChange = new EventEmitter<'mensuel' | 'annuel'>();

  private itsService = inject(ItsService);

  activeTab: 'mensuel' | 'annuel' = 'mensuel';
  salaireBrutAnnuel: number | null = null;
  resultAnnuel: ItsResult | null = null;

  get nombreParts(): number {
    return this.itsService.calculerNombreParts(
      this.input.situationFamiliale,
      this.input.nombreEnfants,
      this.input.appliquerChargeFamille
    );
  }

  onInputChange(): void {
    this.inputChange.emit();
    // Recalculer aussi l'annuel si necessaire
    if (this.activeTab === 'annuel' && this.salaireBrutAnnuel && this.salaireBrutAnnuel > 0) {
      this.recalculerAnnuel();
    }
  }

  onAnnuelInputChange(): void {
    this.recalculerAnnuel();
  }

  private recalculerAnnuel(): void {
    if (this.salaireBrutAnnuel && this.salaireBrutAnnuel > 0) {
      const inputAnnuel: ItsInput = {
        ...this.input,
        salaireBrut: this.salaireBrutAnnuel,
        periode: 'annuel'
      };
      this.resultAnnuel = this.itsService.calculerIts(inputAnnuel);
    } else {
      this.resultAnnuel = null;
    }
    this.annuelResultChange.emit(this.resultAnnuel);
  }

  onTabChange(tab: 'mensuel' | 'annuel'): void {
    this.activeTab = tab;
    this.tabChange.emit(tab);
    if (tab === 'annuel') {
      this.annuelResultChange.emit(this.resultAnnuel);
    }
  }
}
