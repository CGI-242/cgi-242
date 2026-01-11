import { Pipe, PipeTransform, inject } from '@angular/core';
import { PermissionService, Permission } from '../../core/services/permission.service';

/**
 * Pipe pour vérifier les permissions dans les templates
 *
 * Usage:
 * ```html
 * <button [disabled]="!('members:invite' | hasPermission)">Inviter</button>
 *
 * <div [class.hidden]="!(['billing:view'] | hasPermission:'any')">
 *   Facturation
 * </div>
 * ```
 */
@Pipe({
  name: 'hasPermission',
  standalone: true,
  pure: false, // Impure pour réagir aux changements de permissions
})
export class HasPermissionPipe implements PipeTransform {
  private permissionService = inject(PermissionService);

  transform(
    permission: Permission | Permission[],
    mode: 'all' | 'any' = 'all'
  ): boolean {
    if (!permission) return false;

    const permsArray = Array.isArray(permission) ? permission : [permission];

    if (permsArray.length === 0) return true;

    if (mode === 'any') {
      return this.permissionService.hasAnyPermission(...permsArray);
    }

    return this.permissionService.hasAllPermissions(...permsArray);
  }
}
