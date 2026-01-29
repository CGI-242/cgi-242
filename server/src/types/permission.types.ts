import { OrganizationRole, SubscriptionPlan } from '@prisma/client';

/**
 * Permissions granulaires pour le système multi-tenant
 * Système hybride: permissions par rôle ORG + permissions par plan d'abonnement
 */

// Catégories de permissions
export const PERMISSION_CATEGORIES = {
  ORGANIZATION: 'organization',
  MEMBERS: 'members',
  BILLING: 'billing',
  CONVERSATIONS: 'conversations',
  API: 'api',
  ANALYTICS: 'analytics',
  // Catégories liées aux fonctionnalités (plan-based)
  ARTICLES: 'articles',
  CHAT: 'chat',
  SIMULATORS: 'simulators',
  ADMIN: 'admin',
} as const;

// Définition des permissions disponibles
export const PERMISSIONS = {
  // === PERMISSIONS PAR RÔLE (Organisation) ===

  // Organisation
  ORG_VIEW: 'org:view',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',
  ORG_TRANSFER: 'org:transfer',

  // Gestion des membres
  MEMBERS_VIEW: 'members:view',
  MEMBERS_INVITE: 'members:invite',
  MEMBERS_REMOVE: 'members:remove',
  MEMBERS_ROLE_UPDATE: 'members:role_update',

  // Facturation (role-based)
  BILLING_VIEW: 'billing:view',
  BILLING_MANAGE: 'billing:manage',
  BILLING_INVOICES: 'billing:invoices',

  // Conversations
  CONV_CREATE: 'conversations:create',
  CONV_VIEW_ALL: 'conversations:view_all',
  CONV_DELETE_ANY: 'conversations:delete_any',
  CONV_SHARE: 'conversations:share',

  // API & Intégrations
  API_KEYS_VIEW: 'api:keys_view',
  API_KEYS_CREATE: 'api:keys_create',
  API_KEYS_DELETE: 'api:keys_delete',

  // Analytics & Audit
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  AUDIT_VIEW: 'audit:view',

  // === PERMISSIONS PAR PLAN D'ABONNEMENT ===

  // Articles CGI
  ARTICLES_READ: 'articles:read',
  ARTICLES_UNLIMITED: 'articles:unlimited',
  ARTICLES_EXPORT: 'articles:export',

  // Chat IA
  CHAT_ACCESS: 'chat:access',
  CHAT_UNLIMITED: 'chat:unlimited',

  // Simulateurs
  SIMULATORS_ACCESS: 'simulators:access',

  // === PERMISSIONS ADMIN (Super Admin) ===
  USERS_MANAGE: 'users:manage',
  ADMIN_BILLING_VIEW: 'admin:billing_view',
  ADMIN_ORGS_MANAGE: 'admin:orgs_manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Structure des permissions stockées en JSON
export interface PermissionSet {
  [key: string]: boolean;
}

// Permissions par défaut selon le rôle
export const DEFAULT_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  OWNER: Object.values(PERMISSIONS), // Toutes les permissions
  ADMIN: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.MEMBERS_INVITE,
    PERMISSIONS.MEMBERS_REMOVE,
    PERMISSIONS.MEMBERS_ROLE_UPDATE,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_MANAGE,
    PERMISSIONS.BILLING_INVOICES,
    PERMISSIONS.CONV_CREATE,
    PERMISSIONS.CONV_VIEW_ALL,
    PERMISSIONS.CONV_DELETE_ANY,
    PERMISSIONS.CONV_SHARE,
    PERMISSIONS.API_KEYS_VIEW,
    PERMISSIONS.API_KEYS_CREATE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.AUDIT_VIEW,
  ],
  MEMBER: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.CONV_CREATE,
    PERMISSIONS.CONV_SHARE,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  VIEWER: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
};

// Description des permissions pour l'UI
export const PERMISSION_DESCRIPTIONS: Record<
  Permission,
  { label: string; description: string; category: string }
