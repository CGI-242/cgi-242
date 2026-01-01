import { Chapitre } from '../cgi-types';

/**
 * CGI 2026 - Tome 1, Livre 1, Chapitre 2 : IMPOT SUR LES BENEFICES D'AFFAIRES (IBA)
 *
 * Transposition Directive CEMAC n°0119/25-UEAC-177-CM-42 du 09/01/2025
 */
export const CGI_2026_T1_L1_CHAP2: Chapitre = {
  chapitre: 2,
  titre: 'IMPOT SUR LES BENEFICES D\'AFFAIRES (IBA)',
  articles: '93-116A',
  sections: [
    {
      section: 1,
      titre: 'CHAMP D\'APPLICATION',
      articles: '93A-93C',
    },
    {
      section: 2,
      titre: 'BENEFICE IMPOSABLE',
      articles: '94-94B',
    },
    {
      section: 3,
      titre: 'MODALITES D\'IMPOSITION',
      articles: '95-95B',
    },
    {
      section: 4,
      titre: 'REGIME DES PETITES ET TRES PETITES ENTREPRISES',
      articles: '96-101',
    },
    {
      section: 5,
      titre: 'REGIME DU REEL',
      articles: '102-104',
    },
    {
      section: 6,
      titre: 'IMPOT SUR LE REVENU DES CAPITAUX MOBILIERS (IRCM)',
      articles: '105-110A',
      sous_sections: [
        { sous_section: 1, titre: 'Champ d\'application', articles: '105-105E' },
        { sous_section: 2, titre: 'Exonérations', articles: '106' },
        { sous_section: 3, titre: 'Territorialité', articles: '107' },
        { sous_section: 4, titre: 'Fait générateur et exigibilité', articles: '108' },
        { sous_section: 5, titre: 'Base d\'imposition', articles: '109' },
        { sous_section: 6, titre: 'Modalités d\'imposition', articles: '110-110A' },
      ],
    },
    {
      section: 7,
      titre: 'IMPOT SUR LES REVENUS FONCIERS (IRF)',
      articles: '111-113A',
      sous_sections: [
        { sous_section: 1, titre: 'Champ d\'application', articles: '111-111E' },
        { sous_section: 2, titre: 'Base d\'imposition', articles: '112-112B' },
        { sous_section: 3, titre: 'Modalités d\'imposition', articles: '113-113A' },
      ],
    },
    {
      section: 8,
      titre: 'IMPOT SUR LES TRAITEMENTS ET SALAIRES (ITS)',
      articles: '114-116A',
      sous_sections: [
        { sous_section: 1, titre: 'Champ d\'application', articles: '114-114E' },
        { sous_section: 2, titre: 'Base d\'imposition', articles: '115' },
        { sous_section: 3, titre: 'Modalités d\'imposition', articles: '116-116A' },
      ],
    },
  ],
};
