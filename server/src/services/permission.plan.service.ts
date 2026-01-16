// server/src/services/permission.plan.service.ts
// Permissions basées sur le plan d'abonnement

import { OrganizationRole, SubscriptionPlan } from '@prisma/client';
import { prisma } from '../config/database.js';
import { Permission, getPlanPermissions } from '../types/permission.types.js';

export interface EffectivePermissions {
  rolePermissions: Permission[];
  planPermissions: Permission[];
  combined: Permission[];
  plan: SubscriptionPlan;
  role: OrganizationRole | null;
}

/**
 * Vérifie si un utilisateur a une permission basée sur son plan
 */
export async function hasPlanPermission(
  userId: string,
  permission: Permission,
  organizationId?: string
): Promise<boolean> {
  let plan: SubscriptionPlan = 'FREE';

  if (organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });
    plan = org?.subscription?.plan || 'FREE';
  } else {
    const userSubscription = await prisma.subscription.findFirst({
      where: { userId, type: 'PERSONAL' },
    });
    plan = userSubscription?.plan || 'FREE';
  }

  const planPerms = getPlanPermissions(plan);
  return planPerms.includes(permission);
}

/**
 * Récupère le plan d'un utilisateur
 */
export async function getUserPlan(
  userId: string,
  organizationId?: string
): Promise<SubscriptionPlan> {
  if (organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });
    return org?.subscription?.plan || 'FREE';
  }

  const userSubscription = await prisma.subscription.findFirst({
    where: { userId, type: 'PERSONAL' },
  });
  return userSubscription?.plan || 'FREE';
}

/**
 * Récupère les permissions du plan d'un utilisateur
 */
export async function getUserPlanPermissions(
  userId: string,
  organizationId?: string
): Promise<Permission[]> {
  const plan = await getUserPlan(userId, organizationId);
  return getPlanPermissions(plan);
}

/**
 * Récupère toutes les permissions effectives d'un utilisateur
 * Combine: permissions du rôle ORG + permissions du plan
 */
export async function getAllEffectivePermissions(
  userId: string,
  organizationId: string | undefined,
  rolePermissions: Permission[]
): Promise<EffectivePermissions> {
  let role: OrganizationRole | null = null;
  const plan = await getUserPlan(userId, organizationId);

  if (organizationId) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { organizationId, userId },
      },
      select: { role: true },
    });
    role = member?.role || null;
  }

  const planPermissions = getPlanPermissions(plan);
  const combined = [...new Set([...rolePermissions, ...planPermissions])];

  return {
    rolePermissions,
    planPermissions,
    combined,
    plan,
    role,
  };
}

export default {
  hasPlanPermission,
  getUserPlan,
  getUserPlanPermissions,
  getAllEffectivePermissions,
};
