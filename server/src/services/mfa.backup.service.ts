// server/src/services/mfa.backup.service.ts
// Utilitaires pour les codes de backup MFA

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('MFABackupService');

const BACKUP_CODES_COUNT = 10;

/**
 * Générer des codes de backup aléatoires
 * Format: XXXX-XXXX (8 caractères alphanumériques)
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];

  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    codes.push(`${part1}-${part2}`);
  }

  return codes;
}

/**
 * Hasher les codes de backup pour stockage sécurisé
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
}

/**
 * Vérifier et consommer un code de backup
 * @returns true si le code est valide et a été consommé
 */
export async function verifyAndConsumeBackupCode(
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
 * Obtenir le nombre de codes de backup restants
 */
export async function getBackupCodesCount(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaBackupCodes: true },
  });

  return user?.mfaBackupCodes?.length ?? 0;
}

/**
 * Sauvegarder de nouveaux codes de backup hashés
 */
export async function saveBackupCodes(userId: string, codes: string[]): Promise<void> {
  const hashedCodes = await hashBackupCodes(codes);

  await prisma.user.update({
    where: { id: userId },
    data: { mfaBackupCodes: hashedCodes },
  });

  logger.info(`Codes de backup régénérés pour userId: ${userId}`);
}
