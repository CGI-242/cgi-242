import { Injectable, inject } from '@angular/core';
import {
  FiscalCommonService,
  SituationFamiliale,
  PeriodeRevenu,
  FISCAL_PARAMS_2026,
} from './fiscal-common.service';

// Ré-exporter les types pour compatibilité
export { SituationFamiliale, PeriodeRevenu } from './fiscal-common.service';

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

@Injectable({ providedIn: 'root' })
export class IrppService {
  private readonly fiscalCommon = inject(FiscalCommonService);

  /**
   * Calcule le nombre de parts fiscales selon l'article 91 du CGI
   * Délègue au service commun
   */
  calculerNombreParts(situation: SituationFamiliale, nombreEnfants: number | null): number {
    return this.fiscalCommon.calculateQuotient(situation, nombreEnfants, true);
  }

  /**
   * Calcule l'IRPP selon les règles du CGI Congo
   * Utilise FiscalCommonService pour les calculs partagés
   */
  calculerIrpp(input: IrppInput): IrppResult {
    // === ÉTAPE 1: Revenu brut annualisé ===
    const { annuel: revenuBrutAnnuel, mensuel: revenuBrutMensuelEffectif } =
      this.fiscalCommon.annualizeRevenu(input.salaireBrut || 0, input.periode);

    // === ÉTAPE 2: Retenue CNSS (Article 40) - via service commun ===
    const cnssResult = this.fiscalCommon.calculateCNSS(revenuBrutMensuelEffectif);

    // === ÉTAPES 3-5: Frais professionnels et revenu net - via service commun ===
    const fraisProResult = this.fiscalCommon.calculateFraisPro(
      revenuBrutAnnuel,
      cnssResult.retenueAnnuelle
    );

    // === ÉTAPE 6: Quotient familial (Article 91) - via service commun ===
    const nombreParts = this.fiscalCommon.calculateQuotient(
      input.situationFamiliale,
      input.nombreEnfants,
      true
    );
    const revenuParPart = fraisProResult.revenuNetImposable / nombreParts;

    // === ÉTAPE 7: Application du barème progressif (Article 95) ===
    const { detailTranches, impotTotal } = this.appliquerBareme(revenuParPart);
    const irppParPart = impotTotal;

    // === ÉTAPE 8: IRPP total ===
    const irppAnnuel = irppParPart * nombreParts;
    const irppMensuel = irppAnnuel / 12;

    // Taux effectif d'imposition - via service commun
    const tauxEffectif = this.fiscalCommon.calculateTauxEffectif(
      irppAnnuel,
      fraisProResult.revenuNetImposable
    );

    // Salaire net après IRPP
    const salaireNetAnnuel = revenuBrutAnnuel - cnssResult.retenueAnnuelle - irppAnnuel;
    const salaireNetMensuel = salaireNetAnnuel / 12;

    return {
      revenuBrutMensuel: revenuBrutMensuelEffectif,
      revenuBrutAnnuel,
      baseCnss: cnssResult.baseAnnuelle,
      retenueCnss: cnssResult.retenueAnnuelle,
      plafondCnssApplique: cnssResult.plafondApplique,
      baseApresCnss: fraisProResult.baseApresCnss,
      fraisProfessionnels: fraisProResult.fraisProfessionnels,
      revenuNetImposable: fraisProResult.revenuNetImposable,
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
    const params = this.fiscalCommon.getParams();
    const { impotTotal, details } = this.fiscalCommon.applyBareme(revenuParPart, params.irpp.baremes);

    const detailTranches: TrancheDetail[] = details.map((d, i) => ({
      tranche: d.tranche,
      min: params.irpp.baremes[i].min,
      max: params.irpp.baremes[i].max,
      taux: d.taux,
      baseImposable: d.base,
      impot: d.impot,
    }));

    return { detailTranches, impotTotal };
  }

  /**
   * Formate un montant en FCFA - délègue au service commun
   */
  formatMontant(montant: number): string {
    return this.fiscalCommon.formatMontant(montant);
  }
}
