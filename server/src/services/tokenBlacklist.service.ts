/**
 * Service de Blacklist JWT
 *
 * Permet d'invalider les tokens JWT avant leur expiration naturelle.
 * Utilisé principalement pour:
 * - Logout (invalider access + refresh tokens)
 * - Logout de toutes les sessions (invalider tous les tokens d'un utilisateur)
 * - Révocation forcée (compromission de compte)
 *
 * Stockage: Redis avec TTL automatique aligné sur l'expiration du token
 */

import { redisService } from './redis.service.js';
import { createLogger } from '../utils/logger.js';
import jwt from 'jsonwebtoken';

const logger = createLogger('TokenBlacklist');

// Préfixes pour les clés Redis
const BLACKLIST_PREFIX = 'blacklist:token:';
const USER_BLACKLIST_PREFIX = 'blacklist:user:';

// TTL par défaut si on ne peut pas extraire l'expiration du token
const DEFAULT_TTL_SECONDS = 24 * 60 * 60; // 24 heures

/**
 * Extraire le temps restant avant expiration d'un token JWT
 * @returns TTL en secondes, ou null si impossible à déterminer
 */
function getTokenTTL(token: string): number | null {
  try {
    // Décoder le token sans vérifier la signature (on veut juste l'expiration)
    const decoded = jwt.decode(token) as { exp?: number } | null;

    if (!decoded || !decoded.exp) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - now;

    // Si le token est déjà expiré, retourner 1 seconde (sera nettoyé rapidement)
    return ttl > 0 ? ttl : 1;
  } catch {
    return null;
  }
}

/**
 * Extraire l'ID utilisateur d'un token JWT
 */
function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwt.decode(token) as { userId?: string } | null;
    return decoded?.userId || null;
  } catch {
    return null;
  }
}

/**
 * Générer un hash court du token pour la clé Redis
 * (Évite de stocker le token complet)
 */
function hashToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

class TokenBlacklistService {
  /**
   * Ajouter un token à la blacklist
   * Le token sera automatiquement supprimé après son expiration naturelle
   *
   * @param token - Le token JWT à blacklister
   * @param reason - Raison de la blacklist (pour les logs)
   * @returns true si ajouté avec succès, false sinon
   */
  async blacklistToken(token: string, reason: string = 'logout'): Promise<boolean> {
    if (!token) {
      logger.warn('Tentative de blacklist avec token vide');
      return false;
    }

    const tokenHash = hashToken(token);
    const key = BLACKLIST_PREFIX + tokenHash;
    const ttl = getTokenTTL(token) || DEFAULT_TTL_SECONDS;
    const userId = getUserIdFromToken(token);

    try {
      const success = await redisService.set(key, {
        reason,
        userId,
        blacklistedAt: new Date().toISOString(),
      }, ttl);

      if (success) {
        logger.info(`Token blacklisté: ${tokenHash.substring(0, 8)}... (raison: ${reason}, TTL: ${ttl}s)`);
      } else {
        // Redis non disponible - log mais continue (dégradation gracieuse)
        logger.warn(`Impossible de blacklister le token (Redis indisponible): ${tokenHash.substring(0, 8)}...`);
      }

      return success;
    } catch (error) {
      logger.error('Erreur lors de la blacklist du token:', error);
      return false;
    }
  }

  /**
   * Vérifier si un token est blacklisté
   *
   * @param token - Le token JWT à vérifier
   * @returns true si le token est blacklisté, false sinon
   */
  async isBlacklisted(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    // Si Redis n'est pas disponible, on ne peut pas vérifier
    // Par sécurité, on pourrait retourner true, mais cela bloquerait tous les users
    // On choisit de retourner false (dégradation gracieuse)
    if (!redisService.isAvailable()) {
      return false;
    }

    const tokenHash = hashToken(token);
    const key = BLACKLIST_PREFIX + tokenHash;

    try {
      const result = await redisService.get(key);
      return result !== null;
    } catch (error) {
      logger.error('Erreur lors de la vérification de blacklist:', error);
      return false;
    }
  }

