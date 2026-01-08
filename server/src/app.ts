import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/environment.js';
import routes from './routes/index.js';
import metricsRoutes from './routes/metrics.routes.js';
import healthRoutes from './routes/health.routes.js';
import swaggerRoutes from './routes/swagger.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { globalRateLimiter } from './middleware/rateLimit.middleware.js';
import { metricsMiddleware } from './middleware/metrics.middleware.js';
import { sanitizeInputs } from './middleware/validation.middleware.js';
import { metricsIPWhitelist } from './middleware/ipWhitelist.middleware.js';
import { secureCSPMiddleware } from './middleware/csp.middleware.js';
import { createLogger, httpLogger } from './utils/logger.js';
import { initSentry } from './services/sentry.service.js';

const appLogger = createLogger('App');

export function createApp(): Express {
  const app = express();

  // Métriques Prometheus (avant tout autre middleware)
  app.use(metricsMiddleware);

  // Endpoint /metrics pour Prometheus (protégé par IP whitelist)
  // Autorise: localhost, réseaux privés (10.x, 172.16-31.x, 192.168.x)
  // Configurable via METRICS_WHITELIST_IPS="ip1,ip2,ip3"
  app.use('/metrics', metricsIPWhitelist, metricsRoutes);

  // Endpoint /health pour les health checks (sans auth)
  app.use('/health', healthRoutes);

  // Documentation API Swagger (sans auth)
  app.use('/api-docs', swaggerRoutes);

  // Fichiers statiques (test-agent.html, etc.) - AVANT Helmet pour éviter CSP
  const publicPath = path.join(process.cwd(), 'public');
  app.use('/public', (req, res, next) => {
    // Désactiver CSP pour les fichiers statiques de test
    res.removeHeader('Content-Security-Policy');
    next();
  }, express.static(publicPath));

  // Initialiser Sentry pour le tracking des erreurs
  initSentry(app);

  // Sécurité - Helmet avec CSP stricte (sans 'unsafe-inline' ni 'unsafe-eval')
  // Utilise des nonces cryptographiques pour les scripts inline autorisés
  // Voir middleware/csp.middleware.ts pour la configuration détaillée
  app.use(secureCSPMiddleware());
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-ID', 'X-CSRF-Token'],
      exposedHeaders: ['X-CSRF-Token'],
    })
  );

  // Cookie parser pour les cookies HttpOnly
  app.use(cookieParser(config.cookie.secret));

  // Rate limiting global
  app.use(globalRateLimiter);

  // Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Logging HTTP avec Winston
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', { stream: httpLogger }));
  }

  // Monitoring: Temps de réponse
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      // Log uniquement les requêtes API (pas les assets)
      if (req.path.startsWith('/api')) {
        const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
        appLogger[logLevel](`${req.method} ${req.path} - ${status} - ${duration}ms`);
      }
    });
    next();
  });

  // Sanitization des entrées
  app.use(sanitizeInputs);

  // Trust proxy (si derrière un reverse proxy)
  app.set('trust proxy', 1);

  // Routes API
  app.use(config.apiPrefix, routes);

  // Gestion des erreurs
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
