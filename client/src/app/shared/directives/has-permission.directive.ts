import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  inject,
  effect,
} from '@angular/core';
import { PermissionService, Permission } from '../../core/services/permission.service';

/**
 * Directive structurelle pour afficher/masquer des éléments selon les permissions
 *
 * Usage:
 * ```html
 * <button *hasPermission="'members:invite'">Inviter</button>
 *
 * <div *hasPermission="['billing:view', 'billing:manage']" hasPermissionMode="any">
 *   Facturation
 * </div>
 *
 * <ng-container *hasPermission="'admin:orgs_manage'; else noAccess">
 *   Contenu admin
 * </ng-container>
 * <ng-template #noAccess>Accès refusé</ng-template>
 * ```
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private permissions: Permission | Permission[] = [];
  private mode: 'all' | 'any' = 'all';
  private elseTemplateRef: TemplateRef<any> | null = null;
  private hasView = false;

  /**
   * Permission(s) requise(s) - peut être une string ou un tableau
   */
  @Input()
  set hasPermission(value: Permission | Permission[]) {
    this.permissions = value;
    this.updateView();
  }

  /**
   * Mode de vérification: 'all' (toutes requises) ou 'any' (une seule suffit)
   */
  @Input()
  set hasPermissionMode(value: 'all' | 'any') {
    this.mode = value;
    this.updateView();
  }

  /**
   * Template à afficher si la permission n'est pas accordée
   */
  @Input()
  set hasPermissionElse(templateRef: TemplateRef<any>) {
    this.elseTemplateRef = templateRef;
    this.updateView();
  }

  ngOnInit(): void {
    // S'abonner aux changements de permissions via effect()
    effect(() => {
      // Accéder au signal pour déclencher le recalcul
      this.permissionService.allPermissions();
      this.updateView();
    });
  }

  ngOnDestroy(): void {
    this.viewContainer.clear();
  }

  private updateView(): void {
    const hasPermission = this.checkPermissions();

    if (hasPermission && !this.hasView) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      if (this.elseTemplateRef) {
        this.viewContainer.createEmbeddedView(this.elseTemplateRef);
      }
      this.hasView = false;
    } else if (!hasPermission && !this.hasView && this.elseTemplateRef) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.elseTemplateRef);
    }
  }

  private checkPermissions(): boolean {
    if (!this.permissions) return false;

    const permsArray = Array.isArray(this.permissions)
      ? this.permissions
      : [this.permissions];

    if (permsArray.length === 0) return true;

    if (this.mode === 'any') {
      return this.permissionService.hasAnyPermission(...permsArray);
    }

    return this.permissionService.hasAllPermissions(...permsArray);
  }
}
