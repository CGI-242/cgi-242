import { Injectable, inject } from '@angular/core';
import {
  FiscalCommonService,
  SituationFamiliale,
  PeriodeRevenu,
  BaremeItsTranche,
} from './fiscal-common.service';

// Ré-exporter les types pour compatibilité
export { SituationFamiliale, PeriodeRevenu } from './fiscal-common.service';

export interface ItsInput {
  // Revenus
  salaireBrut: number | null;
  periode: PeriodeRevenu;

  // Situation familiale
  situationFamiliale: SituationFamiliale;
  nombreEnfants: number | null;

  // Exception 2026: appliquer les charges de famille
  // Note: Par défaut ITS n'applique pas les charges, mais exception autorisée par DGI en 2026
  appliquerChargeFamille: boolean;

  // Avantages (optionnels)
  avantagesEnNature?: number | null;
  primes?: number | null;
}

export interface ItsResult {
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

  // Étape 6: Quotient familial (exception 2026)
  nombreParts: number;
  revenuParPart: number;
  chargeFamilleAppliquee: boolean;

  // Étape 7: Calcul par tranches
  detailTranches: TrancheDetail[];
  itsParPart: number;

  // Étape 8: ITS total
  itsAnnuel: number;
  itsMensuel: number;

  // Minimum ITS
  minimumApplique: boolean;
  smigApplique: boolean;

  // Taux effectif
  tauxEffectif: number;

  // Salaire net après ITS
  salaireNetAnnuel: number;
  salaireNetMensuel: number;

  // Version
  version: string;
}

export interface TrancheDetail {
  tranche: string;
  min: number;
  max: number | null;
  taux: number;
  tauxAffiche: string; // Pour afficher "1 200 FCFA" ou "10%"
  baseImposable: number;
  impot: number;
}

@Injectable({ providedIn: 'root' })
export class ItsService {
  private readonly fiscalCommon = inject(FiscalCommonService);

  /**
   * Calcule le nombre de parts fiscales selon le CGI
   * Délègue au service commun avec support du flag appliquerCharge
   */
  calculerNombreParts(situation: SituationFamiliale, nombreEnfants: number | null, appliquerCharge: boolean): number {
    return this.fiscalCommon.calculateQuotient(situation, nombreEnfants, appliquerCharge);
  }

  /**
   * Calcule l'ITS selon les règles du CGI Congo 2026 - Article 116
   * Utilise FiscalCommonService pour les calculs partagés
   */
  calculerIts(input: ItsInput): ItsResult {
    const params = this.fiscalCommon.getParams();

    // === ÉTAPE 1: Revenu brut annualisé ===
    const salaireBrut = (input.salaireBrut || 0) + (input.avantagesEnNature || 0) + (input.primes || 0);
    const { annuel: revenuBrutAnnuel, mensuel: revenuBrutMensuelEffectif } =
      this.fiscalCommon.annualizeRevenu(salaireBrut, input.periode);

    // === ÉTAPE 2: Retenue CNSS (Article 40) - via service commun ===
    const cnssResult = this.fiscalCommon.calculateCNSS(revenuBrutMensuelEffectif);

    // === ÉTAPES 3-5: Frais professionnels et revenu net - via service commun ===
    const fraisProResult = this.fiscalCommon.calculateFraisPro(
      revenuBrutAnnuel,
      cnssResult.retenueAnnuelle
    );

    // === ÉTAPE 6: Quotient familial (Exception 2026) - via service commun ===
    const nombreParts = this.fiscalCommon.calculateQuotient(
      input.situationFamiliale,
      input.nombreEnfants,
      input.appliquerChargeFamille
    );
    const revenuParPart = fraisProResult.revenuNetImposable / nombreParts;

    // === ÉTAPE 7: Application du barème progressif ITS 2026 ===
    const { detailTranches, impotTotal } = this.appliquerBareme(revenuParPart);
    const itsParPart = impotTotal;

    // === ÉTAPE 8: ITS total ===
    let itsAnnuel = itsParPart * nombreParts;

    // Vérifier le minimum ITS si salaire brut < SMIG - via service commun
    const smigApplique = this.fiscalCommon.isUnderSmig(revenuBrutAnnuel);
    let minimumApplique = false;

    if (smigApplique && itsAnnuel < params.its.minimumAnnuel) {
      itsAnnuel = params.its.minimumAnnuel;
      minimumApplique = true;
    }

    const itsMensuel = itsAnnuel / 12;

    // Taux effectif d'imposition - via service commun
    const tauxEffectif = this.fiscalCommon.calculateTauxEffectif(
      itsAnnuel,
      fraisProResult.revenuNetImposable
    );

    // Salaire net après ITS
    const salaireNetAnnuel = revenuBrutAnnuel - cnssResult.retenueAnnuelle - itsAnnuel;
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
      chargeFamilleAppliquee: input.appliquerChargeFamille,
      detailTranches,
      itsParPart,
      itsAnnuel: this.fiscalCommon.round(itsAnnuel),
      itsMensuel: this.fiscalCommon.round(itsMensuel),
      minimumApplique,
      smigApplique,
      tauxEffectif,
      salaireNetAnnuel,
      salaireNetMensuel,
      version: '2026',
    };
  }

  /**
   * Applique le barème progressif ITS 2026 - Article 116
   * Utilise le service commun pour le calcul avec forfait
   */
  private appliquerBareme(revenuParPart: number): { detailTranches: TrancheDetail[]; impotTotal: number } {
    const params = this.fiscalCommon.getParams();
    const { impotTotal, details } = this.fiscalCommon.applyBaremeIts(
      revenuParPart,
      params.its.baremes as BaremeItsTranche[]
    );

    const detailTranches: TrancheDetail[] = details.map((d, i) => ({
      tranche: d.tranche,
      min: params.its.baremes[i].min,
      max: params.its.baremes[i].max,
      taux: d.taux,
      tauxAffiche: d.tauxAffiche,
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

  /**
   * Compare ITS 2026 vs IRPP 2025 pour un même salaire
   * Utilise le service commun pour appliquer le barème IRPP
   */
  comparerAvecIrpp(salaireBrutMensuel: number, situation: SituationFamiliale, enfants: number): {
    its2026: number;
    irpp2025: number;
    difference: number;
    pourcentageEconomie: number;
  } {
    const params = this.fiscalCommon.getParams();

    // Calcul ITS 2026 (avec charges de famille pour comparaison équitable)
    const resultIts = this.calculerIts({
      salaireBrut: salaireBrutMensuel,
      periode: 'mensuel',
      situationFamiliale: situation,
      nombreEnfants: enfants,
      appliquerChargeFamille: true,
    });

    // Simulation IRPP 2025 via service commun
    const { impotTotal: irppParPart } = this.fiscalCommon.applyBareme(
      resultIts.revenuParPart,
      params.irpp.baremes
    );

    const irpp2025 = irppParPart * resultIts.nombreParts / 12; // Mensuel
    const its2026 = resultIts.itsMensuel;
    const difference = irpp2025 - its2026;
    const pourcentageEconomie = irpp2025 > 0 ? (difference / irpp2025) * 100 : 0;

    return {
      its2026,
      irpp2025,
      difference,
      pourcentageEconomie,
    };
  }
}
