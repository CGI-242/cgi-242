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
 * Gère les suffixes complexes:
 * - Lettres: A, B, C...
 * - Lettres avec numéro: C-1, C-2, D-1, E-9...
 * - Latin: bis, ter, quater...
 * - Combinaisons: A bis, B ter...
 *
 * Ordre: 126 < 126-A < 126-B < 126-C < 126-C-1 < 126-C-4 < 126-D < 126-D-6 < 126-E-9 < 126 bis < 126 ter
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

  // Cas 1: Lettre + numéro (ex: "c-1", "d-6", "e-9")
  // Format: lettre-numéro ou lettre numéro
  const letterNumMatch = cleanedSuffix.match(/^([a-z])\s*[-]?\s*(\d+)$/);
  if (letterNumMatch) {
    const letter = letterNumMatch[1].charCodeAt(0) - 96; // a=1, b=2, c=3...
    const num = parseInt(letterNumMatch[2], 10);
    // Ordre: 100 * lettre + numéro (ex: c-1 = 301, c-4 = 304, d-1 = 401)
    return 100 * letter + num;
  }

  // Cas 2: Latin seul ou avec "quater" qui a aussi des numéros (ex: "quater b-1")
  // Format: quater/quinquies + lettre + numéro (ex: "quater c-1", "quater b-2")
  const latinComplexMatch = cleanedSuffix.match(/^(bis|ter|quater|quinquies|sexies|septies|octies|nonies|decies|undecies|duodecies)\s+([a-z])\s*[-]?\s*(\d+)?$/);
  if (latinComplexMatch) {
    const latin = LATIN_ORDER[latinComplexMatch[1]] || 0;
    const letter = latinComplexMatch[2].charCodeAt(0) - 96;
    const num = latinComplexMatch[3] ? parseInt(latinComplexMatch[3], 10) : 0;
    // Ordre: 10000 + latin*1000 + lettre*100 + num
    return 10000 + latin * 1000 + letter * 100 + num;
  }

  // Cas 3: Lettre seule (ex: "a", "b", "c")
  const letterOnlyMatch = cleanedSuffix.match(/^([a-z])$/);
  if (letterOnlyMatch) {
    const letter = letterOnlyMatch[1].charCodeAt(0) - 96;
    // Ordre: 100 * lettre (ex: a = 100, b = 200, c = 300)
    return 100 * letter;
  }

  // Cas 4: Latin seul (ex: "bis", "ter", "quater")
  const latinOnlyMatch = cleanedSuffix.match(/^(bis|ter|quater|quinquies|sexies|septies|octies|nonies|decies|undecies|duodecies)$/);
  if (latinOnlyMatch) {
    // Les latins viennent APRÈS toutes les lettres (après z = 26, donc 2700+)
    return 5000 + LATIN_ORDER[latinOnlyMatch[1]];
  }

  // Cas 5: Lettre + latin (ex: "a bis", "b ter")
  const letterLatinMatch = cleanedSuffix.match(/^([a-z])\s*(bis|ter|quater|quinquies|sexies|septies|octies|nonies|decies|undecies|duodecies)$/);
  if (letterLatinMatch) {
    const letter = letterLatinMatch[1].charCodeAt(0) - 96;
    const latin = LATIN_ORDER[letterLatinMatch[2]];
    // Ordre: après les latins simples
    return 6000 + letter * 100 + latin;
  }

  // Suffixe non reconnu - mettre à la fin
  return 9999;
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

    // Cas spécial: plage avec suffixes complexes (ex: "126-C-1 à 126-C-4", "126-D à 126-D-6")
    const rangeMatch = ss.articles.match(/^([\d]+-[A-Za-z]+-?\d*)\s*[àa]\s*([\d]+-[A-Za-z]+-?\d*)$/i);
    if (rangeMatch) {
      const firstArticle = rangeMatch[1].toLowerCase().replace(/\s+/g, '');
      if (normalizedNumero === firstArticle) {
        return ss.titre;
      }
      continue;
    }

    // Extraire le premier article de la plage (ex: "12-65 bis" -> "12", "86A-86D" -> "86A")
    const ssMatch = ss.articles.match(/^(\d+[A-Za-z]*)/);
    if (ssMatch) {
      const ssStart = ssMatch[1].toLowerCase();
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
 * Extrait le préfixe lettre majuscule (A., A), A-...) du titre
 */
export function getUpperLetterPrefix(titre: string | undefined): string | null {
  if (!titre) return null;
  // Format "I. Xxx : A. Contribuables...", "A) Régime..." ou "A- Régime..."
  const match = titre.match(/(?:^|:\s*)([A-Z])[-.)]\s*/);
  if (match) return match[1];
  return null;
}

/**
 * Extrait le préfixe de paragraphe numéroté (1), 2), 3)... ou 1-, 2-, 3-...) du titre
 */
export function getParagraphPrefix(titre: string | undefined): string | null {
  if (!titre) return null;
  // Pattern avec deux-points: "X: 1) ..."
  const matchColon = titre.match(/:\s*(\d+)[-)]/);
  if (matchColon) return matchColon[1];
  // Pattern au début: "1) ..."
  const matchStart = titre.match(/^(\d+)\)/);
  if (matchStart) return matchStart[1];
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
 * Ex: "Sous-section 4 : 1- Conditions..." -> "1- Conditions..."
 * Ex: "1) Charges de personnel" -> "1) Charges de personnel"
 */
export function getParagraphHeader(titre: string | undefined): string | null {
  if (!titre) return null;
  // Pattern avec deux-points: "X: 1) ..."
  const matchColon = titre.match(/:\s*(\d+[-)]\s*[^:]+)/);
  if (matchColon) {
    return matchColon[1].trim();
  }
  // Pattern au début: "1) ..." - retourne tout le titre
  const matchStart = titre.match(/^(\d+\)\s*.+)/);
  if (matchStart) {
    return matchStart[1].trim();
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
