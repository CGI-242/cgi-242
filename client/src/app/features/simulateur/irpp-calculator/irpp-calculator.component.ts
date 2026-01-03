import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IrppService, IrppInput, IrppResult } from '../services/irpp.service';
import { IrppFormComponent } from './irpp-form.component';
import { IrppBaremeComponent } from './irpp-bareme.component';

@Component({
  selector: 'app-irpp-calculator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IrppFormComponent, IrppBaremeComponent],
  template: `
    <div class="flex gap-6">
      <!-- Formulaire à gauche -->
      <div class="w-[60%]">
        <app-irpp-form
          [input]="input"
          [result]="result()"
          (inputChange)="calculer()"
          (annuelResultChange)="onAnnuelResultChange($event)"
          (tabChange)="onTabChange($event)" />
      </div>

      <!-- Barème à droite -->
      <div class="w-[40%]">
        <app-irpp-bareme [result]="baremeResult()" />
      </div>
    </div>
  `,
})
export class IrppCalculatorComponent {
  private irppService = inject(IrppService);

  input: IrppInput = {
    salaireBrut: null,
    periode: 'mensuel',
    situationFamiliale: 'celibataire',
    nombreEnfants: null,
  };

  result = signal<IrppResult | null>(null);
  annuelResult = signal<IrppResult | null>(null);
  activeTab = signal<'mensuel' | 'annuel'>('mensuel');

  baremeResult = signal<IrppResult | null>(null);

  calculer(): void {
    if (this.input.salaireBrut && this.input.salaireBrut > 0) {
      const resultat = this.irppService.calculerIrpp(this.input);
      this.result.set(resultat);
      // Mettre à jour le barème si on est sur l'onglet mensuel
      if (this.activeTab() === 'mensuel') {
        this.baremeResult.set(resultat);
      }
    } else {
      this.result.set(null);
      if (this.activeTab() === 'mensuel') {
        this.baremeResult.set(null);
      }
    }
  }

  onAnnuelResultChange(result: IrppResult | null): void {
    this.annuelResult.set(result);
    if (this.activeTab() === 'annuel') {
      this.baremeResult.set(result);
    }
  }

  onTabChange(tab: 'mensuel' | 'annuel'): void {
    this.activeTab.set(tab);
    if (tab === 'mensuel') {
      this.baremeResult.set(this.result());
    } else {
      this.baremeResult.set(this.annuelResult());
    }
  }
}
