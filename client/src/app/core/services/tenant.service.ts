import { Injectable, signal, computed } from '@angular/core';

export type TenantType = 'personal' | 'organization';

export interface OrganizationContext {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface TenantContext {
  type: TenantType;
  organization?: OrganizationContext;
}

const TENANT_KEY = 'cgi_tenant_context';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private contextSignal = signal<TenantContext>(this.loadContext());

  context = this.contextSignal.asReadonly();
  isOrganization = computed(() => this.contextSignal().type === 'organization');
  currentOrganization = computed(() => this.contextSignal().organization);
  organizationId = computed(() => this.contextSignal().organization?.id);

  setPersonalContext(): void {
    const ctx: TenantContext = { type: 'personal' };
    this.contextSignal.set(ctx);
    localStorage.setItem(TENANT_KEY, JSON.stringify(ctx));
  }

  setOrganizationContext(org: OrganizationContext): void {
    const ctx: TenantContext = { type: 'organization', organization: org };
    this.contextSignal.set(ctx);
    localStorage.setItem(TENANT_KEY, JSON.stringify(ctx));
  }

  clearContext(): void {
    this.setPersonalContext();
  }

  hasMinimumRole(requiredRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'): boolean {
    const org = this.contextSignal().organization;
    if (!org) return false;

    const hierarchy: Record<string, number> = {
      OWNER: 4,
      ADMIN: 3,
      MEMBER: 2,
      VIEWER: 1,
    };

    return hierarchy[org.role] >= hierarchy[requiredRole];
  }

  private loadContext(): TenantContext {
    const stored = localStorage.getItem(TENANT_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { type: 'personal' };
      }
    }
    return { type: 'personal' };
  }
}
