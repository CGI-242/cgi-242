import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService, Permission } from '../services/permission.service';

/**
 * Guard de permission pour protéger les routes basées sur les permissions granulaires
 *
 * Usage dans les routes:
 * ```typescript
 * {
 *   path: 'billing',
 *   component: BillingComponent,
 *   canActivate: [permissionGuard('billing:view')]
 * }
 *
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [permissionsGuard(['users:manage', 'admin:orgs_manage'], 'any')]
 * }
 * ```
 */

/**
 * Guard pour une permission unique
 */
export function permissionGuard(permission: Permission): CanActivateFn {
  return () => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    if (permissionService.hasPermission(permission)) {
      return true;
    }

    router.navigate(['/forbidden']);
    return false;
  };
}

/**
 * Guard pour plusieurs permissions avec mode 'all' ou 'any'
 */
export function permissionsGuard(
  permissions: Permission[],
  mode: 'all' | 'any' = 'all'
): CanActivateFn {
  return () => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    const hasAccess =
      mode === 'any'
        ? permissionService.hasAnyPermission(...permissions)
        : permissionService.hasAllPermissions(...permissions);

    if (hasAccess) {
      return true;
    }

    router.navigate(['/forbidden']);
    return false;
  };
}

// Guards pré-configurés pour les fonctionnalités communes
export const canViewBilling = permissionGuard('billing:view');
export const canManageBilling = permissionGuard('billing:manage');
export const canInviteMembers = permissionGuard('members:invite');
export const canManageMembers = permissionsGuard(
  ['members:invite', 'members:remove', 'members:role_update'],
  'any'
);
export const canAccessChat = permissionGuard('chat:access');
export const canAccessSimulators = permissionGuard('simulators:access');
export const canExportArticles = permissionGuard('articles:export');
export const canViewAnalytics = permissionGuard('analytics:view');
export const canViewAudit = permissionGuard('audit:view');
