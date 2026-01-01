import { Tome } from '../cgi-types';
import { CGI_2026_T1_L1_CHAP1 } from './cgi-tome1-livre1-chap1-2026.data';
import { CGI_2026_T1_L1_CHAP2 } from './cgi-tome1-livre1-chap2-2026.data';

/**
 * CGI 2026 - Tome 1 : Impôts d'État
 *
 * Transposition de la Directive CEMAC n°0119/25-UEAC-177-CM-42 du 09/01/2025
 * portant harmonisation de l'imposition des revenus et des bénéfices
 * dans les États membres de la CEMAC
 *
 * Adoptée par LF 2026 le 22/12/2025
 */
export const CGI_TOME_1_2026: Tome = {
  tome: 1,
  titre: 'Impôts d\'État',
  parties: [
    {
      partie: 1,
      titre: 'Impôts d\'État',
      livres: [
        {
          livre: 1,
          titre: 'Impôts directs et taxes assimilées',
          chapitres: [
            CGI_2026_T1_L1_CHAP1,
            CGI_2026_T1_L1_CHAP2,
            // Chapitres 3-6 à importer au fur et à mesure
          ],
        },
      ],
    },
  ],
};
