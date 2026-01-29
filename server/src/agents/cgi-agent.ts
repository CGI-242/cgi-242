// server/src/agents/cgi-agent.ts
// Agent CGI unique - Version en vigueur (2026)

import { BaseAgent, AgentConfig, AgentContext, AgentResponse, ArticleSource, AgentMetadata } from './base-agent.js';
import { hybridSearch } from '../services/rag/hybrid-search.service.js';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import { createAnthropicCall } from '../utils/api-resilience.js';
import { SYSTEM_PROMPT } from './cgi-agent.prompts.js';
import { isNumericQuestion, extractKeyPassagesArray, removeMarkdownAndEmojis } from './cgi-agent.utils.js';

const logger = createLogger('CGIAgent');

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
  timeout: 60000,
  maxRetries: 3,
  fetch: globalThis.fetch,
});

const agentConfig: AgentConfig = {
  name: 'Agent CGI',
  version: 'current',
  validFrom: '2026-01-01',
  validUntil: null,
  knowledgeBasePath: 'data/cgi/2026',
  systemPrompt: SYSTEM_PROMPT,
};

/**
 * Agent CGI unique - Version en vigueur
 */
export class CGIAgent extends BaseAgent {
  constructor() {
    super(agentConfig);
  }

  /**
   * Traite une requête utilisateur
   */
  async process(query: string, context?: AgentContext): Promise<AgentResponse> {
    const startTime = Date.now();
    logger.info(`[CGIAgent] Traitement: "${query.substring(0, 100)}..."`);

    try {
      // 1. Recherche hybride dans la base de connaissances (8 articles)
      const sources = await this.searchKnowledgeBase(query, 8);

      logger.info(`[CGIAgent] Articles consultés:`, {
        count: sources.length,
        articles: sources.map((s) => ({ numero: s.numero, titre: s.titre })),
      });

      // 2. Détecter si question numérique
      const isNumeric = isNumericQuestion(query);
      logger.info(`[CGIAgent] Question numérique: ${isNumeric}`);

      // 3. Construire le contexte avec les articles trouvés
      const articlesContext = sources
        .slice(0, 6)
        .map((s) => {
          const header = `Art. ${s.numero} (CGI)${s.titre ? ` - ${s.titre}` : ''}`;
          const keyPassagesSection =
            s.keyPassages && s.keyPassages.length > 0
              ? `\nInformations cles :\n${s.keyPassages.map((p) => `- ${p} ;`).join('\n')}\n`
              : '';
          return `---\n${header}\n${keyPassagesSection}\nTexte :\n${s.extrait}`;
        })
        .join('\n\n');

      // 4. Préparer le système prompt avec contexte
      const numericInstruction = isNumeric
        ? `\n\n## INSTRUCTION SPÉCIALE - EXTRACTION NUMÉRIQUE
Cette question porte sur une VALEUR NUMÉRIQUE (délai, durée, taux, montant).
Tu DOIS :
1. Scanner le contexte pour trouver les CHIFFRES ou NOMBRES EN LETTRES
2. Chercher : pourcentages (%), durées (mois, ans, jours), montants (FCFA, francs)
3. CITER EXACTEMENT le passage contenant la valeur numérique`
        : '';

      const systemPromptWithContext = `${this.getSystemPrompt()}${numericInstruction}\n\nCONTEXTE CGI:\n${articlesContext || 'Aucun article trouvé.'}`;

      // 5. Préparer les messages pour Claude
      const messages: Anthropic.MessageParam[] = [
        ...(context?.previousMessages || [])
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: query },
      ];

      // 6. Appeler Claude Haiku
      const completion = await createAnthropicCall(
        () => anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          system: systemPromptWithContext,
          messages,
          temperature: 0,
        }),
        30000
      );

      let answer = completion.content[0]?.type === 'text' ? completion.content[0].text : '';

      // Post-processing : supprimer markdown et emojis
      answer = removeMarkdownAndEmojis(answer);

      logger.info(`[CGIAgent] Réponse générée en ${Date.now() - startTime}ms`);
      logger.info(`[CGIAgent] Articles trouvés:`, sources.map((s) => s.numero));

      const metadata: AgentMetadata = {
        articlesConsulted: sources.map((s) => s.numero),
        queryTime: Date.now() - startTime,
        model: 'claude-3-haiku-20240307',
        temperature: 0,
      };

      return this.buildResponse(answer, sources, startTime, metadata);
    } catch (error) {
      logger.error('[CGIAgent] Erreur:', error);
      throw error;
    }
  }

  /**
   * Recherche hybride dans la base de connaissances CGI
   */
  async searchKnowledgeBase(query: string, limit = 8): Promise<ArticleSource[]> {
    try {
      const searchResults = await hybridSearch(query, limit, '2026');

      const sources: ArticleSource[] = searchResults.map((result) => {
        const fullContent = result.payload.contenu;
        const keyPassages = extractKeyPassagesArray(fullContent);
        const truncatedContent = fullContent.length > 1000
          ? fullContent.substring(0, 1000) + '...'
          : fullContent;

        return {
          numero: result.payload.numero,
          titre: result.payload.titre,
          extrait: truncatedContent,
          keyPassages: keyPassages,
          fullContentLength: fullContent.length,
          version: 'current',
          score: result.score,
          matchType: result.matchType,
        };
      });

      logger.info(
        `[CGIAgent] Recherche hybride: ${searchResults.map((r) => `${r.payload.numero}(${r.matchType})`).join(', ')}`
      );

      return sources;
    } catch (error) {
      logger.error('[CGIAgent] Erreur recherche hybride:', error);
      return [];
    }
  }
}

export const cgiAgent = new CGIAgent();
export default CGIAgent;
