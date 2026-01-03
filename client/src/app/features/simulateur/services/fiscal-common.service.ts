/**
 * Service commun pour les calculs fiscaux
 * Centralise les méthodes et constantes partagées entre IRPP, ITS et IS
 * Élimine la duplication de code - Recommandation Section 6.4
 */

import { Injectable } from '@angular/core';

// Types communs
export type SituationFamiliale = 'celibataire' | 'marie' | 'divorce' | 'veuf';
export type PeriodeRevenu = 'mensuel' | 'annuel';

// Interface pour les résultats CNSS
export interface CnssResult {
  baseMensuelle: number;
  baseAnnuelle: number;
  retenueMensuelle: number;
  retenueAnnuelle: number;
  plafondApplique: boolean;
}

// Interface pour les résultats frais professionnels
export interface FraisProResult {
  baseApresCnss: number;
  fraisProfessionnels: number;
  revenuNetImposable: number;
}

// Interface pour la configuration fiscale
export interface FiscalParams {
  cnss: {
    taux: number;
    plafondMensuel: number;
  };
  fraisPro: {
    taux: number;
  };
  quotientFamilial: {
    maxParts: number;
  };
  smig: {
    mensuel: number;
    annuel: number;
  };
  irpp: {
    baremes: BaremeTranche[];
  };
  its: {
    baremes: BaremeItsTranche[];
    minimumAnnuel: number;
  };
  is: {
    tauxGeneral: number;
    tauxEtranger: number;
    tauxMinimumNormal: number;
    tauxMinimumDeficit: number;
  };
}

export interface BaremeTranche {
  min: number;
  max: number | null;
  taux: number;
}

export interface BaremeItsTranche extends BaremeTranche {
  forfait?: number;
}

// Configuration fiscale 2026 - Externalisée pour faciliter les mises à jour
export const FISCAL_PARAMS_2026: FiscalParams = {
  // CNSS - Article 40 CGI
  cnss: {
    taux: 0.04, // 4%
    plafondMensuel: 1_200_000, // 1 200 000 FCFA
  },

  // Frais professionnels - Article 41 CGI
  fraisPro: {
    taux: 0.20, // 20%
  },

  // Quotient familial - Article 91 CGI
  quotientFamilial: {
    maxParts: 6.5,
  },

  // SMIG - Décret n°2024-2762 du 20 novembre 2024
  smig: {
    mensuel: 70_400, // 70 400 FCFA/mois
    annuel: 70_400 * 12, // 844 800 FCFA/an
  },

  // Barème IRPP - Article 95 CGI
  irpp: {
    baremes: [
      { min: 0, max: 464_000, taux: 0.01 },
      { min: 464_000, max: 1_000_000, taux: 0.10 },
      { min: 1_000_000, max: 3_000_000, taux: 0.25 },
      { min: 3_000_000, max: null, taux: 0.40 },
    ],
  },

  // Barème ITS 2026 - Article 116 CGI
  its: {
    baremes: [
      { min: 0, max: 615_000, taux: 0, forfait: 1_200 },
      { min: 615_000, max: 1_500_000, taux: 0.10 },
      { min: 1_500_000, max: 3_500_000, taux: 0.15 },
      { min: 3_500_000, max: 5_000_000, taux: 0.20 },
      { min: 5_000_000, max: null, taux: 0.30 },
    ],
    minimumAnnuel: 1_200, // 1 200 FCFA
  },

  // IS - Articles 86A et 86B CGI
  is: {
    tauxGeneral: 0.25, // 25%
    tauxEtranger: 0.33, // 33%
    tauxMinimumNormal: 0.01, // 1%
    tauxMinimumDeficit: 0.02, // 2%
  },
};

@Injectable({ providedIn: 'root' })
export class FiscalCommonService {
  private params: FiscalParams = FISCAL_PARAMS_2026;

  /**
   * Permet de mettre à jour les paramètres fiscaux (pour versions futures)
   */
  setParams(params: FiscalParams): void {
    this.params = params;
  }

  /**
   * Récupère les paramètres fiscaux actuels
   */
  getParams(): FiscalParams {
    return this.params;
  }

  /**
   * Calcule la retenue CNSS selon l'Article 40 du CGI
   * 4% plafonné à 1 200 000 FCFA mensuel
   */
  calculateCNSS(revenuBrutMensuel: number): CnssResult {
    const { taux, plafondMensuel } = this.params.cnss;

    const baseMensuelle = Math.min(revenuBrutMensuel, plafondMensuel);
    const retenueMensuelle = baseMensuelle * taux;
    const plafondApplique = revenuBrutMensuel > plafondMensuel;

    return {
      baseMensuelle,
      baseAnnuelle: baseMensuelle * 12,
      retenueMensuelle,
      retenueAnnuelle: retenueMensuelle * 12,
      plafondApplique,
    };
  }

  /**
   * Calcule les frais professionnels selon l'Article 41 du CGI
   * 20% de la base après CNSS
   */
  calculateFraisPro(revenuBrutAnnuel: number, retenueCnssAnnuelle: number): FraisProResult {
    const baseApresCnss = revenuBrutAnnuel - retenueCnssAnnuelle;
    const fraisProfessionnels = baseApresCnss * this.params.fraisPro.taux;
    const revenuNetImposable = baseApresCnss - fraisProfessionnels;

    return {
      baseApresCnss,
      fraisProfessionnels,
      revenuNetImposable,
    };
  }

