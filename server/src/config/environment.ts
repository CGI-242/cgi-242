import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // Serveur
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',

  // Base de données
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT - tokens sécurisés
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h', // 24 heures
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Réduit à 7 jours
  },

  // Cookies sécurisés
  cookie: {
    secret: process.env.COOKIE_SECRET || process.env.JWT_SECRET || 'cookie-secret-change-in-production',
    secure: process.env.NODE_ENV === 'production', // HTTPS only en prod
    sameSite: (process.env.COOKIE_SAME_SITE || 'strict') as 'strict' | 'lax' | 'none',
    domain: process.env.COOKIE_DOMAIN || undefined,
    httpOnly: true, // Toujours HttpOnly
  },

  // CSRF Protection
  csrf: {
    enabled: process.env.CSRF_ENABLED !== 'false', // Activé par défaut
    secret: process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf-secret-change-in-production',
  },

  // Cryptage
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Chiffrement AES-256
  encryption: {
    key: process.env.ENCRYPTION_KEY || '',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  },

  // Anthropic Claude
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
  },

  // Pinecone
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    index: process.env.PINECONE_INDEX || 'cgi-242',
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'CGI Engine <noreply@cgi-engine.com>',
    adminEmail: process.env.ADMIN_EMAIL || '',
  },

  // Super Admins (emails séparés par des virgules)
  superAdmins: (process.env.SUPER_ADMIN_EMAILS || '').split(',').filter(Boolean),

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',

  // Helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Validation des variables critiques en production
export function validateEnvironment(): void {
  const requiredInProduction = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  if (config.isProduction) {
    const missing = requiredInProduction.filter(
      (key) => !process.env[key]
    );

    if (missing.length > 0) {
      throw new Error(
        `Variables d'environnement manquantes en production: ${missing.join(', ')}`
      );
    }

    // Validation de la force du JWT_SECRET en production
    const jwtSecret = process.env.JWT_SECRET || '';
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET doit faire au moins 32 caractères en production');
    }
    if (jwtSecret.includes('default') || jwtSecret.includes('secret') || jwtSecret.includes('change')) {
      throw new Error('JWT_SECRET semble être une valeur par défaut. Utilisez une clé forte en production.');
    }
  }

  // Note: En développement, un avertissement sera affiché par le logger si secrets faibles
  // Cette validation silencieuse évite les erreurs ESLint no-console
}

export default config;
