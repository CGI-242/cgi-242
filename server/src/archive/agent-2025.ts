// server/src/agents/agent-2025.ts
import { BaseAgent, AgentConfig, AgentContext, AgentResponse, ArticleSource, AgentMetadata } from './base-agent.js';
import { hybridSearch } from '../services/rag/hybrid-search.service.js';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Agent2025');

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

const SYSTEM_PROMPT_2025 = `Tu es CGI 242, l'assistant fiscal intelligent de NORMX AI, spécialisé dans le Code Général des Impôts du Congo - Édition 2025.

IDENTITÉ
- Produit : CGI 242 by NORMX AI
- Marque : NORMX AI (INPI n°5146181)
- Spécialité : Fiscalité congolaise (République du Congo)
- Périmètre : Régime fiscal 2025 (avant réforme ITS)

RÈGLES DE GROUNDING (PRIORITÉ MAXIMALE)
- Tu ne peux citer QUE les articles présents dans le CONTEXTE CGI ci-dessous
- NE JAMAIS inventer de numéro d'article, chiffre, taux ou montant
- Si l'info n'est pas dans le contexte : "Information non disponible dans les articles consultés."

RÈGLE DE CITATION : SOURCE PRIMAIRE
Quand plusieurs articles traitent du même sujet, cite celui qui DÉFINIT le concept :
- "Catégories de revenus" → Art. 1 (définit les 7 catégories)
- "Personnes imposables" → Art. 2 (définit qui est imposable)
- "Barème IRPP" → Art. 95 (définit les tranches)
- "Précompte libératoire bons de caisse" → Art. 61 (caractère libératoire)

RÈGLE PRÉCOMPTE LIBÉRATOIRE (PRIORITÉ HAUTE)
Si la question porte sur des revenus ayant supporté un précompte libératoire (bons de caisse 15%, IRCM 15%), tu DOIS :
1. Citer l'article 61 du CGI en priorité (pas l'article 76)
2. Mentionner le caractère LIBÉRATOIRE du précompte
3. Conclure que ces revenus n'ont PAS à être déclarés dans l'IRPP
4. Ne pas mentionner l'obligation générale de déclaration (Art. 76) qui ne s'applique pas ici

FORMAT DE RÉPONSE STRICT (À SUIVRE EXACTEMENT)

RÈGLE ABSOLUE : CONCISION ET CLARTÉ
- JAMAIS de markdown (** __ # ##)
- JAMAIS de répétition d'article
- JAMAIS de phrases inutiles
- Maximum 4 phrases au total

TEMPLATE EXACT À SUIVRE :

[L'article X du CGI dispose que... + réponse complète]

NE PAS écrire "Source : CGI 2025" - la source s'affiche automatiquement.

RÈGLES STRICTES :
1. TOUJOURS commencer par la règle de droit :
   - "L'article X du CGI dispose que..."
   - OU "Selon l'article X du CGI, ..."
   - JAMAIS commencer par "Voici", "Il existe", "Le montant est"

2. Intégrer la réponse dans la même phrase que l'article
   - Exemple : "L'article 1 du CGI dispose que le revenu net global comprend 7 catégories : 1) ... ; 2) ..."

3. Citer l'article UNE SEULE FOIS

4. Maximum 3 phrases au total

5. LIGNE VIDE obligatoire avant Source

6. SOURCE sur ligne séparée : "Source : CGI 2025"

EXEMPLES CORRECTS :

Q: Un contribuable détient des bons de caisse ayant supporté le précompte de 15%. Doit-il les déclarer ?

L'article 61 du CGI dispose que le précompte de 15% sur les bons de caisse est libératoire de l'impôt sur le revenu. Ces revenus n'ont donc pas à être déclarés dans l'IRPP.

---

Q: Quelles sont les catégories de revenus imposables à l'IRPP ?

L'article 1 du CGI dispose que le revenu net global imposable comprend 7 catégories :

1) les revenus fonciers ;
2) les bénéfices industriels et commerciaux ;
3) les traitements et salaires ;
4) les bénéfices non commerciaux ;
5) les revenus des capitaux mobiliers ;
6) les plus-values ;
7) les bénéfices agricoles.

---

Q: Quelle est la durée d'absence qui fait perdre la résidence fiscale ?

L'article 2 du CGI dispose qu'une absence continue supérieure à vingt-quatre mois entraîne la perte de la résidence fiscale au Congo.

---

Q: Quel est le taux de l'IS au Congo ?

L'article 122 du CGI dispose que le taux normal de l'impôt sur les sociétés est de 28%.

INTERDIT (ERREURS À ÉVITER) :
- Commencer par "Voici", "Il existe", "Le montant est" → TOUJOURS commencer par "L'article X du CGI dispose que..."
- Répéter le même article plusieurs fois
- Écrire "Source : CGI 2025" (s'affiche automatiquement)
- Plus de 3 phrases
- Mettre tous les éléments d'une liste sur la même ligne

RÈGLE LISTES (TRÈS IMPORTANT) :
Quand tu listes des éléments (3 ou plus), UTILISE DES RETOURS À LA LIGNE :

[Phrase d'introduction] :

1) [élément 1] ;
2) [élément 2] ;
3) [élément 3].

RÈGLES LISTES OBLIGATOIRES :
- Phrase d'introduction terminée par ":"
- RETOUR À LA LIGNE après les ":"
- UN SEUL élément par ligne
- RETOUR À LA LIGNE après CHAQUE élément
- Numérotation : 1) 2) 3) etc.
- Point-virgule (;) à la fin de chaque élément SAUF le dernier
- Point (.) à la fin du DERNIER élément uniquement
- JAMAIS tous les éléments sur une seule ligne
- NE JAMAIS écrire "Source : CGI 2025" (s'affiche automatiquement)

RÈGLES TTS (lecture audio) :
- Sigles : écrire en entier la première fois

DOMAINES :
- IRPP : Barème 1%, 10%, 25%, 40%
- IS : 28%
- TVA : 18% (normal), 5% (réduit)`;

