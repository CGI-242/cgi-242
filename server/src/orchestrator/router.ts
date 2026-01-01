// server/src/orchestrator/router.ts
import { createLogger } from '../utils/logger.js';
import { analyzeIntent, QueryIntent, getDefaultAgentYear } from './intent-analyzer.js';
import { agent2025 } from '../agents/agent-2025.js';
import { agent2026 } from '../agents/agent-2026.js';
import { AgentContext, AgentResponse, ArticleSource } from '../agents/base-agent.js';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/environment.js';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

const logger = createLogger('CGIOrchestrator');

export interface OrchestratorResponse {
  answer: string;
  sources: ArticleSource[];
  routing: {
    intent: QueryIntent;
    agentsUsed: string[];
    isComparison: boolean;
  };
  processingTime: number;
}

export interface ComparisonResult {
  answer2025: AgentResponse;
  answer2026: AgentResponse;
  synthesizedComparison: string;
}

/**
 * Orchestrateur principal pour le routage des requêtes CGI
 * Route vers Agent 2025 ou Agent 2026 selon l'intention détectée
 */
export class CGIOrchestrator {
  private static instance: CGIOrchestrator;

  private constructor() {
    logger.info('[CGIOrchestrator] Initialisé');
  }

  /**
   * Singleton pattern
   */
  static getInstance(): CGIOrchestrator {
    if (!CGIOrchestrator.instance) {
      CGIOrchestrator.instance = new CGIOrchestrator();
    }
    return CGIOrchestrator.instance;
  }

  /**
   * Traite une requête utilisateur et la route vers le bon agent
   */
  async processQuery(query: string, context?: AgentContext): Promise<OrchestratorResponse> {
    const startTime = Date.now();
    logger.info(`[CGIOrchestrator] Nouvelle requête: "${query.substring(0, 80)}..."`);

    // 1. Analyser l'intention
    const intent = analyzeIntent(query);
    logger.info(`[CGIOrchestrator] Intent: year=${intent.targetYear}, comparison=${intent.isComparison}, domain=${intent.domain}`);

    let response: OrchestratorResponse;

    try {
      // 2. Router selon l'intention
      if (intent.isComparison) {
        // Requête de comparaison - utiliser les deux agents
        response = await this.handleComparison(query, intent, context, startTime);
      } else {
        // Requête simple - utiliser un seul agent
        response = await this.handleSingleQuery(query, intent, context, startTime);
      }

      logger.info(`[CGIOrchestrator] Réponse générée en ${Date.now() - startTime}ms`);
      return response;
    } catch (error) {
      logger.error('[CGIOrchestrator] Erreur:', error);
      throw error;
    }
  }

  /**
   * Traite une requête simple (un seul agent)
   */
  private async handleSingleQuery(
    query: string,
    intent: QueryIntent,
    context: AgentContext | undefined,
    startTime: number
  ): Promise<OrchestratorResponse> {
    // Déterminer quel agent utiliser
    const targetYear = intent.targetYear || getDefaultAgentYear();
    const agent = targetYear === 2025 ? agent2025 : agent2026;

    logger.info(`[CGIOrchestrator] Routage vers ${agent.getName()}`);

    // Traiter la requête
    const agentResponse = await agent.process(query, context);

    return {
      answer: agentResponse.answer,
      sources: agentResponse.sources,
      routing: {
        intent,
        agentsUsed: [agent.getName()],
        isComparison: false,
      },
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Traite une requête de comparaison (deux agents)
   */
  private async handleComparison(
    query: string,
    intent: QueryIntent,
    context: AgentContext | undefined,
    startTime: number
  ): Promise<OrchestratorResponse> {
    logger.info('[CGIOrchestrator] Traitement comparaison 2025 vs 2026');

    // Exécuter les deux agents en parallèle
    const [response2025, response2026] = await Promise.all([
      agent2025.process(query, context),
      agent2026.process(query, context),
    ]);

    // Synthétiser la comparaison
    const comparison = await this.synthesizeComparison(query, response2025, response2026, intent);

    // Fusionner les sources
    const allSources = [...response2025.sources, ...response2026.sources];

    return {
      answer: comparison,
      sources: allSources,
      routing: {
        intent,
        agentsUsed: [agent2025.getName(), agent2026.getName()],
        isComparison: true,
      },
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Synthétise une comparaison entre les réponses des deux agents
   */
  private async synthesizeComparison(
    query: string,
    response2025: AgentResponse,
    response2026: AgentResponse,
    intent: QueryIntent
  ): Promise<string> {
    const comparisonPrompt = `Tu es un expert fiscal chargé de comparer les dispositions du CGI 2025 et CGI 2026.

Question de l'utilisateur: ${query}

=== RÉPONSE CGI 2025 (avant réforme ITS) ===
${response2025.answer}

Sources 2025: ${response2025.sources.map((s) => `Art. ${s.numero}`).join(', ') || 'Aucune'}

=== RÉPONSE CGI 2026 (après réforme ITS) ===
${response2026.answer}

Sources 2026: ${response2026.sources.map((s) => `Art. ${s.numero}`).join(', ') || 'Aucune'}

=== INSTRUCTIONS ===
Fournis une analyse comparative structurée:
1. **Résumé des différences clés** - Les changements majeurs entre 2025 et 2026
2. **Détail par aspect** - Compare point par point les dispositions
3. **Impact pratique** - Explique les conséquences concrètes pour le contribuable
4. **Tableau comparatif** si pertinent (utilise le format Markdown)

Domaine fiscal concerné: ${intent.domain || 'général'}
Mots-clés détectés: ${intent.detectedKeywords.join(', ') || 'aucun'}`;

    const systemPrompt =
      'Tu es un expert du Code Général des Impôts du Congo. Tu dois fournir des comparaisons claires et structurées entre les régimes fiscaux 2025 et 2026. Utilise des émojis pour la lisibilité (📌 💡 ⚠️).';

    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: comparisonPrompt }],
    });

    return completion.content[0]?.type === 'text' ? completion.content[0].text : '';
  }

  /**
   * Recherche dans les deux bases de connaissances
   */
  async searchBothVersions(query: string, limit = 5): Promise<{ sources2025: ArticleSource[]; sources2026: ArticleSource[] }> {
    const [sources2025, sources2026] = await Promise.all([
      agent2025.searchKnowledgeBase(query, limit),
      agent2026.searchKnowledgeBase(query, limit),
    ]);

    return { sources2025, sources2026 };
  }

  /**
   * Force l'utilisation d'un agent spécifique
   */
  async queryWithAgent(query: string, year: 2025 | 2026, context?: AgentContext): Promise<AgentResponse> {
    const agent = year === 2025 ? agent2025 : agent2026;
    return agent.process(query, context);
  }
}

// Export singleton
export const orchestrator = CGIOrchestrator.getInstance();
export default CGIOrchestrator;
