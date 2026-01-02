// server/src/orchestrator/router.ts
// Version simplifiée : UN SEUL AGENT CGI (version en vigueur)
import { createLogger } from '../utils/logger.js';
import { cgiAgent } from '../agents/cgi-agent.js';
import { AgentContext, AgentResponse, ArticleSource } from '../agents/base-agent.js';

const logger = createLogger('CGIOrchestrator');

export interface OrchestratorResponse {
  answer: string;
  sources: ArticleSource[];
  routing: {
    agentUsed: string;
  };
  processingTime: number;
}

/**
 * Orchestrateur simplifié pour les requêtes CGI
 * Utilise un seul agent (CGI en vigueur)
 */
export class CGIOrchestrator {
  private static instance: CGIOrchestrator;

  private constructor() {
    logger.info('[CGIOrchestrator] Initialisé (mode mono-agent)');
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
   * Traite une requête utilisateur
   */
  async processQuery(query: string, context?: AgentContext): Promise<OrchestratorResponse> {
    const startTime = Date.now();
    logger.info(`[CGIOrchestrator] Nouvelle requête: "${query.substring(0, 80)}..."`);

    try {
      // Traiter avec l'agent CGI unique
      const agentResponse = await cgiAgent.process(query, context);

      const response: OrchestratorResponse = {
        answer: agentResponse.answer,
        sources: agentResponse.sources,
        routing: {
          agentUsed: cgiAgent.getName(),
        },
        processingTime: Date.now() - startTime,
      };

      logger.info(`[CGIOrchestrator] Réponse générée en ${response.processingTime}ms`);
      return response;
    } catch (error) {
      logger.error('[CGIOrchestrator] Erreur:', error);
      throw error;
    }
  }

  /**
   * Recherche dans la base de connaissances CGI
   */
  async searchKnowledgeBase(query: string, limit = 5): Promise<ArticleSource[]> {
    return cgiAgent.searchKnowledgeBase(query, limit);
  }
}

// Export singleton
export const orchestrator = CGIOrchestrator.getInstance();
export default CGIOrchestrator;
