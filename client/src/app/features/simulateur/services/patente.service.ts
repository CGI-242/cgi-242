import { Injectable } from '@angular/core';

export interface PatenteInput {
  chiffreAffaires: number | null;
  regime: 'reel' | 'forfait' | 'tpe' | 'pe';
  isEntrepriseNouvelle: boolean;
  isStandBy: boolean;
  dernierePatente: number | null; // Pour les entreprises en stand-by
  nombreEntitesFiscales: number;
}

export interface PatenteTrancheDetail {
  tranche: string;
  base: number;
  taux: number;
  montant: number;
}

export interface PatenteResult {
  chiffreAffaires: number;
  regime: string;
  tranches: PatenteTrancheDetail[];
  patenteBrute: number;
  reductionStandBy: number;
  patenteApresReduction: number;
  reduction50Pourcent: number;
  patenteNette: number;
  patenteParEntite: number;
  nombreEntites: number;
  dateEcheance: string;
  references: string[];
}

// Barème de la patente selon CGI 2025 (Art. 306)
const BAREME_PATENTE = [
  { min: 0, max: 1_000_000, taux: 0 },
  { min: 1_000_001, max: 20_000_000, taux: 0.0075 }, // 0,750%
  { min: 20_000_001, max: 40_000_000, taux: 0.0065 }, // 0,650%
  { min: 40_000_001, max: 100_000_000, taux: 0.0045 }, // 0,450%
  { min: 100_000_001, max: 300_000_000, taux: 0.002 }, // 0,200%
  { min: 300_000_001, max: 500_000_000, taux: 0.0015 }, // 0,150%
  { min: 500_000_001, max: 1_000_000_000, taux: 0.0014 }, // 0,140%
  { min: 1_000_000_001, max: 3_000_000_000, taux: 0.00135 }, // 0,135%
  { min: 3_000_000_001, max: 20_000_000_000, taux: 0.00125 }, // 0,125%
  { min: 20_000_000_001, max: Infinity, taux: 0.00045 }, // 0,045%
];

@Injectable({ providedIn: 'root' })
export class PatenteService {
  calculerPatente(input: PatenteInput): PatenteResult | null {
    const ca = input.chiffreAffaires || 0;

    if (ca <= 0 && !input.isStandBy) {
      return null;
    }

    // Calcul par tranches
    const tranches: PatenteTrancheDetail[] = [];
    let patenteBrute = 0;

    // Si en stand-by, 25% de la dernière patente (Art. 278)
    if (input.isStandBy && input.dernierePatente) {
      const montantStandBy = input.dernierePatente * 0.25;
      return {
        chiffreAffaires: 0,
        regime: this.getRegimeLabel(input.regime),
        tranches: [],
        patenteBrute: input.dernierePatente,
        reductionStandBy: input.dernierePatente - montantStandBy,
        patenteApresReduction: montantStandBy,
        reduction50Pourcent: montantStandBy * 0.5,
        patenteNette: Math.round(montantStandBy * 0.5 / 10) * 10,
        patenteParEntite: Math.round(montantStandBy * 0.5 / 10) * 10,
        nombreEntites: 1,
        dateEcheance: '10-20 avril',
        references: [
          'Art. 278 al. 6 : Stand-by = 25% dernière patente',
          'Art. 306 : Réduction de 50% du montant liquidé'
        ],
      };
    }

    let caRestant = ca;

    for (const bareme of BAREME_PATENTE) {
      if (caRestant <= 0) break;

      const borneInf = bareme.min;
      const borneSup = bareme.max;
      const taux = bareme.taux;

      if (ca > borneInf) {
        const baseImposable = Math.min(caRestant, borneSup - borneInf);
        const montantTranche = baseImposable * taux;

        if (montantTranche > 0) {
          tranches.push({
            tranche: this.formatTranche(borneInf, borneSup),
            base: baseImposable,
            taux: taux * 100,
            montant: montantTranche,
          });
        }

        patenteBrute += montantTranche;
        caRestant -= baseImposable;
      }
    }

    // Réduction de 50% selon Art. 306
    const reduction50 = patenteBrute * 0.5;
    const patenteNette = patenteBrute - reduction50;

    // Arrondi à la dizaine la plus proche (Art. 278)
    const patenteArrondie = Math.round(patenteNette / 10) * 10;

    // Répartition par entité fiscale (Art. 281)
    const nombreEntites = Math.max(1, input.nombreEntitesFiscales || 1);
    const patenteParEntite = Math.round(patenteArrondie / nombreEntites / 10) * 10;

    return {
      chiffreAffaires: ca,
      regime: this.getRegimeLabel(input.regime),
      tranches,
      patenteBrute,
      reductionStandBy: 0,
      patenteApresReduction: patenteBrute,
      reduction50Pourcent: reduction50,
      patenteNette: patenteArrondie,
      patenteParEntite,
      nombreEntites,
      dateEcheance: patenteArrondie > 100_000 ? '2 fractions (Q2)' : '10-20 avril',
      references: [
        'Art. 277 : Droit de patente',
        'Art. 278 : Assiette de la patente',
        'Art. 306 : Tarifs (L.F.2023) - Réduction 50%',
        'Art. 307 : Paiement',
      ],
    };
  }

  private formatTranche(min: number, max: number): string {
    if (max === Infinity) {
      return `> ${this.formatMontant(min)}`;
    }
    return `${this.formatMontant(min + 1)} - ${this.formatMontant(max)}`;
  }

  private formatMontant(montant: number): string {
    if (montant >= 1_000_000_000) {
      return `${(montant / 1_000_000_000).toFixed(0)} Mds`;
    }
    if (montant >= 1_000_000) {
      return `${(montant / 1_000_000).toFixed(0)} M`;
    }
    return montant.toLocaleString('fr-FR');
  }

  private getRegimeLabel(regime: string): string {
    const labels: Record<string, string> = {
      reel: 'Régime du réel',
      forfait: 'Régime forfaitaire',
      tpe: 'Très petites entreprises',
      pe: 'Petites entreprises',
    };
    return labels[regime] || regime;
  }
}
