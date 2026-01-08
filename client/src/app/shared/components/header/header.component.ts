import { Component, inject, ElementRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { OrgSwitcherComponent } from '../org-switcher/org-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, OrgSwitcherComponent],
  template: `
    <header class="bg-white border-b border-secondary-200 sticky top-0 z-40">
      <div class="px-2 sm:px-4">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <div class="flex items-center gap-8">
            <a routerLink="/" class="flex items-center gap-1">
              <img src="assets/images/logo242.png" alt="CGI 242" class="h-14 sm:h-16 w-auto" />
              <span class="text-base text-secondary-400 font-medium hidden sm:inline">By NORMX AI</span>
            </a>

            @if (authService.isAuthenticated()) {
              <nav class="hidden md:flex items-center gap-6">
                <a routerLink="/dashboard" class="text-base text-secondary-600 hover:text-secondary-900 font-medium">Dashboard</a>
              </nav>
            }
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-4">
            @if (authService.isAuthenticated()) {
              <app-org-switcher />

              <div class="relative user-menu-container">
                <button
                  (click)="toggleMenu()"
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary-100">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-600 text-sm font-medium">
                      {{ userInitials }}
                    </span>
                  </div>
                </button>

                @if (menuOpen) {
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1">
                    <a routerLink="/profile" class="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                      Mon profil
                    </a>
                    <a routerLink="/profile/settings" class="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                      Paramètres
                    </a>
                    <hr class="my-1">
                    <button
                      (click)="logout()"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Déconnexion
                    </button>
                  </div>
                }
              </div>
            } @else {
              <!-- Mobile: icons only -->
              <a routerLink="/auth/login" class="sm:hidden p-2 text-secondary-600 hover:text-primary-600" title="Connexion">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
              </a>
              <a routerLink="/auth/register" class="sm:hidden p-2 bg-primary-600 text-white rounded-lg" title="S'inscrire">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </a>
              <!-- Desktop: text buttons -->
              <a routerLink="/auth/login" class="hidden sm:inline-block btn-outline">Connexion</a>
              <a routerLink="/auth/register" class="hidden sm:inline-block btn-primary">S'inscrire</a>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  authService = inject(AuthService);
  private elementRef = inject(ElementRef);
  menuOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const menuButton = this.elementRef.nativeElement.querySelector('.user-menu-container');
    if (menuButton && !menuButton.contains(event.target)) {
      this.menuOpen = false;
    }
  }

  get userInitials(): string {
    const user = this.authService.user();
    if (!user) return '';
    const first = user.firstName?.charAt(0) ?? '';
    const last = user.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.menuOpen = false;
    this.authService.logout();
  }
}
