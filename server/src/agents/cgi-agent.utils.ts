// server/src/agents/cgi-agent.utils.ts
// Utilitaires pour l'agent CGI

/**
 * Détecte si la question porte sur des valeurs numériques
 */
export function isNumericQuestion(query: string): boolean {
  const numericPatterns = [
    /combien/i,
    /quel(?:le)?s?\s+(?:est|sont|délai|durée|taux|montant|seuil)/i,
    /pendant\s+combien/i,
    /au bout de/i,
    /après\s+combien/i,
    /délai|durée|période/i,
    /taux|pourcentage|%/i,
    /montant|seuil|plafond/i,
    /\d+\s*(mois|ans?|jours?)/i,
    /barème|bareme|tranche/i,
  ];
  return numericPatterns.some((p) => p.test(query));
}

/**
 * Extrait les passages clés contenant des valeurs numériques
 */
export function extractKeyPassagesArray(fullText: string): string[] {
  const sentences = fullText
    .replace(/(\d)\.\s+(\d)/g, '$1§DECIMAL§$2')
    .replace(/Art\.\s+/g, 'Art§DOT§ ')
    .split(/[.;]\s+/)
    .map((s) =>
      s
        .replace(/§DECIMAL§/g, '.')
        .replace(/§DOT§/g, '.')
        .trim()
    )
    .filter((s) => s.length > 10);

  const keyPatterns = [
    /\d+\s*%/,
    /\d+[\s.]*\d*\s*(FCFA|francs)/i,
    /vingt|trente|quarante|cinquante|soixante/i,
    /\d+\s*(mois|ans?|jours?|heures?)/i,
    /délai|durée|période|absence/i,
    /taux|barème|seuil|plafond|minimum/i,
    /exonér|affranchi|exempté/i,
    /retenue|acompte|versement/i,
  ];

  const keyPassages = sentences.filter((sentence) =>
    keyPatterns.some((pattern) => pattern.test(sentence))
  );

  return keyPassages.slice(0, 5);
}

/**
 * Supprime tout formatage markdown et emojis de la réponse
 */
export function removeMarkdownAndEmojis(text: string): string {
  return text
    // Supprimer bold (**text** ou __text__)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Supprimer italique (*text* ou _text_)
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Supprimer headers (# ## ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Supprimer tirets multiples
    .replace(/---+/g, '')
    // Supprimer backticks
    .replace(/`([^`]+)`/g, '$1')
    // Supprimer emojis courants
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    // Supprimer symboles spéciaux et variation selectors
    .replace(/[\u{1F4CB}\u{1F4CC}\u{1F4A1}\u{1F4D6}\u{2705}\u{274C}\u{26A0}\u{1F534}\u{1F7E2}\u{1F7E1}\u{27A1}\u{2B05}\u{2B06}\u{2B07}]/gu, '')
    .replace(/\u{FE0F}/gu, '')
    // Nettoyer les espaces multiples
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
