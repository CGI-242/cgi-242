import { Chapitre } from '../cgi-types';

/**
 * CGI 2026 - Tome 1, Livre 1, Chapitre 1 : IMPOT SUR LES SOCIETES (IS)
 *
 * Transposition Directive CEMAC n°0119/25-UEAC-177-CM-42 du 09/01/2025
 */
export const CGI_2026_T1_L1_CHAP1: Chapitre = {
  chapitre: 1,
  titre: 'IMPOT SUR LES SOCIETES (IS)',
  articles: '1-...',
  sections: [
    {
      section: 1,
      titre: 'GENERALITES',
      articles: '1',
    },
    {
      section: 2,
      titre: 'CHAMP D\'APPLICATION',
      articles: '2-7',
      sous_sections: [
        { sous_section: 1, titre: 'Personnes imposables', articles: '2' },
        { sous_section: 2, titre: 'Exonérations et crédits d\'impôts', articles: '3-3A' },
        { sous_section: 3, titre: 'Territorialité', articles: '4-4A-7' },
      ],
    },
    {
      section: 3,
      titre: 'BENEFICE IMPOSABLE',
      articles: '8-85',
      sous_sections: [
        { sous_section: 1, titre: 'Définition', articles: '8-11' },
        { sous_section: 2, titre: 'Les produits imposables', articles: '12-16' },
        { sous_section: 3, titre: 'Régime des plus-values ou moins-values de cession', articles: '17-25' },
        { sous_section: 4, titre: 'Les charges déductibles', articles: '26-76' },
        { sous_section: 5, titre: 'Prix de transferts', articles: '77-85' },
      ],
    },
    {
      section: 4,
      titre: 'MODALITES D\'IMPOSITION',
      articles: '86-86C',
      sous_sections: [
        { sous_section: 1, titre: 'Période d\'imposition', articles: '86' },
        { sous_section: 2, titre: 'Calcul de l\'impôt', articles: '86A-86C' },
        { sous_section: 3, titre: 'Etablissement de l\'impôt', articles: '(art. 123 CGI)' },
        { sous_section: 4, titre: 'Obligations des personnes morales', articles: '(art. 124-124B CGI)' },
      ],
    },
    {
      section: 5,
      titre: 'REGIMES PARTICULIERS',
      articles: '87-92F',
      sous_sections: [
        { sous_section: 1, titre: 'Régime des sociétés mères et des filiales', articles: '87-87A' },
        { sous_section: 2, titre: 'Régime des succursales', articles: '88' },
        { sous_section: 3, titre: 'Régime fiscal des quartiers généraux de sociétés', articles: '89-89C' },
        { sous_section: 4, titre: 'Régime fiscal des holdings', articles: '90-90F' },
        { sous_section: 5, titre: 'Régime d\'intégration fiscale des groupes de sociétés', articles: '91-91I' },
        { sous_section: 6, titre: 'Régime des personnes morales étrangères', articles: '92-92F' },
      ],
    },
  ],
};