> = {
  [PERMISSIONS.ORG_VIEW]: {
    label: 'Voir organisation',
    description: "Accéder aux informations de l'organisation",
    category: PERMISSION_CATEGORIES.ORGANIZATION,
  },
  [PERMISSIONS.ORG_UPDATE]: {
    label: 'Modifier organisation',
    description: "Modifier les paramètres de l'organisation",
    category: PERMISSION_CATEGORIES.ORGANIZATION,
  },
  [PERMISSIONS.ORG_DELETE]: {
    label: 'Supprimer organisation',
    description: "Supprimer l'organisation",
    category: PERMISSION_CATEGORIES.ORGANIZATION,
  },
  [PERMISSIONS.ORG_TRANSFER]: {
    label: 'Transférer propriété',
    description: "Transférer la propriété de l'organisation",
    category: PERMISSION_CATEGORIES.ORGANIZATION,
  },
  [PERMISSIONS.MEMBERS_VIEW]: {
    label: 'Voir membres',
    description: 'Voir la liste des membres',
    category: PERMISSION_CATEGORIES.MEMBERS,
  },
  [PERMISSIONS.MEMBERS_INVITE]: {
    label: 'Inviter membres',
    description: 'Inviter de nouveaux membres',
    category: PERMISSION_CATEGORIES.MEMBERS,
  },
  [PERMISSIONS.MEMBERS_REMOVE]: {
    label: 'Retirer membres',
    description: "Retirer des membres de l'organisation",
    category: PERMISSION_CATEGORIES.MEMBERS,
  },
  [PERMISSIONS.MEMBERS_ROLE_UPDATE]: {
    label: 'Modifier rôles',
    description: 'Modifier le rôle des membres',
    category: PERMISSION_CATEGORIES.MEMBERS,
  },
  [PERMISSIONS.BILLING_VIEW]: {
    label: 'Voir facturation',
    description: 'Accéder aux informations de facturation',
    category: PERMISSION_CATEGORIES.BILLING,
  },
  [PERMISSIONS.BILLING_MANAGE]: {
    label: 'Gérer facturation',
    description: "Gérer l'abonnement et les paiements",
    category: PERMISSION_CATEGORIES.BILLING,
  },
  [PERMISSIONS.BILLING_INVOICES]: {
    label: 'Voir factures',
    description: 'Télécharger les factures',
    category: PERMISSION_CATEGORIES.BILLING,
  },
  [PERMISSIONS.CONV_CREATE]: {
    label: 'Créer conversations',
    description: 'Créer de nouvelles conversations',
    category: PERMISSION_CATEGORIES.CONVERSATIONS,
  },
  [PERMISSIONS.CONV_VIEW_ALL]: {
    label: 'Voir toutes conversations',
    description: "Voir les conversations de l'équipe",
    category: PERMISSION_CATEGORIES.CONVERSATIONS,
  },
  [PERMISSIONS.CONV_DELETE_ANY]: {
    label: 'Supprimer conversations',
    description: "Supprimer n'importe quelle conversation",
    category: PERMISSION_CATEGORIES.CONVERSATIONS,
  },
  [PERMISSIONS.CONV_SHARE]: {
    label: 'Partager conversations',
    description: 'Partager des conversations',
    category: PERMISSION_CATEGORIES.CONVERSATIONS,
  },
  [PERMISSIONS.API_KEYS_VIEW]: {
    label: 'Voir clés API',
    description: 'Voir les clés API configurées',
    category: PERMISSION_CATEGORIES.API,
  },
  [PERMISSIONS.API_KEYS_CREATE]: {
    label: 'Créer clés API',
    description: 'Créer de nouvelles clés API',
    category: PERMISSION_CATEGORIES.API,
  },
  [PERMISSIONS.API_KEYS_DELETE]: {
    label: 'Supprimer clés API',
    description: 'Supprimer des clés API',
    category: PERMISSION_CATEGORIES.API,
  },
  [PERMISSIONS.ANALYTICS_VIEW]: {
    label: 'Voir analytics',
    description: "Voir les tableaux de bord d'analyse",
    category: PERMISSION_CATEGORIES.ANALYTICS,
  },
  [PERMISSIONS.ANALYTICS_EXPORT]: {
    label: 'Exporter analytics',
    description: 'Exporter les données analytiques',
    category: PERMISSION_CATEGORIES.ANALYTICS,
  },
  [PERMISSIONS.AUDIT_VIEW]: {
    label: "Voir journal d'audit",
    description: "Accéder au journal d'audit",
    category: PERMISSION_CATEGORIES.ANALYTICS,
  },
  // Permissions Articles (plan-based)
  [PERMISSIONS.ARTICLES_READ]: {
    label: 'Lire articles',
    description: 'Accéder aux articles du CGI',
    category: PERMISSION_CATEGORIES.ARTICLES,
  },
  [PERMISSIONS.ARTICLES_UNLIMITED]: {
    label: 'Articles illimités',
    description: 'Accès illimité aux articles',
    category: PERMISSION_CATEGORIES.ARTICLES,
  },
  [PERMISSIONS.ARTICLES_EXPORT]: {
    label: 'Exporter articles',
    description: 'Exporter les articles en PDF/Word',
    category: PERMISSION_CATEGORIES.ARTICLES,
  },
  // Permissions Chat IA (plan-based)
  [PERMISSIONS.CHAT_ACCESS]: {
    label: 'Chat IA',
    description: "Accéder à l'assistant IA",
    category: PERMISSION_CATEGORIES.CHAT,
  },
  [PERMISSIONS.CHAT_UNLIMITED]: {
    label: 'Chat illimité',
    description: 'Questions illimitées au chat IA',
    category: PERMISSION_CATEGORIES.CHAT,
  },
  // Permissions Simulateurs (plan-based)
  [PERMISSIONS.SIMULATORS_ACCESS]: {
    label: 'Simulateurs',
    description: 'Accéder aux simulateurs fiscaux',
    category: PERMISSION_CATEGORIES.SIMULATORS,
  },
  // Permissions Admin (super admin)
  [PERMISSIONS.USERS_MANAGE]: {
    label: 'Gérer utilisateurs',
    description: 'Gérer tous les utilisateurs',
    category: PERMISSION_CATEGORIES.ADMIN,
  },
  [PERMISSIONS.ADMIN_BILLING_VIEW]: {
    label: 'Facturation globale',
    description: 'Voir la facturation globale',
    category: PERMISSION_CATEGORIES.ADMIN,
  },
  [PERMISSIONS.ADMIN_ORGS_MANAGE]: {
    label: 'Gérer organisations',
    description: 'Gérer toutes les organisations',
    category: PERMISSION_CATEGORIES.ADMIN,
  },
};

