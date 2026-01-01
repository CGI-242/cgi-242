import { OrganizationRole, SubscriptionPlan } from '@prisma/client';

export interface TenantContext {
  type: 'personal' | 'organization';
  userId: string;
  organizationId?: string;
  organizationRole?: OrganizationRole;
  subscription: SubscriptionContext;
}

export interface SubscriptionContext {
  plan: SubscriptionPlan;
  questionsRemaining: number;
  questionsPerMonth: number;
  maxMembers?: number;
  isActive: boolean;
}

export interface OrganizationContext {
  id: string;
  name: string;
  slug: string;
  role: OrganizationRole;
  subscription: SubscriptionContext;
}

export type RoleHierarchy = Record<OrganizationRole, number>;

export const ROLE_HIERARCHY: RoleHierarchy = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export function hasMinimumRole(
  userRole: OrganizationRole,
  requiredRole: OrganizationRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function getRoleLabel(role: OrganizationRole): string {
  const labels: Record<OrganizationRole, string> = {
    OWNER: 'Propriétaire',
    ADMIN: 'Administrateur',
    MEMBER: 'Membre',
    VIEWER: 'Lecteur',
  };
  return labels[role];
}
