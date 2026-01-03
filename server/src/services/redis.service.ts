// server/src/services/redis.service.ts
import Redis from 'ioredis';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('RedisService');

// Configuration Redis
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// TTL par défaut (en secondes)
export const CACHE_TTL = {
  EMBEDDING: 60 * 60 * 24 * 7,    // 7 jours (embeddings sont stables)
  SEARCH_RESULT: 60 * 60,         // 1 heure
  QUOTA: 60 * 5,                  // 5 minutes
  ARTICLE: 60 * 60 * 24,          // 24 heures
  SESSION: 60 * 15,               // 15 minutes
};

// Préfixes pour les clés
export const CACHE_PREFIX = {
  EMBEDDING: 'emb:',
  SEARCH: 'search:',
  QUOTA: 'quota:',
  ARTICLE: 'article:',
  USER: 'user:',
};

class RedisService {
  private client: Redis | null = null;
  private isConnected = false;

  /**
   * Initialise la connexion Redis
   */
  async connect(): Promise<void> {
    if (this.client && this.isConnected) {
      return;
    }

    try {
      this.client = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            logger.warn('Redis connection failed after 3 retries, running without cache');
            return null; // Stop retrying
          }
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis connected successfully');
      });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis connection closed');
      });

      await this.client.connect();
    } catch (error) {
      logger.warn('Redis connection failed, running without cache:', error);
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Vérifie si Redis est disponible
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return null;

    try {
      const value = await this.client!.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set(key: string, value: unknown, ttlSeconds: number = CACHE_TTL.SEARCH_RESULT): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Supprime une clé du cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Supprime toutes les clés correspondant à un pattern
   */
  async delPattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(...keys);
      }
      return keys.length;
    } catch (error) {
      logger.error(`Redis DEL pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Incrémente un compteur
   */
  async incr(key: string, ttlSeconds?: number): Promise<number> {
    if (!this.isAvailable()) return -1;

    try {
      const value = await this.client!.incr(key);
      if (ttlSeconds && value === 1) {
        await this.client!.expire(key, ttlSeconds);
      }
      return value;
    } catch (error) {
      logger.error(`Redis INCR error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Récupère un compteur
   */
  async getCounter(key: string): Promise<number> {
    if (!this.isAvailable()) return -1;

    try {
      const value = await this.client!.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      logger.error(`Redis GET counter error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Ferme la connexion Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }

  /**
   * Health check
   */
  async ping(): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const result = await this.client!.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Statistiques du cache
   */
  async getStats(): Promise<{ connected: boolean; keys?: number; memory?: string }> {
    if (!this.isAvailable()) {
      return { connected: false };
    }

    try {
      const info = await this.client!.info('memory');
      const dbSize = await this.client!.dbsize();
      const memoryMatch = info.match(/used_memory_human:(\S+)/);

      return {
        connected: true,
        keys: dbSize,
        memory: memoryMatch ? memoryMatch[1] : 'unknown',
      };
    } catch {
      return { connected: true };
    }
  }
}

// Singleton
export const redisService = new RedisService();

/**
 * Retourne le client Redis brut pour les intégrations externes (rate-limit-redis, etc.)
 * Retourne null si Redis n'est pas disponible
 */
export function getRedisClient(): Redis | null {
  if (!redisService.isAvailable()) {
    return null;
  }
  // Accès au client interne via le service
  return (redisService as unknown as { client: Redis | null }).client;
}

// Helpers pour générer les clés de cache
export function createCacheKey(prefix: string, ...parts: string[]): string {
  return prefix + parts.join(':');
}

export function hashText(text: string): string {
  // Simple hash pour les clés de cache
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

export default redisService;
