import { Component, inject, signal, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TenantService, OrganizationContext } from '@core/services/tenant.service';
import { OrganizationService, OrganizationMembership } from '@core/services/organization.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-org-switcher',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative">
      <button
        (click)="toggleDropdown()"
        class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary-100 transition">
        <!-- Current context -->
        <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
          @if (currentOrg(); as org) {
            @if (org.logo) {
              <img [src]="org.logo" class="w-full h-full rounded-lg object-cover" [alt]="org.name">
            } @else {
              <span class="text-primary-600 text-sm font-medium">{{ org.name.charAt(0) }}</span>
            }
          } @else {
            <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          }
        </div>

        <div class="text-left hidden sm:block">
          <p class="text-sm font-medium text-secondary-900 max-w-[120px] truncate">
            {{ currentOrg()?.name ?? 'Espace personnel' }}
          </p>
          <p class="text-xs text-secondary-500">
            {{ currentOrg() ? getRoleLabel(currentOrg()!.role) : 'Mon compte' }}
          </p>
        </div>

        <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div class="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 z-50">
          <!-- Espace personnel -->
          <button
            (click)="switchToPersonal()"
            class="w-full px-4 py-2 flex items-center gap-3 hover:bg-secondary-50"
            [class.bg-primary-50]="!currentOrg()">
            <div class="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <div class="text-left flex-1">
              <p class="text-sm font-medium text-secondary-900">Espace personnel</p>
              <p class="text-xs text-secondary-500">Mon compte</p>
            </div>
            @if (!currentOrg()) {
              <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            }
          </button>

          @if (memberships().length > 0) {
            <hr class="my-2">
            <p class="px-4 py-1 text-xs font-medium text-secondary-500 uppercase">Organisations</p>

            @for (membership of memberships(); track membership.organization.id) {
              <button
                (click)="switchToOrganization(membership)"
                class="w-full px-4 py-2 flex items-center gap-3 hover:bg-secondary-50"
                [class.bg-primary-50]="currentOrg()?.id === membership.organization.id">
                <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  @if (membership.organization.logo) {
                    <img [src]="membership.organization.logo" class="w-full h-full rounded-lg object-cover" [alt]="membership.organization.name">
                  } @else {
                    <span class="text-primary-600 text-sm font-medium">
                      {{ membership.organization.name.charAt(0) }}
                    </span>
                  }
                </div>
                <div class="text-left flex-1">
                  <p class="text-sm font-medium text-secondary-900">{{ membership.organization.name }}</p>
                  <p class="text-xs text-secondary-500">{{ getRoleLabel(membership.role) }}</p>
                </div>
                @if (currentOrg()?.id === membership.organization.id) {
                  <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                }
              </button>
            }
          }

          <hr class="my-2">

          <!-- Créer une organisation -->
          <a
            routerLink="/organization/create"
            (click)="closeDropdown()"
            class="w-full px-4 py-2 flex items-center gap-3 hover:bg-secondary-50 text-primary-600">
            <div class="w-8 h-8 rounded-lg border-2 border-dashed border-primary-300 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span class="text-sm font-medium">Créer une organisation</span>
          </a>
        </div>
      }
    </div>
  `,
})
export class OrgSwitcherComponent implements OnInit {
  private tenantService = inject(TenantService);
  private orgService = inject(OrganizationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isOpen = signal(false);
  memberships = signal<OrganizationMembership[]>([]);
  currentOrg = this.tenantService.currentOrganization;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  ngOnInit(): void {
    this.loadMemberships();
  }

  loadMemberships(): void {
    this.orgService.getUserOrganizations().subscribe((memberships) => {
      this.memberships.set(memberships);
    });
  }

  toggleDropdown(): void {
    this.isOpen.update((v) => !v);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  switchToPersonal(): void {
    this.tenantService.setPersonalContext();
    this.closeDropdown();
    this.router.navigate(['/chat']);
  }

  switchToOrganization(membership: OrganizationMembership): void {
    const org: OrganizationContext = {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      logo: membership.organization.logo,
      role: membership.role,
    };
    this.tenantService.setOrganizationContext(org);
    this.closeDropdown();
    this.router.navigate(['/chat']);
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
