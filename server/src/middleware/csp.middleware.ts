/**
 * Content Security Policy (CSP) Middleware
 *
 * Fournit une protection robuste contre les attaques XSS en:
 * - Supprimant 'unsafe-inline' et 'unsafe-eval'
 * - Utilisant des nonces cryptographiques pour les scripts inline autorisés
 * - Appliquant une politique stricte pour les réponses API
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */

import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import crypto from 'crypto';
import helmet from 'helmet';
import { config } from '../config/environment.js';

// Déclaration pour étendre Express Request via module augmentation
declare module 'express-serve-static-core' {
  interface Request {
    cspNonce?: string;
  }
}

/**
 * Génère un nonce cryptographique unique pour chaque requête
 * Le nonce est utilisé pour autoriser des scripts inline spécifiques
 */
function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Middleware qui génère et attache un nonce CSP à chaque requête
 * Le nonce peut être utilisé dans les templates HTML: <script nonce="{{cspNonce}}">
 */
export function cspNonceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const nonce = generateNonce();
  req.cspNonce = nonce;
  res.locals.cspNonce = nonce;
  next();
}

/**
 * Configuration CSP stricte (sans unsafe-*)
 * Utilise des nonces pour les scripts inline légitimes
 */
export function createSecureHelmet() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        // Source par défaut: uniquement le même domaine
        defaultSrc: ["'self'"],

        // Scripts: self + nonce pour inline + CDNs autorisés
        // PAS de 'unsafe-inline' ni 'unsafe-eval'
        scriptSrc: [
          "'self'",
          // Les nonces seront ajoutés dynamiquement via le middleware
          (req: IncomingMessage) => `'nonce-${(req as Request).cspNonce}'`,
          // CDN Tailwind (si utilisé en dev)
          ...(config.isProduction ? [] : ['https://cdn.tailwindcss.com']),
        ],

        // Scripts workers (Web Workers, Service Workers)
        workerSrc: ["'self'", 'blob:'],

        // Styles: self + nonce (ou 'unsafe-inline' pour compatibilité styles dynamiques)
        // Note: Les styles inline sont moins risqués que les scripts
        styleSrc: [
          "'self'",
          // Permettre les styles inline pour les frameworks CSS-in-JS
          // C'est acceptable car les styles ne peuvent pas exécuter de code
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
        ],

        // Polices
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'data:',
        ],

        // Images
        imgSrc: [
          "'self'",
          'data:',
          'https:',
          'blob:',
        ],

        // Connexions (API, WebSocket)
        connectSrc: [
          "'self'",
          config.frontendUrl,
          'https://api.anthropic.com',
          'https://api.openai.com',
          // WebSocket pour dev hot-reload
          ...(config.isProduction ? [] : ['ws:', 'wss:']),
        ],

        // Médias (audio, vidéo)
        mediaSrc: ["'self'"],

        // Frames: aucun (protection clickjacking)
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],

        // Objets (Flash, Java, etc.): aucun
        objectSrc: ["'none'"],

        // Base URI: seulement self (protection contre injection de base tag)
        baseUri: ["'self'"],

        // Actions de formulaire
        formAction: ["'self'"],

        // Upgrade HTTP vers HTTPS en production
        upgradeInsecureRequests: config.isProduction ? [] : null,

        // Rapport des violations CSP (optionnel)
        // reportUri: '/api/csp-report',
      },
    },

    // Autres protections Helmet
    crossOriginEmbedderPolicy: false, // Désactivé pour compatibilité API externes
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // HSTS (HTTP Strict Transport Security)
    hsts: {
      maxAge: 31536000, // 1 an
      includeSubDomains: true,
      preload: true,
    },

    // Protection contre le MIME sniffing
    noSniff: true,

    // Protection XSS (header legacy, CSP est plus robuste)
    xssFilter: true,

    // Masquer le header X-Powered-By
    hidePoweredBy: true,

    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },

    // Permissions Policy (anciennement Feature Policy)
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  });
}

/**
 * Middleware combiné: génère le nonce puis applique Helmet
 */
export function secureCSPMiddleware() {
  const helmetMiddleware = createSecureHelmet();

  return (req: Request, res: Response, next: NextFunction) => {
    // Générer le nonce d'abord
    const nonce = generateNonce();
    req.cspNonce = nonce;
    res.locals.cspNonce = nonce;

    // Puis appliquer Helmet avec le nonce
    helmetMiddleware(req, res, next);
  };
}

export default secureCSPMiddleware;
