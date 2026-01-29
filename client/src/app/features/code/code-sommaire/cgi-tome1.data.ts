import { Tome } from './cgi-types';

export const CGI_TOME_1: Tome = {
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
            {
              chapitre: 1,
              titre: 'Impôt sur le revenu des personnes physiques (IRPP)',
              articles: '1-101',
              sections: [
                { section: 1, titre: 'Dispositions générales', page: 9, articles: '1-9' },
                {
                  section: 2,
                  titre: 'Revenus imposables',
                  page: 12,
                  articles: '10-75',
                  sous_sections: [
                    { sous_section: 1, titre: 'Détermination des bénéfices ou revenus catégoriels', articles: '12-65 bis' },
                    {
                      sous_section: 2,
                      titre: 'Revenu global',
                      articles: '66-75',
                      paragraphes: [
                        { numero: 1, titre: 'Revenu imposable', articles: '66-71' },
                        { numero: 2, titre: 'Revenu imposable des étrangers et des personnes non domiciliées au Congo', articles: '72-73' },
                        { numero: 3, titre: 'Revenus de l\'année d\'acquisition d\'un domicile ou d\'une résidence au Congo', articles: '74' },
                        { numero: 4, titre: 'Revenus de l\'année du transfert du domicile hors du Congo ou de l\'abandon de toute résidence au Congo', articles: '75' },
                      ]
                    },
                  ]
                },
                { section: 3, titre: 'Déclaration des contribuables', page: 31, articles: '76-80' },
                { section: 4, titre: 'Vérification des déclarations', page: 33, articles: '81-85' },
                { section: 5, titre: 'Taxation d\'office', page: 34, articles: '86-88' },
                { section: 6, titre: 'Calcul de l\'impôt', page: 35, articles: '89-97' },
                { section: 7, titre: 'Cession, cessation ou décès', page: 37, articles: '98-101' },
              ],
            },
            { chapitre: 2, titre: 'Impôt complémentaire', statut: 'abrogé', page: 39, articles: '102-105' },
            {
              chapitre: 3,
              titre: 'Impôt sur les bénéfices des sociétés',
              articles: '106-126 septies',
              sections: [
                { section: 1, titre: 'Généralités', page: 40, articles: '106' },
                {
                  section: 2,
                  titre: 'Champ d\'application',
                  page: 40,
                  articles: '107-108',
                  sous_sections: [
                    { sous_section: 1, titre: 'Personnes imposables', articles: '107' },
                    { sous_section: 2, titre: 'Exonération', articles: '107-A' },
                    { sous_section: 3, titre: 'Territorialité', articles: '108' },
                  ]
                },
                {
                  section: 3,
                  titre: 'Détermination du bénéfice imposable',
                  page: 41,
                  articles: '109-120-I',
                  sous_sections: [
                    { sous_section: 1, titre: 'Définition', articles: '109-109-B' },
                    { sous_section: 2, titre: 'Frais généraux', articles: '110-113-C' },
                    { sous_section: 3, titre: 'Les amortissements', articles: '114-114-T' },
                    { sous_section: 4, titre: 'Provisions', articles: '115-115-F' },
                    { sous_section: 5, titre: 'Produits taxables', articles: '116-116-C' },
                    { sous_section: 6, titre: 'Évaluation stocks et travaux', articles: '117-117-A' },
                    { sous_section: 7, titre: 'Plus-values et moins-values', articles: '118-118-F' },
                    { sous_section: 8, titre: 'Report déficitaire', articles: '119' },
                    { sous_section: 9, titre: 'Prix de transferts', articles: '120-120-I' },
                  ]
                },
                {
                  section: 4,
                  titre: 'Modalités d\'imposition',
                  page: 58,
                  articles: '121-124-C',
                  sous_sections: [
                    { sous_section: 1, titre: 'Période de l\'imposition', articles: '121-122-B' },
                    { sous_section: 2, titre: 'Calcul de l\'impôt', articles: '122' },
                    { sous_section: 3, titre: 'Établissement de l\'impôt', articles: '123-123-A' },
                    { sous_section: 4, titre: 'Obligations des personnes morales', articles: '124-124-C' },
                  ]
                },
                {
                  section: 5,
                  titre: 'Régimes particuliers',
                  page: 61,
                  articles: '125-126 septies',
                  sous_sections: [
                    { sous_section: 1, titre: 'Régime des sociétés nouvelles', articles: '125', statut: 'abrogé' },
                    { sous_section: 2, titre: 'Régime des sociétés mères et filiales', articles: '126-126-A', paragraphes: [
                        { numero: 'A', titre: 'Régime mère-fille', articles: '126' },
                        { numero: 'B', titre: 'Subventions et remises de dettes', articles: '126-A' },
                      ]
                    },
                    { sous_section: 3, titre: 'Régime des succursales', articles: '126-B' },
                    { sous_section: 3.5, display: '3 bis', titre: 'Régime fiscal des quartiers généraux des sociétés', articles: '126-C-1 à 126-C-4' },
                    { sous_section: 4, titre: 'Régime fiscal des holdings', articles: '126-D à 126-D-6', paragraphes: [
                        { numero: 1, titre: 'Conditions d\'éligibilité', articles: '126-D' },
                        { numero: 2, titre: 'Imposition des plus-values des titres', articles: '126-D-1 à 126-D-3' },
                        { numero: 3, titre: 'Autres avantages fiscaux', articles: '126-D-4 à 126-D-6' },
                      ]
                    },
                    { sous_section: 5, titre: 'Régime d\'intégration fiscale', articles: '126-E à 126-E-9' },
                    { sous_section: 6, titre: 'Régime des personnes morales étrangères', articles: '126 bis à 126 septies' },
                  ]
                },
              ],
            },
            {
              chapitre: 4,
              titre: 'Dispositions communes',
              articles: '127-140 bis',
              sections: [
                { section: 1, titre: 'Révision des bilans', page: 71, articles: '127-127 quinquies' },
                { section: 2, titre: 'Réductions pour investissement', statut: 'abrogé', page: 72, articles: '128-132' },
                { section: 3, titre: 'Régime exploitations minières', page: 72, articles: '133-140 bis' },
              ],
            },
            {
              chapitre: 5,
              titre: 'Taxes diverses',
              articles: '141-171 undecies',
              sections: [
                { section: 1, titre: 'Taxe d\'apprentissage', statut: 'abrogé', page: 74, articles: '141-145' },
                { section: 2, titre: 'Taxes sur les terrains', page: 74, articles: '146-160' },
                { section: 3, titre: 'Taxe spéciale sur les sociétés', page: 78, articles: '161-165' },
                { section: 5, titre: 'Impôt spécial bons de caisse', page: 79, articles: '166-168' },
                { section: 6, titre: 'Taxe véhicules de tourisme', page: 80, articles: '169-171 undecies' },
              ],
            },
            {
              chapitre: 6,
              titre: 'Dispositions diverses',
              articles: '172-185 ter-F',
              sections: [
                { section: 1, titre: 'Obligations employeurs', page: 81, articles: '172-176' },
                { section: 2, titre: 'Commissions et honoraires', page: 84, articles: '177-180' },
                { section: 6, titre: 'Personnes non-résidentes', page: 86, articles: '181-183' },
                { section: 7, titre: 'Plus-values sur titres', page: 88, articles: '184-185 ter-F' },
              ],
            },
          ],
        },
      ],
    },
    {
      partie: 2,
      titre: 'Impositions perçues au profit des collectivités et de divers organismes',
      titres: [
        {
          titre: 1,
          titre_libelle: 'Impôts perçus au profit des collectivités',
          chapitres: [
            { chapitre: 1, titre: 'Impôts et taxes obligatoires', page: 90, articles: '250-341' },
            { chapitre: 2, titre: 'Taxes facultatives', page: 104, articles: '342-364' },
            { chapitre: 3, titre: 'Centimes additionnels à certains impôts', page: 105, articles: '365-371' },
          ],
        },
      ],
    },
    {
      partie: 3,
      titre: 'Dispositions communes aux parties 1 et 2',
      titres: [
        {
          titre: 1,
          titre_libelle: 'Dispositions diverses',
          chapitres: [
            { chapitre: 1, titre: 'Sanctions pour défaut de déclaration', page: 106, articles: '372-381 ter' },
            { chapitre: 2, titre: 'Prescriptions', page: 109, articles: '382-383' },
            { chapitre: 3, titre: 'Changement du lieu d\'imposition', page: 110, articles: '384' },
            { chapitre: 4, titre: 'Conventions fiscales', page: 110, articles: '385-386 bis' },
            { chapitre: 5, titre: 'Vérification des contribuables', page: 111, articles: '387-390 bis J' },
            { chapitre: 6, titre: 'Droit de communication', page: 116, articles: '391-399 ter' },
            { chapitre: 7, titre: 'Commission des impôts', page: 119, articles: '400-403' },
            { chapitre: 8, titre: 'Secret professionnel', page: 120, articles: '404-406' },
            { chapitre: 9, titre: 'Marchés publics', page: 121, articles: '406 bis' },
          ],
        },
        {
          titre: 2,
          titre_libelle: 'Rôles',
          chapitres: [
            { chapitre: 1, titre: 'Émission des rôles', page: 121, articles: '407-409' },
            { chapitre: 2, titre: 'Approbation des rôles', page: 121, articles: '410-414' },
            { chapitre: 3, titre: 'Mise en recouvrement', page: 122, articles: '415-421' },
          ],
        },
        {
          titre: 3,
          titre_libelle: 'Réclamations',
          chapitres: [
            { chapitre: 1, titre: 'Juridictions contentieuse et gracieuse', page: 123, articles: '422-422 ter' },
            { chapitre: 2, titre: 'Juridiction contentieuse', page: 124, articles: '427-445' },
            { chapitre: 3, titre: 'Juridiction gracieuse', page: 127, articles: '446-457' },
            { chapitre: 4, titre: 'Dispositions communes', page: 128, articles: '458-458 bis' },
          ],
        },
        {
          titre: 4,
          titre_libelle: 'Recouvrement',
          chapitres: [
            { chapitre: 1, titre: 'Dispositions générales', page: 128, articles: '459-518' },
            { chapitre: 2, titre: 'Paiement différé et frais de poursuite', page: 136, articles: '518 quater A-520' },
          ],
        },
      ],
    },
    {
      partie: 4,
      titre: 'Sanctions pénales',
      simple: true,
      articles: '521-526',
    },
  ],
  annexes: { titre: 'Annexes au Tome 1', page: 142 },
};
