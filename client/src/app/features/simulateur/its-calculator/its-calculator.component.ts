import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItsService, ItsInput, ItsResult } from '../services/its.service';
import { ItsFormComponent } from './its-form.component';
import { ItsBaremeComponent } from './its-bareme.component';

@Component({
  selector: 'app-its-calculator',
  standalone: true,
  imports: [CommonModule, ItsFormComponent, ItsBaremeComponent],
  template: `
    <div class="flex gap-6">
      <!-- Formulaire a gauche -->
      <div class="w-[60%]">
        <app-its-form
          [input]="input"
          [result]="result()"
          (inputChange)="calculer()"
          (annuelResultChange)="onAnnuelResultChange($event)"
          (tabChange)="onTabChange($event)" />
      </div>

      <!-- Bareme a droite -->
      <div class="w-[40%]">
        <app-its-bareme [result]="baremeResult()" />
      </div>
    </div>
  `,
})
export class ItsCalculatorComponent {
  private itsService = inject(ItsService);

  input: ItsInput = {
    salaireBrut: null,
    periode: 'mensuel',
    situationFamiliale: 'celibataire',
    nombreEnfants: null,
    appliquerChargeFamille: false, // Par defaut, ITS ne tient pas compte des charges
  };

  result = signal<ItsResult | null>(null);
  annuelResult = signal<ItsResult | null>(null);
  activeTab = signal<'mensuel' | 'annuel'>('mensuel');

  baremeResult = signal<ItsResult | null>(null);

  calculer(): void {
    if (this.input.salaireBrut && this.input.salaireBrut > 0) {
      const resultat = this.itsService.calculerIts(this.input);
      this.result.set(resultat);
      // Mettre a jour le bareme si on est sur l'onglet mensuel
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

  onAnnuelResultChange(result: ItsResult | null): void {
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
