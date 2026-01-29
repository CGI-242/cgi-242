import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IrppInput, IrppResult, IrppService } from '../services/irpp.service';

@Component({
  selector: 'app-irpp-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './irpp-form.component.html',
  styleUrls: ['./irpp-form.component.scss'],
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
