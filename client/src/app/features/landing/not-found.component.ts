import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center px-4">
      <div class="max-w-lg w-full text-center">
        <!-- Illustration 404 -->
        <div class="relative mb-8">
          <div class="text-[180px] font-bold text-secondary-100 leading-none select-none">
            404
          </div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="bg-white rounded-2xl shadow-xl p-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <svg class="w-24 h-24 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Message -->
        <h1 class="text-3xl font-bold text-secondary-900 mb-4">
          Page introuvable
        </h1>
        <p class="text-secondary-600 mb-8 text-lg">
          Oups ! La page que vous recherchez semble avoir disparu dans le Code Général des Impôts...
        </p>

        <!-- Suggestions -->
        <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
          <h2 class="font-semibold text-secondary-900 mb-4">Que souhaitez-vous faire ?</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              [routerLink]="authService.isAuthenticated() ? '/dashboard' : '/'"
              class="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group">
              <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <div class="text-left">
                <p class="font-medium text-secondary-900">Accueil</p>
                <p class="text-sm text-secondary-500">Retour à la page principale</p>
              </div>
            </a>

            @if (authService.isAuthenticated()) {
              <a
                routerLink="/chat"
                class="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <div class="text-left">
                  <p class="font-medium text-secondary-900">Assistant IA</p>
                  <p class="text-sm text-secondary-500">Poser une question fiscale</p>
                </div>
              </a>

              <a
                routerLink="/code"
                class="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <div class="text-left">
                  <p class="font-medium text-secondary-900">Code CGI</p>
                  <p class="text-sm text-secondary-500">Consulter les articles</p>
                </div>
              </a>

              <a
                routerLink="/simulateur"
                class="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="text-left">
                  <p class="font-medium text-secondary-900">Simulateurs</p>
                  <p class="text-sm text-secondary-500">Calculer vos impôts</p>
                </div>
              </a>
            } @else {
              <a
                routerLink="/auth/login"
                class="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                </div>
                <div class="text-left">
                  <p class="font-medium text-secondary-900">Connexion</p>
                  <p class="text-sm text-secondary-500">Accéder à votre compte</p>
                </div>
              </a>
            }
          </div>
        </div>

        <!-- Bouton retour -->
        <button
          (click)="goBack()"
          class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Revenir à la page précédente
        </button>

        <!-- Footer -->
        <div class="mt-12 text-sm text-secondary-500">
          <p>Code d'erreur: 404 - Page non trouvée</p>
          <p class="mt-1">
            Besoin d'aide ?
            <a href="mailto:support@normx-ai.com" class="text-primary-600 hover:underline">
              Contactez-nous
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  authService = inject(AuthService);

  goBack(): void {
    window.history.back();
  }
}
