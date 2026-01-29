// server/src/services/stripe.webhook.service.ts
// Gestion des webhooks Stripe

import Stripe from 'stripe';
import { prisma } from '../config/database.js';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import { AppError } from '../middleware/error.middleware.js';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

const logger = createLogger('StripeWebhookService');

// Configuration Stripe (optionnel en dev)
let stripe: Stripe | null = null;
if (config.stripe.secretKey) {
  stripe = new Stripe(config.stripe.secretKey);
} else {
  logger.warn('STRIPE_SECRET_KEY non configurée - webhooks désactivés');
}

/**
 * Gérer le webhook Stripe
 */
export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<void> {
  if (!stripe) {
    throw new AppError('Service Stripe non configuré', 503);
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );
  } catch (err) {
    logger.error('Erreur signature webhook Stripe:', err);
    throw new AppError('Signature webhook invalide', 400);
  }

  logger.info(`Webhook Stripe reçu: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      logger.info(`Event Stripe non géré: ${event.type}`);
  }
}

/**
 * Checkout complété - activer l'abonnement
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const { userId, plan } = session.metadata || {};

  if (!userId || !plan) {
    logger.error('Métadonnées manquantes dans la session Checkout');
    return;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    logger.error(`Abonnement non trouvé pour user ${userId}`);
    return;
  }

  if (!stripe) {
    logger.error('Stripe non configuré dans handleCheckoutCompleted');
    return;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Utiliser les propriétés via l'objet renvoyé
  const subData = stripeSubscription as unknown as {
    id: string;
    current_period_start: number;
    current_period_end: number;
  };

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      plan: plan as SubscriptionPlan,
      status: 'ACTIVE',
      stripeSubscriptionId: subData.id,
      currentPeriodStart: new Date(subData.current_period_start * 1000),
      currentPeriodEnd: new Date(subData.current_period_end * 1000),
      questionsPerMonth: getQuestionsForPlan(plan as SubscriptionPlan),
      questionsUsed: 0,
    },
  });

  logger.info(`Abonnement activé: ${plan} pour user ${userId}`);
}

/**
 * Abonnement mis à jour
 */
async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
  // Cast pour accéder aux propriétés
  const subData = stripeSubscription as unknown as {
    id: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
  };

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subData.id },
  });

  if (!subscription) {
    logger.warn(`Abonnement non trouvé: ${subData.id}`);
    return;
  }

  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELLED',
    trialing: 'TRIALING',
  };

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: statusMap[subData.status] || 'ACTIVE',
      currentPeriodStart: new Date(subData.current_period_start * 1000),
      currentPeriodEnd: new Date(subData.current_period_end * 1000),
    },
  });

  logger.info(`Abonnement mis à jour: ${subscription.id}`);
}

/**
 * Abonnement annulé
 */
async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) {
    return;
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      plan: 'FREE',
      questionsPerMonth: 10,
    },
  });

  logger.info(`Abonnement annulé: ${subscription.id}`);
}

/**
 * Paiement réussi - enregistrer le paiement
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  // Cast pour accéder aux propriétés
  const invoiceData = invoice as unknown as {
    id: string;
    subscription: string | null;
    amount_paid: number;
    currency: string;
    payment_intent: string | null;
    billing_reason: string | null;
  };

  if (!invoiceData.subscription) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoiceData.subscription },
  });

  if (!subscription) return;

  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount: (invoiceData.amount_paid || 0) / 100,
      currency: invoiceData.currency.toUpperCase(),
      status: 'succeeded',
      stripePaymentId: invoiceData.payment_intent || '',
      paymentMethod: 'card',
      metadata: {
        invoiceId: invoiceData.id,
        billingReason: invoiceData.billing_reason,
      },
    },
  });

  // Réinitialiser le compteur de questions pour le nouveau mois
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { questionsUsed: 0 },
  });

  logger.info(`Paiement enregistré pour abonnement ${subscription.id}`);
}

/**
 * Paiement échoué
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // Cast pour accéder aux propriétés
  const invoiceData = invoice as unknown as {
    id: string;
    subscription: string | null;
    amount_due: number;
    currency: string;
    payment_intent: string | null;
    billing_reason: string | null;
  };

  if (!invoiceData.subscription) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoiceData.subscription },
  });

  if (!subscription) return;

  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount: (invoiceData.amount_due || 0) / 100,
      currency: invoiceData.currency.toUpperCase(),
      status: 'failed',
      stripePaymentId: invoiceData.payment_intent || '',
      metadata: {
        invoiceId: invoiceData.id,
        billingReason: invoiceData.billing_reason,
      },
    },
  });

  logger.warn(`Paiement échoué pour abonnement ${subscription.id}`);
}

/**
 * Helper: questions par plan
 */
function getQuestionsForPlan(plan: SubscriptionPlan): number {
  const limits: Record<SubscriptionPlan, number> = {
    FREE: 10,
    STARTER: 50,
    PROFESSIONAL: 200,
    TEAM: 500,
    ENTERPRISE: 1000,
  };
  return limits[plan];
}
