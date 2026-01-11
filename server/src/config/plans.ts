import { SubscriptionPlan, SubscriptionType } from '@prisma/client';

export interface PlanConfig {
  name: string;
  type: SubscriptionType;
  price: number; // Prix annuel en XAF (TTC)
  launchPrice: number; // Prix offre lancement
  currency: string;
  questionsPerMonth: number; // -1 = illimité
  exportsPerMonth: number; // -1 = illimité
  maxMembers: number;
  features: string[];
  popular?: boolean;
  supportDelay: string;
}

// Grille tarifaire officielle CGI 242 - Janvier 2026
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanConfig> = {
  // BASIC - Le prix du CGI papier
  FREE: {
    name: 'BASIC',
    type: 'PERSONAL',
    price: 50000, // 50 000 FCFA/an
    launchPrice: 40000, // Offre lancement -10 000
    currency: 'XAF',
    questionsPerMonth: 0, // Pas d'IA
    exportsPerMonth: 5,
    maxMembers: 1,
    supportDelay: '72h',
    features: [
      'Recherche CGI illimitée',
      'Consultation 600+ articles',
      'Tous les simulateurs fiscaux',
      'Calendrier fiscal + alertes',
      'FAQ interactive',
      '5 exports PDF/mois',
      'Support email (72h)',
    ],
  },

  // STARTER = PRO dans la grille
  STARTER: {
    name: 'PRO',
    type: 'PERSONAL',
    price: 75000, // 75 000 FCFA/an
    launchPrice: 60000, // Offre lancement -15 000
    currency: 'XAF',
    questionsPerMonth: 50,
    exportsPerMonth: 20,
    maxMembers: 1,
    popular: true,
    supportDelay: '48h',
    features: [
      'Tout BASIC inclus',
      '50 questions IA/mois',
      '20 exports PDF/mois',
      'Veille fiscale',
      'Support email (48h)',
    ],
  },

  // PROFESSIONAL = EXPERT dans la grille
  PROFESSIONAL: {
    name: 'EXPERT',
    type: 'PERSONAL',
    price: 100000, // 100 000 FCFA/an
    launchPrice: 80000, // Offre lancement -20 000
    currency: 'XAF',
    questionsPerMonth: 100,
    exportsPerMonth: -1, // Illimité
    maxMembers: 3,
    supportDelay: '24h',
    features: [
      'Tout PRO inclus',
      '100 questions IA/mois',
      'Exports PDF illimités',
      '3 utilisateurs inclus',
      'Support prioritaire (24h)',
      'Accès webinaires fiscaux',
    ],
  },

  // TEAM - Pour les équipes plus grandes
  TEAM: {
    name: 'TEAM',
    type: 'ORGANIZATION',
    price: 250000, // Sur demande
    launchPrice: 200000,
    currency: 'XAF',
    questionsPerMonth: 300,
    exportsPerMonth: -1,
    maxMembers: 10,
    supportDelay: '24h',
    features: [
      'Tout EXPERT inclus',
      '300 questions IA partagées',
      'Jusqu\'à 10 utilisateurs',
      'Dashboard équipe',
      'Gestion des rôles',
    ],
  },

  // ENTERPRISE - Sur devis
  ENTERPRISE: {
    name: 'ENTERPRISE',
    type: 'ORGANIZATION',
    price: 0, // Sur devis
    launchPrice: 0,
    currency: 'XAF',
    questionsPerMonth: -1,
    exportsPerMonth: -1,
    maxMembers: -1,
    supportDelay: 'Dédié',
    features: [
      'Questions illimitées',
      'Utilisateurs illimités',
      'SSO / SAML',
      'API dédiée',
      'SLA garanti',
      'Account manager',
      'Formation sur site',
    ],
  },
};

// Packs de recharges IA
export interface AIPack {
  id: string;
  name: string;
  questions: number;
  price: number;
  pricePerQuestion: number;
  validityMonths: number;
}

export const AI_PACKS: AIPack[] = [
  { id: 'PACK_20', name: 'STARTER', questions: 20, price: 5000, pricePerQuestion: 250, validityMonths: 12 },
  { id: 'PACK_50', name: 'STANDARD', questions: 50, price: 10000, pricePerQuestion: 200, validityMonths: 12 },
  { id: 'PACK_100', name: 'PRO', questions: 100, price: 18000, pricePerQuestion: 180, validityMonths: 12 },
  { id: 'PACK_200', name: 'MEGA', questions: 200, price: 30000, pricePerQuestion: 150, validityMonths: 12 },
];

// Réductions disponibles
export interface Discount {
  code: string;
  name: string;
  percentage: number;
  conditions: string;
  validPlans: SubscriptionPlan[];
}

export const DISCOUNTS: Discount[] = [
  { code: 'ETUDIANT30', name: 'Étudiants', percentage: 30, conditions: 'Carte étudiant valide', validPlans: ['FREE'] },
  { code: 'STARTUP20', name: 'Startups', percentage: 20, conditions: 'Entreprise < 2 ans (RCCM)', validPlans: ['STARTER'] },
  { code: 'ONECCA15', name: 'ONECCA/OEC', percentage: 15, conditions: 'Membre ordre comptable', validPlans: ['FREE', 'STARTER', 'PROFESSIONAL'] },
];

// Offre de lancement - valable jusqu'au 31 mars 2026
export const LAUNCH_OFFER = {
  enabled: true,
  endDate: new Date('2026-03-31'),
  discounts: {
    FREE: 10000, // -10 000 FCFA
    STARTER: 15000, // -15 000 FCFA
    PROFESSIONAL: 20000, // -20 000 FCFA
  },
};

// Limites par plan pour validation
export interface PlanLimits {
  questions: number;
  exports: number;
  members: number;
  historyDays: number;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: { questions: 0, exports: 5, members: 1, historyDays: 30 },
  STARTER: { questions: 50, exports: 20, members: 1, historyDays: 90 },
  PROFESSIONAL: { questions: 100, exports: Infinity, members: 3, historyDays: Infinity },
  TEAM: { questions: 300, exports: Infinity, members: 10, historyDays: Infinity },
  ENTERPRISE: { questions: Infinity, exports: Infinity, members: Infinity, historyDays: Infinity },
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

// Helper pour obtenir le prix actuel (avec offre lancement si active)
export function getCurrentPrice(plan: SubscriptionPlan): number {
  const config = SUBSCRIPTION_PLANS[plan];
  if (LAUNCH_OFFER.enabled && new Date() < LAUNCH_OFFER.endDate) {
    return config.launchPrice;
  }
  return config.price;
}
