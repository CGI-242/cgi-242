import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/environment.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { globalRateLimiter } from './middleware/rateLimit.middleware.js';
import { sanitizeInputs } from './middleware/validation.middleware.js';

export function createApp(): Express {
  const app = express();

  // Sécurité
  app.use(helmet());
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-ID'],
    })
  );

  // Rate limiting global
  app.use(globalRateLimiter);

  // Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Logging
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

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
