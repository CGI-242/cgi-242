// server/src/controllers/subscription.controller.ts
import { Request, Response } from 'express';
import { SubscriptionPlan } from '@prisma/client';
import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('SubscriptionController');

// Map frontend plan names to Prisma enum values
const PLAN_MAPPING: Record<string, SubscriptionPlan> = {
  FREE: 'FREE',
  BASIC: 'STARTER',
  PRO: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
};

const PLAN_LIMITS: Record<SubscriptionPlan, { questionsPerMonth: number }> = {
  FREE: { questionsPerMonth: 10 },
  STARTER: { questionsPerMonth: 50 },
  PROFESSIONAL: { questionsPerMonth: 200 },
  TEAM: { questionsPerMonth: 500 },
  ENTERPRISE: { questionsPerMonth: 1000 },
};

/**
 * Upgrade subscription plan
 */
export async function upgradePlan(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { plan } = req.body;

    if (!userId) {
      sendError(res, 'Non autorise', 401);
      return;
    }

    // Map frontend plan name to Prisma enum
    const prismaPlan = PLAN_MAPPING[plan];
    if (!prismaPlan) {
      sendError(res, 'Plan invalide', 400);
      return;
    }

    const planConfig = PLAN_LIMITS[prismaPlan];

    // Find user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // Create subscription if it doesn't exist
      await prisma.subscription.create({
        data: {
          userId,
          type: 'PERSONAL',
          plan: prismaPlan,
          status: 'ACTIVE',
          questionsPerMonth: planConfig.questionsPerMonth,
          maxMembers: 1,
        },
      });
    } else {
      // Update existing subscription
      await prisma.subscription.update({
        where: { userId },
        data: {
          plan: prismaPlan,
          questionsPerMonth: planConfig.questionsPerMonth,
        },
      });
    }

    logger.info(`User ${userId} upgraded to plan ${prismaPlan}`);

    sendSuccess(res, { plan, questionsPerMonth: planConfig.questionsPerMonth });
  } catch (error) {
    logger.error('Erreur upgradePlan:', error);
    sendError(res, 'Erreur lors de la mise a jour', 500);
  }
}

/**
 * Get current subscription
 */
export async function getSubscription(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, 'Non autorise', 401);
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      sendSuccess(res, {
        plan: 'FREE',
        status: 'ACTIVE',
        questionsPerMonth: 10,
        questionsUsed: 0,
      });
      return;
    }

    sendSuccess(res, {
      plan: subscription.plan,
      status: subscription.status,
      questionsPerMonth: subscription.questionsPerMonth,
      questionsUsed: subscription.questionsUsed,
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  } catch (error) {
    logger.error('Erreur getSubscription:', error);
    sendError(res, 'Erreur lors de la recuperation', 500);
  }
}
