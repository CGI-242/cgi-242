import { Injectable } from '@angular/core';

// Types pour le calcul IRPP
export type SituationFamiliale = 'celibataire' | 'marie' | 'divorce' | 'veuf';
export type PeriodeRevenu = 'mensuel' | 'annuel';

export interface IrppInput {
  // Revenus
  salaireBrut: number | null;
  periode: PeriodeRevenu;

  // Situation familiale
  situationFamiliale: SituationFamiliale;
  nombreEnfants: number | null;
}

export interface IrppResult {
  // Étape 1: Revenu brut
  revenuBrutMensuel: number;
  revenuBrutAnnuel: number;

  // Étape 2: CNSS
  baseCnss: number;
  retenueCnss: number;
  plafondCnssApplique: boolean;

  // Étape 3: Base après CNSS
  baseApresCnss: number;

  // Étape 4: Frais professionnels
  fraisProfessionnels: number;

  // Étape 5: Revenu net imposable
  revenuNetImposable: number;

  // Étape 6: Quotient familial
  nombreParts: number;
  revenuParPart: number;

  // Étape 7: Calcul par tranches
  detailTranches: TrancheDetail[];
  irppParPart: number;

  // Étape 8: IRPP total
  irppAnnuel: number;
  irppMensuel: number;

  // Taux effectif
  tauxEffectif: number;

  // Salaire net après IRPP
  salaireNetAnnuel: number;
  salaireNetMensuel: number;
}

export interface TrancheDetail {
  tranche: string;
  min: number;
  max: number | null;
  taux: number;
  baseImposable: number;
  impot: number;
}

// Constantes du CGI Congo
const TAUX_CNSS = 0.04; // 4% - Article 40
const PLAFOND_CNSS_MENSUEL = 1_200_000; // 1 200 000 FCFA - Article 40
const TAUX_FRAIS_PRO = 0.20; // 20% - Article 41

// Barème progressif - Article 95
const BAREME_IRPP: { min: number; max: number | null; taux: number }[] = [
  { min: 0, max: 464_000, taux: 0.01 },
  { min: 464_000, max: 1_000_000, taux: 0.10 },
  { min: 1_000_000, max: 3_000_000, taux: 0.25 },
  { min: 3_000_000, max: null, taux: 0.40 },
];

@Injectable({ providedIn: 'root' })
export class IrppService {

  /**
   * Calcule le nombre de parts fiscales selon l'article 91 du CGI
   */
  calculerNombreParts(situation: SituationFamiliale, nombreEnfants: number | null): number {
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

    // Maximum 6.5 parts
    return Math.min(totalParts, 6.5);
  }

  /**
   * Calcule l'IRPP selon les règles du CGI Congo
   */
  calculerIrpp(input: IrppInput): IrppResult {
    // === ÉTAPE 1: Revenu brut annualisé ===
    const revenuBrutMensuel = input.salaireBrut || 0;
    const revenuBrutAnnuel = input.periode === 'mensuel'
      ? revenuBrutMensuel * 12
      : revenuBrutMensuel;
    const revenuBrutMensuelEffectif = revenuBrutAnnuel / 12;

    // === ÉTAPE 2: Retenue CNSS (Article 40) ===
    // 4% plafonné à 1 200 000 FCFA mensuel
    const baseCnssMensuelle = Math.min(revenuBrutMensuelEffectif, PLAFOND_CNSS_MENSUEL);
    const retenueCnssMensuelle = baseCnssMensuelle * TAUX_CNSS;
    const retenueCnssAnnuelle = retenueCnssMensuelle * 12;
    const plafondApplique = revenuBrutMensuelEffectif > PLAFOND_CNSS_MENSUEL;

    // === ÉTAPE 3: Base après CNSS ===
    const baseApresCnss = revenuBrutAnnuel - retenueCnssAnnuelle;

    // === ÉTAPE 4: Frais professionnels (Article 41) ===
    // 20% de la base après CNSS
    const fraisProfessionnels = baseApresCnss * TAUX_FRAIS_PRO;

    // === ÉTAPE 5: Revenu net imposable ===
    const revenuNetImposable = baseApresCnss - fraisProfessionnels;

    // === ÉTAPE 6: Quotient familial (Article 91) ===
    const nombreParts = this.calculerNombreParts(input.situationFamiliale, input.nombreEnfants);
    const revenuParPart = revenuNetImposable / nombreParts;

    // === ÉTAPE 7: Application du barème progressif (Article 95) ===
    const { detailTranches, impotTotal } = this.appliquerBareme(revenuParPart);
    const irppParPart = impotTotal;

    // === ÉTAPE 8: IRPP total ===
    const irppAnnuel = irppParPart * nombreParts;
    const irppMensuel = irppAnnuel / 12;

    // Taux effectif d'imposition
    const tauxEffectif = revenuNetImposable > 0
      ? (irppAnnuel / revenuNetImposable) * 100
      : 0;

    // Salaire net après IRPP
    const salaireNetAnnuel = revenuBrutAnnuel - retenueCnssAnnuelle - irppAnnuel;
    const salaireNetMensuel = salaireNetAnnuel / 12;

    return {
      revenuBrutMensuel: revenuBrutMensuelEffectif,
      revenuBrutAnnuel,
      baseCnss: baseCnssMensuelle * 12,
      retenueCnss: retenueCnssAnnuelle,
      plafondCnssApplique: plafondApplique,
      baseApresCnss,
      fraisProfessionnels,
      revenuNetImposable,
      nombreParts,
      revenuParPart,
      detailTranches,
      irppParPart,
      irppAnnuel,
      irppMensuel,
      tauxEffectif,
      salaireNetAnnuel,
      salaireNetMensuel,
    };
  }

  /**
   * Applique le barème progressif de l'article 95
   */
  private appliquerBareme(revenuParPart: number): { detailTranches: TrancheDetail[]; impotTotal: number } {
    const detailTranches: TrancheDetail[] = [];
    let impotTotal = 0;
    let revenuRestant = revenuParPart;

    for (const tranche of BAREME_IRPP) {
      if (revenuRestant <= 0) break;

      const limiteHaute = tranche.max ?? Infinity;
      const largeurTranche = limiteHaute - tranche.min;
      const baseImposable = Math.min(revenuRestant, largeurTranche);
      const impot = baseImposable * tranche.taux;

      detailTranches.push({
        tranche: tranche.max
          ? `${this.formatMontant(tranche.min)} - ${this.formatMontant(tranche.max)}`
          : `> ${this.formatMontant(tranche.min)}`,
        min: tranche.min,
        max: tranche.max,
        taux: tranche.taux * 100,
        baseImposable,
        impot,
      });

      impotTotal += impot;
      revenuRestant -= baseImposable;
    }

    return { detailTranches, impotTotal };
  }

  /**
   * Formate un montant en FCFA
   */
  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  }
}
