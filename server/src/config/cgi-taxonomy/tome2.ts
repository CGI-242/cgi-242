// server/src/config/cgi-taxonomy/tome2.ts

export const TOME_2 = {
  id: "tome-2",
  nom: "Code Général des Impôts - Tome 2",
  pageDebut: 149,
  pageFin: 240,

  livres: [
    {
      id: "livre-1",
      nom: "Enregistrement des actes et mutations",
      pageDebut: 149,
      pageFin: 203,
      chapitres: [
        { id: "chapitre-1", nom: "De l'enregistrement", pageDebut: 149, pageFin: 150 },
        { id: "chapitre-2", nom: "Assiette des droits", pageDebut: 151, pageFin: 157 },
        { id: "chapitre-3", nom: "Délais pour l'enregistrement", pageDebut: 158, pageFin: 161 },
        { id: "chapitre-4", nom: "Bureaux d'enregistrement", pageDebut: 162, pageFin: 162 },
        { id: "chapitre-5", nom: "Paiement des droits", pageDebut: 162, pageFin: 163 },
        { id: "chapitre-6", nom: "Peines pour défaut d'enregistrement", pageDebut: 164, pageFin: 166 },
        { id: "chapitre-7", nom: "Insuffisances et dissimulations", pageDebut: 167, pageFin: 168 },
        { id: "chapitre-8", nom: "Obligations des parties", pageDebut: 169, pageFin: 178 },
        { id: "chapitre-9", nom: "Droits acquis et prescriptions", pageDebut: 179, pageFin: 180 },
        { id: "chapitre-10", nom: "Poursuites et instances", pageDebut: 181, pageFin: 181 },
        { id: "chapitre-11", nom: "Fixation des droits", pageDebut: 182, pageFin: 192 },
        { id: "chapitre-12", nom: "Enregistrement en débet, gratis et exemptions", pageDebut: 193, pageFin: 199 },
        { id: "chapitre-13", nom: "Taxe spéciale sur les assurances", pageDebut: 200, pageFin: 202 },
      ]
    },
    {
      id: "livre-2",
      nom: "Contribution du timbre",
      pageDebut: 205,
      pageFin: 221,
      chapitres: [
        { id: "chapitre-1", nom: "Dispositions générales", pageDebut: 205, pageFin: 207 },
        { id: "chapitre-2", nom: "Timbre de dimension", pageDebut: 208, pageFin: 210 },
        { id: "chapitre-3", nom: "Timbres passeports et cartes d'identité", pageDebut: 211, pageFin: 211 },
        { id: "chapitre-4", nom: "Visa spécial et actes exempts", pageDebut: 212, pageFin: 218 },
        { id: "chapitre-5", nom: "Droits de timbre des effets de commerce", pageDebut: 219, pageFin: 219 },
        { id: "chapitre-6", nom: "Droit de timbre sur les véhicules", pageDebut: 220, pageFin: 221 },
      ]
    },
    {
      id: "livre-3",
      nom: "Impôt sur le revenu des valeurs mobilières (IRVM)",
      pageDebut: 222,
      pageFin: 230,
      chapitres: [
        { id: "chapitre-1", nom: "Dispositions générales", pageDebut: 222, pageFin: 225 },
        { id: "chapitre-2", nom: "Dispositions diverses", pageDebut: 226, pageFin: 226 },
        { id: "chapitre-3", nom: "Exemptions", pageDebut: 226, pageFin: 229 },
        { id: "chapitre-4", nom: "Déclarations des sociétés", pageDebut: 230, pageFin: 230 },
      ]
    },
    {
      id: "livre-4",
      nom: "Taxe immobilière",
      pageDebut: 231,
      pageFin: 232,
    },
    {
      id: "livre-5",
      nom: "Curatelle",
      pageDebut: 233,
      pageFin: 239,
    },
    {
      id: "livre-6",
      nom: "Taxe sur le kilowatt/heure",
      pageDebut: 239,
      pageFin: 239,
      statut: "ABROGE",
    },
    {
      id: "livre-7",
      nom: "Taxe sur les appareils automatiques",
      pageDebut: 240,
      pageFin: 240,
    },
    {
      id: "livre-8",
      nom: "Droits relatifs aux domaines de l'État",
      pageDebut: 240,
      pageFin: 240,
    },
  ]
};
