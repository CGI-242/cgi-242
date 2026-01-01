import { Injectable } from '@angular/core';

// Types pour le calcul ITS 2026
export type SituationFamiliale = 'celibataire' | 'marie' | 'divorce' | 'veuf';
export type PeriodeRevenu = 'mensuel' | 'annuel';

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

// Constantes du CGI Congo 2026 - Article 116
const TAUX_CNSS = 0.04; // 4% - Article 40
const PLAFOND_CNSS_MENSUEL = 1_200_000; // 1 200 000 FCFA - Article 40
const TAUX_FRAIS_PRO = 0.20; // 20% - Article 41

// SMIG Congo (salaire minimum interprofessionnel garanti)
// Décret n°2024-2762 du 20 novembre 2024 - En vigueur depuis le 1er janvier 2025
const SMIG_MENSUEL = 70_400; // 70 400 FCFA/mois
const SMIG_ANNUEL = SMIG_MENSUEL * 12; // 844 800 FCFA/an

// Minimum ITS annuel si salaire < SMIG
const MINIMUM_ITS_ANNUEL = 1_200; // 1 200 FCFA - Article 116

// Barème progressif ITS 2026 - Article 116 (nouveau barème)
// Note: Première tranche = forfait fixe de 1 200 FCFA
const BAREME_ITS_2026: { min: number; max: number | null; taux: number; forfait?: number }[] = [
  { min: 0, max: 615_000, taux: 0, forfait: 1_200 },       // Forfait 1 200 FCFA
  { min: 615_000, max: 1_500_000, taux: 0.10 },            // 10%
  { min: 1_500_000, max: 3_500_000, taux: 0.15 },          // 15%
  { min: 3_500_000, max: 5_000_000, taux: 0.20 },          // 20%
  { min: 5_000_000, max: null, taux: 0.30 },               // 30%
];

@Injectable({ providedIn: 'root' })
export class ItsService {

  /**
   * Calcule le nombre de parts fiscales selon le CGI
   * Note: ITS 2026 n'applique normalement pas de charge de famille,
   * mais une exception est autorisée par la DGI en 2026
   */
  calculerNombreParts(situation: SituationFamiliale, nombreEnfants: number | null, appliquerCharge: boolean): number {
    // Si pas d'application des charges de famille, retourner 1 part
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

    // Maximum 6.5 parts
    return Math.min(totalParts, 6.5);
  }

  /**
   * Calcule l'ITS selon les règles du CGI Congo 2026 - Article 116
   */
  calculerIts(input: ItsInput): ItsResult {
    // === ÉTAPE 1: Revenu brut annualisé ===
    const salaireBrut = (input.salaireBrut || 0) + (input.avantagesEnNature || 0) + (input.primes || 0);
    const revenuBrutMensuel = salaireBrut;
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

    // === ÉTAPE 6: Quotient familial (Exception 2026) ===
    // Note: ITS n'applique normalement pas les charges de famille,
    // mais exception autorisée par la DGI en 2026
    const nombreParts = this.calculerNombreParts(
      input.situationFamiliale,
      input.nombreEnfants,
      input.appliquerChargeFamille
    );
    const revenuParPart = revenuNetImposable / nombreParts;

    // === ÉTAPE 7: Application du barème progressif ITS 2026 ===
    const { detailTranches, impotTotal } = this.appliquerBareme(revenuParPart);
    const itsParPart = impotTotal;

    // === ÉTAPE 8: ITS total ===
    let itsAnnuel = itsParPart * nombreParts;

    // Vérifier le minimum ITS si salaire brut < SMIG
    const smigApplique = revenuBrutAnnuel < SMIG_ANNUEL;
    let minimumApplique = false;

    if (smigApplique && itsAnnuel < MINIMUM_ITS_ANNUEL) {
      itsAnnuel = MINIMUM_ITS_ANNUEL;
      minimumApplique = true;
    }

    const itsMensuel = itsAnnuel / 12;

    // Taux effectif d'imposition
    const tauxEffectif = revenuNetImposable > 0
      ? (itsAnnuel / revenuNetImposable) * 100
      : 0;

    // Salaire net après ITS
    const salaireNetAnnuel = revenuBrutAnnuel - retenueCnssAnnuelle - itsAnnuel;
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
      chargeFamilleAppliquee: input.appliquerChargeFamille,
      detailTranches,
      itsParPart,
      itsAnnuel: Math.round(itsAnnuel),
      itsMensuel: Math.round(itsMensuel),
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
   * Note: La première tranche est un forfait fixe de 1 200 FCFA
   */
  private appliquerBareme(revenuParPart: number): { detailTranches: TrancheDetail[]; impotTotal: number } {
    const detailTranches: TrancheDetail[] = [];
    let impotTotal = 0;
    let revenuRestant = revenuParPart;

    for (const tranche of BAREME_ITS_2026) {
      if (revenuRestant <= 0) break;

      const limiteHaute = tranche.max ?? Infinity;
      const largeurTranche = limiteHaute - tranche.min;
      const baseImposable = Math.min(revenuRestant, largeurTranche);

      let impot: number;
      let tauxAffiche: string;

      if (tranche.forfait !== undefined) {
        // Première tranche: forfait fixe de 1 200 FCFA
        impot = tranche.forfait;
        tauxAffiche = `${this.formatMontant(tranche.forfait)} (forfait)`;
      } else {
        impot = baseImposable * tranche.taux;
        tauxAffiche = `${tranche.taux * 100}%`;
      }

      detailTranches.push({
        tranche: tranche.max
          ? `${this.formatMontant(tranche.min)} - ${this.formatMontant(tranche.max)}`
          : `> ${this.formatMontant(tranche.min)}`,
        min: tranche.min,
        max: tranche.max,
        taux: tranche.taux * 100,
        tauxAffiche,
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

  /**
   * Compare ITS 2026 vs IRPP 2025 pour un même salaire
   */
  comparerAvecIrpp(salaireBrutMensuel: number, situation: SituationFamiliale, enfants: number): {
    its2026: number;
    irpp2025: number;
    difference: number;
    pourcentageEconomie: number;
  } {
    // Calcul ITS 2026 (avec charges de famille pour comparaison equitable)
    const resultIts = this.calculerIts({
      salaireBrut: salaireBrutMensuel,
      periode: 'mensuel',
      situationFamiliale: situation,
      nombreEnfants: enfants,
      appliquerChargeFamille: true, // Pour comparaison avec IRPP qui applique toujours les charges
    });

    // Simulation IRPP 2025 (barème ancien)
    const baremeIrpp = [
      { min: 0, max: 464_000, taux: 0.01 },
      { min: 464_000, max: 1_000_000, taux: 0.10 },
      { min: 1_000_000, max: 3_000_000, taux: 0.25 },
      { min: 3_000_000, max: null, taux: 0.40 },
    ];

    let irppParPart = 0;
    let revenuRestant = resultIts.revenuParPart;

    for (const tranche of baremeIrpp) {
      if (revenuRestant <= 0) break;
      const limiteHaute = tranche.max ?? Infinity;
      const largeurTranche = limiteHaute - tranche.min;
      const baseImposable = Math.min(revenuRestant, largeurTranche);
      irppParPart += baseImposable * tranche.taux;
      revenuRestant -= baseImposable;
    }

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
