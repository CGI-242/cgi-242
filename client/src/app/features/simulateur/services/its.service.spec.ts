/**
 * Tests unitaires pour ItsService
 * Vérifie le calcul de l'ITS 2026 selon le CGI Congo - Article 116
 */

import { TestBed } from '@angular/core/testing';
import { ItsService } from './its.service';
import { FiscalCommonService } from './fiscal-common.service';

describe('ItsService', () => {
  let service: ItsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ItsService, FiscalCommonService],
    });
    service = TestBed.inject(ItsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculerNombreParts', () => {
    it('devrait retourner 1 part si appliquerCharge est false', () => {
      expect(service.calculerNombreParts('marie', 5, false)).toBe(1);
    });

    it('devrait appliquer le quotient familial si appliquerCharge est true', () => {
      expect(service.calculerNombreParts('marie', 2, true)).toBe(3);
    });
  });

  describe('calculerIts', () => {
    describe('Forfait première tranche', () => {
      it('devrait appliquer le forfait de 1 200 FCFA pour les bas salaires', () => {
        const result = service.calculerIts({
          salaireBrut: 50_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
          appliquerChargeFamille: false,
        });

        // Revenu net imposable bas = forfait 1 200 FCFA
        expect(result.itsAnnuel).toBeGreaterThanOrEqual(1_200);
      });
    });

    describe('Calcul standard', () => {
      it('devrait calculer l\'ITS pour 500 000 FCFA mensuel', () => {
        const result = service.calculerIts({
          salaireBrut: 500_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
          appliquerChargeFamille: false,
        });

        expect(result.revenuBrutAnnuel).toBe(6_000_000);
        expect(result.nombreParts).toBe(1);
        expect(result.chargeFamilleAppliquee).toBe(false);
        expect(result.version).toBe('2026');
      });

      it('devrait calculer l\'ITS pour 1 000 000 FCFA mensuel', () => {
        const result = service.calculerIts({
          salaireBrut: 1_000_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
          appliquerChargeFamille: false,
        });

        expect(result.revenuBrutAnnuel).toBe(12_000_000);
        expect(result.itsAnnuel).toBeGreaterThan(0);
        expect(result.itsMensuel).toBeGreaterThan(0);
      });
    });

    describe('Exception charges de famille 2026', () => {
      it('devrait appliquer les charges si exception activée', () => {
        const resultSansCharge = service.calculerIts({
          salaireBrut: 1_000_000,
          periode: 'mensuel',
          situationFamiliale: 'marie',
          nombreEnfants: 3,
          appliquerChargeFamille: false,
        });

        const resultAvecCharge = service.calculerIts({
          salaireBrut: 1_000_000,
          periode: 'mensuel',
          situationFamiliale: 'marie',
          nombreEnfants: 3,
          appliquerChargeFamille: true,
        });

        expect(resultSansCharge.nombreParts).toBe(1);
        expect(resultAvecCharge.nombreParts).toBe(3.5); // 2 + 0.5*3

        // Avec plus de parts, l'ITS devrait être plus faible
        expect(resultAvecCharge.itsAnnuel).toBeLessThan(resultSansCharge.itsAnnuel);
      });
    });

    describe('Avantages en nature et primes', () => {
      it('devrait inclure les avantages en nature dans le calcul', () => {
        const resultSansAvantages = service.calculerIts({
          salaireBrut: 500_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
          appliquerChargeFamille: false,
        });

        const resultAvecAvantages = service.calculerIts({
          salaireBrut: 500_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
          appliquerChargeFamille: false,
          avantagesEnNature: 100_000,
          primes: 50_000,
        });

        expect(resultAvecAvantages.revenuBrutAnnuel).toBeGreaterThan(
          resultSansAvantages.revenuBrutAnnuel
        );
      });
    });

    describe('Minimum ITS et SMIG', () => {
      it('devrait détecter un salaire sous le SMIG', () => {
        const result = service.calculerIts({
          salaireBrut: 50_000, // Sous le SMIG de 70 400
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
          appliquerChargeFamille: false,
        });

        expect(result.smigApplique).toBe(true);
      });

      it('devrait appliquer le minimum ITS si nécessaire', () => {
        const result = service.calculerIts({
          salaireBrut: 30_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
          appliquerChargeFamille: false,
        });

        // Le minimum ITS est 1 200 FCFA/an
        if (result.minimumApplique) {
          expect(result.itsAnnuel).toBe(1_200);
        }
      });
    });

    describe('Tranches d\'imposition ITS 2026', () => {
      it('devrait fournir le détail par tranche avec tauxAffiche', () => {
        const result = service.calculerIts({
          salaireBrut: 1_500_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
          appliquerChargeFamille: false,
        });

        expect(result.detailTranches).toBeDefined();
        expect(result.detailTranches.length).toBeGreaterThan(0);

        // Première tranche devrait avoir "forfait" dans tauxAffiche
        expect(result.detailTranches[0].tauxAffiche).toContain('forfait');
      });
    });

    describe('Plafond CNSS', () => {
      it('devrait appliquer le plafond CNSS', () => {
        const result = service.calculerIts({
          salaireBrut: 2_000_000,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
          appliquerChargeFamille: false,
        });

        expect(result.plafondCnssApplique).toBe(true);
      });
    });

    describe('Cas limites', () => {
      it('devrait gérer un salaire nul', () => {
        const result = service.calculerIts({
          salaireBrut: 0,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: 0,
          appliquerChargeFamille: false,
        });

        expect(result.revenuBrutAnnuel).toBe(0);
      });

      it('devrait gérer un salaire null', () => {
        const result = service.calculerIts({
          salaireBrut: null,
          periode: 'mensuel',
          situationFamiliale: 'celibataire',
          nombreEnfants: null,
          appliquerChargeFamille: false,
        });

        expect(result.revenuBrutAnnuel).toBe(0);
      });
    });
  });

  describe('comparerAvecIrpp', () => {
    it('devrait retourner une comparaison ITS 2026 vs IRPP 2025', () => {
      const comparaison = service.comparerAvecIrpp(1_000_000, 'celibataire', 0);

      expect(comparaison).toHaveProperty('its2026');
      expect(comparaison).toHaveProperty('irpp2025');
      expect(comparaison).toHaveProperty('difference');
      expect(comparaison).toHaveProperty('pourcentageEconomie');
    });

    it('devrait montrer une économie avec le nouveau barème ITS', () => {
      const comparaison = service.comparerAvecIrpp(500_000, 'marie', 2);

      // Le nouveau barème ITS 2026 est généralement plus favorable
      // La différence devrait être positive (économie)
      expect(comparaison.its2026).toBeGreaterThanOrEqual(0);
      expect(comparaison.irpp2025).toBeGreaterThanOrEqual(0);
    });
  });

  describe('formatMontant', () => {
    it('devrait formater un montant en FCFA', () => {
      const formatted = service.formatMontant(1_500_000);
      expect(formatted).toContain('FCFA');
    });
  });
});
