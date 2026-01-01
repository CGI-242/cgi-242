// server/src/config/cgi-taxonomy/keywords.ts

// Mots-clés pour améliorer la recherche sémantique
export const CGI_KEYWORDS: Record<string, string[]> = {
  "IRPP": ["impôt sur le revenu", "personnes physiques", "revenu imposable", "barème", "tranches"],
  "ITS": ["impôt sur les traitements et salaires", "retenue à la source", "employeur", "salaires"],
  "IS": ["impôt sur les sociétés", "bénéfices", "résultat fiscal", "amortissements", "provisions"],
  "TVA": ["taxe sur la valeur ajoutée", "déduction", "crédit", "exonération", "assujetti", "18%", "5%"],
  "IRVM": ["valeurs mobilières", "dividendes", "intérêts", "revenus de capitaux"],
  "IGF": ["impôt global forfaitaire", "micro-entreprise", "forfait"],
  "ASDI": ["acompte", "divers impôts", "retenue", "précompte"],
  "CAMU": ["couverture maladie universelle", "solidarité", "contribution"],
  "ZES": ["zone économique spéciale", "exonération", "investissement"],
  "enregistrement": ["actes", "mutations", "droits", "formalité", "notaire"],
  "timbre": ["contribution", "dimension", "passeport", "véhicule"],
  "recouvrement": ["paiement", "rôle", "poursuites", "prescription"],
  "contentieux": ["réclamation", "juridiction", "gracieux", "litige"],
  "contrôle": ["vérification", "redressement", "notification", "garanties"],
  "exonération": ["dispense", "franchise", "exemption", "réduction"],
};

// Taux d'imposition principaux
export const CGI_TAUX = {
  IS: { taux_normal: 28, taux_reduit: 25 },
  TVA: { taux_normal: 18, taux_reduit: 5, taux_zero: 0 },
  IRVM: { taux: 20 },
  IRPP: {
    tranches: [
      { min: 0, max: 464000, taux: 1 },
      { min: 464001, max: 1000000, taux: 10 },
      { min: 1000001, max: 3000000, taux: 25 },
      { min: 3000001, max: null, taux: 40 },
    ]
  },
  ITS: { taux: 7.7 },
  enregistrement: { mutation_immeuble: 15, societe: 1 }
};

// Fonction pour trouver les mots-clés dans un texte
export function extractKeywordsFromText(text: string): string[] {
  const keywords: string[] = [];
  const lowerText = text.toLowerCase();

  for (const [key, terms] of Object.entries(CGI_KEYWORDS)) {
    if (lowerText.includes(key.toLowerCase())) {
      keywords.push(key);
    }
    for (const term of terms) {
      if (lowerText.includes(term.toLowerCase()) && !keywords.includes(key)) {
        keywords.push(key);
        break;
      }
    }
  }

  return [...new Set(keywords)];
}
