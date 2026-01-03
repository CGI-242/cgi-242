/**
 * Service de métriques Prometheus
 * Collecte et expose les métriques pour le monitoring
 */

import client, { Registry, Counter, Histogram, Gauge, Summary } from 'prom-client';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('MetricsService');

// Registre personnalisé pour les métriques
export const register = new Registry();

// Ajouter les métriques par défaut (CPU, mémoire, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'cgi_engine_',
  labels: { service: 'cgi-engine', instance: process.env.SERVER_ID || 'default' },
});

// ==================== HTTP METRICS ====================

/**
 * Durée des requêtes HTTP
 */
export const httpRequestDuration = new Histogram({
  name: 'cgi_engine_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
  registers: [register],
});

/**
 * Nombre total de requêtes HTTP
 */
export const httpRequestTotal = new Counter({
  name: 'cgi_engine_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * Requêtes HTTP en cours
 */
export const httpRequestsInProgress = new Gauge({
  name: 'cgi_engine_http_requests_in_progress',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['method'],
  registers: [register],
});

/**
 * Taille des réponses HTTP
 */
export const httpResponseSize = new Summary({
  name: 'cgi_engine_http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route'],
  percentiles: [0.5, 0.9, 0.99],
  registers: [register],
});

// ==================== AI METRICS ====================

/**
 * Durée des appels IA
 */
export const aiRequestDuration = new Histogram({
  name: 'cgi_engine_ai_request_duration_seconds',
  help: 'Duration of AI API calls in seconds',
  labelNames: ['model', 'operation'],
  buckets: [0.5, 1, 2, 5, 10, 20, 30, 60],
  registers: [register],
});

/**
 * Nombre total de requêtes IA
 */
export const aiRequestTotal = new Counter({
  name: 'cgi_engine_ai_requests_total',
  help: 'Total number of AI API requests',
  labelNames: ['model', 'operation', 'status'],
  registers: [register],
});

/**
 * Tokens utilisés par les appels IA
 */
export const aiTokensUsed = new Counter({
  name: 'cgi_engine_ai_tokens_total',
  help: 'Total number of AI tokens used',
  labelNames: ['model', 'type'],
  registers: [register],
});

/**
 * Coût estimé des appels IA
 */
export const aiCostEstimate = new Counter({
  name: 'cgi_engine_ai_cost_estimate_usd',
  help: 'Estimated cost of AI API calls in USD',
  labelNames: ['model'],
  registers: [register],
});

// ==================== DATABASE METRICS ====================

/**
 * Durée des requêtes DB
 */
export const dbQueryDuration = new Histogram({
  name: 'cgi_engine_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

/**
 * Connexions DB actives
 */
export const dbConnectionsActive = new Gauge({
  name: 'cgi_engine_db_connections_active',
  help: 'Number of active database connections',
  labelNames: ['pool'],
  registers: [register],
});

// ==================== CACHE METRICS ====================

/**
 * Hits/Misses du cache
 */
export const cacheOperations = new Counter({
  name: 'cgi_engine_cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'result'],
  registers: [register],
});

/**
 * Taille du cache
 */
export const cacheSize = new Gauge({
  name: 'cgi_engine_cache_size_bytes',
  help: 'Current size of cache in bytes',
  registers: [register],
});

// ==================== BUSINESS METRICS ====================

/**
 * Questions posées
 */
export const questionsTotal = new Counter({
  name: 'cgi_engine_questions_total',
  help: 'Total number of questions asked',
  labelNames: ['plan', 'organization_type'],
  registers: [register],
});

/**
 * Utilisateurs actifs
 */
export const activeUsers = new Gauge({
  name: 'cgi_engine_active_users',
  help: 'Number of active users in the last period',
  labelNames: ['period'],
  registers: [register],
});

/**
 * Conversations créées
 */
export const conversationsCreated = new Counter({
  name: 'cgi_engine_conversations_created_total',
  help: 'Total number of conversations created',
  labelNames: ['visibility'],
  registers: [register],
});

/**
 * Recherches d'articles
 */
export const articleSearches = new Counter({
  name: 'cgi_engine_article_searches_total',
  help: 'Total number of article searches',
  labelNames: ['version', 'type'],
  registers: [register],
});

/**
 * Utilisation des quotas
 */
export const quotaUsage = new Gauge({
  name: 'cgi_engine_quota_usage_ratio',
  help: 'Quota usage ratio (0-1)',
  labelNames: ['plan', 'type'],
  registers: [register],
});

// ==================== QDRANT METRICS ====================

/**
 * Durée des recherches vectorielles
 */
export const qdrantSearchDuration = new Histogram({
  name: 'cgi_engine_qdrant_search_duration_seconds',
  help: 'Duration of Qdrant vector searches in seconds',
  labelNames: ['collection'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2],
  registers: [register],
});

/**
 * Résultats des recherches vectorielles
 */
export const qdrantSearchResults = new Histogram({
  name: 'cgi_engine_qdrant_search_results_count',
  help: 'Number of results returned by Qdrant searches',
  labelNames: ['collection'],
  buckets: [0, 1, 2, 3, 5, 10, 20],
  registers: [register],
});

// ==================== ERROR METRICS ====================

/**
 * Erreurs par type
 */
export const errorsTotal = new Counter({
  name: 'cgi_engine_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'code'],
  registers: [register],
});

// ==================== HELPERS ====================

/**
 * Mesure la durée d'une opération
 */
export function measureDuration<T>(
  histogram: Histogram,
  labels: Record<string, string>,
  operation: () => Promise<T>
): Promise<T> {
  const end = histogram.startTimer(labels);
  return operation().finally(() => end());
}

/**
 * Endpoint pour exposer les métriques
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Content-Type pour les métriques
 */
export function getMetricsContentType(): string {
  return register.contentType;
}

/**
 * Reset toutes les métriques (pour les tests)
 */
export function resetMetrics(): void {
  register.resetMetrics();
  logger.info('Metrics reset');
}

/**
 * Statistiques des métriques
 */
export async function getMetricsStats(): Promise<{
  metricsCount: number;
  contentType: string;
}> {
  const metrics = await register.getMetricsAsJSON();
  return {
    metricsCount: metrics.length,
    contentType: register.contentType,
  };
}

logger.info('Prometheus metrics initialized');

export default register;
