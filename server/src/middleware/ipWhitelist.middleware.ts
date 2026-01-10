/**
 * Middleware de protection par IP Whitelist
 * Utilisé pour protéger les endpoints sensibles comme /metrics
 */

import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('IPWhitelist');

/**
 * IPs autorisées par défaut pour les métriques
 * - localhost (IPv4 et IPv6)
 * - Réseaux privés courants
 */
const DEFAULT_WHITELIST = [
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  'localhost',
];

/**
 * Réseaux privés (CIDR) autorisés
 */
const PRIVATE_NETWORKS = [
  { prefix: '10.', name: 'Class A Private' },
  { prefix: '172.16.', name: 'Class B Private' },
  { prefix: '172.17.', name: 'Class B Private (Docker)' },
  { prefix: '172.18.', name: 'Class B Private' },
  { prefix: '172.19.', name: 'Class B Private' },
  { prefix: '172.20.', name: 'Class B Private' },
  { prefix: '172.21.', name: 'Class B Private' },
  { prefix: '172.22.', name: 'Class B Private' },
  { prefix: '172.23.', name: 'Class B Private' },
  { prefix: '172.24.', name: 'Class B Private' },
  { prefix: '172.25.', name: 'Class B Private' },
  { prefix: '172.26.', name: 'Class B Private' },
  { prefix: '172.27.', name: 'Class B Private' },
  { prefix: '172.28.', name: 'Class B Private' },
  { prefix: '172.29.', name: 'Class B Private' },
  { prefix: '172.30.', name: 'Class B Private' },
  { prefix: '172.31.', name: 'Class B Private' },
  { prefix: '192.168.', name: 'Class C Private' },
];

/**
 * Extraire l'IP réelle du client (supporte les proxies)
 */
function getClientIP(req: Request): string {
  // X-Forwarded-For peut contenir plusieurs IPs séparées par des virgules
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor).split(',');
    return ips[0].trim();
  }

  // X-Real-IP (utilisé par nginx)
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }

  // Fallback sur l'IP de la connexion
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Vérifier si une IP est dans un réseau privé
 */
function isPrivateNetwork(ip: string): boolean {
  // Normaliser IPv6-mapped IPv4
  const normalizedIP = ip.replace('::ffff:', '');

  return PRIVATE_NETWORKS.some(network => normalizedIP.startsWith(network.prefix));
}

/**
 * Vérifier si une IP est autorisée
 */
function isIPAllowed(ip: string, whitelist: string[], allowPrivateNetworks: boolean): boolean {
  // Normaliser l'IP
  const normalizedIP = ip.replace('::ffff:', '');

  // Vérifier la whitelist explicite
  if (whitelist.includes(ip) || whitelist.includes(normalizedIP)) {
    return true;
  }

  // Vérifier les réseaux privés si autorisés
  if (allowPrivateNetworks && isPrivateNetwork(normalizedIP)) {
    return true;
  }

  return false;
}

export interface IPWhitelistOptions {
  /** Liste d'IPs autorisées (en plus des défauts) */
  additionalIPs?: string[];
  /** Autoriser tous les réseaux privés (10.x, 172.16-31.x, 192.168.x) */
  allowPrivateNetworks?: boolean;
  /** Message d'erreur personnalisé */
  errorMessage?: string;
  /** Désactiver complètement la protection (pour tests) */
  disabled?: boolean;
}

/**
 * Créer un middleware de whitelist IP
 *
 * @example
 * // Protéger /metrics avec whitelist par défaut + réseaux privés
 * app.use('/metrics', createIPWhitelist({ allowPrivateNetworks: true }), metricsRoutes);
 *
 * @example
 * // Ajouter des IPs spécifiques
 * app.use('/metrics', createIPWhitelist({
 *   additionalIPs: ['203.0.113.50', '198.51.100.0/24'],
 *   allowPrivateNetworks: true
 * }), metricsRoutes);
 */
export function createIPWhitelist(options: IPWhitelistOptions = {}) {
  const {
    additionalIPs = [],
    allowPrivateNetworks = true,
    errorMessage = 'Access denied: IP not whitelisted',
    disabled = false,
  } = options;

  // Construire la whitelist complète
  const whitelist = [...DEFAULT_WHITELIST, ...additionalIPs];

  // Parser les IPs depuis la variable d'environnement
  const envIPs = process.env.METRICS_WHITELIST_IPS;
  if (envIPs) {
    const parsedIPs = envIPs.split(',').map(ip => ip.trim()).filter(Boolean);
    whitelist.push(...parsedIPs);
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    // Mode désactivé (pour développement/tests)
    if (disabled || process.env.METRICS_WHITELIST_DISABLED === 'true') {
      logger.debug('IP whitelist disabled, allowing access');
      return next();
    }

    const clientIP = getClientIP(req);
    const allowed = isIPAllowed(clientIP, whitelist, allowPrivateNetworks);

    if (allowed) {
      logger.debug(`Metrics access granted for IP: ${clientIP}`);
      return next();
    }

    logger.warn(`Metrics access denied for IP: ${clientIP}`, {
      ip: clientIP,
      path: req.path,
      userAgent: req.headers['user-agent'],
    });

    res.status(403).json({
      success: false,
      error: errorMessage,
      ip: clientIP,
    });
  };
}

/**
 * Middleware pré-configuré pour les métriques Prometheus
 * Autorise localhost et réseaux privés par défaut
 */
export const metricsIPWhitelist = createIPWhitelist({
  allowPrivateNetworks: true,
  errorMessage: 'Access to metrics endpoint denied: IP not whitelisted',
});

export default createIPWhitelist;