  /**
   * Calcule le quotient familial selon l'Article 91 du CGI
   */
  calculateQuotient(
    situation: SituationFamiliale,
    nombreEnfants: number | null,
    appliquerCharge: boolean = true
  ): number {
    // Si pas d'application des charges de famille (ITS sans exception)
    if (!appliquerCharge) {
      return 1;
    }

    const enfants = Math.max(0, nombreEnfants || 0);

    // Parts de base selon situation
    let partsBase: number;
    if (situation === 'marie') {
      partsBase = 2;
    } else if (situation === 'veuf' && enfants > 0) {
      partsBase = 2; // Veuf avec enfants traité comme marié
    } else {
      partsBase = 1; // Célibataire, divorcé, veuf sans enfant
    }

    // Ajout des parts pour enfants
    let partsEnfants: number;
    if (situation === 'celibataire' || situation === 'divorce') {
      // Célibataire/divorcé: 1ère enfant = +1 part, puis +0.5 par enfant
      if (enfants === 0) {
        partsEnfants = 0;
      } else {
        partsEnfants = 1 + (enfants - 1) * 0.5;
      }
    } else {
      // Marié/veuf: +0.5 par enfant
      partsEnfants = enfants * 0.5;
    }

    const totalParts = partsBase + partsEnfants;

    // Maximum selon configuration
    return Math.min(totalParts, this.params.quotientFamilial.maxParts);
  }

  /**
   * Applique un barème progressif à un revenu par part
   */
  applyBareme(
    revenuParPart: number,
    baremes: BaremeTranche[]
  ): { impotTotal: number; details: { tranche: string; taux: number; base: number; impot: number }[] } {
    const details: { tranche: string; taux: number; base: number; impot: number }[] = [];
    let impotTotal = 0;
    let revenuRestant = revenuParPart;

    for (const tranche of baremes) {
      if (revenuRestant <= 0) break;

      const limiteHaute = tranche.max ?? Infinity;
      const largeurTranche = limiteHaute - tranche.min;
      const baseImposable = Math.min(revenuRestant, largeurTranche);
      const impot = baseImposable * tranche.taux;

      details.push({
        tranche: tranche.max
          ? `${this.formatMontant(tranche.min)} - ${this.formatMontant(tranche.max)}`
          : `> ${this.formatMontant(tranche.min)}`,
        taux: tranche.taux * 100,
        base: baseImposable,
        impot,
      });

      impotTotal += impot;
      revenuRestant -= baseImposable;
    }

    return { impotTotal, details };
  }

  /**
   * Applique le barème ITS avec forfait pour la première tranche
   */
  applyBaremeIts(
    revenuParPart: number,
    baremes: BaremeItsTranche[]
  ): { impotTotal: number; details: { tranche: string; tauxAffiche: string; taux: number; base: number; impot: number }[] } {
    const details: { tranche: string; tauxAffiche: string; taux: number; base: number; impot: number }[] = [];
    let impotTotal = 0;
    let revenuRestant = revenuParPart;

    for (const tranche of baremes) {
      if (revenuRestant <= 0) break;

      const limiteHaute = tranche.max ?? Infinity;
      const largeurTranche = limiteHaute - tranche.min;
      const baseImposable = Math.min(revenuRestant, largeurTranche);

      let impot: number;
      let tauxAffiche: string;

      if (tranche.forfait !== undefined) {
        impot = tranche.forfait;
        tauxAffiche = `${this.formatMontant(tranche.forfait)} (forfait)`;
      } else {
        impot = baseImposable * tranche.taux;
        tauxAffiche = `${tranche.taux * 100}%`;
      }

      details.push({
        tranche: tranche.max
          ? `${this.formatMontant(tranche.min)} - ${this.formatMontant(tranche.max)}`
          : `> ${this.formatMontant(tranche.min)}`,
        tauxAffiche,
        taux: tranche.taux * 100,
        base: baseImposable,
        impot,
      });

      impotTotal += impot;
      revenuRestant -= baseImposable;
    }

    return { impotTotal, details };
  }

  /**
   * Calcule le taux effectif d'imposition
   */
  calculateTauxEffectif(impot: number, revenuNetImposable: number): number {
    return revenuNetImposable > 0 ? (impot / revenuNetImposable) * 100 : 0;
  }

  /**
   * Annualise un revenu selon la période
   */
  annualizeRevenu(montant: number, periode: PeriodeRevenu): { annuel: number; mensuel: number } {
    const annuel = periode === 'mensuel' ? montant * 12 : montant;
    const mensuel = annuel / 12;
    return { annuel, mensuel };
  }

  /**
   * Vérifie si le salaire est inférieur au SMIG
   */
  isUnderSmig(revenuBrutAnnuel: number): boolean {
    return revenuBrutAnnuel < this.params.smig.annuel;
  }

  /**
   * Formate un montant en FCFA
   */
  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  }

  /**
   * Arrondit un montant à l'entier
   */
  round(montant: number): number {
    return Math.round(montant);
  }
}
