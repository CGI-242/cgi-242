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
 * <button *appHasPermission="'members:invite'">Inviter</button>
 *
 * <div *appHasPermission="['billing:view', 'billing:manage']" appHasPermissionMode="any">
 *   Facturation
 * </div>
 *
 * <ng-container *appHasPermission="'admin:orgs_manage'; else noAccess">
 *   Contenu admin
 * </ng-container>
 * <ng-template #noAccess>Accès refusé</ng-template>
 * ```
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<void>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private permissions: Permission | Permission[] = [];
  private mode: 'all' | 'any' = 'all';
  private elseTemplateRef: TemplateRef<void> | null = null;
  private hasView = false;

  /**
   * Permission(s) requise(s) - peut être une string ou un tableau
   */
  @Input()
  set appHasPermission(value: Permission | Permission[]) {
    this.permissions = value;
    this.updateView();
  }

  /**
   * Mode de vérification: 'all' (toutes requises) ou 'any' (une seule suffit)
   */
  @Input()
  set appHasPermissionMode(value: 'all' | 'any') {
    this.mode = value;
    this.updateView();
  }

  /**
   * Template à afficher si la permission n'est pas accordée
   */
  @Input()
  set appHasPermissionElse(templateRef: TemplateRef<void>) {
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
