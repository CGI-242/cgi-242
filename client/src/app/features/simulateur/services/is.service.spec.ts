/**
 * Tests unitaires pour IsService
 * Vérifie le calcul de l'IS selon les Articles 86A et 86B du CGI Congo 2026
 */

import { TestBed } from '@angular/core/testing';
import { IsService } from './is.service';
import { FiscalCommonService } from './fiscal-common.service';

describe('IsService', () => {
  let service: IsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IsService, FiscalCommonService],
    });
    service = TestBed.inject(IsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculerIS', () => {
    describe('Base minimum de perception', () => {
      it('devrait calculer la base minimum de perception', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: 5_000_000,
          produitsHAO: 2_000_000,
          retenuesLiberatoires: 1_000_000,
          beneficeImposable: 20_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        // Base = 100M + 5M + 2M - 1M = 106M
        expect(result.baseMinimumPerception).toBe(106_000_000);
      });

      it('devrait gérer les valeurs null', () => {
        const result = service.calculerIS({
          produitsExploitation: 50_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 10_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.baseMinimumPerception).toBe(50_000_000);
      });
    });

    describe('Taux minimum de perception', () => {
      it('devrait appliquer 1% en cas normal', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 20_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.tauxMinimum).toBe(1); // 1%
        expect(result.minimumPerceptionAnnuel).toBe(1_000_000); // 1% de 100M
      });

      it('devrait appliquer 2% en cas de déficit consécutif', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: null,
          deficitConsecutif: true,
          typeContribuable: 'general',
        });

        expect(result.tauxMinimum).toBe(2); // 2%
        expect(result.deficitConsecutif).toBe(true);
        expect(result.minimumPerceptionAnnuel).toBe(2_000_000); // 2% de 100M
      });
    });

    describe('Acomptes trimestriels', () => {
      it('devrait calculer 4 acomptes égaux', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 20_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.acomptes.length).toBe(4);

        const montantAcompte = result.minimumPerceptionAnnuel / 4;
        result.acomptes.forEach(acompte => {
          expect(acompte.montant).toBe(Math.round(montantAcompte));
        });
      });

      it('devrait avoir les bonnes échéances', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 20_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.acomptes[0].echeance).toBe('15 mars');
        expect(result.acomptes[1].echeance).toBe('15 juin');
        expect(result.acomptes[2].echeance).toBe('15 septembre');
        expect(result.acomptes[3].echeance).toBe('15 décembre');
      });
    });

    describe('Taux IS', () => {
      it('devrait appliquer 25% pour contribuable général', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 20_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.tauxIS).toBe(25);
        expect(result.typeContribuable).toBe('general');
        expect(result.isCalcule).toBe(5_000_000); // 25% de 20M
      });

      it('devrait appliquer 33% pour personne morale étrangère', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 30_000_000,
          deficitConsecutif: false,
          typeContribuable: 'etranger',
        });

        expect(result.tauxIS).toBe(33);
        expect(result.typeContribuable).toBe('etranger');
        expect(result.isCalcule).toBe(9_900_000); // 33% de 30M
      });
    });

    describe('IS dû (maximum IS/minimum)', () => {
      it('devrait retenir l\'IS si supérieur au minimum', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000, // Minimum: 1M
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 20_000_000, // IS: 5M
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.isCalcule).toBe(5_000_000);
        expect(result.minimumPerceptionAnnuel).toBe(1_000_000);
        expect(result.isDu).toBe(5_000_000);
        expect(result.minimumApplique).toBe(false);
      });

      it('devrait retenir le minimum si supérieur à l\'IS', () => {
        const result = service.calculerIS({
          produitsExploitation: 500_000_000, // Minimum: 5M
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 10_000_000, // IS: 2.5M
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.isCalcule).toBe(2_500_000);
        expect(result.minimumPerceptionAnnuel).toBe(5_000_000);
        expect(result.isDu).toBe(5_000_000);
        expect(result.minimumApplique).toBe(true);
      });
    });

    describe('Déductibilité du minimum', () => {
      it('devrait permettre 100% de déduction avec taux 1%', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 20_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.minimumDeductible).toBe(result.minimumPerceptionAnnuel);
      });

      it('devrait permettre 50% de déduction avec taux 2%', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 20_000_000,
          deficitConsecutif: true,
          typeContribuable: 'general',
        });

        expect(result.minimumDeductible).toBe(result.minimumPerceptionAnnuel / 2);
      });
    });

    describe('Solde dû après déduction', () => {
      it('devrait calculer le solde après déduction du minimum', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 20_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        // IS calculé: 5M, Minimum déductible: 1M
        // Solde: max(0, 5M - 1M) = 4M
        expect(result.soldeDuApresDeduction).toBe(4_000_000);
      });

      it('devrait retourner 0 si IS inférieur au minimum déductible', () => {
        const result = service.calculerIS({
          produitsExploitation: 500_000_000, // Minimum: 5M
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 2_000_000, // IS: 500k
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.soldeDuApresDeduction).toBe(0);
      });
    });

    describe('Version', () => {
      it('devrait retourner la version 2026 par défaut', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 20_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.version).toBe('2026');
      });

      it('devrait accepter une version spécifiée', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 20_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
          version: '2025',
        });

        expect(result.version).toBe('2025');
      });
    });

    describe('Cas limites', () => {
      it('devrait gérer un bénéfice nul', () => {
        const result = service.calculerIS({
          produitsExploitation: 100_000_000,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 0,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.isCalcule).toBe(0);
        expect(result.isDu).toBe(result.minimumPerceptionAnnuel);
      });

      it('devrait gérer des produits nuls', () => {
        const result = service.calculerIS({
          produitsExploitation: 0,
          produitsFinanciers: null,
          produitsHAO: null,
          retenuesLiberatoires: null,
          beneficeImposable: 10_000_000,
          deficitConsecutif: false,
          typeContribuable: 'general',
        });

        expect(result.baseMinimumPerception).toBe(0);
        expect(result.minimumPerceptionAnnuel).toBe(0);
      });
    });
  });

  describe('formatMontant', () => {
    it('devrait formater un montant en FCFA', () => {
      const formatted = service.formatMontant(100_000_000);
      expect(formatted).toContain('FCFA');
    });
  });
});
