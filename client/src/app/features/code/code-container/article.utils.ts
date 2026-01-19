/**
 * Utilitaires pour le traitement des articles du CGI
 * - Tri des articles
 * - Parsing des plages d'articles
 * - Extraction des headers (sous-sections, romains, paragraphes)
 */

// Ordre des suffixes latins pour le tri
const LATIN_ORDER: Record<string, number> = {
  'bis': 1,
  'ter': 2,
  'quater': 3,
  'quinquies': 4,
  'sexies': 5,
  'septies': 6,
  'octies': 7,
  'nonies': 8,
  'decies': 9,
  'undecies': 10,
  'duodecies': 11,
};

/**
 * Retourne l'ordre de tri pour un numéro d'article
 * Gère les suffixes latins (bis, ter...) et les lettres (A, B...)
 * Ordre: 113 < 113-A < 113-B < 113-C < 113 bis < 113-A bis < ...
 */
export function getArticleSortOrder(numero: string): number {
  const match = numero.toLowerCase().match(/^(\d+)\s*[-]?\s*(.*)$/);
  if (!match) return 0;

  // Retirer les annotations comme "(L.F. 2023)" avant de traiter le suffixe
  const cleanedSuffix = match[2].trim().replace(/\s*\([^)]*\)\s*/g, '');

  // Pas de suffixe = article de base
  if (!cleanedSuffix) {
    return 0;
  }

  // Parser le suffixe pour extraire lettre et latin séparément
  const suffixMatch = cleanedSuffix.match(/^([a-z])?\s*(bis|ter|quater|quinquies|sexies|septies|octies|nonies|decies|undecies|duodecies)?$/);

  if (!suffixMatch) {
    return 9999; // Suffixe non reconnu
  }

  const letterPart = suffixMatch[1];
  const latinPart = suffixMatch[2];

  // Calcul de l'ordre:
  // - Lettre seule (A, B, C): a=1, b=2, c=3...
  // - Latin seul (bis, ter): 1000 + bis=1, ter=2... (après les lettres)
  // - Lettre + latin (A bis): 2000 + lettre*100 + latin
  if (letterPart && latinPart) {
    return 2000 + (letterPart.charCodeAt(0) - 96) * 100 + LATIN_ORDER[latinPart];
  } else if (latinPart) {
    return 1000 + LATIN_ORDER[latinPart];
  } else if (letterPart) {
    return letterPart.charCodeAt(0) - 96;
  }

  return 0;
}

/**
 * Vérifie si un numéro d'article est dans une plage
 * Exemples: "1-65 bis", "107-A", "4-4A-7"
 */
export function isArticleInRange(numero: string, range: string): boolean {
  // Normaliser pour la comparaison (ex: "107-A" -> "107-a")
  const normalizedNumero = numero.toLowerCase().replace(/\s+/g, '');
  const normalizedRange = range.toLowerCase().replace(/\s+/g, '');

  // Cas spécial: article unique avec suffixe lettre (ex: "107-A", "126-B")
  if (/^\d+-[a-z]+$/.test(normalizedRange)) {
    return normalizedNumero === normalizedRange;
  }

  // Extraire le numéro de l'article (partie numérique)
  const match = numero.match(/^(\d+)/);
  if (!match) return false;
  const articleNum = parseInt(match[1], 10);

  // Parser la plage (ex: "1-65 bis" -> start=1, end=65)
  const rangeMatch = range.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    return articleNum >= start && articleNum <= end;
  }

  // Si pas de plage, vérifier si c'est un article unique ou une liste
  const parts = range.split('-').map(p => p.trim());

  // Si c'est un seul article (ex: "1")
  if (parts.length === 1) {
    const singleNum = parseInt(parts[0].match(/^(\d+)/)?.[1] || '0', 10);
    return articleNum === singleNum;
  }

  // Si c'est une liste avec lettres (ex: "4-4A-7" ou "3-3A")
  const nums = parts.map(p => parseInt(p.match(/^(\d+)/)?.[1] || '0', 10)).filter(n => n > 0);
  if (nums.length >= 2) {
    const start = Math.min(...nums);
    const end = Math.max(...nums);
    return articleNum >= start && articleNum <= end;
  }

  return false;
}

/**
 * Retourne le titre de la sous-section si l'article est le premier de cette sous-section
 */
