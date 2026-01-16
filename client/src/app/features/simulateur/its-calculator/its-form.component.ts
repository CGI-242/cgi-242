import { Component, ChangeDetectionStrategy, Input, input, output, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItsInput, ItsResult, ItsService } from '../services/its.service';

@Component({
  selector: 'app-its-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './its-form.component.html',
  styleUrls: ['./its-form.component.scss'],
})
export class ItsFormComponent {
  // Keep @Input for two-way bound properties
  @Input() input!: ItsInput;
  result = input<ItsResult | null>(null);
  inputChange = output<void>();
  annuelResultChange = output<ItsResult | null>();
  tabChange = output<'mensuel' | 'annuel'>();

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
