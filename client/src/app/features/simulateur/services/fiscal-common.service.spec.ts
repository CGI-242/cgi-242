/**
 * Tests unitaires pour FiscalCommonService
 * Vérifie les calculs fiscaux communs: CNSS, frais pro, quotient familial
 */

import { TestBed } from '@angular/core/testing';
import { FiscalCommonService, FISCAL_PARAMS_2026 } from './fiscal-common.service';

describe('FiscalCommonService', () => {
  let service: FiscalCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FiscalCommonService],
    });
    service = TestBed.inject(FiscalCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateCNSS', () => {
    it('devrait calculer la CNSS à 4% du salaire', () => {
      const result = service.calculateCNSS(500_000);

      expect(result.baseMensuelle).toBe(500_000);
      expect(result.retenueMensuelle).toBe(20_000); // 4% de 500 000
      expect(result.plafondApplique).toBe(false);
    });

    it('devrait appliquer le plafond CNSS de 1 200 000 FCFA', () => {
      const result = service.calculateCNSS(2_000_000);

      expect(result.baseMensuelle).toBe(1_200_000); // Plafond
      expect(result.retenueMensuelle).toBe(48_000); // 4% de 1 200 000
      expect(result.plafondApplique).toBe(true);
    });

    it('devrait calculer correctement les valeurs annuelles', () => {
      const result = service.calculateCNSS(1_000_000);

      expect(result.baseAnnuelle).toBe(12_000_000);
      expect(result.retenueAnnuelle).toBe(480_000);
    });

    it('devrait retourner 0 pour un salaire nul', () => {
      const result = service.calculateCNSS(0);

      expect(result.baseMensuelle).toBe(0);
      expect(result.retenueMensuelle).toBe(0);
    });
  });

  describe('calculateFraisPro', () => {
    it('devrait calculer les frais professionnels à 20%', () => {
      const result = service.calculateFraisPro(12_000_000, 480_000);

      expect(result.baseApresCnss).toBe(11_520_000);
      expect(result.fraisProfessionnels).toBe(2_304_000); // 20% de 11 520 000
      expect(result.revenuNetImposable).toBe(9_216_000);
    });

    it('devrait gérer un revenu brut égal à la retenue CNSS', () => {
      const result = service.calculateFraisPro(480_000, 480_000);

      expect(result.baseApresCnss).toBe(0);
      expect(result.fraisProfessionnels).toBe(0);
      expect(result.revenuNetImposable).toBe(0);
    });
  });

  describe('calculateQuotient', () => {
    describe('Célibataire', () => {
      it('devrait retourner 1 part sans enfant', () => {
        const parts = service.calculateQuotient('celibataire', 0);
        expect(parts).toBe(1);
      });

      it('devrait retourner 2 parts avec 1 enfant', () => {
        const parts = service.calculateQuotient('celibataire', 1);
        expect(parts).toBe(2); // 1 base + 1 premier enfant
      });

      it('devrait retourner 2.5 parts avec 2 enfants', () => {
        const parts = service.calculateQuotient('celibataire', 2);
        expect(parts).toBe(2.5); // 1 + 1 + 0.5
      });

      it('devrait retourner 3 parts avec 3 enfants', () => {
        const parts = service.calculateQuotient('celibataire', 3);
        expect(parts).toBe(3); // 1 + 1 + 0.5 + 0.5
      });
    });

    describe('Marié', () => {
      it('devrait retourner 2 parts sans enfant', () => {
        const parts = service.calculateQuotient('marie', 0);
        expect(parts).toBe(2);
      });

      it('devrait retourner 2.5 parts avec 1 enfant', () => {
        const parts = service.calculateQuotient('marie', 1);
        expect(parts).toBe(2.5); // 2 + 0.5
      });

      it('devrait retourner 3 parts avec 2 enfants', () => {
        const parts = service.calculateQuotient('marie', 2);
        expect(parts).toBe(3); // 2 + 0.5 + 0.5
      });
    });

    describe('Divorcé', () => {
      it('devrait se comporter comme célibataire', () => {
        expect(service.calculateQuotient('divorce', 0)).toBe(1);
        expect(service.calculateQuotient('divorce', 1)).toBe(2);
        expect(service.calculateQuotient('divorce', 2)).toBe(2.5);
      });
    });

    describe('Veuf', () => {
      it('devrait retourner 1 part sans enfant', () => {
        const parts = service.calculateQuotient('veuf', 0);
        expect(parts).toBe(1);
      });

      it('devrait retourner 2.5 parts avec 1 enfant (traité comme marié)', () => {
        const parts = service.calculateQuotient('veuf', 1);
        expect(parts).toBe(2.5); // 2 base (veuf avec enfants) + 0.5
      });
    });

    describe('Maximum 6.5 parts', () => {
      it('devrait plafonner à 6.5 parts', () => {
        const parts = service.calculateQuotient('marie', 15);
        expect(parts).toBe(6.5);
      });
    });

    describe('Flag appliquerCharge', () => {
      it('devrait retourner 1 part si appliquerCharge est false', () => {
        const parts = service.calculateQuotient('marie', 5, false);
        expect(parts).toBe(1);
      });
    });

    describe('Valeurs nulles/négatives', () => {
      it('devrait traiter null comme 0 enfants', () => {
        const parts = service.calculateQuotient('celibataire', null);
        expect(parts).toBe(1);
      });
    });
  });

  describe('applyBareme', () => {
    it('devrait appliquer le barème IRPP correctement', () => {
      const baremes = FISCAL_PARAMS_2026.irpp.baremes;
      const result = service.applyBareme(2_000_000, baremes);

      // Tranche 1: 0-464 000 à 1% = 4 640
      // Tranche 2: 464 000-1 000 000 à 10% = 53 600
      // Tranche 3: 1 000 000-2 000 000 à 25% = 250 000
      const expectedTotal = 4_640 + 53_600 + 250_000;

      expect(result.impotTotal).toBe(expectedTotal);
      expect(result.details.length).toBe(3);
    });

    it('devrait retourner 0 pour un revenu nul', () => {
      const result = service.applyBareme(0, FISCAL_PARAMS_2026.irpp.baremes);
      expect(result.impotTotal).toBe(0);
      expect(result.details.length).toBe(0);
    });

    it('devrait gérer un revenu dans la première tranche', () => {
      const result = service.applyBareme(300_000, FISCAL_PARAMS_2026.irpp.baremes);
      expect(result.impotTotal).toBe(3_000); // 1% de 300 000
      expect(result.details.length).toBe(1);
    });
  });

  describe('applyBaremeIts', () => {
    it('devrait appliquer le forfait de 1 200 FCFA pour la première tranche', () => {
      const result = service.applyBaremeIts(500_000, FISCAL_PARAMS_2026.its.baremes);

      expect(result.impotTotal).toBe(1_200); // Forfait
      expect(result.details[0].tauxAffiche).toContain('forfait');
    });

    it('devrait appliquer les taux pour les tranches supérieures', () => {
      const result = service.applyBaremeIts(2_000_000, FISCAL_PARAMS_2026.its.baremes);

      // Tranche 1: forfait 1 200
      // Tranche 2: (1 500 000 - 615 000) à 10% = 88 500
      // Tranche 3: (2 000 000 - 1 500 000) à 15% = 75 000
      const expectedTotal = 1_200 + 88_500 + 75_000;

      expect(result.impotTotal).toBe(expectedTotal);
    });
  });

  describe('calculateTauxEffectif', () => {
    it('devrait calculer le taux effectif', () => {
      const taux = service.calculateTauxEffectif(200_000, 2_000_000);
      expect(taux).toBe(10);
    });

    it('devrait retourner 0 pour un revenu nul', () => {
      const taux = service.calculateTauxEffectif(100_000, 0);
      expect(taux).toBe(0);
    });
  });

  describe('annualizeRevenu', () => {
    it('devrait annualiser un revenu mensuel', () => {
      const result = service.annualizeRevenu(1_000_000, 'mensuel');
      expect(result.annuel).toBe(12_000_000);
      expect(result.mensuel).toBe(1_000_000);
    });

    it('devrait conserver un revenu annuel', () => {
      const result = service.annualizeRevenu(12_000_000, 'annuel');
      expect(result.annuel).toBe(12_000_000);
      expect(result.mensuel).toBe(1_000_000);
    });
  });

  describe('isUnderSmig', () => {
    it('devrait retourner true pour un revenu sous le SMIG', () => {
      expect(service.isUnderSmig(500_000)).toBe(true);
    });

    it('devrait retourner false pour un revenu au-dessus du SMIG', () => {
      expect(service.isUnderSmig(1_000_000)).toBe(false);
    });
  });

  describe('formatMontant', () => {
    it('devrait formater un montant en FCFA', () => {
      const formatted = service.formatMontant(1_500_000);
      expect(formatted).toContain('1');
      expect(formatted).toContain('500');
      expect(formatted).toContain('000');
      expect(formatted).toContain('FCFA');
    });
  });

  describe('getParams / setParams', () => {
    it('devrait retourner les paramètres par défaut', () => {
      const params = service.getParams();
      expect(params.cnss.taux).toBe(0.04);
      expect(params.cnss.plafondMensuel).toBe(1_200_000);
    });
  });
});