export function getSousSectionHeader(
  articleNumero: string,
  sousSections: { titre: string; articles: string }[]
): string | null {
  if (!sousSections.length) return null;

  const normalizedNumero = articleNumero.toLowerCase().replace(/\s+/g, '');

  for (const ss of sousSections) {
    const normalizedSsArticles = ss.articles.toLowerCase().replace(/\s+/g, '');

    // Cas spécial: article unique avec suffixe lettre (ex: "107-A", "126-B")
    if (/^\d+-[a-z]+$/.test(normalizedSsArticles)) {
      if (normalizedNumero === normalizedSsArticles) {
        return ss.titre;
      }
      continue;
    }

    // Extraire le premier article de la plage (ex: "12-65 bis" -> "12")
    const ssMatch = ss.articles.match(/^(\d+)/);
    if (ssMatch) {
      const ssStart = ssMatch[1];
      // Match exact ou avec suffixe (L.F. xxxx)
      if (normalizedNumero === ssStart || normalizedNumero.startsWith(ssStart + '(')) {
        return ss.titre;
      }
    }
  }
  return null;
}

/**
 * Extrait le préfixe romain (I., II., III... jusqu'à X) du titre
 */
export function getRomanPrefix(titre: string | undefined): string | null {
  if (!titre) return null;
  const romanMatch = titre.match(/^(X|IX|VIII|VII|VI|V|IV|III|II|I)\.\s*/);
  if (romanMatch) return romanMatch[1];
  return null;
}

/**
 * Extrait le préfixe lettre majuscule (A., B., C...) du titre
 */
export function getUpperLetterPrefix(titre: string | undefined): string | null {
  if (!titre) return null;
  // Format "I. Xxx : A. Contribuables..." ou directement "A. Contribuables..."
  const match = titre.match(/(?:^|:\s*)([A-Z])\.\s+/);
  if (match) return match[1];
  return null;
}

/**
 * Extrait le préfixe de paragraphe numéroté (1), 2), 3)...) du titre
 */
export function getParagraphPrefix(titre: string | undefined): string | null {
  if (!titre) return null;
  const match = titre.match(/:\s*(\d+)\)/);
  if (match) return match[1];
  return null;
}

/**
 * Extrait le préfixe lettre minuscule (a), b), c)...) du titre
 */
export function getLetterPrefix(titre: string | undefined): string | null {
  if (!titre) return null;
  const match = titre.match(/:\s*([a-z])\)/);
  if (match) return match[1];
  return null;
}

/**
 * Nettoie le titre pour l'affichage (retire les préfixes)
 */
export function getCleanTitle(titre: string | undefined): string {
  if (!titre) return '';
  // Extraire la dernière partie après le dernier ":"
  const parts = titre.split(':');
  let result = parts.length > 1 ? parts[parts.length - 1].trim() : titre;
  // Retirer le préfixe numéroté "1) ", "2) ", "3) "...
  result = result.replace(/^\d+\)\s*/, '');
  // Retirer le préfixe lettre "a) ", "b) "...
  result = result.replace(/^[a-z]\)\s*/, '');
  return result;
}

/**
 * Extrait le header de paragraphe complet du titre
 * Ex: "I. Revenus fonciers : 3) Détermination..." -> "3) Détermination du revenu imposable"
 */
export function getParagraphHeader(titre: string | undefined): string | null {
  if (!titre) return null;
  const match = titre.match(/:\s*(\d+\)\s*[^:]+)/);
  if (match) {
    return match[1].trim();
  }
  return null;
}

/**
 * Extrait le header de lettre complet du titre
 * Ex: "... : a) Régime du forfait" -> "a) Régime du forfait"
 */
export function getLetterHeader(titre: string | undefined): string | null {
  if (!titre) return null;
  const match = titre.match(/:\s*([a-z]\)\s*[^:]+)$/);
  if (match) {
    return match[1].trim();
  }
  return null;
}

/**
 * Extrait le header lettre majuscule complet du titre
 * Ex: "I. Xxx : A. Contribuables domiciliés" -> "A. Contribuables domiciliés"
 */
export function getUpperLetterHeader(titre: string | undefined): string | null {
  if (!titre) return null;
  const match = titre.match(/(?:^|:\s*)([A-Z]\.\s+[^:]+)/);
  if (match) {
    return match[1].trim();
  }
  return null;
}

/**
 * Extrait le header romain complet du titre
 * Ex: "I. Personnes imposables : ..." -> "I. Personnes imposables"
 */
export function getRomanHeader(titre: string | undefined): string | null {
  if (!titre) return null;
  const romanRegex = /^(X|IX|VIII|VII|VI|V|IV|III|II|I)\.\s*([^:]+)/;
  const match = titre.match(romanRegex);
  if (match) return `${match[1]}. ${match[2].trim()}`;
  return null;
}
