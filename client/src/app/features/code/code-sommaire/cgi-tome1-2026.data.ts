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
                  articles: '87-92K',
                  sous_sections: [
                    { sous_section: 1, titre: 'Régimes des sociétés mère et filiales', articles: '87-87A' },
                    { sous_section: 2, titre: 'Régimes des succursales', articles: '88' },
                    { sous_section: 3, titre: 'Régime fiscal des quartiers généraux des sociétés', articles: '89-89C' },
                    { sous_section: 4, titre: 'Régime fiscal des holdings', articles: '90-90E' },
                    { sous_section: 5, titre: 'Régime d\'intégration fiscale des groupes de sociétés', articles: '91-91I' },
                    { sous_section: 6, titre: 'Régime des personnes morales étrangères', articles: '92-92K' },
                  ]
                },
              ],
            },
            {
              chapitre: 2,
              titre: 'Impôts sur les revenus',
              articles: '93-116I',
              sections: [
                {
                  section: 1,
                  display: '2.1',
                  titre: 'Impôt sur les bénéfices d\'affaires (IBA)',
                  articles: '93-102',
                  sous_sections: [
                    { sous_section: 1, display: 'Sec. 1', titre: 'Champ d\'application', articles: '93-93C' },
                    { sous_section: 2, display: 'Sec. 2', titre: 'Bénéfice imposable', articles: '94-94' },
                    { sous_section: 3, display: 'Sec. 3', titre: 'Modalités d\'imposition', articles: '95-95' },
                    { sous_section: 4, display: 'Sec. 4', titre: 'Régimes des petites et très petites entreprises', articles: '96-102' },
                  ]
                },
                {
                  section: 2,
                  display: '2.2',
                  titre: 'Impôt sur le revenu des capitaux mobiliers (IRCM)',
                  articles: '103-110',
                  sous_sections: [
                    { sous_section: 1, display: 'Sec. 1', titre: 'Champ d\'application', articles: '103-103' },
                    { sous_section: 2, display: '§1', titre: 'Revenus des valeurs mobilières', articles: '104-105' },
                    { sous_section: 3, display: '§2', titre: 'Revenus des obligations', articles: '105A-105A' },
                    { sous_section: 4, display: '§3', titre: 'Revenus des créances, dépôts et cautionnements', articles: '105B-105B' },
                    { sous_section: 5, display: '§4', titre: 'Plus-values mobilières', articles: '105C-105C' },
                    { sous_section: 6, display: 'Sec. 2', titre: 'Exonérations', articles: '106-106' },
                    { sous_section: 7, display: 'Sec. 3', titre: 'Territorialité', articles: '107-107' },
                    { sous_section: 8, display: 'Sec. 4', titre: 'Fait générateur et exigibilité', articles: '108-108' },
                    { sous_section: 9, display: 'Sec. 5', titre: 'Base d\'imposition', articles: '109-109' },
                    { sous_section: 10, display: 'Sec. 6', titre: 'Modalités d\'imposition', articles: '110-110' },
                  ]
                },
                {
                  section: 3,
                  display: '2.3',
                  titre: 'Impôt sur les revenus fonciers (IRF)',
                  articles: '111-113A',
                  sous_sections: [
                    { sous_section: 1, display: 'Sec. 1', titre: 'Champ d\'application', articles: '111-111E' },
                    { sous_section: 2, display: '§1', titre: 'Revenus imposables', articles: '111-111B' },
                    { sous_section: 3, display: '§2', titre: 'Exonération', articles: '111C-111D' },
                    { sous_section: 4, display: '§3', titre: 'Fait générateur et exigibilité', articles: '111E' },
                    { sous_section: 5, display: 'Sec. 2', titre: 'Base d\'imposition', articles: '112-112B' },
                    { sous_section: 6, display: 'Sec. 3', titre: 'Modalités d\'imposition', articles: '113-113A' },
                  ]
                },
                {
                  section: 4,
                  display: '2.4',
                  titre: 'Impôt sur les traitements et salaires (ITS)',
                  articles: '114-116I',
                  sous_sections: [
                    { sous_section: 1, display: 'Sec. 1', titre: 'Champ d\'application', articles: '114-114E' },
                    { sous_section: 2, display: '§1', titre: 'Revenus imposables', articles: '114' },
                    { sous_section: 3, display: '§2', titre: 'Exonérations', articles: '114A-114C' },
                    { sous_section: 4, display: '§3', titre: 'Territorialité', articles: '114D' },
                    { sous_section: 5, display: '§4', titre: 'Fait générateur et exigibilité', articles: '114E' },
                    { sous_section: 6, display: 'Sec. 2', titre: 'Base d\'imposition', articles: '115-115' },
                    { sous_section: 7, display: 'Sec. 3', titre: 'Modalités d\'imposition', articles: '116-116I' },
                  ]
                },
              ],
            },
            {
              chapitre: 3,
              titre: 'Sans objet',
            },
            {
              chapitre: 4,
              titre: 'Dispositions communes à l\'IS et aux impôts sur les revenus',
              articles: '127-140K',
              sections: [
                { section: 1, titre: 'Révision des bilans', articles: '127-127 quinquies' },
                { section: 2, titre: 'Déclaration des contribuables', articles: '128-132' },
                {
                  section: 3,
                  titre: 'Régime spécial des exploitations minières',
                  articles: '133-140 bis',
                  paragraphes: [
                    { numero: 1, titre: 'Hydrocarbures liquides ou gazeux', articles: '133-139' },
                    { numero: 2, titre: 'Substances minérales concessibles autres que les hydrocarbures liquides ou gazeux', articles: '140-140 bis' },
                  ]
                },
                { section: 4, titre: 'Vérification des déclarations', articles: '140A-140E' },
                { section: 5, titre: 'Taxation d\'office', articles: '140F-140G' },
                { section: 6, titre: 'Cession, cessation ou décès', articles: '140H-140K' },
              ],
            },
            {
              chapitre: 5,
              titre: 'Taxes diverses',
              articles: '141-171N',
              sections: [
                { section: 1, titre: 'Sans objet', statut: 'sans objet', articles: '141-156' },
                { section: 2, titre: 'Taxes sur les terrains', articles: '157-167 bis' },
                { section: 3, titre: 'Taxe spéciale sur les sociétés', statut: 'abrogé', articles: '168-171' },
                { section: 4, titre: 'Taxe forfaitaire due par les employeurs et les débirentiers', statut: 'abrogé', articles: '171 bis-171 quinquies' },
                { section: 5, titre: 'Impôt spécial sur les bons de caisse (Abrogé)', statut: 'abrogé', articles: '171 sexies-171 undecies' },
                { section: 6, titre: 'Taxe sur les véhicules de tourisme des sociétés', articles: '171 A-171 L' },
                { section: 7, titre: 'Sans objet', statut: 'sans objet', articles: '171 M-171 N' },
              ],
            },
            {
              chapitre: 6,
              titre: 'Dispositions diverses',
              articles: '172-185 sexies',
              sections: [
                { section: 1, titre: 'Obligations des employeurs et débirentiers', articles: '172-182' },
                { section: 2, titre: 'Obligations des personnes ou sociétés versant des commissions, courtages, ristournes, honoraires et droits d\'auteurs', articles: '183-183 ter' },
                { section: 3, titre: 'Déclaration des rémunérations d\'associés et parts de bénéfices', articles: '184' },
                { section: 4, titre: 'Renseignements à fournir par les bénéficiaires des traitements, salaires, pensions et rentes de source étrangère', articles: '185' },
                { section: 5, titre: 'Dispositions particulières applicables aux sociétés visées aux articles 92 et suivants', articles: '185 bis' },
                { section: 6, titre: 'Dispositions particulières applicables aux personnes physiques ou morales n\'ayant ni domicile, ni résidence fiscale au Congo', articles: '185 ter A-185 ter F' },
                { section: 7, titre: 'Plus-values sur titres réalisées par des personnes non-résidentes', articles: '185 quater A-185 quater C' },
                { section: 8, titre: 'Paiements effectués par les entrepreneurs adjudicataires des marchés de BTP au profit des sous-traitants desdits marchés', articles: '185 quinquies' },
                { section: 9, titre: 'Réassurance', articles: '185 sexies' },
              ],
            },
          ],
        },
        {
          livre: 2,
          titre: 'Impôt sur le chiffre d\'affaires intérieur',
          statut: 'abrogé',
          note: 'Abrogé - Voir TFNC 6 pour les dispositions relatives à la TVA',
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
            {
              chapitre: 1,
              titre: 'Impôts et taxes obligatoires',
              articles: '250-341',
              sections: [
                { section: 1, titre: 'Généralités', articles: '250' },
                {
                  section: 2,
                  titre: 'Contribution foncière des propriétés bâties',
                  articles: '251-262',
                  sous_sections: [
                    { sous_section: 1, display: 'I', titre: 'Propriétés bâties', articles: '251-252 bis' },
                    { sous_section: 2, display: 'II', titre: 'Exemptions permanentes', articles: '253' },
                    { sous_section: 3, display: 'III', titre: 'Exemptions temporaires', articles: '254-256' },
                    { sous_section: 4, display: 'IV', titre: 'Base d\'imposition', articles: '257-259' },
                    { sous_section: 5, display: 'V', titre: 'Lieu d\'imposition', articles: '260' },
                    { sous_section: 6, display: 'VI', titre: 'Débiteur de l\'impôt', articles: '261' },
                    { sous_section: 7, display: 'VII', titre: 'Calcul de l\'impôt', articles: '262' },
                  ],
                },
                {
                  section: 3,
                  titre: 'Contribution foncière des propriétés non bâties',
                  articles: '263-275',
                  sous_sections: [
                    { sous_section: 1, display: 'I', titre: 'Propriétés imposables', articles: '263-264' },
                    { sous_section: 2, display: 'II', titre: 'Exemptions permanentes', articles: '265' },
                    { sous_section: 3, display: 'III', titre: 'Exemptions temporaires', articles: '266-269' },
                    { sous_section: 4, display: 'IV', titre: 'Base d\'imposition', articles: '270-272' },
                    { sous_section: 5, display: 'V', titre: 'Lieu d\'imposition', articles: '273' },
                    { sous_section: 6, display: 'VI', titre: 'Débiteur de l\'impôt', articles: '274' },
                    { sous_section: 7, display: 'VII', titre: 'Calcul de l\'impôt', articles: '275' },
                  ],
                },
                {
                  section: 4,
                  titre: 'Dispositions communes aux sections 2 et 3',
                  articles: '276',
                },
                {
                  section: 5,
                  titre: 'Contribution des patentes',
                  articles: '277-314 bis',
                  sous_sections: [
                    { sous_section: 1, display: 'I', titre: 'Droit de patente', articles: '277-278' },
                    { sous_section: 2, display: 'II', titre: 'Exemptions', articles: '279' },
                    { sous_section: 3, display: 'III', titre: 'Droits proportionnels', articles: '280-284' },
                    { sous_section: 4, display: 'IV', titre: 'Personnalité de la patente', articles: '285-286' },
                    { sous_section: 5, display: 'V', titre: 'Annualité de la patente', articles: '287-290' },
                    { sous_section: 6, display: 'VI', titre: 'Justifications à produire', articles: '291-293' },
                    { sous_section: 7, display: 'VII', titre: 'Dispositions spéciales à certaines professions', articles: '294-300' },
                    { sous_section: 8, display: 'VIII', titre: 'Établissement des matrices et titres de perception', articles: '301-308' },
                    { sous_section: 9, display: 'IX', titre: 'Délivrance des formules et paiement', articles: '309-311' },
                    { sous_section: 10, display: 'X', titre: 'Déclarations', articles: '312-314 bis' },
                  ],
                },
                {
                  section: 6,
                  titre: 'Contribution des licences',
                  articles: '315-320',
                  statut: 'abrogé',
                },
                {
                  section: 7,
                  titre: 'Taxe régionale',
                  articles: '321-327',
                  sous_sections: [
                    { sous_section: 1, display: 'I', titre: 'Personnes imposables', articles: '321-322' },
                    { sous_section: 2, display: 'II', titre: 'Exemptions', articles: '323' },
                    { sous_section: 3, display: 'III', titre: 'Lieu d\'imposition', articles: '324-325' },
                    { sous_section: 4, display: 'IV', titre: 'Taux de la taxe', articles: '326' },
                    { sous_section: 5, display: 'V', titre: 'Établissement et recouvrement', articles: '327' },
                  ],
                },
                {
                  section: 8,
                  titre: 'Taxe additionnelle au chiffre d\'affaires',
                  articles: '328-330',
                  statut: 'abrogé',
                },
                {
                  section: 9,
                  titre: 'Taxe sur les spectacles, jeux et divertissements',
                  articles: '331-341',
                  sous_sections: [
                    { sous_section: 1, display: 'I', titre: 'Champ d\'application', articles: '331' },
                    { sous_section: 2, display: 'II', titre: 'Exemptions', articles: '332' },
                    { sous_section: 3, display: 'III', titre: 'Tarif', articles: '333-335' },
                    { sous_section: 4, display: 'IV', titre: 'Assiette et liquidation', articles: '336-339' },
                    { sous_section: 5, display: 'V', titre: 'Obligations des redevables', articles: '340' },
                    { sous_section: 6, display: 'VI', titre: 'Contrôle de la taxe', articles: '340 bis-341' },
                  ],
                },
              ],
            },
            {
              chapitre: 2,
              titre: 'Taxes facultatives',
              articles: '341-364',
              sections: [
                { section: 1, titre: 'Généralités', articles: '341' },
                { section: 2, titre: 'Taxe sur la valeur locative des locaux professionnels (Abrogé)', articles: '343-346' },
                { section: 3, titre: 'Taxe d\'enlèvement des ordures ménagères', articles: '347-354' },
                { section: 4, titre: 'Taxe sur les véhicules à moteur', articles: '355-364' },
              ],
            },
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
            { chapitre: 1, titre: 'Sanctions pour défaut de déclaration, déclarations tardives ou inexactes', articles: '372-381 ter' },
            {
              chapitre: 2,
              titre: 'Prescriptions',
              articles: '382-383',
              sections: [
                { section: 1, titre: 'IRPP, IS, TSS, TA, TVA, CA', articles: '382-382 ter' },
                { section: 2, titre: 'Autres impôts et taxes', articles: '383' },
              ],
            },
            { chapitre: 3, titre: 'Changement du lieu d\'imposition', articles: '384' },
            { chapitre: 4, titre: 'Conventions fiscales', articles: '385-386 bis' },
            { chapitre: 5, titre: 'Vérification des contribuables', articles: '387-390 bis J' },
            {
              chapitre: 6,
              titre: 'Droit de communication',
              articles: '391-399 quater',
              sections: [
                { section: 1, titre: 'Droit de communication auprès des entreprises privées', articles: '391-392' },
                { section: 2, titre: 'Droit de communication auprès des administrations publiques', articles: '393-396' },
                { section: 3, titre: 'Dispositions particulières', articles: '397' },
                { section: 4, titre: 'Dispositions communes', articles: '398-399 quater' },
              ],
            },
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
            {
              chapitre: 2,
              titre: 'Juridiction contentieuse',
              articles: '423-445',
              sections: [
                { section: 1, titre: 'Demandes en décharge ou réduction', articles: '423-434' },
                { section: 2, titre: 'Demandes présentées par le service du recouvrement', articles: '435-437' },
                { section: 3, titre: 'Dégrèvements d\'office', articles: '438-440' },
                { section: 4, titre: 'Dispositions diverses', articles: '441-445' },
              ],
            },
            {
              chapitre: 3,
              titre: 'Juridiction gracieuse',
              articles: '446-457',
              sections: [
                { section: 1, titre: 'Demande en remise ou modération', articles: '446-450' },
                { section: 2, titre: 'Demandes en remise de pénalités', articles: '451' },
                { section: 3, titre: 'États de cotes irrécouvrables', articles: '452-456' },
                { section: 4, titre: 'Dispositions diverses', articles: '457' },
              ],
            },
            { chapitre: 4, titre: 'Dispositions communes', articles: '458-458 bis' },
          ],
        },
        {
          titre: 4,
          titre_libelle: 'Recouvrement',
          chapitres: [
            {
              chapitre: 1,
              titre: 'Dispositions générales',
              articles: '459-510',
              sections: [
                { section: 1, titre: 'Exigibilité de l\'impôt', articles: '459-460 bis' },
                { section: 2, titre: 'Paiement de l\'impôt', articles: '461-466' },
                { section: 3, titre: 'Obligations des tiers', articles: '467-485' },
                { section: 4, titre: 'Mesures particulières', articles: '486-494' },
                { section: 5, titre: 'Oppositions, revendications, mesures conservatoires', articles: '495-504' },
                { section: 6, titre: 'Opérations comptables, responsabilités', articles: '505-510' },
              ],
            },
            {
              chapitre: 2,
              titre: 'Dispositions spéciales',
              articles: '511-518 quater A',
              sections: [
                { section: 1, titre: 'Sanctions pour défaut ou retard dans le versement de l\'IRPP ou de la taxe forfaitaire', articles: '511-515' },
                { section: 2, titre: 'Sanctions pour défaut ou retard dans le dépôt des relevés et déclarations relatifs à la TVA', articles: '516-518' },
                { section: '2 bis', titre: 'Sanctions pour défaut de précompte - impôt spécial sur les bons de caisse', articles: '518 bis' },
                { section: '2 ter', titre: 'Sanctions pour défaut ou retard dans le versement des acomptes IS', articles: '518 ter' },
                { section: '2 quater', titre: 'Compétence pour statuer en matière de paiement différé ou échelonné', articles: '518 quater A' },
              ],
            },
            {
              chapitre: 3,
              titre: 'Frais de poursuite et recouvrements spéciaux',
              articles: '518 quater B-520 E',
              sections: [
                { section: 1, titre: 'Paiement différé ou échelonné', articles: '518 quater B-518 quater C' },
                { section: 2, titre: 'Tarif des frais de poursuite', articles: '519' },
                { section: 3, titre: 'Recouvrement de la taxe sur les spectacles, jeux et divertissements', articles: '520' },
                { section: 4, titre: 'Recouvrement des recettes des ressources naturelles', articles: '520 bis, 520 A-520 E' },
              ],
            },
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
  annexes: { titre: 'Annexes au Tome 1', page: 142, tomeId: 'ANNEXES-1' },
};