  /**
   * Blacklister tous les tokens d'un utilisateur
   * Utilisé pour "Déconnecter de toutes les sessions"
   *
   * @param userId - L'ID de l'utilisateur
   * @param reason - Raison de la blacklist
   * @returns true si succès
   */
  async blacklistAllUserTokens(userId: string, reason: string = 'logout_all'): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const key = USER_BLACKLIST_PREFIX + userId;
    const timestamp = Date.now();

    try {
      // Stocker le timestamp à partir duquel tous les tokens sont invalides
      // Tous les tokens émis AVANT ce timestamp seront considérés comme invalides
      const success = await redisService.set(key, {
        invalidatedAt: timestamp,
        reason,
      }, DEFAULT_TTL_SECONDS * 7); // 7 jours (couvre la durée max d'un refresh token)

      if (success) {
        logger.info(`Tous les tokens de l'utilisateur ${userId} ont été invalidés (raison: ${reason})`);
      }

      return success;
    } catch (error) {
      logger.error(`Erreur lors de l'invalidation des tokens utilisateur ${userId}:`, error);
      return false;
    }
  }

  /**
   * Vérifier si un token utilisateur a été invalidé globalement
   *
   * @param token - Le token à vérifier
   * @returns true si les tokens de l'utilisateur ont été invalidés après l'émission du token
   */
  async isUserTokensInvalidated(token: string): Promise<boolean> {
    if (!token || !redisService.isAvailable()) {
      return false;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return false;
    }

    try {
      const decoded = jwt.decode(token) as { iat?: number } | null;
      if (!decoded?.iat) {
        return false;
      }

      const key = USER_BLACKLIST_PREFIX + userId;
      const data = await redisService.get<{ invalidatedAt: number }>(key);

      if (!data) {
        return false;
      }

      // Le token est invalide si émis AVANT l'invalidation globale
      const tokenIssuedAt = decoded.iat * 1000; // Convertir en ms
      return tokenIssuedAt < data.invalidatedAt;
    } catch (error) {
      logger.error('Erreur lors de la vérification d\'invalidation utilisateur:', error);
      return false;
    }
  }

  /**
   * Vérifier si un token est valide (non blacklisté)
   * Vérifie à la fois la blacklist individuelle et l'invalidation utilisateur
   *
   * @param token - Le token à vérifier
   * @returns true si le token est valide (non blacklisté)
   */
  async isTokenValid(token: string): Promise<boolean> {
    // Vérifier la blacklist individuelle
    if (await this.isBlacklisted(token)) {
      return false;
    }

    // Vérifier l'invalidation globale utilisateur
    if (await this.isUserTokensInvalidated(token)) {
      return false;
    }

    return true;
  }

  /**
   * Révoquer l'accès immédiatement (logout + invalidation globale)
   * Utilisé en cas de compromission de compte
   *
   * @param userId - L'ID de l'utilisateur
   * @param currentAccessToken - Le token d'accès actuel (si disponible)
   * @param currentRefreshToken - Le refresh token actuel (si disponible)
   */
  async revokeAllAccess(
    userId: string,
    currentAccessToken?: string,
    currentRefreshToken?: string
  ): Promise<void> {
    const reason = 'security_revocation';

    // Blacklister les tokens actuels si fournis
    if (currentAccessToken) {
      await this.blacklistToken(currentAccessToken, reason);
    }
    if (currentRefreshToken) {
      await this.blacklistToken(currentRefreshToken, reason);
    }

    // Invalider tous les tokens de l'utilisateur
    await this.blacklistAllUserTokens(userId, reason);

    logger.warn(`Révocation de sécurité complète pour l'utilisateur ${userId}`);
  }

  /**
   * Statistiques de la blacklist (pour monitoring)
   */
  async getStats(): Promise<{
    available: boolean;
    blacklistedTokens?: number;
    invalidatedUsers?: number;
  }> {
    if (!redisService.isAvailable()) {
      return { available: false };
    }

    try {
      // Compter les tokens blacklistés
      const tokenKeys = await redisService.get<string[]>('__blacklist_stats__');

      return {
        available: true,
        blacklistedTokens: tokenKeys?.length || 0,
      };
    } catch {
      return { available: true };
    }
  }
}

// Singleton
export const tokenBlacklistService = new TokenBlacklistService();

export default tokenBlacklistService;
