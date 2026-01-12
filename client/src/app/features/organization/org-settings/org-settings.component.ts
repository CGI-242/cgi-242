import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { OrganizationService, Organization } from '@core/services/organization.service';
import { TenantService } from '@core/services/tenant.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-org-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
    BreadcrumbComponent,
  ],
  template: `
    <div class="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="true" />

        <main class="flex-1 ml-14">
          <div class="max-w-5xl mx-auto py-8 px-4">
            <!-- Breadcrumb -->
            <div class="mb-4">
              <app-breadcrumb />
            </div>

            @if (isLoading()) {
              <app-loading-spinner size="lg" containerClass="py-12" />
            } @else if (organization()) {
              <!-- Header -->
              <div class="mb-8">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span class="text-primary-600 text-2xl font-bold">
                      {{ organization()!.name.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <h1 class="text-2xl font-bold text-secondary-900">
                      {{ organization()!.name }}
                    </h1>
                    <p class="text-secondary-600">
                      {{ getRoleLabel(tenantService.currentOrganization()?.role ?? 'MEMBER') }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Tabs -->
              <div class="border-b border-secondary-200 mb-6">
                <nav class="flex gap-6">
                  <a
                    routerLink="members"
                    routerLinkActive="border-primary-600 text-primary-600"
                    class="py-3 border-b-2 border-transparent text-secondary-600 hover:text-secondary-900 font-medium text-sm">
                    Membres
                  </a>
                  @if (tenantService.hasMinimumRole('ADMIN')) {
                    <a
                      routerLink="general"
                      routerLinkActive="border-primary-600 text-primary-600"
                      class="py-3 border-b-2 border-transparent text-secondary-600 hover:text-secondary-900 font-medium text-sm">
                      Paramètres
                    </a>
                    <a
                      routerLink="billing"
                      routerLinkActive="border-primary-600 text-primary-600"
                      class="py-3 border-b-2 border-transparent text-secondary-600 hover:text-secondary-900 font-medium text-sm">
                      Facturation
                    </a>
                  }
                </nav>
              </div>

              <!-- Content -->
              <router-outlet />
            }
          </div>
        </main>
      </div>
    </div>
  `,
})
export class OrgSettingsComponent implements OnInit {
  private orgService = inject(OrganizationService);
  private destroyRef = inject(DestroyRef);
  tenantService = inject(TenantService);

  organization = signal<Organization | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    const orgId = this.tenantService.organizationId();
    if (orgId) {
      this.orgService.getOrganization(orgId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((org) => {
          this.organization.set(org);
          this.isLoading.set(false);
        });
    }
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      OWNER: 'Propriétaire',
      ADMIN: 'Administrateur',
      MEMBER: 'Membre',
      VIEWER: 'Lecteur',
    };
    return labels[role] ?? role;
  }
}
