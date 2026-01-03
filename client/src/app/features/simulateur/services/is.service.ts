import { Injectable, inject } from '@angular/core';
import { FiscalCommonService } from './fiscal-common.service';

// Types pour le calcul IS - Art. 86A et 86B CGI 2026
export interface IsInput {
  // Base imposable du minimum de perception
  produitsExploitation: number | null;
  produitsFinanciers: number | null;
  produitsHAO: number | null; // Hors Activité Ordinaire
  retenuesLiberatoires: number | null; // À déduire de la base

  // Bénéfice imposable pour calcul IS
  beneficeImposable: number | null;

  // Situation déficitaire
  deficitConsecutif: boolean; // 2 exercices consécutifs déficitaires = taux 2%

  // Type de contribuable (Art. 86A)
  typeContribuable: 'general' | 'etranger'; // 25% ou 33%

  // Version CGI
  version?: '2025' | '2026';
}

export interface IsResult {
  // Base minimum de perception
  baseMinimumPerception: number;

  // Taux appliqué
  tauxMinimum: number;
  deficitConsecutif: boolean;

  // Minimum de perception annuel
  minimumPerceptionAnnuel: number;

  // 4 acomptes trimestriels
  acomptes: {
    echeance: string;
    montant: number;
  }[];

  // Calcul IS standard (25% ou 33% - Art. 86A)
  tauxIS: number;
  typeContribuable: 'general' | 'etranger';
  isCalcule: number;

  // IS à payer (max entre IS calculé et minimum)
  isDu: number;
  minimumApplique: boolean;

  // Déductibilité du minimum sur l'IS
  minimumDeductible: number;
  soldeDuApresDeduction: number;

  // Version
  version: string;
}

// Constantes CGI 2026 - Art. 86A et 86B
const TAUX_IS_GENERAL = 0.25; // 25% - Art. 86A al. 2
const TAUX_IS_ETRANGER = 0.33; // 33% - Art. 86A al. 3b (personnes morales étrangères)
const TAUX_MINIMUM_NORMAL = 0.01; // 1% - Art. 86B al. 3
const TAUX_MINIMUM_DEFICIT = 0.02; // 2% si déficit 2 exercices consécutifs

// Échéances des 4 acomptes
const ECHEANCES_ACOMPTES = [
  '15 mars',
  '15 juin',
  '15 septembre',
  '15 décembre'
];

@Injectable({ providedIn: 'root' })
export class IsService {
  private readonly fiscalCommon = inject(FiscalCommonService);

  /**
   * Calcule l'IS et le minimum de perception selon Art. 86B CGI 2026
   * Utilise les paramètres du FiscalCommonService
   */
  calculerIS(input: IsInput): IsResult {
    const params = this.fiscalCommon.getParams();
    const version = input.version || '2026';

    // === BASE MINIMUM DE PERCEPTION (Art. 86B al. 2) ===
    // Produits d'exploitation + Produits financiers + Produits HAO
    // - Retenues à la source libératoires
    const produitsExploitation = input.produitsExploitation || 0;
    const produitsFinanciers = input.produitsFinanciers || 0;
    const produitsHAO = input.produitsHAO || 0;
    const retenuesLiberatoires = input.retenuesLiberatoires || 0;

    const baseMinimumPerception = produitsExploitation + produitsFinanciers + produitsHAO - retenuesLiberatoires;

    // === TAUX MINIMUM (Art. 86B al. 3) ===
    // 1% normal, 2% si déficit 2 exercices consécutifs
    const tauxMinimum = input.deficitConsecutif ? TAUX_MINIMUM_DEFICIT : TAUX_MINIMUM_NORMAL;

    // === MINIMUM DE PERCEPTION ANNUEL ===
    const minimumPerceptionAnnuel = Math.max(0, baseMinimumPerception * tauxMinimum);

    // === 4 ACOMPTES (Art. 86B al. 5) ===
    const montantAcompte = minimumPerceptionAnnuel / 4;
    const acomptes = ECHEANCES_ACOMPTES.map(echeance => ({
      echeance,
      montant: Math.round(montantAcompte)
    }));

    // === IS CALCULÉ (Art. 86A) ===
    // 25% général, 33% personnes morales étrangères
    const beneficeImposable = input.beneficeImposable || 0;
    const tauxIS = input.typeContribuable === 'etranger' ? TAUX_IS_ETRANGER : TAUX_IS_GENERAL;
    const isCalcule = beneficeImposable * tauxIS;

    // === IS DÛ ===
    const minimumApplique = isCalcule < minimumPerceptionAnnuel && minimumPerceptionAnnuel > 0;
    const isDu = Math.max(isCalcule, minimumPerceptionAnnuel);

    // === DÉDUCTIBILITÉ (Art. 86B al. 6) ===
    // Taux 1% : 100% déductible
    // Taux 2% : 50% déductible
    let minimumDeductible: number;
    if (input.deficitConsecutif) {
      minimumDeductible = minimumPerceptionAnnuel / 2; // 50% si taux 2%
    } else {
      minimumDeductible = minimumPerceptionAnnuel; // 100% si taux 1%
    }

    // Solde dû après déduction du minimum
    const soldeDuApresDeduction = Math.max(0, isCalcule - minimumDeductible);

    return {
      baseMinimumPerception: Math.round(baseMinimumPerception),
      tauxMinimum: tauxMinimum * 100,
      deficitConsecutif: input.deficitConsecutif,
      minimumPerceptionAnnuel: Math.round(minimumPerceptionAnnuel),
      acomptes,
      tauxIS: tauxIS * 100,
      typeContribuable: input.typeContribuable || 'general',
      isCalcule: Math.round(isCalcule),
      isDu: Math.round(isDu),
      minimumApplique,
      minimumDeductible: Math.round(minimumDeductible),
      soldeDuApresDeduction: Math.round(soldeDuApresDeduction),
      version,
    };
  }

  /**
   * Formate un montant en FCFA - délègue au service commun
   */
  formatMontant(montant: number): string {
    return this.fiscalCommon.formatMontant(montant);
  }
}