const config2025: AgentConfig = {
  name: 'Agent CGI 2025',
  version: '2025',
  validFrom: '2025-01-01',
  validUntil: '2025-12-31',
  knowledgeBasePath: 'data/cgi/2025',
  systemPrompt: SYSTEM_PROMPT_2025,
};

/**
 * Agent spécialisé pour le CGI 2025 (avant réforme ITS)
 */
export class Agent2025 extends BaseAgent {
  constructor() {
    super(config2025);
  }

  /**
   * Détecte si la question porte sur des valeurs numériques (délais, taux, montants)
   */
  private isNumericQuestion(query: string): boolean {
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
    ];
    return numericPatterns.some((p) => p.test(query));
  }

  /**
   * Supprime tout formatage markdown de la réponse
   * Appliqué en post-processing pour garantir une réponse en prose naturelle
   */
  private removeMarkdown(text: string): string {
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
      // Nettoyer les espaces multiples SANS toucher aux retours à la ligne
      .replace(/[^\S\n]+/g, ' ')  // Remplace espaces/tabs multiples par un seul espace, PRÉSERVE \n
      .replace(/\n{3,}/g, '\n\n') // Max 2 retours à la ligne consécutifs
      .trim();
  }

  /**
   * Met en évidence les valeurs numériques dans le texte (post-processing)
   * DÉSACTIVÉ : plus de markdown dans les réponses
   */
  private highlightNumericValues(text: string): string {
    // Ne plus ajouter de markdown - retourner le texte tel quel
    return text;
  }

  /**
   * Extrait les passages clés contenant des valeurs numériques
   * DOIT être appelé sur le contenu COMPLET, pas tronqué
   * @returns Array de phrases clés (max 5)
   */
  private extractKeyPassagesArray(fullText: string): string[] {
    // Découper en phrases (attention aux abréviations)
    const sentences = fullText
      .replace(/(\d)\.\s+(\d)/g, '$1§DECIMAL§$2') // Protéger les décimales
      .replace(/Art\.\s+/g, 'Art§DOT§ ')          // Protéger "Art."
      .split(/[.;]\s+/)
      .map((s) =>
        s
          .replace(/§DECIMAL§/g, '.')
          .replace(/§DOT§/g, '.')
          .trim()
      )
      .filter((s) => s.length > 10);

    // Patterns pour identifier les passages importants
    const keyPatterns = [
      /\d+\s*%/,                                    // Pourcentages : 1%, 10%
      /\d+[\s.]*\d*\s*(FCFA|francs)/i,             // Montants : 100.000 FCFA
      /vingt|trente|quarante|cinquante|soixante/i, // Nombres en lettres
      /\d+\s*(mois|ans?|jours?|heures?)/i,         // Durées : 24 mois, 5 ans
      /délai|durée|période|absence/i,              // Termes temporels
      /taux|barème|seuil|plafond|minimum/i,        // Termes fiscaux
      /exonér|affranchi|exempté/i,                 // Exonérations
      /perte|acqui|perd/i,                         // Acquisition/perte de droits
    ];

    const keyPassages = sentences.filter((sentence) =>
      keyPatterns.some((pattern) => pattern.test(sentence))
    );

    // Limiter à 5 passages clés max
    return keyPassages.slice(0, 5);
  }

  /**
   * Traite une requête utilisateur avec le contexte CGI 2025
   */
  async process(query: string, context?: AgentContext): Promise<AgentResponse> {
    const startTime = Date.now();
    logger.info(`[Agent2025] Traitement: "${query.substring(0, 100)}..."`);

    try {
      // 1. Recherche dans la base de connaissances 2025 (8 articles pour meilleure couverture)
      const sources = await this.searchKnowledgeBase(query, 8);

      // 1.1 Logger les articles consultés pour traçabilité et debug
      logger.info(`[Agent2025] Articles consultés pour "${query.substring(0, 50)}...":`, {
        count: sources.length,
        articles: sources.map((s) => ({
          numero: s.numero,
          titre: s.titre,
        })),
      });

      // 1.2 Détecter si question numérique pour extraction ciblée
      const isNumeric = this.isNumericQuestion(query);
      logger.info(`[Agent2025] Question numérique détectée: ${isNumeric}`);

      // 2. Construire le contexte avec les articles trouvés
      // FORMAT CORRIGÉ : Éviter "ARTICLE 1:" qui crée confusion avec les vrais numéros
      const articlesContext = sources
        .slice(0, 6) // Max 6 articles pour Haiku
        .map((s) => {
          // Format clair : **Art. X** (CGI 2025) - Titre
          const header = `**Art. ${s.numero}** (CGI 2025)${s.titre ? ` - ${s.titre}` : ''}`;

          // Si keyPassages disponibles, les afficher en priorité
          const keyPassagesSection =
            s.keyPassages && s.keyPassages.length > 0
              ? `\n**INFORMATIONS CLÉS:**\n${s.keyPassages.map((p) => `- ${p}`).join('\n')}\n`
              : '';

          return `---\n${header}\n${keyPassagesSection}\n**Texte:**\n${s.extrait}`;
        })
        .join('\n\n');

      // 3. Préparer le système prompt avec contexte
      // Ajouter instructions d'extraction si question numérique
      const numericInstruction = isNumeric
        ? `\n\n## INSTRUCTION SPÉCIALE - EXTRACTION NUMÉRIQUE
Cette question porte sur une VALEUR NUMÉRIQUE (délai, durée, taux, montant).
Tu DOIS :
1. Scanner le contexte pour trouver les CHIFFRES ou NOMBRES EN LETTRES
2. Chercher : pourcentages (%), durées (mois, ans, jours), montants (FCFA, francs)
3. Chercher les nombres en lettres : vingt-quatre, trente, cinquante, etc.
4. CITER EXACTEMENT le passage contenant la valeur numérique`
        : '';

      const systemPromptWithContext = `${this.getSystemPrompt()}${numericInstruction}\n\nCONTEXTE CGI 2025:\n${articlesContext || 'Aucun article trouvé.'}`;

      // 4. Préparer les messages pour Claude
      const messages: Anthropic.MessageParam[] = [
        ...(context?.previousMessages || [])
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        { role: 'user', content: query },
      ];

      // 5. Appeler Claude Haiku avec température 0 (précision maximale)
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        system: systemPromptWithContext,
        messages,
        temperature: 0, // Précision maximale, réduit les hallucinations
      });

      let answer =
        completion.content[0]?.type === 'text' ? completion.content[0].text : '';

      // DEBUG: Log réponse brute AVANT traitement
      logger.info('[Agent2025] === RÉPONSE BRUTE (avant traitement) ===');
      logger.info(answer);
      logger.info('[Agent2025] === FIN RÉPONSE BRUTE ===');

      // Vérifier présence de retours à la ligne
      const newlineCount = (answer.match(/\n/g) || []).length;
      logger.info(`[Agent2025] Nombre de retours à la ligne dans réponse brute: ${newlineCount}`);

      // 6. Post-processing : supprimer tout markdown de la réponse
      answer = this.removeMarkdown(answer);

      // 7. Supprimer "Source : CGI 2025" si présent (s'affiche automatiquement dans l'UI)
      answer = answer.replace(/\n*Source\s*:\s*CGI\s*\d{4}\s*$/i, '').trim();

      // DEBUG: Log réponse APRÈS traitement
      logger.info('[Agent2025] === RÉPONSE APRÈS removeMarkdown ===');
      logger.info(answer);
      logger.info('[Agent2025] === FIN RÉPONSE TRAITÉE ===');

      const newlineCountAfter = (answer.match(/\n/g) || []).length;
      logger.info(`[Agent2025] Nombre de retours à la ligne APRÈS traitement: ${newlineCountAfter}`);

      logger.info(`[Agent2025] Réponse générée en ${Date.now() - startTime}ms`);
      logger.info(`[Agent2025] Articles trouvés:`, sources.map((s) => s.numero));

      // Construire les metadata pour traçabilité
      const metadata: AgentMetadata = {
        articlesConsulted: sources.map((s) => s.numero),
        queryTime: Date.now() - startTime,
        model: 'claude-3-haiku-20240307',
        temperature: 0,
      };

      return this.buildResponse(answer, sources, startTime, metadata);
    } catch (error) {
      logger.error('[Agent2025] Erreur:', error);
      throw error;
    }
  }

  /**
   * Recherche dans la base de connaissances CGI 2025 (recherche hybride)
   * Extrait les passages clés du contenu COMPLET avant troncature
   */
  async searchKnowledgeBase(query: string, limit = 8): Promise<ArticleSource[]> {
    try {
      // Utiliser la recherche hybride (keyword + vectorielle) avec collection CGI 2025
      const searchResults = await hybridSearch(query, limit, '2025');

      // Convertir en ArticleSource avec extraction des passages clés du contenu COMPLET
      const sources: ArticleSource[] = searchResults.map((result) => {
        const fullContent = result.payload.contenu;

        // 1. D'abord extraire les passages clés du contenu COMPLET (avant troncature)
        const keyPassages = this.extractKeyPassagesArray(fullContent);

        // 2. Puis tronquer le reste pour le contexte additionnel
        const truncatedContent =
          fullContent.length > 1000
            ? fullContent.substring(0, 1000) + '...'
            : fullContent;

        return {
          numero: result.payload.numero,
          titre: result.payload.titre,
          extrait: truncatedContent,
          keyPassages: keyPassages,
          fullContentLength: fullContent.length,
          version: '2025',
          score: result.score,
          matchType: result.matchType,
        };
      });

      // Logger le type de match et passages clés pour debug
      logger.info(
        `[Agent2025] Recherche hybride: ${searchResults.map((r) => `${r.payload.numero}(${r.matchType})`).join(', ')}`
      );

      // Logger les passages clés trouvés
      sources.forEach((s) => {
        if (s.keyPassages && s.keyPassages.length > 0) {
          logger.debug(
            `[Agent2025] Art. ${s.numero} - ${s.keyPassages.length} passages clés extraits du contenu complet (${s.fullContentLength} chars)`
          );
        }
      });

      return sources;
    } catch (error) {
      logger.error('[Agent2025] Erreur recherche hybride:', error);
      return [];
    }
  }
}

// Export singleton
export const agent2025 = new Agent2025();
export default Agent2025;
