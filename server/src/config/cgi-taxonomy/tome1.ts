// server/src/config/cgi-taxonomy/tome1.ts

export const TOME_1 = {
  id: "tome-1",
  nom: "Code Général des Impôts - Tome 1",
  pageDebut: 9,
  pageFin: 147,

  parties: [
    // PARTIE 1 - IMPÔTS D'ÉTAT
    {
      id: "partie-1",
      nom: "Impôts d'État",
      pageDebut: 9,
      pageFin: 89,

      livres: [
        {
          id: "livre-1",
          nom: "Impôts directs et taxes assimilées",
          pageDebut: 9,
          pageFin: 89,

          chapitres: [
            {
              id: "chapitre-1",
              nom: "Impôt sur le revenu des personnes physiques (IRPP)",
              pageDebut: 9,
              pageFin: 38,
              statut: "EN_VIGUEUR",
              sections: [
                { id: "section-1", nom: "Dispositions générales", page: 9 },
                { id: "section-2", nom: "Revenus imposables", page: 12 },
                { id: "section-3", nom: "Déclaration des contribuables", page: 31 },
                { id: "section-4", nom: "Vérification des déclarations", page: 33 },
                { id: "section-5", nom: "Taxation d'office", page: 34 },
                { id: "section-6", nom: "Calcul de l'impôt", page: 35 },
                { id: "section-7", nom: "Cession, cessation ou décès", page: 37 },
              ]
            },
            {
              id: "chapitre-2",
              nom: "Impôt complémentaire",
              pageDebut: 39,
              pageFin: 39,
              statut: "ABROGE",
            },
            {
              id: "chapitre-3",
              nom: "Impôt sur les bénéfices des sociétés (IS)",
              pageDebut: 40,
              pageFin: 70,
              statut: "EN_VIGUEUR",
              sections: [
                { id: "section-1", nom: "Généralités", page: 40 },
                { id: "section-2", nom: "Champ d'application", page: 40 },
                { id: "section-3", nom: "Détermination du bénéfice imposable", page: 41 },
                { id: "section-4", nom: "Modalités d'imposition", page: 58 },
                { id: "section-5", nom: "Régimes particuliers", page: 61 },
              ]
            },
            {
              id: "chapitre-4",
              nom: "Dispositions communes",
              pageDebut: 71,
              pageFin: 73,
              statut: "EN_VIGUEUR",
            },
            {
              id: "chapitre-5",
              nom: "Taxes diverses",
              pageDebut: 74,
              pageFin: 80,
              statut: "EN_VIGUEUR",
            },
            {
              id: "chapitre-6",
              nom: "Dispositions diverses",
              pageDebut: 81,
              pageFin: 89,
              statut: "EN_VIGUEUR",
            },
          ]
        },
      ]
    },

    // PARTIE 2 - IMPOSITIONS COLLECTIVITÉS
    {
      id: "partie-2",
      nom: "Impositions perçues au profit des collectivités",
      pageDebut: 90,
      pageFin: 105,
    },

    // PARTIE 3 - DISPOSITIONS COMMUNES
    {
      id: "partie-3",
      nom: "Dispositions communes aux parties 1 et 2",
      pageDebut: 106,
      pageFin: 139,
    },

    // PARTIE 4 - SANCTIONS PÉNALES
    {
      id: "partie-4",
      nom: "Sanctions pénales",
      pageDebut: 140,
      pageFin: 141,
    },
  ],

  annexes: {
    nom: "Annexes au Tome 1",
    pageDebut: 142,
    pageFin: 147,
  }
};
