import { OrganizationRole } from '@prisma/client';

export interface TenantContext {
  type: 'personal' | 'organization';
  userId: string;
  organizationId?: string;
  organizationRole?: OrganizationRole;
  subscription: {
    plan: string;
    questionsRemaining: number;
    maxMembers?: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profession?: string | null;
  isEmailVerified?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenant?: TenantContext;
    }
  }
}

export {};
