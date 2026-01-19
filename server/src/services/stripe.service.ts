// server/src/services/stripe.service.ts
// Service de paiement Stripe

import Stripe from 'stripe';
import { prisma } from '../config/database.js';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import { AppError } from '../middleware/error.middleware.js';
import { SubscriptionPlan } from '@prisma/client';
import { handleStripeWebhook } from './stripe.webhook.service.js';

const logger = createLogger('StripeService');

// Configuration Stripe (optionnel en dev)
let stripe: Stripe | null = null;
if (config.stripe.secretKey) {
  stripe = new Stripe(config.stripe.secretKey);
} else {
  logger.warn('STRIPE_SECRET_KEY non configurée - paiements désactivés');
}

// Prix des plans en XAF (Franc CFA)
export const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; yearly: number; name: string }> = {
  FREE: { monthly: 0, yearly: 0, name: 'Gratuit' },
  STARTER: { monthly: 5000, yearly: 50000, name: 'Starter' },
  PROFESSIONAL: { monthly: 15000, yearly: 150000, name: 'Professionnel' },
  TEAM: { monthly: 35000, yearly: 350000, name: 'Équipe' },
  ENTERPRISE: { monthly: 75000, yearly: 750000, name: 'Entreprise' },
};

export interface CreateCheckoutParams {
  userId: string;
  plan: SubscriptionPlan;
  billingPeriod: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}

export interface StripeCustomer {
  customerId: string;
  email: string;
}

/**
 * Créer ou récupérer un client Stripe
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<StripeCustomer> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { personalSubscription: true },
  });

  if (!user) {
    throw new AppError('Utilisateur non trouvé', 404);
  }

  // Client existant ?
  if (user.personalSubscription?.stripeCustomerId) {
    return {
      customerId: user.personalSubscription.stripeCustomerId,
      email: user.email,
    };
  }

  // Vérifier que Stripe est configuré
  if (!stripe) {
    throw new AppError('Service de paiement non disponible', 503);
  }

  // Créer un nouveau client Stripe
  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
    metadata: {
      userId: user.id,
    },
  });

  // Mettre à jour l'abonnement avec l'ID client
  if (user.personalSubscription) {
    await prisma.subscription.update({
      where: { id: user.personalSubscription.id },
      data: { stripeCustomerId: customer.id },
    });
  }

  logger.info(`Client Stripe créé: ${customer.id} pour user ${userId}`);

  return {
    customerId: customer.id,
    email: user.email,
  };
}

/**
 * Créer une session de paiement Stripe Checkout
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<string> {
  const { userId, plan, billingPeriod, successUrl, cancelUrl } = params;

  if (plan === 'FREE') {
    throw new AppError('Le plan gratuit ne nécessite pas de paiement', 400);
  }

  const priceInfo = PLAN_PRICES[plan];
  const amount = billingPeriod === 'yearly' ? priceInfo.yearly : priceInfo.monthly;

  const customer = await getOrCreateStripeCustomer(userId);

  // Vérifier que Stripe est configuré
  if (!stripe) {
    throw new AppError('Service de paiement non disponible', 503);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customer.customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'xaf',
          product_data: {
            name: `CGI 242 - Plan ${priceInfo.name}`,
            description: `Abonnement ${billingPeriod === 'yearly' ? 'annuel' : 'mensuel'} à la plateforme d'intelligence fiscale`,
          },
          unit_amount: amount,
          recurring: {
            interval: billingPeriod === 'yearly' ? 'year' : 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
      billingPeriod,
    },
  });

  logger.info(`Session Checkout créée: ${session.id} pour plan ${plan}`);

  return session.url || '';
}

/**
 * Annuler un abonnement
 */
export async function cancelSubscription(userId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    throw new AppError('Aucun abonnement actif à annuler', 400);
  }

  // Vérifier que Stripe est configuré
  if (!stripe) {
    throw new AppError('Service de paiement non disponible', 503);
  }

  await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

  logger.info(`Abonnement annulé pour user ${userId}`);
}

/**
 * Obtenir le portail client Stripe
 */
export async function createCustomerPortalSession(
  userId: string,
  returnUrl: string
): Promise<string> {
  // Vérifier que Stripe est configuré
  if (!stripe) {
    throw new AppError('Service de paiement non disponible', 503);
  }

  const customer = await getOrCreateStripeCustomer(userId);

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.customerId,
    return_url: returnUrl,
  });

  return session.url;
}

// Ré-exporter le handler de webhook
export { handleStripeWebhook };

export default {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  handleStripeWebhook,
  cancelSubscription,
  createCustomerPortalSession,
  PLAN_PRICES,
};
