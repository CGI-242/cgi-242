/**
 * Tests unitaires pour IrppService
 * Vérifie le calcul de l'IRPP selon le CGI Congo
 */

import { TestBed } from '@angular/core/testing';
import { IrppService } from './irpp.service';
import { FiscalCommonService } from './fiscal-common.service';

describe('IrppService', () => {
  let service: IrppService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IrppService, FiscalCommonService],
    });
    service = TestBed.inject(IrppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculerNombreParts', () => {
    it('devrait déléguer au FiscalCommonService', () => {
      expect(service.calculerNombreParts('celibataire', 0)).toBe(1);
      expect(service.calculerNombreParts('marie', 2)).toBe(3);
    });
  });

  describe('calculerIrpp', () => {
    describe('Cas de base: Célibataire sans enfants', () => {
      it('devrait calculer l\'IRPP pour 500 000 FCFA mensuel', () => {
        const result = service.calculerIrpp({
          salaireBrut: 500_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
        });

        // Revenu brut annuel: 6 000 000
        expect(result.revenuBrutAnnuel).toBe(6_000_000);

        // CNSS: 4% de 500 000 = 20 000/mois = 240 000/an
        expect(result.retenueCnss).toBe(240_000);
        expect(result.plafondCnssApplique).toBe(false);

        // Base après CNSS: 5 760 000
        expect(result.baseApresCnss).toBe(5_760_000);

        // Frais pro 20%: 1 152 000
        expect(result.fraisProfessionnels).toBe(1_152_000);

        // Revenu net imposable: 4 608 000
        expect(result.revenuNetImposable).toBe(4_608_000);

        // 1 part (célibataire)
        expect(result.nombreParts).toBe(1);

        // Vérifier que l'IRPP est calculé
        expect(result.irppAnnuel).toBeGreaterThan(0);
        expect(result.irppMensuel).toBeGreaterThan(0);
      });

      it('devrait calculer l\'IRPP pour 1 000 000 FCFA mensuel', () => {
        const result = service.calculerIrpp({
          salaireBrut: 1_000_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
        });

        expect(result.revenuBrutAnnuel).toBe(12_000_000);
        expect(result.retenueCnss).toBe(480_000);
        expect(result.nombreParts).toBe(1);
      });
    });

    describe('Plafond CNSS', () => {
      it('devrait appliquer le plafond CNSS pour les hauts salaires', () => {
        const result = service.calculerIrpp({
          salaireBrut: 2_000_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
        });

        // Plafond CNSS: 1 200 000
        expect(result.baseCnss).toBe(14_400_000); // 1 200 000 * 12
        expect(result.retenueCnss).toBe(576_000); // 4% de 14 400 000
        expect(result.plafondCnssApplique).toBe(true);
      });
    });

    describe('Quotient familial', () => {
      it('devrait appliquer 2 parts pour un marié sans enfants', () => {
        const result = service.calculerIrpp({
          salaireBrut: 1_000_000,
          periode: 'mensuel',
          situationFamiliale: 'marie',
          nombreEnfants: 0,
        });

        expect(result.nombreParts).toBe(2);
      });

      it('devrait appliquer les parts enfants pour un marié avec enfants', () => {
        const result = service.calculerIrpp({
          salaireBrut: 1_000_000,
          periode: 'mensuel',
          situationFamiliale: 'marie',
          nombreEnfants: 3,
        });

        expect(result.nombreParts).toBe(3.5); // 2 + 0.5*3
      });

      it('devrait réduire l\'IRPP avec plus de parts', () => {
        const resultSansEnfants = service.calculerIrpp({
          salaireBrut: 1_500_000,
          periode: 'mensuel',
          situationFamiliale: 'marie',
          nombreEnfants: 0,
        });

        const resultAvecEnfants = service.calculerIrpp({
          salaireBrut: 1_500_000,
          periode: 'mensuel',
          situationFamiliale: 'marie',
          nombreEnfants: 4,
        });

        // Plus de parts = moins d'impôt
        expect(resultAvecEnfants.irppAnnuel).toBeLessThan(resultSansEnfants.irppAnnuel);
      });
    });

    describe('Revenu annuel', () => {
      it('devrait accepter un revenu annuel directement', () => {
        const result = service.calculerIrpp({
          salaireBrut: 12_000_000,
          periode: 'annuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
        });

        expect(result.revenuBrutAnnuel).toBe(12_000_000);
        expect(result.revenuBrutMensuel).toBe(1_000_000);
      });
    });

    describe('Tranches d\'imposition', () => {
      it('devrait fournir le détail par tranche', () => {
        const result = service.calculerIrpp({
          salaireBrut: 1_000_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
        });

        expect(result.detailTranches).toBeDefined();
        expect(result.detailTranches.length).toBeGreaterThan(0);

        // Vérifier la structure des tranches
        result.detailTranches.forEach(tranche => {
          expect(tranche).toHaveProperty('tranche');
          expect(tranche).toHaveProperty('taux');
          expect(tranche).toHaveProperty('baseImposable');
          expect(tranche).toHaveProperty('impot');
        });
      });
    });

    describe('Taux effectif', () => {
      it('devrait calculer le taux effectif d\'imposition', () => {
        const result = service.calculerIrpp({
          salaireBrut: 1_000_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
        });

        expect(result.tauxEffectif).toBeGreaterThan(0);
        expect(result.tauxEffectif).toBeLessThan(100);

        // Vérifier la cohérence
        const tauxCalcule = (result.irppAnnuel / result.revenuNetImposable) * 100;
        expect(result.tauxEffectif).toBeCloseTo(tauxCalcule, 2);
      });
    });

    describe('Salaire net', () => {
      it('devrait calculer le salaire net après IRPP', () => {
        const result = service.calculerIrpp({
          salaireBrut: 1_000_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
        });

        const expectedNet = result.revenuBrutAnnuel - result.retenueCnss - result.irppAnnuel;
        expect(result.salaireNetAnnuel).toBe(expectedNet);
        expect(result.salaireNetMensuel).toBe(expectedNet / 12);
      });
    });

    describe('Cas limites', () => {
      it('devrait gérer un salaire nul', () => {
        const result = service.calculerIrpp({
          salaireBrut: 0,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
        });

        expect(result.revenuBrutAnnuel).toBe(0);
        expect(result.irppAnnuel).toBe(0);
      });

      it('devrait gérer un salaire null', () => {
        const result = service.calculerIrpp({
          salaireBrut: null,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: null,
        });

        expect(result.revenuBrutAnnuel).toBe(0);
        expect(result.nombreParts).toBe(1);
      });
    });
  });

  describe('formatMontant', () => {
    it('devrait formater un montant en FCFA', () => {
      const formatted = service.formatMontant(1_500_000);
      expect(formatted).toContain('FCFA');
    });
  });
});
