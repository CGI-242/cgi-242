import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cgi242-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Header -->
    <header class="bg-white border-b border-secondary-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <img src="assets/images/logo_cgi_transp_sm.webp" alt="CGI 242" class="h-36 w-auto" loading="eager" fetchpriority="high" />
          </div>

          <!-- Navigation Desktop -->
          <nav class="hidden md:flex items-center space-x-8">
            <a href="#fonctionnalites" class="text-secondary-600 hover:text-primary-600 transition-colors">Fonctionnalités</a>
            <a href="#tarifs" class="text-secondary-600 hover:text-primary-600 transition-colors">Tarifs</a>
            <a href="#contact" class="text-secondary-600 hover:text-primary-600 transition-colors">Contact</a>
          </nav>

          <!-- CTA Desktop -->
          <div class="hidden md:flex items-center space-x-4">
            <a routerLink="/auth/login" class="text-secondary-600 hover:text-primary-600 transition-colors">
              Connexion
            </a>
            <a routerLink="/auth/register" class="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Essai gratuit
            </a>
          </div>

          <!-- Menu Hamburger Mobile -->
          <button
            (click)="toggleMobileMenu()"
            class="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
            aria-label="Menu">
            @if (!mobileMenuOpen()) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            }
            @if (mobileMenuOpen()) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            }
          </button>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden border-t border-secondary-200 py-4 space-y-3">
          <a href="#fonctionnalites" (click)="closeMobileMenu()" class="block px-3 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg">Fonctionnalités</a>
          <a href="#tarifs" (click)="closeMobileMenu()" class="block px-3 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg">Tarifs</a>
          <a href="#contact" (click)="closeMobileMenu()" class="block px-3 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg">Contact</a>
          <hr class="border-secondary-200">
          <a routerLink="/auth/login" (click)="closeMobileMenu()" class="block px-3 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg">Connexion</a>
          <a routerLink="/auth/register" (click)="closeMobileMenu()" class="block px-3 py-2 bg-primary-600 text-white text-center rounded-lg font-semibold">Essai gratuit</a>
          </div>
        }
      </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-12 md:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div class="text-center md:text-left">
            <h1 class="text-3xl md:text-5xl font-heading font-bold mb-4 md:mb-6">
              Votre assistant fiscal IA pour le Congo-Brazzaville
            </h1>
            <p class="text-lg md:text-xl text-white/80 mb-6 md:mb-8">
              Accédez instantanément au Code Général des Impôts 2025.
              Recherche intelligente, simulateurs fiscaux et réponses précises.
            </p>

            <!-- Badges Mobile -->
            <div class="flex flex-wrap justify-center md:hidden gap-2 mb-6">
              <span class="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                2000+ articles
              </span>
              <span class="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                IA instantanée
              </span>
              <span class="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                Simulateurs
              </span>
              <span class="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                CGI 2025
              </span>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
              <a routerLink="/auth/register" class="bg-white text-primary-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-gray-100 transition-all text-center">
                Commencer gratuitement
              </a>
              <a routerLink="/auth/login" class="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-white hover:text-primary-600 transition-all text-center">
                Se connecter
              </a>
            </div>
          </div>

          <!-- Desktop Features Card -->
          <div class="hidden md:block">
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <span class="text-lg">2000+ articles du CGI</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <span class="text-lg">Recherche IA instantanée</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span class="text-lg">Simulateurs fiscaux</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <span class="text-lg">Mis à jour 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Fonctionnalités -->
    <section id="fonctionnalites" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4">
            Tout le CGI à portée de main
          </h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            Une plateforme complète pour maîtriser la fiscalité congolaise
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Recherche sémantique -->
          <div class="bg-secondary-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-secondary-900 mb-3">Recherche sémantique</h3>
            <p class="text-secondary-600">
              Trouvez instantanément les articles pertinents grâce à notre moteur de recherche intelligent.
            </p>
          </div>

          <!-- Chat IA -->
          <div class="bg-secondary-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-secondary-900 mb-3">Chat IA Fiscal</h3>
            <p class="text-secondary-600">
              Posez vos questions en langage naturel et obtenez des réponses précises avec références aux articles.
            </p>
            <span class="inline-block mt-3 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">PRO & EXPERT</span>
          </div>

          <!-- Navigateur CGI -->
          <div class="bg-secondary-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-secondary-900 mb-3">Navigateur CGI</h3>
            <p class="text-secondary-600">
              Parcourez l'intégralité du Code Général des Impôts 2025 avec une navigation intuitive par tomes et chapitres.
            </p>
          </div>

          <!-- Simulateurs -->
          <div class="bg-secondary-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-secondary-900 mb-3">Simulateurs d'impôts</h3>
            <p class="text-secondary-600">
              IS, IRPP, ITS, TVA, Patente, Taxe foncière, Droits d'enregistrement. Résultats instantanés avec détail des calculs.
            </p>
          </div>

          <!-- Calendrier fiscal -->
          <div class="bg-secondary-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-secondary-900 mb-3">Calendrier fiscal</h3>
            <p class="text-secondary-600">
              Toutes les échéances légales avec rappels automatiques 7j et 3j avant. Export iCal et Google Calendar.
            </p>
          </div>

          <!-- Veille fiscale -->
          <div class="bg-secondary-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-secondary-900 mb-3">Veille fiscale</h3>
            <p class="text-secondary-600">
              Alertes sur les nouvelles lois, circulaires DGID et notes de service. Newsletter mensuelle incluse.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tarifs -->
    <section id="tarifs" class="py-20 bg-secondary-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4">
            Tarifs simples et transparents
          </h2>
          <p class="text-lg text-secondary-600">
            Abonnement annuel - Sans engagement - TVA 18% incluse
          </p>
        </div>

        <!-- Offre de lancement -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-4 mb-10 max-w-2xl mx-auto text-center">
          <p class="font-semibold">Offre de lancement - Jusqu'au 31 mars 2026</p>
          <p class="text-sm opacity-90">Jusqu'a -20% sur tous les abonnements !</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <!-- BASIC -->
          <div class="bg-white rounded-2xl p-8 border border-secondary-200">
            <div class="inline-block bg-secondary-100 text-secondary-600 text-sm px-3 py-1 rounded-full mb-4">📚 BASIC</div>
            <h3 class="text-xl font-bold text-secondary-900 mb-2">Le prix du CGI papier</h3>
            <div class="mb-4">
              <div class="flex items-baseline gap-2">
                <span class="text-lg text-secondary-400 line-through">50 000</span>
                <span class="text-3xl font-bold text-secondary-900">40 000 XAF</span>
                <span class="text-lg font-normal text-secondary-500">/an</span>
              </div>
              <div class="text-sm text-green-600 font-medium">Offre lancement -10 000 XAF</div>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-2 text-secondary-600">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Recherche CGI illimitee
              </li>
              <li class="flex items-center gap-2 text-secondary-600">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Tous les simulateurs fiscaux
              </li>
              <li class="flex items-center gap-2 text-secondary-600">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Calendrier fiscal + alertes
              </li>
              <li class="flex items-center gap-2 text-secondary-600">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                5 exports PDF/mois
              </li>
              <li class="flex items-center gap-2 text-secondary-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Assistant IA non inclus
              </li>
            </ul>
            <p class="text-xs text-secondary-500 mb-4 text-center">Ideal : Particuliers, etudiants, auto-entrepreneurs</p>
            <a routerLink="/auth/register" class="block w-full py-3 px-4 text-center border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Commencer
            </a>
          </div>

          <!-- PRO -->
          <div class="bg-primary-600 rounded-2xl p-8 text-white transform scale-105 shadow-xl">
            <div class="inline-block bg-white/20 text-sm px-3 py-1 rounded-full mb-4">🤖 PRO - Populaire</div>
            <h3 class="text-xl font-bold mb-2">L'IA a votre service</h3>
            <div class="mb-4">
              <div class="flex items-baseline gap-2">
                <span class="text-lg opacity-60 line-through">75 000</span>
                <span class="text-3xl font-bold">60 000 XAF</span>
                <span class="text-lg font-normal opacity-80">/an</span>
              </div>
              <div class="text-sm text-green-300 font-medium">Offre lancement -15 000 XAF</div>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Tout BASIC inclus
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <strong>50 questions IA/mois</strong>
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                20 exports PDF/mois
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Veille fiscale
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Support email 48h
              </li>
            </ul>
            <p class="text-xs opacity-80 mb-4 text-center">Ideal : Comptables, PME, consultants</p>
            <a routerLink="/auth/register" class="block w-full py-3 px-4 text-center bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Essayer gratuitement
            </a>
          </div>

          <!-- EXPERT -->
          <div class="bg-white rounded-2xl p-8 border-2 border-primary-200">
            <div class="inline-block bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full mb-4">🏆 EXPERT</div>
            <h3 class="text-xl font-bold text-secondary-900 mb-2">Pour les exigeants</h3>
            <div class="mb-4">
              <div class="flex items-baseline gap-2">
                <span class="text-lg text-secondary-400 line-through">100 000</span>
                <span class="text-3xl font-bold text-secondary-900">80 000 XAF</span>
                <span class="text-lg font-normal text-secondary-500">/an</span>
              </div>
              <div class="text-sm text-green-600 font-medium">Offre lancement -20 000 XAF</div>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-2 text-secondary-600">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Tout PRO inclus
              </li>
              <li class="flex items-center gap-2 text-secondary-600">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <strong>100 questions IA/mois</strong>
              </li>
              <li class="flex items-center gap-2 text-secondary-600">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Exports PDF illimites
              </li>
              <li class="flex items-center gap-2 text-secondary-600">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <strong>3 utilisateurs inclus</strong>
              </li>
              <li class="flex items-center gap-2 text-secondary-600">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Support prioritaire 24h
              </li>
            </ul>
            <p class="text-xs text-secondary-500 mb-4 text-center">Ideal : Cabinets, directions financieres</p>
            <a routerLink="/auth/register" class="block w-full py-3 px-4 text-center bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Souscrire
            </a>
          </div>
        </div>

        <!-- Comparaison CGI papier -->
        <div class="mt-16 bg-white rounded-2xl p-8 max-w-3xl mx-auto border border-secondary-200">
          <h3 class="text-xl font-bold text-secondary-900 mb-6 text-center">Meme prix qu'un CGI papier, 10x plus de valeur</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="text-center p-4 bg-secondary-50 rounded-xl">
              <p class="text-secondary-500 mb-2">CGI Papier</p>
              <p class="text-2xl font-bold text-secondary-900">50 000 FCFA</p>
              <ul class="text-sm text-secondary-500 mt-3 space-y-1">
                <li>Recherche manuelle</li>
                <li>Racheter chaque annee</li>
                <li>Calculs a la main</li>
              </ul>
            </div>
            <div class="text-center p-4 bg-primary-50 rounded-xl border-2 border-primary-200">
              <p class="text-primary-600 mb-2 font-medium">CGI 242 BASIC</p>
              <p class="text-2xl font-bold text-primary-700">40 000 FCFA</p>
              <ul class="text-sm text-primary-600 mt-3 space-y-1">
                <li>Recherche IA + mots-cles</li>
                <li>Mises a jour automatiques</li>
                <li>Simulateurs integres</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Packs IA -->
        <div class="mt-12 text-center">
          <p class="text-secondary-600 mb-2">
            <strong>Besoin de plus de questions IA ?</strong>
          </p>
          <p class="text-secondary-500 text-sm">
            Packs recharges : 20 questions (5 000 FCFA) | 50 questions (10 000 FCFA) | 100 questions (18 000 FCFA) | 200 questions (30 000 FCFA)
          </p>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="py-20 bg-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-6">
          Une question ?
        </h2>
        <p class="text-lg text-secondary-600 mb-8">
          Notre équipe est à votre disposition pour répondre à vos questions.
        </p>
        <a href="mailto:contact@normx-ai.com" class="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          contact&#64;normx-ai.com
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-secondary-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-12 mb-12">
          <!-- Logo & Description -->
          <div class="md:col-span-2">
            <img src="assets/images/logo_cgi_transp_sm.webp" alt="CGI 242" class="h-48 mb-4" />
            <p class="text-secondary-400 mb-4 max-w-md">
              Assistant fiscal intelligent pour le Code Général des Impôts du Congo-Brazzaville.
              Recherche sémantique, simulateurs et IA au service des professionnels.
            </p>
            <p class="text-secondary-500 text-sm">
              Un produit <a href="https://normx-ai.com" class="text-primary-400 hover:underline">NORMX AI</a>
            </p>
          </div>

          <!-- Liens rapides -->
          <div>
            <h4 class="font-semibold text-lg mb-4">Liens rapides</h4>
            <ul class="space-y-2 text-secondary-400">
              <li><a href="#fonctionnalites" class="hover:text-white transition-colors">Fonctionnalités</a></li>
              <li><a href="#tarifs" class="hover:text-white transition-colors">Tarifs</a></li>
              <li><a routerLink="/auth/login" class="hover:text-white transition-colors">Connexion</a></li>
              <li><a routerLink="/auth/register" class="hover:text-white transition-colors">Inscription</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="font-semibold text-lg mb-4">Contact</h4>
            <ul class="space-y-3 text-secondary-400">
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <a href="mailto:contact@normx-ai.com" class="hover:text-white transition-colors">contact&#64;normx-ai.com</a>
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
                <a href="https://normx-ai.com" target="_blank" class="hover:text-white transition-colors">www.normx-ai.com</a>
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>Brazzaville, Congo</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Séparateur -->
        <div class="border-t border-secondary-700 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-secondary-500 text-sm">
              © {{ currentYear }} CGI 242 by NORMX AI - Tous droits réservés
            </p>
            <div class="flex gap-6 text-secondary-400 text-sm">
              <a href="#" class="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" class="hover:text-white transition-colors">CGU</a>
              <a href="#" class="hover:text-white transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class Cgi242LandingComponent {
  currentYear = new Date().getFullYear();
  mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
