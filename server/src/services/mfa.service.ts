/**
 * Service MFA/2FA avec TOTP
 *
 * Implémente l'authentification à deux facteurs via:
 * - TOTP (Time-based One-Time Password) compatible Google Authenticator
 * - Codes de backup pour récupération
 *
 * Sécurité:
 * - Secrets TOTP chiffrés en base
 * - Codes backup hashés avec bcrypt
 * - Fenêtre de validation de 1 step (30s)
 */

import * as OTPAuth from 'otpauth';
import * as QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { encryptionService } from './encryption.service.js';
import crypto from 'crypto';

const logger = createLogger('MFAService');

const APP_NAME = 'CGI 242';
const BACKUP_CODES_COUNT = 10;

interface MFASetupResult {
  secret: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

interface MFAVerifyResult {
  success: boolean;
  backupCodeUsed?: boolean;
}

class MFAService {
  /**
   * Créer une instance TOTP avec le secret fourni
   */
  private createTOTP(secret: string, email: string): OTPAuth.TOTP {
    return new OTPAuth.TOTP({
      issuer: APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
  }

  /**
   * Générer la configuration MFA pour un utilisateur
   * Ne persiste pas encore - l'utilisateur doit d'abord vérifier avec un code
   */
  async generateSetup(userId: string, userEmail: string): Promise<MFASetupResult> {
    // Générer un nouveau secret TOTP (base32)
    const secret = new OTPAuth.Secret({ size: 20 });

    // Créer l'objet TOTP
    const totp = new OTPAuth.TOTP({
      issuer: APP_NAME,
      label: userEmail,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });

    // Générer l'URI otpauth pour l'app authenticator
    const otpauthUrl = totp.toString();

    // Générer le QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#0077B5',
        light: '#FFFFFF',
      },
    });

    // Générer les codes de backup
    const backupCodes = this.generateBackupCodes();

    logger.info(`MFA setup généré pour l'utilisateur ${userId}`);

    return {
      secret: secret.base32,
      qrCodeDataUrl,
      backupCodes,
    };
  }

  /**
   * Activer le MFA après vérification du premier code
   */
  async enableMFA(
    userId: string,
    secret: string,
    code: string,
    backupCodes: string[]
  ): Promise<boolean> {
    // Récupérer l'email de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return false;
    }

    // Créer TOTP et vérifier le code
    const totp = this.createTOTP(secret, user.email);
    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
      logger.warn(`Tentative d'activation MFA échouée pour userId: ${userId} - code invalide`);
      return false;
    }

    // Chiffrer le secret avant stockage
    const encryptedSecret = encryptionService.encrypt(secret);

    // Hasher les codes de backup
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(c => bcrypt.hash(c, 10))
    );

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: encryptedSecret,
        mfaBackupCodes: hashedBackupCodes,
        mfaVerifiedAt: new Date(),
      },
    });

    logger.info(`MFA activé pour l'utilisateur ${userId}`);
    return true;
  }

  /**
   * Vérifier un code TOTP ou backup lors de la connexion
   */
  async verifyCode(userId: string, code: string): Promise<MFAVerifyResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        mfaEnabled: true,
        mfaSecret: true,
        mfaBackupCodes: true,
      },
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return { success: false };
    }

    // Déchiffrer le secret
    const secret = encryptionService.decrypt(user.mfaSecret);

    // 1. Essayer avec le code TOTP
    const totp = this.createTOTP(secret, user.email);
    const delta = totp.validate({ token: code, window: 1 });

    if (delta !== null) {
      logger.info(`MFA vérifié (TOTP) pour userId: ${userId}`);
      return { success: true, backupCodeUsed: false };
    }

    // 2. Essayer avec les codes de backup
    const backupResult = await this.verifyBackupCode(userId, code, user.mfaBackupCodes);

    if (backupResult) {
      logger.info(`MFA vérifié (backup code) pour userId: ${userId}`);
      return { success: true, backupCodeUsed: true };
    }

    logger.warn(`MFA échoué pour userId: ${userId}`);
    return { success: false };
  }

  /**
   * Vérifier et consommer un code de backup
   */
  private async verifyBackupCode(
    userId: string,
    code: string,
    hashedCodes: string[]
  ): Promise<boolean> {
    // Normaliser le code (enlever espaces et tirets)
    const normalizedCode = code.replace(/[\s-]/g, '').toUpperCase();

    for (let i = 0; i < hashedCodes.length; i++) {
      const isMatch = await bcrypt.compare(normalizedCode, hashedCodes[i]);

      if (isMatch) {
        // Retirer le code utilisé
        const updatedCodes = [...hashedCodes];
        updatedCodes.splice(i, 1);

        await prisma.user.update({
          where: { id: userId },
          data: { mfaBackupCodes: updatedCodes },
        });

        logger.info(`Backup code utilisé pour userId: ${userId}. Codes restants: ${updatedCodes.length}`);
        return true;
      }
    }

    return false;
  }

  /**
   * Désactiver le MFA pour un utilisateur
   */
  async disableMFA(userId: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return false;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Tentative de désactivation MFA échouée pour userId: ${userId} - mot de passe incorrect`);
      return false;
    }

    // Désactiver le MFA
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
        mfaVerifiedAt: null,
      },
    });

    logger.info(`MFA désactivé pour l'utilisateur ${userId}`);
    return true;
  }

  /**
   * Régénérer les codes de backup
   */
  async regenerateBackupCodes(userId: string, code: string): Promise<string[] | null> {
    // Vérifier le code MFA actuel
    const verifyResult = await this.verifyCode(userId, code);

    if (!verifyResult.success) {
      return null;
    }

    // Générer nouveaux codes
    const newBackupCodes = this.generateBackupCodes();

    // Hasher et sauvegarder
    const hashedCodes = await Promise.all(
      newBackupCodes.map(c => bcrypt.hash(c, 10))
    );

    await prisma.user.update({
      where: { id: userId },
      data: { mfaBackupCodes: hashedCodes },
    });

    logger.info(`Codes de backup régénérés pour userId: ${userId}`);
    return newBackupCodes;
  }

  /**
   * Vérifier si un utilisateur a le MFA activé
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true },
    });

    return user?.mfaEnabled ?? false;
  }

  /**
   * Obtenir le statut MFA d'un utilisateur
   */
  async getMFAStatus(userId: string): Promise<{
    enabled: boolean;
    verifiedAt: Date | null;
    backupCodesRemaining: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mfaEnabled: true,
        mfaVerifiedAt: true,
        mfaBackupCodes: true,
      },
    });

    return {
      enabled: user?.mfaEnabled ?? false,
      verifiedAt: user?.mfaVerifiedAt ?? null,
      backupCodesRemaining: user?.mfaBackupCodes?.length ?? 0,
    };
  }

  /**
   * Générer des codes de backup aléatoires
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];

    for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
      // Format: XXXX-XXXX (8 caractères alphanumériques)
      const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      codes.push(`${part1}-${part2}`);
    }

    return codes;
  }
}

export const mfaService = new MFAService();
export default mfaService;
