import { Tome } from './cgi-types';

/**
 * CGI 2026 - Tome 1 : Impôts d'État
 * Basé sur la Directive CEMAC n°0119/25-UEAC-177-CM-42
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
            {
              chapitre: 1,
              titre: 'Impôt sur les sociétés (IS)',
              articles: '1-93',
              sections: [
                { section: 1, titre: 'Généralités', articles: '1' },
                {
                  section: 2,
                  titre: 'Champ d\'application',
                  articles: '2-5',
                  sous_sections: [
                    { sous_section: 1, titre: 'Personnes imposables', articles: '2' },
                    { sous_section: 2, titre: 'Exonérations et crédit d\'impôts', articles: '3' },
                    { sous_section: 3, titre: 'Territorialité', articles: '4-5' },
                  ]
                },
                {
                  section: 3,
                  titre: 'Bénéfices imposables',
                  articles: '6-85',
                  sous_sections: [
                    { sous_section: 1, titre: 'Définition', articles: '6-9' },
                    { sous_section: 2, titre: 'Les produits imposables', articles: '10-14' },
                    { sous_section: 3, titre: 'Régime des plus-values ou moins-values de cession', articles: '15-24' },
                    {
                      sous_section: 4,
                      titre: 'Les charges déductibles',
                      articles: '25-76',
                      paragraphes: [
                        { numero: 1, titre: 'Charges de personnel et des dirigeants', articles: '26-36' },
                        { numero: 2, titre: 'Frais de siège, services et redevances et commissions', articles: '37-40' },
                        { numero: 3, titre: 'Dépenses locatives', articles: '41' },
                        { numero: 4, titre: 'Impôts, taxes et amendes', articles: '42' },
                        { numero: 5, titre: 'Primes d\'assurances', articles: '43-44' },
                        { numero: 6, titre: 'Libéralités, dons, subventions et aides accordés', articles: '45-46' },
                        { numero: 7, titre: 'Dépenses somptuaires', articles: '47' },
                        { numero: 8, titre: 'Rémunérations occultes', articles: '48' },
                        { numero: 9, titre: 'Charges financières', articles: '49' },
                        { numero: 10, titre: 'Rémunérations versées par un établissement stable', articles: '50' },
                        { numero: 11, titre: 'Amortissements', articles: '51-61' },
                        { numero: 12, titre: 'Moins-value et pertes sur actif', articles: '62' },
                        { numero: 13, titre: 'Provisions', articles: '63-74' },
                        { numero: 14, titre: 'Réports déficitaires', articles: '75' },
                        { numero: 15, titre: 'Dérogations sectorielles', articles: '76' },
                      ]
                    },
                    { sous_section: 5, titre: 'Prix de transferts', articles: '77-85' },
                  ]
                },
                {
                  section: 4,
                  titre: 'Modalités d\'imposition',
                  articles: '86-86G',
                  sous_sections: [
                    { sous_section: 1, titre: 'Période d\'imposition', articles: '86' },
                    { sous_section: 2, titre: 'Calcul de l\'impôt', articles: '86A-86D' },
                    { sous_section: 3, titre: 'Obligations des personnes morales', articles: '86E-86G' },
                  ]
                },
                {
                  section: 5,
                  titre: 'Régimes particuliers',
                  articles: '87-93',
                  sous_sections: [
                    { sous_section: 1, titre: 'Régimes des sociétés mère et filiales', articles: '87-87A' },
                    { sous_section: 2, titre: 'Régimes des succursales', articles: '88' },
                    { sous_section: 3, titre: 'Régime fiscal des quartiers généraux des sociétés', articles: '89-89C' },
                    { sous_section: 4, titre: 'Régime fiscal des holdings', articles: '90-90E' },
                    { sous_section: 5, titre: 'Régime d\'intégration fiscale des groupes de sociétés', articles: '91-93' },
                  ]
                },
              ],
            },
            {
              chapitre: 2,
              titre: 'Impôt sur les bénéfices d\'affaires (IBA)',
              articles: '93-126',
              sections: [
                { section: 1, titre: 'Champ d\'application', articles: '93-100' },
                { section: 2, titre: 'Détermination du bénéfice imposable', articles: '101-115' },
                { section: 3, titre: 'Calcul et paiement', articles: '116-126' },
              ],
            },
            {
              chapitre: 3,
              titre: 'Dispositions communes à l\'IS et aux impôts sur les revenus',
              articles: '127-140-I',
              sections: [
                { section: 1, titre: 'Révision des bilans', articles: '127-130' },
                { section: 2, titre: 'Réductions pour investissement', articles: '131-135' },
                { section: 3, titre: 'Régime des exploitations minières', articles: '136-140-I' },
              ],
            },
            {
              chapitre: 4,
              titre: 'Taxes diverses',
              articles: '141-171 undecies',
              sections: [
                { section: 1, titre: 'Taxe d\'apprentissage', statut: 'abrogé', articles: '141-145' },
                { section: 2, titre: 'Taxes sur les terrains', articles: '146-160' },
                { section: 3, titre: 'Taxe spéciale sur les sociétés', articles: '161-165' },
                { section: 4, titre: 'Impôt spécial sur les bons de caisse', articles: '166-168' },
                { section: 5, titre: 'Taxe sur les véhicules de tourisme', articles: '169-171 undecis' },
              ],
            },
            {
              chapitre: 5,
              titre: 'Dispositions diverses',
              articles: '172-185 ter-F',
              sections: [
                { section: 1, titre: 'Obligations des employeurs', articles: '172-176' },
                { section: 2, titre: 'Commissions et honoraires', articles: '177-180' },
                { section: 3, titre: 'Personnes non-résidentes', articles: '181-183' },
                { section: 4, titre: 'Plus-values sur titres', articles: '184-185 ter-F' },
              ],
            },
            {
              chapitre: 6,
              titre: 'Plus-values sur titres réalisées par des personnes non-résidentes',
              articles: '185 quater-A-185 sexies',
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
            { chapitre: 1, titre: 'Impôts et taxes obligatoires', articles: '250-341' },
            { chapitre: 2, titre: 'Taxes facultatives', articles: '342-364' },
            { chapitre: 3, titre: 'Centimes additionnels à certains impôts', articles: '365-371' },
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
            { chapitre: 1, titre: 'Sanctions pour défaut de déclaration', articles: '372-381 ter' },
            { chapitre: 2, titre: 'Prescriptions', articles: '382-383' },
            { chapitre: 3, titre: 'Changement du lieu d\'imposition', articles: '384' },
            { chapitre: 4, titre: 'Conventions fiscales', articles: '385-386 bis' },
            { chapitre: 5, titre: 'Vérification des contribuables', articles: '387-390 bis J' },
            { chapitre: 6, titre: 'Droit de communication', articles: '391-399 ter' },
            { chapitre: 7, titre: 'Commission des impôts', articles: '400-403' },
            { chapitre: 8, titre: 'Secret professionnel', articles: '404-406' },
            { chapitre: 9, titre: 'Marchés publics', articles: '406 bis' },
          ],
        },
        {
          titre: 2,
          titre_libelle: 'Rôles',
          chapitres: [
            { chapitre: 1, titre: 'Émission des rôles', articles: '407-409' },
            { chapitre: 2, titre: 'Approbation des rôles', articles: '410-414' },
            { chapitre: 3, titre: 'Mise en recouvrement', articles: '415-421' },
          ],
        },
        {
          titre: 3,
          titre_libelle: 'Réclamations',
          chapitres: [
            { chapitre: 1, titre: 'Domaines respectifs des juridictions contentieuse et gracieuse', articles: '422-425' },
            { chapitre: 2, titre: 'Juridiction contentieuse', articles: '427-445' },
            { chapitre: 3, titre: 'Juridiction gracieuse', articles: '446-457' },
            { chapitre: 4, titre: 'Dispositions communes', articles: '458-458 bis' },
          ],
        },
        {
          titre: 4,
          titre_libelle: 'Recouvrement',
          chapitres: [
            { chapitre: 1, titre: 'Dispositions générales', articles: '459-518' },
            { chapitre: 2, titre: 'Paiement différé ou échelonné et frais de poursuite', articles: '518 quater A-520' },
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
