import { SubscriptionPlan, SubscriptionType } from '@prisma/client';

export interface PlanConfig {
  name: string;
  type: SubscriptionType;
  price: number | null; // null = sur devis
  currency: string;
  questionsPerMonth: number; // -1 = illimité
  maxMembers: number; // -1 = illimité
  features: string[];
  popular?: boolean;
  contactSales?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanConfig> = {
  // === Plans Individuels ===
  FREE: {
    name: 'Gratuit',
    type: 'PERSONAL',
    price: 0,
    currency: 'XAF',
    questionsPerMonth: 10,
    maxMembers: 1,
    features: [
      '10 questions par mois',
      'Accès aux articles du CGI',
      'Citations des sources',
    ],
  },
  STARTER: {
    name: 'Starter',
    type: 'PERSONAL',
    price: 9900,
    currency: 'XAF',
    questionsPerMonth: 100,
    maxMembers: 1,
    features: [
      '100 questions par mois',
      'Historique 30 jours',
      'Export des réponses',
      'Support email',
    ],
  },
  PROFESSIONAL: {
    name: 'Professionnel',
    type: 'PERSONAL',
    price: 29900,
    currency: 'XAF',
    questionsPerMonth: -1, // Illimité
    maxMembers: 1,
    popular: true,
    features: [
      'Questions illimitées',
      'Historique illimité',
      'Export PDF/Word',
      'Support prioritaire',
    ],
  },

  // === Plans Organisation ===
  TEAM: {
    name: 'Team',
    type: 'ORGANIZATION',
    price: 79900,
    currency: 'XAF',
    questionsPerMonth: 500,
    maxMembers: 5,
    features: [
      '500 questions/mois partagées',
      "Jusqu'à 5 membres",
      'Conversations partagées',
      'Dashboard équipe',
      'Support prioritaire',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    type: 'ORGANIZATION',
    price: null, // Sur devis
    currency: 'XAF',
    questionsPerMonth: -1,
    maxMembers: -1, // Illimité
    features: [
      'Questions illimitées',
      'Membres illimités',
      'SSO / SAML',
      'API dédiée',
      'SLA garanti',
      'Account manager',
      'Formation sur site',
    ],
    contactSales: true,
  },
};

// Limites par plan pour validation
export interface PlanLimits {
  questions: number;
  members: number;
  historyDays: number;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: { questions: 10, members: 1, historyDays: 7 },
  STARTER: { questions: 100, members: 1, historyDays: 30 },
  PROFESSIONAL: { questions: Infinity, members: 1, historyDays: Infinity },
  TEAM: { questions: 500, members: 5, historyDays: Infinity },
  ENTERPRISE: { questions: Infinity, members: Infinity, historyDays: Infinity },
};

// Helper pour obtenir les limites d'un plan
export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

// Helper pour vérifier si un plan est un plan organisation
export function isOrganizationPlan(plan: SubscriptionPlan): boolean {
  return SUBSCRIPTION_PLANS[plan].type === 'ORGANIZATION';
}

// Helper pour vérifier si les questions sont illimitées
export function hasUnlimitedQuestions(plan: SubscriptionPlan): boolean {
  return PLAN_LIMITS[plan].questions === Infinity;
}
