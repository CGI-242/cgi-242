// server/src/utils/api-resilience.ts
// Utilitaires pour la résilience des appels API (timeout, retry)

import { createLogger } from './logger.js';

const logger = createLogger('ApiResilience');

/**
 * Crée une promesse de timeout
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`API timeout after ${ms}ms`));
    }, ms);
  });
}

/**
 * Délai avec jitter pour éviter les thundering herds
 */
function getBackoffDelay(attempt: number, baseDelay: number = 1000): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 500;
  return Math.min(exponentialDelay + jitter, 30000); // Max 30s
}

/**
 * Vérifie si une erreur est récupérable (retry possible)
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Erreurs réseau/timeout - toujours retry
    if (message.includes('timeout') ||
        message.includes('network') ||
        message.includes('econnreset') ||
        message.includes('econnrefused')) {
      return true;
    }

    // Rate limiting - retry avec backoff
    if (message.includes('rate limit') || message.includes('429')) {
      return true;
    }

    // Erreurs serveur temporaires (5xx)
    if (message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504')) {
      return true;
    }

    // Overloaded - retry
    if (message.includes('overloaded')) {
      return true;
    }
  }

  return false;
}

interface WithTimeoutAndRetryOptions {
  timeout?: number;      // Timeout en ms (défaut: 30000)
  maxRetries?: number;   // Nombre max de tentatives (défaut: 3)
  baseDelay?: number;    // Délai de base pour backoff (défaut: 1000)
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Exécute une fonction async avec timeout et retry
 *
 * @example
 * const result = await withTimeoutAndRetry(
 *   () => anthropic.messages.create({ ... }),
 *   { timeout: 30000, maxRetries: 3 }
 * );
 */
export async function withTimeoutAndRetry<T>(
  fn: () => Promise<T>,
  options: WithTimeoutAndRetryOptions = {}
): Promise<T> {
  const {
    timeout = 30000,
    maxRetries = 3,
    baseDelay = 1000,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Race entre l'appel API et le timeout
      const result = await Promise.race([
        fn(),
        createTimeout(timeout),
      ]);

      // Succès - log si c'était un retry
      if (attempt > 0) {
        logger.info(`API call succeeded after ${attempt + 1} attempts`);
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const isLastAttempt = attempt >= maxRetries - 1;
      const canRetry = isRetryableError(error);

      if (isLastAttempt || !canRetry) {
        logger.error(`API call failed after ${attempt + 1} attempts:`, lastError.message);
        throw lastError;
      }

      // Calculer le délai de backoff
      const delay = getBackoffDelay(attempt, baseDelay);

      logger.warn(
        `API call failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms:`,
        lastError.message
      );

      // Callback optionnel pour le monitoring
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Ne devrait jamais arriver, mais TypeScript le demande
  throw lastError || new Error('Unknown error in withTimeoutAndRetry');
}

/**
 * Wrapper simplifié pour les appels Anthropic
 */
export function createAnthropicCall<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return withTimeoutAndRetry(fn, {
    timeout: timeoutMs,
    maxRetries: 3,
    baseDelay: 1000,
    onRetry: (attempt, error) => {
      logger.warn(`Anthropic API retry #${attempt}: ${error.message}`);
    },
  });
}

export default { withTimeoutAndRetry, createAnthropicCall };
