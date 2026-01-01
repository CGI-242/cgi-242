import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IrppInput, IrppResult, IrppService } from '../services/irpp.service';

@Component({
  selector: 'app-irpp-form',
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
        Calculateur IRPP
      </h2>

      <!-- Situation familiale -->
      <div class="mb-6 p-4 bg-secondary-50 rounded-lg">
        <h3 class="text-sm font-medium text-secondary-700 mb-3">Situation familiale (Art. 91)</h3>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label for="situationFamiliale" class="block text-xs text-secondary-500 mb-1">Statut</label>
            <select
              id="situationFamiliale"
              [(ngModel)]="input.situationFamiliale"
              (ngModelChange)="onInputChange()"
              class="w-full px-3 py-2 text-sm border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option value="celibataire">Célibataire</option>
              <option value="marie">Marié(e)</option>
              <option value="divorce">Divorcé(e)</option>
              <option value="veuf">Veuf/Veuve</option>
            </select>
          </div>
          <div>
            <label for="nombreEnfants" class="block text-xs text-secondary-500 mb-1">Enfants à charge</label>
            <input
              id="nombreEnfants"
              type="number"
              [(ngModel)]="input.nombreEnfants"
              (ngModelChange)="onInputChange()"
              min="0" max="20"
              class="w-full px-3 py-2 text-sm border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500">
          </div>
          <div>
            <span class="block text-xs text-secondary-500 mb-1">Nombre de parts</span>
            <div class="px-3 py-2 text-sm font-bold text-primary-700 bg-primary-100 border border-primary-200 rounded-lg text-center">
              {{ nombreParts }}
            </div>
          </div>
        </div>
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

        <!-- Section Annuel (calculé) -->
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
            <p class="text-xs text-secondary-500">Net imposable ÷ {{ nombreParts }} parts</p>
          </div>
          <span class="text-lg font-bold text-primary-600 w-48 text-right">
            {{ result?.revenuParPart ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Section Impôt -->
        <div class="bg-red-50 px-4 py-2 mt-4">
          <span class="text-sm font-semibold text-red-800">IMPÔT À PAYER</span>
        </div>

        <!-- Impôt brut annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border-x border-secondary-200">
          <span class="text-sm text-secondary-600">IMPÔT BRUT (Annuel)</span>
          <span class="text-sm font-medium w-48 text-right">
            {{ result?.irppAnnuel ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Impôt brut mensuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-red-100 border border-red-200 rounded-b-lg">
          <span class="text-sm font-semibold text-red-800">IMPÔT BRUT (Mensuel)</span>
          <span class="text-lg font-bold text-red-700 w-48 text-right">
            {{ result?.irppMensuel ?? 0 | number:'1.0-0' }}
          </span>
        </div>
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
            <p class="text-xs text-secondary-500">Net imposable ÷ {{ nombreParts }} parts</p>
          </div>
          <span class="text-lg font-bold text-primary-600 w-48 text-right">
            {{ resultAnnuel?.revenuParPart ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Impôt brut annuel -->
        <div class="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200">
          <span class="text-sm font-semibold text-red-800">IMPÔT BRUT ANNUEL</span>
          <span class="text-lg font-bold text-red-700 w-48 text-right">
            {{ resultAnnuel?.irppAnnuel ?? 0 | number:'1.0-0' }}
          </span>
        </div>

        <!-- Section Régularisation -->
        <div class="bg-orange-50 px-4 py-2 mt-4">
          <span class="text-sm font-semibold text-orange-800">RÉGULARISATION</span>
        </div>

        <!-- Total acomptes versés - SAISIE -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border border-secondary-200">
          <div>
            <span class="text-sm text-secondary-600">TOTAL ACOMPTES VERSÉS</span>
            <p class="text-xs text-secondary-400">IRPP versé sur l'année</p>
          </div>
          <div class="relative w-48">
            <input
              type="number"
              [(ngModel)]="totalAcomptesVerses"
              class="w-full px-3 py-2 text-right font-medium border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-orange-50"
              placeholder="">
          </div>
        </div>

        <!-- Régularisation -->
        <div class="flex items-center justify-between px-4 py-4 rounded-b-lg"
          [class.bg-red-100]="getRegularisation() > 0"
          [class.border-red-200]="getRegularisation() > 0"
          [class.bg-green-100]="getRegularisation() < 0"
          [class.border-green-200]="getRegularisation() < 0"
          [class.bg-secondary-100]="getRegularisation() === 0"
          [class.border-secondary-200]="getRegularisation() === 0"
          [class.border]="true">
          <div>
            <span class="text-sm font-semibold"
              [class.text-red-800]="getRegularisation() > 0"
              [class.text-green-800]="getRegularisation() < 0"
              [class.text-secondary-700]="getRegularisation() === 0">
              {{ getRegularisation() > 0 ? 'À PAYER (12ème mois)' : getRegularisation() < 0 ? 'TROP PERÇU (à rembourser)' : 'RÉGULARISATION' }}
            </span>
          </div>
          <span class="text-lg font-bold w-48 text-right"
            [class.text-red-700]="getRegularisation() > 0"
            [class.text-green-700]="getRegularisation() < 0"
            [class.text-secondary-600]="getRegularisation() === 0">
            {{ getRegularisation() | number:'1.0-0' }}
          </span>
        </div>
      </div>
      }

      <!-- Références -->
      <div class="mt-4 text-xs text-secondary-400">
        Art. 40 (CNSS 4%), Art. 41 (Frais 20%), Art. 91 (Quotient), Art. 95 (Barème)
      </div>
    </div>
  `,
})
export class IrppFormComponent {
  @Input() input!: IrppInput;
  @Input() result: IrppResult | null = null;
  @Output() inputChange = new EventEmitter<void>();
  @Output() annuelResultChange = new EventEmitter<IrppResult | null>();
  @Output() tabChange = new EventEmitter<'mensuel' | 'annuel'>();

  private irppService = inject(IrppService);

  activeTab: 'mensuel' | 'annuel' = 'mensuel';
  salaireBrutAnnuel: number | null = null;
  totalAcomptesVerses: number | null = null;
  resultAnnuel: IrppResult | null = null;

  get nombreParts(): number {
    return this.irppService.calculerNombreParts(
      this.input.situationFamiliale,
      this.input.nombreEnfants
    );
  }

  onInputChange(): void {
    this.inputChange.emit();
    // Recalculer aussi l'annuel si nécessaire (pour mise à jour du barème)
    if (this.activeTab === 'annuel' && this.salaireBrutAnnuel && this.salaireBrutAnnuel > 0) {
      this.recalculerAnnuel();
    }
  }

  onAnnuelInputChange(): void {
    this.recalculerAnnuel();
  }

  private recalculerAnnuel(): void {
    if (this.salaireBrutAnnuel && this.salaireBrutAnnuel > 0) {
      const inputAnnuel: IrppInput = {
        ...this.input,
        salaireBrut: this.salaireBrutAnnuel,
        periode: 'annuel'
      };
      this.resultAnnuel = this.irppService.calculerIrpp(inputAnnuel);
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

  getRegularisation(): number {
    if (!this.resultAnnuel) return 0;
    return this.resultAnnuel.irppAnnuel - (this.totalAcomptesVerses || 0);
  }
}
