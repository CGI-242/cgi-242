import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <!-- Header -->
      <header class="py-4 px-6">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a routerLink="/" class="flex items-center">
            <img src="assets/images/logo-cgi242.png" alt="CGI 242" class="h-16 w-auto" />
          </a>
          <nav class="flex items-center gap-4">
            @if (authService.isAuthenticated()) {
              <a routerLink="/chat" class="btn-primary">Accéder au chat</a>
            } @else {
              <a routerLink="/auth/login" class="btn-outline">Connexion</a>
              <a routerLink="/auth/register" class="btn-primary">S'inscrire</a>
            }
          </nav>
        </div>
      </header>

      <!-- Hero -->
      <section class="py-20 px-6">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl font-bold text-secondary-900 mb-6">
            Votre Assistant IA pour le
            <span class="text-primary-600">Code Général des Impôts</span>
            du Congo
          </h1>
          <p class="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            Posez vos questions fiscales et obtenez des réponses précises,
            sourcées directement depuis le CGI 2025 du Congo-Brazzaville.
          </p>
          <div class="flex gap-4 justify-center">
            <a routerLink="/auth/register" class="btn-primary text-lg px-8 py-3">
              Commencer gratuitement
            </a>
            <a href="#features" class="btn-outline text-lg px-8 py-3">
              En savoir plus
            </a>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="py-20 px-6 bg-white">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-secondary-900 mb-12">
            Pourquoi CGI 242 ?
          </h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6">
              <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-2">Réponses instantanées</h3>
              <p class="text-secondary-600">
                Obtenez des réponses à vos questions fiscales en quelques secondes
              </p>
            </div>
            <div class="text-center p-6">
              <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-2">Sources vérifiables</h3>
              <p class="text-secondary-600">
                Chaque réponse cite les articles du CGI correspondants
              </p>
            </div>
            <div class="text-center p-6">
              <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-2">Travail en équipe</h3>
              <p class="text-secondary-600">
                Partagez vos recherches avec votre cabinet ou entreprise
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-20 px-6 bg-primary-600">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-white mb-4">
            Prêt à simplifier vos recherches fiscales ?
          </h2>
          <p class="text-primary-100 mb-8 text-lg">
            Rejoignez les professionnels qui font confiance à CGI 242
          </p>
          <a routerLink="/auth/register" class="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition">
            Créer un compte gratuit
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-12 px-6 bg-secondary-900">
        <div class="max-w-6xl mx-auto">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center">
              <img src="assets/images/logo-footer.png" alt="CGI 242" class="h-14 w-auto opacity-90" />
            </div>
            <nav class="flex items-center gap-6 text-sm">
              <a href="#features" class="text-secondary-400 hover:text-white transition">Fonctionnalites</a>
              <a routerLink="/auth/login" class="text-secondary-400 hover:text-white transition">Connexion</a>
              <a routerLink="/auth/register" class="text-secondary-400 hover:text-white transition">Inscription</a>
            </nav>
            <p class="text-secondary-500 text-sm">
              &copy; 2026 CGI 242. Tous droits reserves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class LandingComponent {
  authService = inject(AuthService);
}
