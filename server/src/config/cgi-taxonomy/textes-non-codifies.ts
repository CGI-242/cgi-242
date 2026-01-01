// server/src/config/cgi-taxonomy/textes-non-codifies.ts

export const TEXTES_NON_CODIFIES = {
  id: "textes-non-codifies",
  nom: "Textes fiscaux non codifiés",
  pageDebut: 241,
  pageFin: 470,

  sections: [
    {
      id: "conventions-fiscales",
      nom: "Conventions fiscales",
      pageDebut: 241,
      pageFin: 336,
      items: [
        { id: "conv-cemac", nom: "Convention fiscale CEMAC", page: 241 },
        { id: "conv-chine", nom: "Convention fiscale avec la Chine", page: 261 },
        { id: "conv-france", nom: "Convention fiscale avec la France", page: 274 },
        { id: "conv-italie", nom: "Convention fiscale avec l'Italie", page: 290 },
        { id: "conv-maurice", nom: "Convention fiscale avec Maurice", page: 305 },
        { id: "conv-rwanda", nom: "Convention fiscale avec le Rwanda", page: 319 },
      ]
    },
    {
      id: "investissements",
      nom: "Textes relatifs aux investissements",
      pageDebut: 337,
      pageFin: 367,
      items: [
        { id: "charte-invest", nom: "Charte des investissements", page: 337 },
        { id: "agrement", nom: "Modalités d'agrément des entreprises", page: 344 },
        { id: "zes", nom: "Zones économiques spéciales (ZES)", page: 352 },
        { id: "zones-franches-sante", nom: "Zones franches de santé", page: 360 },
        { id: "entrepreneuriat", nom: "Encouragement à l'entrepreneuriat", page: 363 },
        { id: "bvmac", nom: "Opérations sur titres BVMAC", page: 364 },
      ]
    },
    {
      id: "mines-hydrocarbures",
      nom: "Fiscalité des mines et des hydrocarbures",
      pageDebut: 368,
      pageFin: 407,
      items: [
        { id: "code-hydrocarbures", nom: "Dispositions fiscales du Code des hydrocarbures", page: 368 },
        { id: "secteur-petrolier", nom: "Dispositions fiscales au secteur pétrolier amont", page: 375 },
        { id: "tva-petrolier", nom: "Modalités TVA au secteur pétrolier", page: 397 },
        { id: "code-minier", nom: "Dispositions fiscales du Code minier", page: 402 },
      ]
    },
    {
      id: "impots-taxes-divers",
      nom: "Impôts, taxes et retenues divers",
      pageDebut: 408,
      pageFin: 436,
      items: [
        { id: "asdi", nom: "Acompte sur divers impôts (ASDI)", page: 408 },
        { id: "camu", nom: "Contribution de solidarité pour la CAMU", page: 410 },
        { id: "accises", nom: "Droits d'accises et taxes assimilées", page: 411 },
        { id: "igf", nom: "Impôt global forfaitaire (IGF)", page: 420 },
        { id: "taxe-occupation-locaux", nom: "Taxe d'occupation des locaux", page: 425 },
        { id: "taxe-communications", nom: "Taxe sur les communications électroniques", page: 427 },
        { id: "taxe-unique-salaires", nom: "Taxe unique sur les salaires", page: 434 },
      ]
    },
    {
      id: "tva",
      nom: "Taxe sur la valeur ajoutée (TVA)",
      pageDebut: 453,
      pageFin: 468,
      chapitres: [
        { id: "tva-chapitre-1", nom: "Champ d'application", pageDebut: 453, pageFin: 458 },
        { id: "tva-chapitre-2", nom: "Fait générateur et exigibilité", pageDebut: 459, pageFin: 459 },
        { id: "tva-chapitre-3", nom: "Base d'imposition et taux", pageDebut: 460, pageFin: 461 },
        { id: "tva-chapitre-4", nom: "Régime des déductions", pageDebut: 462, pageFin: 463 },
        { id: "tva-chapitre-5", nom: "Modalités pratiques", pageDebut: 464, pageFin: 467 },
      ],
    },
  ],
};
