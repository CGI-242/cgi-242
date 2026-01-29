import { Component, inject, model, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TenantService } from '@core/services/tenant.service';

interface NavSubItem {
  label: string;
  route: string;
}

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavSubItem[];
  requiresOrg?: boolean;
  minimumRole?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 transition-all duration-300"
      [class.w-52]="!collapsed()"
      [class.w-14]="collapsed()">
      <nav class="space-y-1" [class.p-3]="!collapsed()" [class.p-2]="collapsed()">
        @for (item of visibleItems; track item.label) {
          @if (item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
              class="flex items-center rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition"
              [class.gap-3]="!collapsed()"
              [class.px-3]="!collapsed()"
              [class.py-2]="!collapsed()"
              [class.justify-center]="collapsed()"
              [class.p-2]="collapsed()">
              <span [innerHTML]="getSafeIcon(item.icon)" class="w-5 h-5 flex-shrink-0"></span>
              @if (!collapsed()) {
                <span class="text-base font-medium">{{ item.label }}</span>
              }
            </a>
          } @else if (item.children) {
            <!-- Menu avec sous-items -->
            <div>
              <button
                (click)="toggleMenu(item.label)"
                class="w-full flex items-center rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition"
                [class.gap-3]="!collapsed()"
                [class.px-3]="!collapsed()"
                [class.py-2]="!collapsed()"
                [class.justify-center]="collapsed()"
                [class.p-2]="collapsed()">
                <span [innerHTML]="getSafeIcon(item.icon)" class="w-5 h-5 flex-shrink-0"></span>
                @if (!collapsed()) {
                  <span class="text-base font-medium flex-1 text-left">{{ item.label }}</span>
                  <svg
                    class="w-4 h-4 transition-transform"
                    [class.rotate-180]="isMenuOpen(item.label)"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                }
              </button>
              @if (!collapsed() && isMenuOpen(item.label)) {
                <div class="ml-8 mt-1 space-y-1">
                  @for (child of item.children; track child.route) {
                    <a
                      [routerLink]="child.route"
                      routerLinkActive="text-primary-700 dark:text-primary-400 font-medium"
                      class="block px-3 py-1.5 text-base text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 transition">
                      {{ child.label }}
                    </a>
                  }
                </div>
              }
            </div>
          }
        }
      </nav>

      <!-- Toggle button -->
      <button
        (click)="collapsed.set(!collapsed())"
        class="absolute bottom-4 right-0 translate-x-1/2 w-6 h-6 bg-white dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 rounded-full flex items-center justify-center hover:bg-secondary-50 dark:hover:bg-secondary-600">
        <svg class="w-4 h-4 text-secondary-400" [class.rotate-180]="collapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
    </aside>
  `,
})
export class SidebarComponent {
  collapsed = model(false);

  private tenantService = inject(TenantService);
  private sanitizer = inject(DomSanitizer);

  openMenus = signal<Set<string>>(new Set());

  private navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>',
      route: '/dashboard',
    },
    {
      label: 'Livre CGI',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
      children: [
        { label: 'CGI 2025', route: '/code/2025' },
        { label: 'CGI 2026', route: '/code/2026' },
      ],
    },
    {
      label: 'Simulateur',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
      children: [
        { label: 'IRPP (2025)', route: '/simulateur/irpp' },
        { label: 'ITS (2026)', route: '/simulateur/its' },
        { label: 'Minimum perception IS', route: '/simulateur/is' },
        { label: 'Patente', route: '/simulateur/patente' },
        { label: 'Acompte IS', route: '/simulateur/acompte-is' },
        { label: 'Solde IS', route: '/simulateur/solde-is' },
      ],
    },
    {
      label: 'Chat IA',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>',
      route: '/chat',
    },
    {
      label: 'Alertes',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
      route: '/alertes-fiscales',
    },
    {
      label: 'Organisation',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
      route: '/organization',
      requiresOrg: true,
      minimumRole: 'MEMBER',
    },
    {
      label: 'Paramètres',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
      route: '/profile/settings',
    },
  ];

  private iconCache = new Map<string, SafeHtml>();

  getSafeIcon(icon: string): SafeHtml {
    if (!this.iconCache.has(icon)) {
      this.iconCache.set(icon, this.sanitizer.bypassSecurityTrustHtml(icon));
    }
    return this.iconCache.get(icon)!;
  }

  toggleMenu(label: string): void {
    this.openMenus.update(menus => {
      const newMenus = new Set(menus);
      if (newMenus.has(label)) {
        newMenus.delete(label);
      } else {
        newMenus.add(label);
      }
      return newMenus;
    });
  }

  isMenuOpen(label: string): boolean {
    return this.openMenus().has(label);
  }

  get visibleItems(): NavItem[] {
    return this.navItems.filter((item) => {
      if (item.requiresOrg && !this.tenantService.isOrganization()) {
        return false;
      }
      if (item.minimumRole && !this.tenantService.hasMinimumRole(item.minimumRole)) {
        return false;
      }
      return true;
    });
  }
}
