import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TenantService } from '../services/tenant.service';

type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export function orgRoleGuard(minimumRole: OrgRole): CanActivateFn {
  return () => {
    const tenantService = inject(TenantService);
    const router = inject(Router);

    if (!tenantService.isOrganization()) {
      router.navigate(['/chat']);
      return false;
    }

    if (tenantService.hasMinimumRole(minimumRole)) {
      return true;
    }

    router.navigate(['/forbidden']);
    return false;
  };
}

export const requireOwner: CanActivateFn = orgRoleGuard('OWNER');
export const requireAdmin: CanActivateFn = orgRoleGuard('ADMIN');
export const requireMember: CanActivateFn = orgRoleGuard('MEMBER');
