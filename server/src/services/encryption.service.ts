/**
 * Service de chiffrement AES-256-GCM
 *
 * Utilisé pour chiffrer les données sensibles:
 * - Secrets MFA/TOTP
 * - Tokens API externes
 * - Données personnelles sensibles
 *
 * Algorithme: AES-256-GCM (authentifié)
 * - IV unique par chiffrement (12 bytes)
 * - Auth tag pour intégrité (16 bytes)
 * - Clé dérivée de ENCRYPTION_KEY via SHA-256
 */

import crypto from 'crypto';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('EncryptionService');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommandé pour GCM
const AUTH_TAG_LENGTH = 16;
const ENCODING: BufferEncoding = 'base64';

class EncryptionService {
  private key: Buffer | null = null;

  /**
   * Dériver la clé de chiffrement à partir de la variable d'environnement
   */
  private getKey(): Buffer {
    if (this.key) {
      return this.key;
    }

    const encryptionKey = config.encryption?.key || process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
      logger.error('ENCRYPTION_KEY non définie - utilisation d\'une clé temporaire (non sécurisé!)');
      // En développement uniquement - générer une clé déterministe basée sur JWT_SECRET
      const fallbackKey = config.jwt.secret || 'dev-fallback-key-not-for-production';
      this.key = crypto.createHash('sha256').update(fallbackKey).digest();
    } else {
      // Dériver une clé 256 bits à partir de la clé fournie
      this.key = crypto.createHash('sha256').update(encryptionKey).digest();
    }

    return this.key;
  }

  /**
   * Chiffrer une chaîne de caractères
   * @param plaintext - Texte à chiffrer
   * @returns Texte chiffré en base64 (iv:authTag:ciphertext)
   */
  encrypt(plaintext: string): string {
    if (!plaintext) {
      return '';
    }

    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(IV_LENGTH);

      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

      let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
      encrypted += cipher.final(ENCODING);

      const authTag = cipher.getAuthTag();

      // Format: iv:authTag:ciphertext (tous en base64)
      const result = [
        iv.toString(ENCODING),
        authTag.toString(ENCODING),
        encrypted,
      ].join(':');

      return result;
    } catch (error) {
      logger.error('Erreur de chiffrement:', error);
      throw new Error('Échec du chiffrement');
    }
  }

  /**
   * Déchiffrer une chaîne de caractères
   * @param ciphertext - Texte chiffré (format iv:authTag:ciphertext)
   * @returns Texte déchiffré
   */
  decrypt(ciphertext: string): string {
    if (!ciphertext) {
      return '';
    }

    try {
      const key = this.getKey();
      const parts = ciphertext.split(':');

      if (parts.length !== 3) {
        throw new Error('Format de données chiffrées invalide');
      }

      const iv = Buffer.from(parts[0], ENCODING);
      const authTag = Buffer.from(parts[1], ENCODING);
      const encrypted = parts[2];

      if (iv.length !== IV_LENGTH) {
        throw new Error('IV invalide');
      }

      if (authTag.length !== AUTH_TAG_LENGTH) {
        throw new Error('Auth tag invalide');
      }

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Erreur de déchiffrement:', error);
      throw new Error('Échec du déchiffrement - données corrompues ou clé invalide');
    }
  }

  /**
   * Chiffrer un objet JSON
   */
  encryptObject<T>(data: T): string {
    const json = JSON.stringify(data);
    return this.encrypt(json);
  }

  /**
   * Déchiffrer vers un objet JSON
   */
  decryptObject<T>(ciphertext: string): T {
    const json = this.decrypt(ciphertext);
    return JSON.parse(json) as T;
  }

  /**
   * Hasher une valeur (one-way)
   * Utilisé pour les données qu'on n'a pas besoin de récupérer (backup codes)
   */
  hash(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');
  }

  /**
   * Générer une clé aléatoire sécurisée
   */
  generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Vérifier si le service est correctement configuré
   */
  isConfigured(): boolean {
    const encryptionKey = config.encryption?.key || process.env.ENCRYPTION_KEY;
    return !!encryptionKey;
  }
}

export const encryptionService = new EncryptionService();
export default encryptionService;
