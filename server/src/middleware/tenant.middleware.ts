import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { sendError } from '../utils/helpers.js';
import { ERROR_MESSAGES, CUSTOM_HEADERS } from '../utils/constants.js';
import { TenantContext } from '../types/express.js';
import { createLogger } from '../utils/logger.js';
import { redisService, CACHE_TTL, CACHE_PREFIX } from '../services/redis.service.js';

const tenantLogger = createLogger('TenantMiddleware');

/**
 * Middleware Multi-Tenant
 *
 * Détermine le contexte du tenant (personnel ou organisation) basé sur:
 * 1. Le header X-Organization-ID
 * 2. Le query parameter orgId
 *
 * Si aucun n'est fourni, utilise le contexte personnel de l'utilisateur.
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    // Récupérer l'ID de l'organisation depuis le header ou query param
    const orgId =
      (req.headers[CUSTOM_HEADERS.ORGANIZATION_ID] as string) ||
      (req.query.orgId as string);

    if (orgId) {
      // Mode Organisation
      const membership = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: orgId,
          },
        },
        include: {
          organization: {
            include: {
              subscription: true,
            },
          },
        },
      });

      if (!membership) {
        return sendError(res, ERROR_MESSAGES.NOT_ORG_MEMBER, 403);
      }

      const sub = membership.organization.subscription;
      const questionsPerMonth = sub?.questionsPerMonth || 10;
      const questionsUsed = sub?.questionsUsed || 0;

      req.tenant = {
        type: 'organization',
        userId,
        organizationId: orgId,
        organizationRole: membership.role,
        subscription: {
          plan: (sub?.plan || 'FREE') as string,
          questionsRemaining: questionsPerMonth === -1
            ? Infinity
            : Math.max(0, questionsPerMonth - questionsUsed),
          maxMembers: sub?.maxMembers || 1,
        },
      } as TenantContext;
    } else {
      // Mode Personnel
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          personalSubscription: true,
        },
      });

      if (!user) {
        return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
      }

      const sub = user.personalSubscription;
      const questionsPerMonth = sub?.questionsPerMonth || 10;
      const questionsUsed = sub?.questionsUsed || 0;

      req.tenant = {
        type: 'personal',
        userId,
        subscription: {
          plan: (sub?.plan || 'FREE') as string,
          questionsRemaining: questionsPerMonth === -1
            ? Infinity
            : Math.max(0, questionsPerMonth - questionsUsed),
        },
      } as TenantContext;
    }

    next();
  } catch (error) {
    tenantLogger.error('Tenant middleware error:', error);
    return sendError(res, ERROR_MESSAGES.INTERNAL_ERROR, 500);
  }
};

/**
 * Middleware pour vérifier le quota de questions
 */
export const checkQuotaMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const tenant = req.tenant;

  if (!tenant) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  if (tenant.subscription.questionsRemaining <= 0) {
    return sendError(res, ERROR_MESSAGES.QUOTA_EXCEEDED, 403);
  }

  next();
};

/**
 * Incrémenter le compteur de questions utilisées (avec cache Redis)
 */
export async function incrementQuestionsUsed(
  tenant: TenantContext
): Promise<void> {
  // Clé de cache pour le quota
  const cacheKey = tenant.type === 'organization' && tenant.organizationId
    ? `${CACHE_PREFIX.QUOTA}org:${tenant.organizationId}`
    : `${CACHE_PREFIX.QUOTA}user:${tenant.userId}`;

  // Incrémenter dans Redis pour un tracking rapide
  const redisCount = await redisService.incr(cacheKey, CACHE_TTL.QUOTA);

  // Mettre à jour la DB de manière asynchrone (fire and forget)
  if (tenant.type === 'organization' && tenant.organizationId) {
    prisma.subscription.updateMany({
      where: { organizationId: tenant.organizationId },
      data: { questionsUsed: { increment: 1 } },
    }).catch(err => tenantLogger.error('Failed to increment org quota in DB:', err));
  } else {
    prisma.subscription.updateMany({
      where: { userId: tenant.userId },
      data: { questionsUsed: { increment: 1 } },
    }).catch(err => tenantLogger.error('Failed to increment user quota in DB:', err));
  }

  tenantLogger.debug(`Quota incremented for ${cacheKey}, Redis count: ${redisCount}`);
}

/**
 * Réinitialiser les compteurs de questions (à appeler en début de période)
 */
export async function resetQuotaCounters(): Promise<void> {
  await prisma.subscription.updateMany({
    where: { status: 'ACTIVE' },
    data: { questionsUsed: 0 },
  });
}

/**
 * Obtenir les statistiques d'utilisation pour un tenant
 */
export async function getTenantUsageStats(tenant: TenantContext): Promise<{
  questionsUsed: number;
  questionsLimit: number;
  percentageUsed: number;
}> {
  let subscription;

  if (tenant.type === 'organization' && tenant.organizationId) {
    subscription = await prisma.subscription.findUnique({
      where: { organizationId: tenant.organizationId },
    });
  } else {
    subscription = await prisma.subscription.findUnique({
      where: { userId: tenant.userId },
    });
  }

  const questionsUsed = subscription?.questionsUsed || 0;
  const questionsLimit = subscription?.questionsPerMonth || 10;
  const percentageUsed = questionsLimit === -1
    ? 0
    : Math.min(100, (questionsUsed / questionsLimit) * 100);

  return {
    questionsUsed,
    questionsLimit: questionsLimit === -1 ? Infinity : questionsLimit,
    percentageUsed,
  };
}

export default tenantMiddleware;
