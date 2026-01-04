import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { InfoWidgetComponent } from '@shared/components/info-widget/info-widget.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, InfoWidgetComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <!-- Header (fixed) -->
      <header class="fixed top-0 left-0 right-0 z-50 py-3 px-6 bg-white/80 backdrop-blur-md border-b border-secondary-100">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a routerLink="/" class="flex items-center">
            <img src="assets/images/logo-app-cgi.png" alt="CGI 242" class="h-12 w-auto" />
          </a>
          <!-- Navigation principale -->
          <nav class="hidden md:flex items-center gap-8">
            <a href="#produits" class="text-secondary-600 hover:text-primary-600 font-medium transition">Produits</a>
            <a href="#tarifs" class="text-secondary-600 hover:text-primary-600 font-medium transition">Tarifs</a>
            <a href="#about" class="text-secondary-600 hover:text-primary-600 font-medium transition">À propos</a>
            <a href="#contact" class="text-secondary-600 hover:text-primary-600 font-medium transition">Contact</a>
          </nav>
          <!-- Boutons auth -->
          <nav class="flex items-center gap-3">
            @if (authService.isAuthenticated()) {
              <a routerLink="/dashboard" class="btn-primary text-sm px-4 py-2">Accéder à l'application</a>
            } @else {
              <a routerLink="/auth/login" class="text-secondary-600 hover:text-primary-600 font-medium text-sm">Connexion</a>
              <a routerLink="/auth/register" class="btn-primary text-sm px-4 py-2">S'inscrire</a>
            }
          </nav>
        </div>
      </header>

      <!-- Hero (with top padding for fixed header) -->
      <section class="pt-36 pb-20 px-6">
        <div class="max-w-7xl mx-auto grid lg:grid-cols-5 gap-8 items-center">
          <!-- Text content -->
          <div class="lg:col-span-2 text-center lg:text-left">
            <h1 class="text-3xl lg:text-4xl font-bold text-secondary-900 mb-5">
              Votre Assistant IA pour le
              <span class="text-primary-600">Code Général des Impôts</span>
              du Congo
            </h1>
            <p class="text-base lg:text-lg text-secondary-600 mb-6">
              Posez vos questions fiscales et obtenez des réponses précises,
              sourcées directement depuis le CGI 2026 du Congo-Brazzaville.
            </p>
            <div class="flex gap-3 justify-center lg:justify-start flex-wrap">
              <a routerLink="/auth/register" class="btn-primary px-6 py-2.5">
                Commencer gratuitement
              </a>
              <a href="#features" class="btn-outline px-6 py-2.5">
                En savoir plus
              </a>
            </div>
          </div>
          <!-- Hero Image -->
          <div class="lg:col-span-3 hidden lg:block">
            <div class="relative">
              <div class="absolute inset-0 bg-primary-200 rounded-3xl transform rotate-2 scale-[1.02] opacity-40"></div>
              <img
                src="assets/images/dashboard-cgi.png"
                alt="Dashboard CGI 242"
                class="relative rounded-2xl shadow-2xl border border-secondary-200 w-full max-w-none"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Produits -->
      <section id="produits" class="py-20 px-6 bg-white">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-secondary-900 mb-4">
            Nos Produits
          </h2>
          <p class="text-center text-secondary-600 mb-12 max-w-2xl mx-auto">
            Des outils puissants pour simplifier votre travail fiscal au quotidien
          </p>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6 bg-secondary-50 rounded-2xl">
              <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-2">Assistant IA CGI</h3>
              <p class="text-secondary-600">
                Posez vos questions fiscales et obtenez des réponses précises avec les articles du CGI correspondants
              </p>
            </div>
            <div class="text-center p-6 bg-secondary-50 rounded-2xl">
              <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-2">Simulateurs fiscaux</h3>
              <p class="text-secondary-600">
                Calculez IRPP, ITS, IS, Patente et autres impôts selon le CGI 2026
              </p>
            </div>
            <div class="text-center p-6 bg-secondary-50 rounded-2xl">
              <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-2">Livre CGI intégral</h3>
              <p class="text-secondary-600">
                Consultez le Code Général des Impôts 2025 et 2026 directement dans l'application
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Tarifs -->
      <section id="tarifs" class="py-20 px-6 bg-secondary-50">
        <div class="max-w-5xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-secondary-900 mb-4">
            Tarifs simples et transparents
          </h2>
          <p class="text-center text-secondary-600 mb-12">
            Choisissez le plan adapté à vos besoins
          </p>
          <div class="grid md:grid-cols-3 gap-8">
            <!-- Gratuit -->
            <div class="bg-white rounded-2xl p-8 border border-secondary-200">
              <h3 class="text-lg font-semibold text-secondary-900 mb-2">Gratuit</h3>
              <div class="mb-6">
                <span class="text-4xl font-bold text-secondary-900">0</span>
                <span class="text-secondary-600"> FCFA/mois</span>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-secondary-600">
                  <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  10 questions/mois
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Simulateurs de base
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Accès CGI 2026
                </li>
              </ul>
              <a routerLink="/auth/register" class="block text-center btn-outline w-full">
                Commencer
              </a>
            </div>
            <!-- Pro -->
            <div class="bg-primary-600 rounded-2xl p-8 text-white relative">
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full">
                Populaire
              </div>
              <h3 class="text-lg font-semibold mb-2">Professionnel</h3>
              <div class="mb-6">
                <span class="text-4xl font-bold">15 000</span>
                <span class="text-primary-200"> FCFA/mois</span>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-primary-200 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Questions illimitées
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-primary-200 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Tous les simulateurs
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-primary-200 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Historique complet
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-primary-200 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Support prioritaire
                </li>
              </ul>
              <a routerLink="/auth/register" class="block text-center bg-white text-primary-600 font-semibold py-2.5 rounded-lg hover:bg-primary-50 transition w-full">
                Essai gratuit 14 jours
              </a>
            </div>
            <!-- Entreprise -->
            <div class="bg-white rounded-2xl p-8 border border-secondary-200">
              <h3 class="text-lg font-semibold text-secondary-900 mb-2">Entreprise</h3>
              <div class="mb-6">
                <span class="text-4xl font-bold text-secondary-900">Sur devis</span>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-secondary-600">
                  <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Multi-utilisateurs
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Espace organisation
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Formation incluse
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Support dédié
                </li>
              </ul>
              <a href="#contact" class="block text-center btn-outline w-full">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- À propos -->
      <section id="about" class="py-20 px-6 bg-white">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-secondary-900 mb-12">
            À propos de CGI 242
          </h2>
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-4">Notre mission</h3>
              <p class="text-secondary-600 mb-6">
                CGI 242 est né de la volonté de rendre le Code Général des Impôts du Congo accessible et compréhensible pour tous les professionnels de la fiscalité.
              </p>
              <p class="text-secondary-600 mb-6">
                Grâce à l'intelligence artificielle, nous transformons des textes juridiques complexes en réponses claires et sourcées, permettant aux fiscalistes, comptables et juristes de gagner un temps précieux.
              </p>
              <div class="flex gap-8">
                <div>
                  <div class="text-3xl font-bold text-primary-600">500+</div>
                  <div class="text-sm text-secondary-600">Articles indexés</div>
                </div>
                <div>
                  <div class="text-3xl font-bold text-primary-600">100%</div>
                  <div class="text-sm text-secondary-600">CGI 2026</div>
                </div>
              </div>
            </div>
            <div class="bg-secondary-50 rounded-2xl p-8">
              <h4 class="font-semibold text-secondary-900 mb-4">Pourquoi nous choisir ?</h4>
              <ul class="space-y-4">
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-primary-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span class="text-secondary-600">Réponses instantanées à vos questions fiscales</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-primary-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-secondary-600">Sources vérifiables avec articles du CGI</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-primary-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <span class="text-secondary-600">Données sécurisées et confidentielles</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section id="contact" class="py-20 px-6 bg-secondary-50">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-secondary-900 mb-4">
            Contactez-nous
          </h2>
          <p class="text-center text-secondary-600 mb-12">
            Une question ? Notre équipe est là pour vous aider
          </p>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-secondary-900 mb-2">Email</h3>
              <a href="mailto:contact@cgi-242.com" class="text-primary-600 hover:underline">contact&#64;cgi-242.com</a>
            </div>
            <div class="text-center">
              <div class="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-secondary-900 mb-2">Téléphone</h3>
              <a href="tel:+24206XXXXXXX" class="text-primary-600 hover:underline">+242 06 XX XX XXX</a>
            </div>
            <div class="text-center">
              <div class="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-secondary-900 mb-2">Adresse</h3>
              <p class="text-secondary-600">Brazzaville, Congo</p>
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
          <div class="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="assets/images/logo-app-cgi.png" alt="CGI 242" class="h-12 w-auto opacity-90 mb-4" />
              <p class="text-secondary-400 text-sm">
                Votre assistant IA pour le Code Général des Impôts du Congo
              </p>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-4">Navigation</h4>
              <ul class="space-y-2 text-sm">
                <li><a href="#produits" class="text-secondary-400 hover:text-white transition">Produits</a></li>
                <li><a href="#tarifs" class="text-secondary-400 hover:text-white transition">Tarifs</a></li>
                <li><a href="#about" class="text-secondary-400 hover:text-white transition">À propos</a></li>
                <li><a href="#contact" class="text-secondary-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-4">Produits</h4>
              <ul class="space-y-2 text-sm">
                <li><span class="text-secondary-400">Assistant IA CGI</span></li>
                <li><span class="text-secondary-400">Simulateurs fiscaux</span></li>
                <li><span class="text-secondary-400">Livre CGI</span></li>
              </ul>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-4">Compte</h4>
              <ul class="space-y-2 text-sm">
                <li><a routerLink="/auth/login" class="text-secondary-400 hover:text-white transition">Connexion</a></li>
                <li><a routerLink="/auth/register" class="text-secondary-400 hover:text-white transition">Inscription</a></li>
              </ul>
            </div>
          </div>
          <div class="border-t border-secondary-800 pt-8 text-center">
            <p class="text-secondary-500 text-sm">
              &copy; 2026 CGI 242. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      <!-- Info Widget (FAQ) -->
      <app-info-widget />
    </div>
  `,
})
export class LandingComponent {
  authService = inject(AuthService);
}
