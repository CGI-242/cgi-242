import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-profile-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    BreadcrumbComponent,
  ],
  template: `
    <div class="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="true" />

        <main class="flex-1 ml-14">
          <div class="max-w-4xl mx-auto py-8 px-4">
            <!-- Breadcrumb -->
            <div class="mb-4">
              <app-breadcrumb />
            </div>

            <!-- Header -->
            <div class="mb-8">
              <div class="flex items-center gap-4">
                <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 text-3xl font-bold">
                    {{ userInitials }}
                  </span>
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-secondary-900">
                    {{ authService.userFullName() }}
                  </h1>
                  <p class="text-secondary-600">{{ authService.user()?.email }}</p>
                  @if (!authService.user()?.isEmailVerified) {
                    <span class="inline-flex items-center gap-1 mt-1 text-sm text-amber-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                      Email non vérifié
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-secondary-200 mb-6">
              <nav class="flex gap-6">
                <a
                  routerLink="info"
                  routerLinkActive="border-primary-600 text-primary-600"
                  class="py-3 border-b-2 border-transparent text-secondary-600 hover:text-secondary-900 font-medium text-sm transition-colors">
                  <span class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Informations
                  </span>
                </a>
                <a
                  routerLink="security"
                  routerLinkActive="border-primary-600 text-primary-600"
                  class="py-3 border-b-2 border-transparent text-secondary-600 hover:text-secondary-900 font-medium text-sm transition-colors">
                  <span class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    Sécurité
                  </span>
                </a>
              </nav>
            </div>

            <!-- Content -->
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class ProfileContainerComponent {
  authService = inject(AuthService);

  get userInitials(): string {
    const user = this.authService.user();
    if (!user) return '';
    const first = user.firstName?.charAt(0) ?? '';
    const last = user.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
  }
}
