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
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-white">
      <!-- Header (fixed) -->
      <header class="fixed top-0 left-0 right-0 z-50 py-2 px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-secondary-100">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-1">
            <img src="assets/images/logo242.png" alt="CGI 242" class="h-10 sm:h-14 w-auto" />
            <span class="text-[10px] text-secondary-400 font-medium hidden sm:inline">By NORMX AI</span>
          </a>
          <!-- Navigation principale -->
          <nav class="hidden md:flex items-center gap-8">
            <a href="#produits" class="text-secondary-600 hover:text-primary-600 font-medium transition">Produits</a>
            <a href="#tarifs" class="text-secondary-600 hover:text-primary-600 font-medium transition">Tarifs</a>
            <a href="#about" class="text-secondary-600 hover:text-primary-600 font-medium transition">À propos</a>
            <a href="#contact" class="text-secondary-600 hover:text-primary-600 font-medium transition">Contact</a>
          </nav>
          <!-- Boutons auth -->
          <nav class="flex items-center gap-2 sm:gap-3">
            @if (authService.isAuthenticated()) {
              <!-- Mobile: icon -->
              <a routerLink="/dashboard" class="sm:hidden p-2 bg-primary-600 text-white rounded-lg" title="Dashboard">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </a>
              <!-- Desktop: text -->
              <a routerLink="/dashboard" class="hidden sm:inline-block btn-primary text-sm px-4 py-2">Accéder à l'application</a>
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
              <a routerLink="/auth/login" class="hidden sm:inline-block text-secondary-600 hover:text-primary-600 font-medium text-sm">Connexion</a>
              <a routerLink="/auth/register" class="hidden sm:inline-block btn-primary text-sm px-4 py-2">S'inscrire</a>
            }
          </nav>
        </div>
      </header>

      <!-- Hero (with top padding for fixed header) -->
      <section class="pt-32 pb-16 px-6 overflow-hidden">
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left: Text content -->
          <div class="text-center lg:text-left animate-fade-in-up">
            <h1 class="text-3xl lg:text-4xl xl:text-5xl font-bold text-secondary-900 mb-5 leading-tight">
              Votre Assistant IA pour le
              <span class="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Code General des Impots</span>
              du Congo
            </h1>
            <p class="text-base lg:text-lg text-secondary-600 mb-6 max-w-lg">
              Posez vos questions fiscales et obtenez des reponses precises,
              sourcees directement depuis le CGI 2026 du Congo-Brazzaville.
            </p>

            <!-- Buttons -->
            <div class="flex gap-3 justify-center lg:justify-start flex-wrap mb-6">
              <a routerLink="/auth/register" class="btn-primary px-6 py-3 text-base hover:scale-105 transition-transform duration-300">
                Commencer gratuitement
              </a>
              <a href="#produits" class="btn-outline px-6 py-3 text-base hover:scale-105 transition-transform duration-300">
                En savoir plus
              </a>
            </div>

            <!-- Trust line -->
            <p class="text-sm text-secondary-500 mb-5 flex items-center justify-center lg:justify-start gap-2 flex-wrap">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                Sources officielles
              </span>
              <span class="text-secondary-300">•</span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                Articles cites
              </span>
              <span class="text-secondary-300">•</span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                Reponses tracables
              </span>
            </p>

            <!-- Mini badges -->
            <div class="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
              <span class="bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">CGI 2026</span>
              <span class="bg-accent-100 text-accent-700 text-xs font-medium px-3 py-1.5 rounded-full">Citations d'articles</span>
              <span class="bg-secondary-100 text-secondary-700 text-xs font-medium px-3 py-1.5 rounded-full">Mode Cabinet / Entreprise</span>
            </div>

            <!-- Used by -->
            <div class="pt-4 border-t border-secondary-200">
              <p class="text-xs text-secondary-400 mb-3 uppercase tracking-wide">Bientot utilise par</p>
              <div class="flex items-center gap-4 justify-center lg:justify-start opacity-50">
                <span class="text-secondary-400 text-sm font-medium">Cabinets comptables</span>
                <span class="text-secondary-300">•</span>
                <span class="text-secondary-400 text-sm font-medium">Entreprises</span>
                <span class="text-secondary-300">•</span>
                <span class="text-secondary-400 text-sm font-medium">Fiscalistes</span>
              </div>
            </div>
          </div>

          <!-- Right: Visual -->
          <div class="hidden lg:block animate-slide-in-right">
            <div class="relative">
              <!-- Glow effect -->
              <div class="absolute -inset-4 bg-gradient-to-r from-primary-400 to-accent-400 rounded-3xl blur-2xl opacity-20 animate-pulse-slow"></div>

              <!-- Main mockup -->
              <div class="relative">
                <img
                  src="assets/images/dashboard-cgi.png"
                  alt="Dashboard CGI 242"
                  class="relative rounded-2xl shadow-2xl border border-secondary-200 w-full"
                />

                <!-- Floating card 1: Article -->
                <div class="absolute -left-8 top-1/4 bg-white rounded-xl shadow-lg p-3 border border-secondary-100 animate-float">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-secondary-900">Article 111</p>
                      <p class="text-xs text-secondary-500">IRF — Impot sur le revenu</p>
                    </div>
                  </div>
                </div>

                <!-- Floating card 2: Response time -->
                <div class="absolute -right-6 top-1/3 bg-white rounded-xl shadow-lg p-3 border border-secondary-100 animate-float" style="animation-delay: 0.5s">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-secondary-900">Reponse en 12s</p>
                      <p class="text-xs text-secondary-500">Rapide et precis</p>
                    </div>
                  </div>
                </div>

                <!-- Floating card 3: History -->
                <div class="absolute -left-4 bottom-1/4 bg-white rounded-xl shadow-lg p-3 border border-secondary-100 animate-float" style="animation-delay: 1s">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-secondary-900">Historique</p>
                      <p class="text-xs text-secondary-500">Toutes vos questions</p>
                    </div>
                  </div>
                </div>
              </div>
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
            <div class="text-center p-6 bg-secondary-50 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
              <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-2">Assistant IA CGI</h3>
              <p class="text-secondary-600">
                Posez vos questions fiscales et obtenez des reponses precises avec les articles du CGI correspondants
              </p>
            </div>
            <div class="text-center p-6 bg-secondary-50 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
              <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-2">Simulateurs fiscaux</h3>
              <p class="text-secondary-600">
                Calculez IRPP, ITS, IS, Patente et autres impots selon le CGI 2026
              </p>
            </div>
            <div class="text-center p-6 bg-secondary-50 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
              <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-2">Livre CGI integral</h3>
              <p class="text-secondary-600">
                Consultez le Code General des Impots 2025 et 2026 directement dans l'application
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Tarifs -->
      <section id="tarifs" class="py-20 px-6 bg-gradient-to-br from-accent-50 via-accent-100 to-primary-50">
        <div class="max-w-5xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-secondary-900 mb-4">
            Tarifs simples et transparents
          </h2>
          <p class="text-center text-secondary-600 mb-12">
            Choisissez le plan adapté à vos besoins
          </p>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Gratuit -->
            <div class="bg-white rounded-2xl p-6 border border-secondary-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 opacity-0 animate-fade-in-up-delay-1">
              <h3 class="text-lg font-semibold text-secondary-900 mb-2">Gratuit</h3>
              <div class="mb-4">
                <span class="text-3xl font-bold text-secondary-900">0</span>
                <span class="text-secondary-600"> FCFA</span>
              </div>
              <p class="text-sm text-secondary-500 mb-4">3 questions/jour - 1 utilisateur</p>
              <ul class="space-y-2 mb-6 text-sm">
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  FAQ uniquement
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Pas de simulateurs
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Pas de CGI 2026
                </li>
              </ul>
              <a routerLink="/auth/register" class="block text-center btn-outline w-full text-sm py-2">
                Commencer
              </a>
            </div>
            <!-- Basic -->
            <div class="bg-white rounded-2xl p-6 border border-secondary-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 opacity-0 animate-fade-in-up-delay-2">
              <h3 class="text-lg font-semibold text-secondary-900 mb-2">Basic</h3>
              <div class="mb-4">
                <span class="text-3xl font-bold text-secondary-900">50 000</span>
                <span class="text-secondary-600"> FCFA/an</span>
              </div>
              <p class="text-sm text-secondary-500 mb-4">10 questions/jour - 1 utilisateur</p>
              <ul class="space-y-2 mb-6 text-sm">
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  8 simulateurs fiscaux
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Acces CGI 2026
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Historique 30 jours
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Support email
                </li>
              </ul>
              <a routerLink="/auth/register" class="block text-center btn-outline w-full text-sm py-2">
                Choisir Basic
              </a>
            </div>
            <!-- Pro (Recommande) -->
            <div class="bg-primary-600 rounded-2xl p-6 text-white relative hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 opacity-0 animate-fade-in-up-delay-3">
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full animate-bounce-slow">
                Recommande
              </div>
              <h3 class="text-lg font-semibold mb-2">Pro</h3>
              <div class="mb-4">
                <span class="text-3xl font-bold">225 000</span>
                <span class="text-primary-200"> FCFA/an</span>
              </div>
              <p class="text-sm text-primary-200 mb-4">50 questions/jour - 5 utilisateurs</p>
              <ul class="space-y-2 mb-6 text-sm">
                <li class="flex items-center">
                  <svg class="w-4 h-4 text-primary-200 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  8 simulateurs fiscaux
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 text-primary-200 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Acces CGI 2026
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 text-primary-200 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Historique 1 an
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 text-primary-200 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Support email 48h
                </li>
              </ul>
              <a routerLink="/auth/register" class="block text-center bg-white text-primary-600 font-semibold py-2 rounded-lg hover:bg-primary-50 transition w-full text-sm">
                Essai gratuit 14 jours
              </a>
            </div>
            <!-- Sur devis -->
            <div class="bg-white rounded-2xl p-6 border border-secondary-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 opacity-0 animate-fade-in-up-delay-4">
              <h3 class="text-lg font-semibold text-secondary-900 mb-2">Sur devis</h3>
              <div class="mb-4">
                <span class="text-2xl font-bold text-secondary-900">Sur devis</span>
              </div>
              <p class="text-sm text-secondary-500 mb-4">100 questions/jour - 10+ utilisateurs</p>
              <ul class="space-y-2 mb-6 text-sm">
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  8 simulateurs fiscaux
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Acces CGI 2026
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Historique 2 ans
                </li>
                <li class="flex items-center text-secondary-600">
                  <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Support telephone
                </li>
              </ul>
              <a href="mailto:contact@cgi242.com?subject=Demande%20de%20devis%20CGI%20242" class="block text-center btn-outline w-full text-sm py-2">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- À propos -->
      <section id="about" class="py-20 px-6 bg-white">
        <div class="max-w-5xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-secondary-900 mb-12">
            À propos de CGI 242
          </h2>

          <!-- La Créatrice -->
          <div class="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 mb-12">
            <div class="flex flex-col md:flex-row items-center gap-8">
              <img
                src="assets/images/christelle-mabika.jpg"
                alt="Christelle MABIKA"
                class="w-32 h-32 rounded-full object-cover flex-shrink-0 border-4 border-white shadow-lg"
              />
              <div class="text-center md:text-left">
                <h3 class="text-2xl font-bold text-secondary-900 mb-1">Christelle MABIKA</h3>
                <p class="text-primary-700 font-semibold mb-3">Fondatrice de NORMX AI</p>
                <p class="text-secondary-600 italic mb-4">
                  "Rendre la fiscalite africaine accessible grace a l'intelligence artificielle"
                </p>
                <div class="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span class="bg-white px-3 py-1 rounded-full text-xs text-secondary-600">Master Finance</span>
                  <span class="bg-white px-3 py-1 rounded-full text-xs text-secondary-600">DSCG</span>
                  <span class="bg-white px-3 py-1 rounded-full text-xs text-secondary-600">Expert-Comptable Stagiaire</span>
                  <span class="bg-white px-3 py-1 rounded-full text-xs text-secondary-600">Ingenieure IA</span>
                </div>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-12 items-start">
            <!-- Mission -->
            <div>
              <h3 class="text-xl font-semibold text-secondary-900 mb-4">Notre mission</h3>
              <p class="text-secondary-600 mb-6">
                CGI 242 est ne de la volonte de rendre le Code General des Impots du Congo accessible et comprehensible pour tous les professionnels de la fiscalite.
              </p>
              <p class="text-secondary-600 mb-6">
                Grace a l'intelligence artificielle, nous transformons des textes juridiques complexes en reponses claires et sourcees, permettant aux fiscalistes, comptables et juristes de gagner un temps precieux.
              </p>
              <div class="flex gap-8">
                <div>
                  <div class="text-3xl font-bold text-primary-600">500+</div>
                  <div class="text-sm text-secondary-600">Articles indexes</div>
                </div>
                <div>
                  <div class="text-3xl font-bold text-primary-600">100%</div>
                  <div class="text-sm text-secondary-600">CGI 2026</div>
                </div>
              </div>
            </div>

            <!-- Pourquoi choisir -->
            <div class="bg-secondary-50 rounded-2xl p-8">
              <h4 class="font-semibold text-secondary-900 mb-4">Pourquoi nous choisir ?</h4>
              <ul class="space-y-4">
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-primary-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span class="text-secondary-600">Reponses instantanees a vos questions fiscales</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-primary-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-secondary-600">Sources verifiables avec articles du CGI</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-primary-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <span class="text-secondary-600">Donnees securisees et confidentielles</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-primary-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
                  </svg>
                  <span class="text-secondary-600">Concu pour l'Afrique, par une Africaine</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- NORMX AI -->
          <div class="mt-12 text-center">
            <p class="text-secondary-500 text-sm">
              <strong class="text-secondary-700">NORMX AI</strong> — Startup specialisee dans le developpement d'assistants intelligents pour la conformite reglementaire en Afrique.
            </p>
          </div>
        </div>
      </section>

      <!-- Produits NORMX AI -->
      <section class="py-20 px-6 bg-gradient-to-br from-primary-50 via-primary-100 to-accent-50">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-secondary-900 mb-4">
            Ecosysteme <span class="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">NORMX AI</span>
          </h2>
          <p class="text-center text-secondary-600 mb-12 max-w-2xl mx-auto">
            Des solutions intelligentes pour la conformite reglementaire en Afrique
          </p>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- CGI 242 -->
            <div class="bg-white rounded-2xl p-6 border-2 border-primary-500 hover:shadow-xl transition-all duration-300 relative">
              <span class="absolute -top-3 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full">En production</span>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-2xl">🇨🇬</span>
                <h3 class="text-lg font-bold text-secondary-900">CGI 242</h3>
              </div>
              <p class="text-sm text-secondary-600 mb-3">Assistant fiscal intelligent — Congo-Brazzaville</p>
              <p class="text-xs text-secondary-500">Recherche vocale, simulateurs fiscaux, CGI 2026</p>
            </div>
            <!-- OHADA 17 -->
            <div class="bg-white rounded-2xl p-6 border border-secondary-200 hover:shadow-xl transition-all duration-300 relative opacity-90">
              <span class="absolute -top-3 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">2025</span>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-2xl">🌍</span>
                <h3 class="text-lg font-bold text-secondary-900">OHADA 17</h3>
              </div>
              <p class="text-sm text-secondary-600 mb-3">Assistant juridique OHADA — 17 pays africains</p>
              <p class="text-xs text-secondary-500">Actes Uniformes, droit commercial, SYSCOHADA</p>
            </div>
            <!-- GENfin 17 -->
            <div class="bg-white rounded-2xl p-6 border border-secondary-200 hover:shadow-xl transition-all duration-300 relative opacity-90">
              <span class="absolute -top-3 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">2025</span>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-2xl">📊</span>
                <h3 class="text-lg font-bold text-secondary-900">GENfin 17</h3>
              </div>
              <p class="text-sm text-secondary-600 mb-3">Generateur d'etats financiers SYSCOHADA</p>
              <p class="text-xs text-secondary-500">Bilan, Compte de resultat, TAFIRE, Notes annexes</p>
            </div>
            <!-- Paie 242 -->
            <div class="bg-white rounded-2xl p-6 border border-secondary-200 hover:shadow-xl transition-all duration-300 relative opacity-90">
              <span class="absolute -top-3 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">2025</span>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-2xl">💰</span>
                <h3 class="text-lg font-bold text-secondary-900">Paie 242</h3>
              </div>
              <p class="text-sm text-secondary-600 mb-3">Gestion de la paie — Congo-Brazzaville</p>
              <p class="text-xs text-secondary-500">ITS, CNSS, ONEMO, bulletins de paie, DSF</p>
            </div>
            <!-- LaboDEC -->
            <div class="bg-white rounded-2xl p-6 border border-secondary-200 hover:shadow-xl transition-all duration-300 relative opacity-90">
              <span class="absolute -top-3 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">2025</span>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-2xl">🎓</span>
                <h3 class="text-lg font-bold text-secondary-900">LaboDEC</h3>
              </div>
              <p class="text-sm text-secondary-600 mb-3">Preparation au DEC — France</p>
              <p class="text-xs text-secondary-500">Cas pratiques, methodologie memoire, simulation soutenance</p>
            </div>
            <!-- Plus a venir -->
            <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200 hover:shadow-xl transition-all duration-300 flex items-center justify-center">
              <div class="text-center">
                <span class="text-3xl mb-2 block">🚀</span>
                <p class="text-primary-700 font-semibold">Et bien plus a venir...</p>
                <p class="text-xs text-primary-600 mt-2">Restez connectes !</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section id="contact" class="py-20 px-6 bg-white">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-secondary-900 mb-4">
            Contactez-nous
          </h2>
          <p class="text-center text-secondary-600 mb-12">
            Une question ? Notre équipe est là pour vous aider
          </p>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6 bg-accent-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div class="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-secondary-900 mb-2">Email</h3>
              <a href="mailto:contact@cgi242.com" class="text-primary-600 hover:underline">contact&#64;cgi242.com</a>
            </div>
            <div class="text-center p-6 bg-accent-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div class="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-secondary-900 mb-2">Téléphone</h3>
              <a href="tel:+24205203422" class="text-primary-600 hover:underline">+242 05 203 42 21</a>
            </div>
            <div class="text-center p-6 bg-accent-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div class="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div class="flex items-center gap-2 mb-2">
                <img src="assets/images/logo242.png" alt="CGI 242" class="h-16 w-auto opacity-90" />
                <span class="text-base text-secondary-300 font-bold">By NORMX AI</span>
              </div>
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
