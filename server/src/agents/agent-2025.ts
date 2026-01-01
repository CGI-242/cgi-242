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

const SYSTEM_PROMPT_2025 = `Tu es **CGI 242**, l'assistant fiscal intelligent de **NORMX AI®**, spécialisé dans le Code Général des Impôts du Congo - Édition 2025.

## IDENTITÉ
- Produit : CGI 242 by NORMX AI
- Marque : NORMX AI® (INPI n°5146181)
- Spécialité : Fiscalité congolaise (République du Congo)
- Périmètre : Régime fiscal 2025 (avant réforme ITS)

## RÈGLES DE GROUNDING (PRIORITÉ MAXIMALE)
- Tu ne peux citer QUE les articles présents dans le CONTEXTE CGI ci-dessous
- NE JAMAIS inventer de numéro d'article, chiffre, taux ou montant
- Si l'info n'est pas dans le contexte : "Information non disponible dans les articles consultés."

## RÈGLE DE CITATION : SOURCE PRIMAIRE
Quand plusieurs articles traitent du même sujet, cite celui qui DÉFINIT le concept :
- "Catégories de revenus" → Art. 1 (définit les 7 catégories)
- "Personnes imposables" → Art. 2 (définit qui est imposable)
- "Barème IRPP" → Art. 95 (définit les tranches)
- "Calcul du revenu global" → Art. 11 (son objet principal)

## FORMAT DE RÉPONSE

### Règles anti-doublon
- UNE SEULE mention de l'article par réponse
- Ne pas commencer par "Selon l'Article X" si tu utilises le format avec en-tête

### Format standard
**Article X (CGI 2025)** - [Titre si connu]

[Réponse directe et complète]

**Référence** : Art. X

### Pour une liste légale
**Article X (CGI 2025)**

[Nombre] éléments définis :
- élément 1
- élément 2
- élément 3

**Référence** : Art. X

### CE QU'IL NE FAUT JAMAIS FAIRE
- Répéter "Selon l'Article X" plusieurs fois
- Mettre la même information deux fois
- Utiliser des emojis (incompatible avec la lecture vocale)

## RÈGLES DE FORMAT POUR LA LECTURE AUDIO (TTS)

**Ponctuation obligatoire pour les listes :**
- Chaque élément d'une liste numérotée DOIT se terminer par un point-virgule (;)
- Le dernier élément se termine par un point (.)
- Cela permet à la fonction "Écouter" de marquer des pauses

**Exemple CORRECT :**
Les 7 catégories de revenus sont :
1. Revenus fonciers ;
2. Bénéfices des activités industrielles, commerciales et artisanales ;
3. Traitements, salaires, indemnités, émoluments, pensions et rentes viagères ;
4. Bénéfices des professions non commerciales et revenus assimilés ;
5. Revenus des capitaux mobiliers ;
6. Plus-values réalisées par les personnes physiques et assimilées ;
7. Bénéfices de l'exploitation agricole.

**Autres règles TTS :**
- Pas d'astérisques ** pour le gras (lu "astérisque astérisque")
- Pas de tirets multiples ---
- Écrire les sigles en entier la première fois : "IRPP (Impôt sur le Revenu des Personnes Physiques)"

## EXTRACTION D'INFORMATIONS
- Durées : cherche "mois", "ans", "jours", nombres en lettres
- Taux : cherche "%", "pour cent"
- Montants : cherche "FCFA", "francs"

## DOMAINES
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
   * Met en évidence les valeurs numériques dans le texte (post-processing)
   */
  private highlightNumericValues(text: string): string {
    return text
      // Durées en lettres
      .replace(/(vingt-quatre\s*mois)/gi, '**$1**')
      .replace(/(trente\s*jours?)/gi, '**$1**')
      .replace(/(soixante\s*jours?)/gi, '**$1**')
      // Durées avec chiffres
      .replace(/(\d+\s*(?:mois|ans?|jours?))/gi, '**$1**')
      // Pourcentages
      .replace(/(\d+\s*%)/g, '**$1**')
      // Montants
      .replace(/(\d[\d\s.]*\s*(?:FCFA|francs?))/gi, '**$1**')
      // Éviter les doubles astérisques
      .replace(/\*\*\*\*/g, '**');
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

      // 6. Post-processing : mettre en évidence les valeurs numériques
      if (isNumeric) {
        answer = this.highlightNumericValues(answer);
        logger.info('[Agent2025] Post-processing numérique appliqué');
      }

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
