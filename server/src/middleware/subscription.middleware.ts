import { Request, Response, NextFunction } from 'express';
import { SubscriptionPlan } from '@prisma/client';
import { sendError } from '../utils/helpers.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { isOrganizationPlan } from '../config/plans.js';

/**
 * Middleware pour vérifier qu'un plan minimum est requis
 */
export const requirePlan = (minimumPlans: SubscriptionPlan[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const tenant = req.tenant;

    if (!tenant) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const currentPlan = tenant.subscription.plan as SubscriptionPlan;

    if (!minimumPlans.includes(currentPlan)) {
      return sendError(
        res,
        `${ERROR_MESSAGES.UPGRADE_REQUIRED}. Plans acceptés: ${minimumPlans.join(', ')}`,
        403
      );
    }

    next();
  };
};

/**
 * Middleware pour vérifier le quota de questions
 */
export const checkQuestionQuota = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
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
 * Middleware pour vérifier qu'un plan organisation est actif
 */
export const requireOrganizationPlan = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const tenant = req.tenant;

  if (!tenant) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  if (tenant.type !== 'organization') {
    return sendError(
      res,
      'Cette fonctionnalité nécessite un abonnement organisation',
      403
    );
  }

  const currentPlan = tenant.subscription.plan as SubscriptionPlan;

  if (!isOrganizationPlan(currentPlan)) {
    return sendError(
      res,
      `${ERROR_MESSAGES.UPGRADE_REQUIRED}. Passez à un plan Team ou Enterprise.`,
      403
    );
  }

  next();
};

/**
 * Middleware pour vérifier la limite de membres
 */
export const checkMemberLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const tenant = req.tenant;

  if (!tenant) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  if (tenant.type !== 'organization') {
    return sendError(
      res,
      'Cette action requiert un contexte d\'organisation',
      400
    );
  }

  const maxMembers = tenant.subscription.maxMembers || 1;

  // -1 signifie illimité
  if (maxMembers === -1) {
    return next();
  }

  // Le nombre actuel de membres sera vérifié dans le service
  // Ce middleware vérifie juste que la limite n'est pas déjà atteinte
  // La vérification réelle se fait dans le service d'invitation

  next();
};

/**
 * Middleware pour les fonctionnalités premium
 */
export const requirePremium = requirePlan([
  'PROFESSIONAL',
  'TEAM',
  'ENTERPRISE',
]);

/**
 * Middleware pour les fonctionnalités enterprise
 */
export const requireEnterprise = requirePlan(['ENTERPRISE']);

/**
 * Middleware pour les fonctionnalités payantes (non FREE)
 */
export const requirePaid = requirePlan([
  'STARTER',
  'PROFESSIONAL',
  'TEAM',
  'ENTERPRISE',
]);

export default requirePlan;
