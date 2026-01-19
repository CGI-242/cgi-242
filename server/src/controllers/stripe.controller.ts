// server/src/controllers/stripe.controller.ts
// Contrôleur pour les paiements Stripe

import { Request, Response } from 'express';
import { SubscriptionPlan } from '@prisma/client';
import {
  createCheckoutSession,
  handleStripeWebhook,
  cancelSubscription,
  createCustomerPortalSession,
  PLAN_PRICES,
} from '../services/stripe.service.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';
import { config } from '../config/environment.js';

const logger = createLogger('StripeController');

/**
 * POST /api/stripe/checkout
 * Créer une session de paiement Stripe Checkout
 */
export async function createCheckout(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { plan, billingPeriod } = req.body;

    if (!userId) {
      sendError(res, 'Non autorisé', 401);
      return;
    }

    if (!plan || !['STARTER', 'PROFESSIONAL', 'TEAM', 'ENTERPRISE'].includes(plan)) {
      sendError(res, 'Plan invalide', 400);
      return;
    }

    if (!billingPeriod || !['monthly', 'yearly'].includes(billingPeriod)) {
      sendError(res, 'Période de facturation invalide', 400);
      return;
    }

    const checkoutUrl = await createCheckoutSession({
      userId,
      plan: plan as SubscriptionPlan,
      billingPeriod: billingPeriod as 'monthly' | 'yearly',
      successUrl: `${config.frontendUrl}/subscription/success`,
      cancelUrl: `${config.frontendUrl}/subscription/cancel`,
    });

    sendSuccess(res, { checkoutUrl });
  } catch (error) {
    logger.error('Erreur createCheckout:', error);
    sendError(res, 'Erreur lors de la création du paiement', 500);
  }
}

/**
 * POST /api/stripe/webhook
 * Webhook Stripe pour les événements de paiement
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      sendError(res, 'Signature manquante', 400);
      return;
    }

    await handleStripeWebhook(req.body, signature);

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Erreur webhook Stripe:', error);
    sendError(res, 'Erreur webhook', 400);
  }
}

/**
 * POST /api/stripe/cancel
 * Annuler l'abonnement actuel
 */
export async function cancelCurrentSubscription(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, 'Non autorisé', 401);
      return;
    }

    await cancelSubscription(userId);

    sendSuccess(res, { message: 'Abonnement annulé' });
  } catch (error) {
    logger.error('Erreur cancelSubscription:', error);
    sendError(res, 'Erreur lors de l\'annulation', 500);
  }
}

/**
 * POST /api/stripe/portal
 * Obtenir l'URL du portail client Stripe
 */
export async function getCustomerPortal(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, 'Non autorisé', 401);
      return;
    }

    const portalUrl = await createCustomerPortalSession(
      userId,
      `${config.frontendUrl}/subscription`
    );

    sendSuccess(res, { portalUrl });
  } catch (error) {
    logger.error('Erreur getCustomerPortal:', error);
    sendError(res, 'Erreur lors de l\'accès au portail', 500);
  }
}

/**
 * GET /api/stripe/plans
 * Récupérer les prix des plans
 */
export async function getPlans(_req: Request, res: Response): Promise<void> {
  try {
    const plans = Object.entries(PLAN_PRICES).map(([key, value]) => ({
      id: key,
      name: value.name,
      monthlyPrice: value.monthly,
      yearlyPrice: value.yearly,
      currency: 'XAF',
    }));

    sendSuccess(res, { plans });
  } catch (error) {
    logger.error('Erreur getPlans:', error);
    sendError(res, 'Erreur lors de la récupération des plans', 500);
  }
}
