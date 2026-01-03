/**
 * Service Sentry pour le tracking des erreurs
 * Capture automatique des exceptions et erreurs
 */

import * as Sentry from '@sentry/node';
import { Express } from 'express';
import { createLogger } from '../utils/logger.js';
import { config } from '../config/environment.js';

const logger = createLogger('SentryService');

// Configuration Sentry
const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || config.nodeEnv;
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || `cgi-engine@${process.env.npm_package_version || '1.0.0'}`;

/**
 * Initialise Sentry si le DSN est configuré
 */
export function initSentry(app?: Express): boolean {
  if (!SENTRY_DSN) {
    logger.warn('SENTRY_DSN not configured, error tracking disabled');
    return false;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      release: SENTRY_RELEASE,

      // Performance monitoring
      tracesSampleRate: config.isProduction ? 0.1 : 1.0,

      // Profiling
      profilesSampleRate: config.isProduction ? 0.1 : 1.0,

      // Filtrer les erreurs sensibles
      beforeSend(event, hint) {
        const error = hint.originalException;

        // Ne pas envoyer les erreurs d'authentification (pas de bugs)
        if (error instanceof Error) {
          if (error.message.includes('Unauthorized') ||
              error.message.includes('Invalid token') ||
              error.message.includes('Rate limit')) {
            return null;
          }
        }

        // Masquer les données sensibles
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }

        return event;
      },

      // Intégrations
      integrations: [
        // Capture automatique des erreurs HTTP
        Sentry.httpIntegration(),
        // Capture des erreurs non gérées
        Sentry.onUncaughtExceptionIntegration(),
        Sentry.onUnhandledRejectionIntegration(),
      ],

      // Tags par défaut
      initialScope: {
        tags: {
          service: 'cgi-engine',
          server_id: process.env.SERVER_ID || 'default',
        },
      },
    });

    // Setup Express si fourni
    if (app) {
      Sentry.setupExpressErrorHandler(app);
    }

    logger.info('Sentry initialized', {
      environment: SENTRY_ENVIRONMENT,
      release: SENTRY_RELEASE,
    });

    return true;
  } catch (error) {
    logger.error('Failed to initialize Sentry', error);
    return false;
  }
}

/**
 * Capture une exception manuellement
 */
export function captureException(error: Error, context?: Record<string, unknown>): string | undefined {
  if (!SENTRY_DSN) return undefined;

  return Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture un message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, unknown>): string | undefined {
  if (!SENTRY_DSN) return undefined;

  return Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Définit l'utilisateur courant pour le contexte
 */
export function setUser(user: { id: string; email?: string; organizationId?: string }): void {
  if (!SENTRY_DSN) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    // Custom data
    organizationId: user.organizationId,
  });
}

/**
 * Efface l'utilisateur du contexte
 */
export function clearUser(): void {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}

/**
 * Ajoute un breadcrumb (trace)
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  if (!SENTRY_DSN) return;
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Crée un span pour le tracing
 */
export function startSpan<T>(
  name: string,
  op: string,
  fn: () => T
): T {
  if (!SENTRY_DSN) return fn();

  return Sentry.startSpan(
    { name, op },
    fn
  );
}

/**
 * Wrapper pour les fonctions async avec capture d'erreur
 */
export async function withErrorTracking<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      captureException(error, { operation, ...context });
    }
    throw error;
  }
}

/**
 * Flush les événements avant shutdown
 */
export async function flushSentry(timeout = 2000): Promise<boolean> {
  if (!SENTRY_DSN) return true;
  return Sentry.flush(timeout);
}

/**
 * Vérifie si Sentry est configuré
 */
export function isSentryEnabled(): boolean {
  return !!SENTRY_DSN;
}

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  startSpan,
  withErrorTracking,
  flushSentry,
  isSentryEnabled,
};