// Permissions par plan d'abonnement
// Plans: FREE, STARTER, PROFESSIONAL, TEAM, ENTERPRISE
export const PLAN_PERMISSIONS: Record<SubscriptionPlan, Permission[]> = {
  FREE: [
    PERMISSIONS.ARTICLES_READ,
  ],
  STARTER: [
    PERMISSIONS.ARTICLES_READ,
    PERMISSIONS.ARTICLES_UNLIMITED,
    PERMISSIONS.SIMULATORS_ACCESS,
  ],
  PROFESSIONAL: [
    PERMISSIONS.ARTICLES_READ,
    PERMISSIONS.ARTICLES_UNLIMITED,
    PERMISSIONS.ARTICLES_EXPORT,
    PERMISSIONS.CHAT_ACCESS,
    PERMISSIONS.SIMULATORS_ACCESS,
  ],
  TEAM: [
    PERMISSIONS.ARTICLES_READ,
    PERMISSIONS.ARTICLES_UNLIMITED,
    PERMISSIONS.ARTICLES_EXPORT,
    PERMISSIONS.CHAT_ACCESS,
    PERMISSIONS.CHAT_UNLIMITED,
    PERMISSIONS.SIMULATORS_ACCESS,
  ],
  ENTERPRISE: [
    PERMISSIONS.ARTICLES_READ,
    PERMISSIONS.ARTICLES_UNLIMITED,
    PERMISSIONS.ARTICLES_EXPORT,
    PERMISSIONS.CHAT_ACCESS,
    PERMISSIONS.CHAT_UNLIMITED,
    PERMISSIONS.SIMULATORS_ACCESS,
    // Plus toutes les permissions admin potentielles
    PERMISSIONS.API_KEYS_VIEW,
    PERMISSIONS.API_KEYS_CREATE,
    PERMISSIONS.API_KEYS_DELETE,
  ],
};

// Helper pour obtenir les permissions d'un plan
export function getPlanPermissions(plan: SubscriptionPlan): Permission[] {
  return PLAN_PERMISSIONS[plan] || PLAN_PERMISSIONS.FREE;
}

// Helper pour vérifier si une permission est valide
export function isValidPermission(permission: string): permission is Permission {
  return Object.values(PERMISSIONS).includes(permission as Permission);
}

// Helper pour obtenir les permissions par défaut d'un rôle
export function getDefaultPermissions(role: OrganizationRole): Permission[] {
  return DEFAULT_PERMISSIONS[role] || [];
}

// Helper pour obtenir les permissions par catégorie
export function getPermissionsByCategory(category: string): Permission[] {
  return Object.entries(PERMISSION_DESCRIPTIONS)
    .filter(([, desc]) => desc.category === category)
    .map(([permission]) => permission as Permission);
}
