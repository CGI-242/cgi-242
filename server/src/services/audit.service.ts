// server/src/services/audit.service.ts
import { AuditAction, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('AuditService');

// Types pour les données d'audit - types flexibles pour JSON
type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonPrimitive | JsonObject | JsonPrimitive[] | undefined };
type AuditChangeValue = JsonPrimitive | JsonObject;
type AuditMetadataValue = JsonPrimitive | Date | undefined;

interface AuditLogData {
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes?: { before: AuditChangeValue; after: AuditChangeValue };
  metadata?: Record<string, AuditMetadataValue>;
  organizationId?: string;
}

/**
 * Service pour enregistrer toutes les actions critiques dans l'application
 * Permet la traçabilité complète pour conformité RGPD et débogage
 */
export class AuditService {
  /**
   * Enregistrer une action dans l'audit trail
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      // Récupérer les informations de l'acteur
      const actor = await prisma.user.findUnique({
        where: { id: data.actorId },
        select: { email: true }
      });

      if (!actor) {
        logger.warn(`Actor not found for audit log: ${data.actorId}`);
        return;
      }

      // Créer l'enregistrement d'audit
      const actorRole = data.metadata?.actorRole;
      await prisma.auditLog.create({
        data: {
          actorId: data.actorId,
          actorEmail: actor.email,
          actorRole: typeof actorRole === 'string' ? actorRole : null,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          organizationId: data.organizationId,
          changes: data.changes || {},
          metadata: {
            ip: String(data.metadata?.ip || ''),
            userAgent: String(data.metadata?.userAgent || ''),
            timestamp: new Date().toISOString(),
            ...data.metadata
          },
          createdAt: new Date()
        }
      });

      logger.info(`Audit log created: ${data.action} by ${actor.email} on ${data.entityType}/${data.entityId}`);

    } catch (error) {
      // Ne pas faire échouer l'opération principale si l'audit échoue
      logger.error('Failed to create audit log:', error);
    }
  }

  /**
   * Récupérer l'historique d'audit pour une organisation
   */
  static async getOrganizationAudit(orgId: string, limit = 100) {
    return prisma.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Récupérer toutes les actions d'un utilisateur
   */
  static async getUserActions(userId: string, limit = 100) {
    return prisma.auditLog.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Récupérer l'historique pour une entité spécifique
   */
  static async getEntityHistory(entityType: string, entityId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Rechercher dans les logs d'audit avec filtres
   */
  static async search(filters: {
    organizationId?: string;
    actorId?: string;
    action?: AuditAction;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entityType = filters.entityType;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt = { ...where.createdAt, gte: filters.startDate };
      if (filters.endDate) where.createdAt = { ...where.createdAt, lte: filters.endDate };
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100
    });
  }

  /**
   * Obtenir des statistiques sur les actions
   */
  static async getActionStats(organizationId?: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: Prisma.AuditLogWhereInput = {
      createdAt: { gte: since }
    };

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      select: {
        action: true,
        createdAt: true
      }
    });

    // Grouper par action
    const stats: Record<string, number> = {};
    logs.forEach(log => {
      stats[log.action] = (stats[log.action] || 0) + 1;
    });

    return stats;
  }

  /**
   * Nettoyer les anciens logs (RGPD - conservation limitée)
   * À exécuter via cron job mensuel ou trimestriel
   */
  static async cleanupOldLogs(olderThanDays = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    logger.info(`Cleaned up ${result.count} audit logs older than ${olderThanDays} days`);
    return result.count;
  }
}
