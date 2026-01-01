// server/src/agents/base-agent.ts
import { createLogger } from '../utils/logger.js';

const logger = createLogger('BaseAgent');

export interface AgentContext {
  userId?: string;
  organizationId?: string;
  conversationId?: string;
  previousMessages?: Message[];
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentMetadata {
  articlesConsulted: string[];
  queryTime: number;
  model: string;
  temperature: number;
}

export interface AgentResponse {
  answer: string;
  sources: ArticleSource[];
  agentUsed: string;
  year: number;
  confidence: number;
  processingTime: number;
  metadata?: AgentMetadata;
}

export interface ArticleSource {
  numero: string;
  titre?: string;
  extrait: string;
  keyPassages?: string[];      // Passages clés extraits du contenu complet
  fullContentLength?: number;  // Longueur totale pour debug
  version: string;
  score?: number;
  matchType?: 'vector' | 'keyword' | 'both';
}

export interface AgentConfig {
  name: string;
  version: string;
  validFrom: string;
  validUntil: string | null;
  knowledgeBasePath: string;
  systemPrompt: string;
}

/**
 * Classe abstraite pour les agents CGI
 * Chaque agent (2025, 2026) hérite de cette classe
 */
export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    logger.info(`Agent ${config.name} initialisé (${config.validFrom} - ${config.validUntil || 'en cours'})`);
  }

  /**
   * Retourne le nom de l'agent
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Retourne la version du CGI
   */
  getVersion(): string {
    return this.config.version;
  }

  /**
   * Vérifie si l'agent est valide pour une date donnée
   */
  isValidForDate(date: Date): boolean {
    const validFrom = new Date(this.config.validFrom);
    const validUntil = this.config.validUntil ? new Date(this.config.validUntil) : null;

    if (date < validFrom) return false;
    if (validUntil && date > validUntil) return false;

    return true;
  }

  /**
   * Retourne le prompt système de l'agent
   */
  getSystemPrompt(): string {
    return this.config.systemPrompt;
  }

  /**
   * Méthode abstraite : traite une requête utilisateur
   */
  abstract process(query: string, context?: AgentContext): Promise<AgentResponse>;

  /**
   * Méthode abstraite : recherche dans la base de connaissances
   */
  abstract searchKnowledgeBase(query: string, limit?: number): Promise<ArticleSource[]>;

  /**
   * Formate les sources pour l'affichage
   */
  protected formatSources(sources: ArticleSource[]): string {
    if (sources.length === 0) return '';

    return sources
      .map((s) => `- Art. ${s.numero} (CGI ${s.version})${s.titre ? ` : ${s.titre}` : ''}`)
      .join('\n');
  }

  /**
   * Génère une réponse avec les sources et metadata optionnels
   */
  protected buildResponse(
    answer: string,
    sources: ArticleSource[],
    startTime: number,
    metadata?: AgentMetadata
  ): AgentResponse {
    return {
      answer,
      sources,
      agentUsed: this.config.name,
      year: parseInt(this.config.version),
      confidence: sources.length > 0 ? 0.8 : 0.5,
      processingTime: Date.now() - startTime,
      ...(metadata && { metadata }),
    };
  }
}

export default BaseAgent;
