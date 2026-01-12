import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cgi242-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Header Glassmorphism -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 transition-all duration-300"
            [class.shadow-lg]="scrolled()">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <img src="assets/images/logo_cgi_transp_sm.webp" alt="CGI 242" class="h-32 w-auto" loading="eager" fetchpriority="high" />
          </div>

          <nav class="hidden md:flex items-center space-x-8">
            <a [href]="normxUrl" class="text-secondary-600 hover:text-primary-600 transition-colors font-medium">Accueil</a>
            <a href="#fonctionnalites" class="text-secondary-600 hover:text-primary-600 transition-colors font-medium">Fonctionnalites</a>
            <a href="#tarifs" class="text-secondary-600 hover:text-primary-600 transition-colors font-medium">Tarifs</a>
            <a href="#contact" class="text-secondary-600 hover:text-primary-600 transition-colors font-medium">Contact</a>
          </nav>

          <div class="hidden md:flex items-center space-x-4">
            <a routerLink="/auth/login" class="text-secondary-600 hover:text-primary-600 transition-colors font-medium">
              Connexion
            </a>
            <a routerLink="/auth/register" class="group relative bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-xl font-semibold overflow-hidden transition-all hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5">
              <span class="relative z-10">Essai gratuit</span>
              <div class="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
          </div>

          <button
            (click)="toggleMobileMenu()"
            class="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
            aria-label="Menu">
            @if (!mobileMenuOpen()) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            }
          </button>
        </div>

        @if (mobileMenuOpen()) {
          <div class="md:hidden border-t border-secondary-200 py-4 space-y-3 animate-fadeIn">
            <a [href]="normxUrl" (click)="closeMobileMenu()" class="block px-3 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg">Accueil</a>
            <a href="#fonctionnalites" (click)="closeMobileMenu()" class="block px-3 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg">Fonctionnalites</a>
            <a href="#tarifs" (click)="closeMobileMenu()" class="block px-3 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg">Tarifs</a>
            <a href="#contact" (click)="closeMobileMenu()" class="block px-3 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg">Contact</a>
            <hr class="border-secondary-200">
            <a routerLink="/auth/login" (click)="closeMobileMenu()" class="block px-3 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg">Connexion</a>
            <a routerLink="/auth/register" (click)="closeMobileMenu()" class="block px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-center rounded-lg font-semibold">Essai gratuit</a>
          </div>
        }
      </div>
    </header>

    <!-- Hero Section - Modern with animated gradient -->
    <section class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 pt-16">
      <!-- Animated background elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
        <!-- Grid pattern -->
        <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left content -->
          <div class="text-center lg:text-left animate-slideUp">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span class="text-white/80 text-sm font-medium">CGI Provisoire 2026</span>
            </div>

            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span class="text-white">Votre CGI intelligent</span>
              <br>
              <span class="bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">à portée de clic</span>
            </h1>

            <p class="text-lg md:text-xl text-white/70 mb-8 max-w-xl mx-auto lg:mx-0">
              L'assistant IA pour le Code General des Impots du Congo-Brazzaville.
              Recherche semantique, simulateurs fiscaux et reponses instantanees.
            </p>

            <!-- Stats -->
            <div class="flex flex-wrap justify-center lg:justify-start gap-8 mb-10">
              <div class="text-center">
                <div class="text-3xl md:text-4xl font-bold text-white">2000+</div>
                <div class="text-white/60 text-sm">Articles du CGI</div>
              </div>
              <div class="text-center">
                <div class="text-3xl md:text-4xl font-bold text-white">8</div>
                <div class="text-white/60 text-sm">Simulateurs</div>
              </div>
              <div class="text-center">
                <div class="text-3xl md:text-4xl font-bold text-white">24/7</div>
                <div class="text-white/60 text-sm">Disponible</div>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a routerLink="/auth/register" class="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-white/25 hover:-translate-y-1">
                <span class="relative z-10 flex items-center gap-2">
                  Commencer gratuitement
                  <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </span>
              </a>
              <a href="#fonctionnalites" class="group inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Voir la demo
              </a>
            </div>
          </div>

          <!-- Right - Floating cards -->
          <div class="hidden lg:block relative">
            <div class="relative w-full h-[500px]">
              <!-- Main card -->
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl animate-float">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <div>
                    <div class="text-white font-semibold">Assistant IA</div>
                    <div class="text-white/60 text-sm">Reponse instantanee</div>
                  </div>
                </div>
                <div class="bg-white/5 rounded-xl p-4 mb-3">
                  <p class="text-white/80 text-sm">"Quel est le taux de l'IS au Congo ?"</p>
                </div>
                <div class="bg-primary-500/20 rounded-xl p-4">
                  <p class="text-white/90 text-sm">Le taux de l'IS est de 25% pour les benefices des societes (Art. 86A CGI)...</p>
                </div>
              </div>

              <!-- Floating elements -->
              <div class="absolute top-10 left-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 animate-float" style="animation-delay: 0.5s;">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-white text-sm">CGI Provisoire 2026</span>
                </div>
              </div>

              <div class="absolute bottom-20 right-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 animate-float" style="animation-delay: 1s;">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span class="text-white text-sm">Reponse en 2s</span>
                </div>
              </div>

              <div class="absolute top-20 right-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 animate-float" style="animation-delay: 1.5s;">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-white text-sm">De nombreux simulateurs d'impots</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </section>

    <!-- Fonctionnalites - Modern cards -->
    <section id="fonctionnalites" class="py-24 bg-gradient-to-b from-white to-secondary-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Fonctionnalites</span>
          <h2 class="text-3xl md:text-5xl font-bold text-secondary-900 mb-4">
            Tout le CGI a portee de main
          </h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            Une plateforme complete pour maitriser la fiscalite congolaise
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (feature of features; track feature.title) {
            <div class="group relative bg-white rounded-2xl p-8 border border-secondary-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1">
              <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i [class]="'ph ' + feature.icon + ' text-2xl text-white'"></i>
              </div>
              <h3 class="text-xl font-bold text-secondary-900 mb-3">{{ feature.title }}</h3>
              <p class="text-secondary-600">{{ feature.description }}</p>
              @if (feature.badge) {
                <span class="inline-block mt-4 text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">{{ feature.badge }}</span>
              }
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Tarifs - Modern pricing -->
    <section id="tarifs" class="py-24 bg-secondary-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <span class="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Tarifs</span>
          <h2 class="text-3xl md:text-5xl font-bold text-secondary-900 mb-4">
            Choisissez votre formule
          </h2>
          <p class="text-lg text-secondary-600">
            Abonnement annuel - Sans engagement - TVA 18% incluse
          </p>
        </div>

        <!-- Offre de lancement -->
        <div class="relative max-w-2xl mx-auto mb-12">
          <div class="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl blur-xl opacity-30"></div>
          <div class="relative bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl p-6 text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <svg class="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd"/>
              </svg>
              <span class="font-bold text-lg">Offre de lancement</span>
            </div>
            <p class="opacity-90">Jusqu'au 31 mars 2026 - Jusqu'a 20% de reduction !</p>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <!-- STANDARD -->
          <div class="group relative bg-white rounded-3xl p-8 border-2 border-secondary-100 hover:border-primary-200 transition-all hover:shadow-xl">
            <div class="mb-6">
              <span class="inline-flex items-center gap-2 bg-secondary-100 text-secondary-700 text-sm px-4 py-1.5 rounded-full font-medium">
                <i class="ph ph-book-open"></i>
                STANDARD
              </span>
            </div>
            <div class="mb-6">
              <div class="flex items-baseline gap-2 mb-1">
                <span class="text-lg text-secondary-400 line-through">60 000</span>
                <span class="text-4xl font-bold text-secondary-900">50 000</span>
                <span class="text-secondary-500">XAF/an</span>
              </div>
              <p class="text-sm text-green-600 font-medium">Economisez 10 000 XAF</p>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-secondary-600">Recherche CGI illimitee</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-secondary-600">Tous les simulateurs fiscaux</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-secondary-600">Calendrier fiscal + alertes</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-secondary-600">5 exports PDF/mois</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-secondary-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span class="text-secondary-400">Assistant IA non inclus</span>
              </li>
            </ul>
            <a routerLink="/auth/register" class="block w-full py-3.5 px-4 text-center border-2 border-secondary-200 text-secondary-700 rounded-xl font-semibold hover:border-primary-500 hover:text-primary-600 transition-all">
              Commencer
            </a>
          </div>

          <!-- PRO - Featured -->
          <div class="group relative">
            <div class="absolute -inset-1 bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div class="relative bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 text-white h-full">
              <div class="absolute -top-4 left-1/2 -translate-x-1/2">
                <span class="bg-gradient-to-r from-yellow-400 to-orange-400 text-secondary-900 text-sm px-4 py-1 rounded-full font-bold shadow-lg">
                  Le plus populaire
                </span>
              </div>
              <div class="mb-6 pt-2">
                <span class="inline-flex items-center gap-2 bg-white/20 text-sm px-4 py-1.5 rounded-full font-medium">
                  <i class="ph ph-robot"></i>
                  PRO
                </span>
              </div>
              <div class="mb-6">
                <div class="flex items-baseline gap-2 mb-1">
                  <span class="text-lg opacity-60 line-through">90 000</span>
                  <span class="text-4xl font-bold">75 000</span>
                  <span class="opacity-80">XAF/an</span>
                </div>
                <p class="text-sm text-green-300 font-medium">Economisez 15 000 XAF</p>
              </div>
              <ul class="space-y-4 mb-8">
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>Tout STANDARD inclus</span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span><strong>50 questions IA/mois</strong></span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>20 exports PDF/mois</span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>Veille fiscale</span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>Support email 48h</span>
                </li>
              </ul>
              <a routerLink="/auth/register" class="block w-full py-3.5 px-4 text-center bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
                Essayer gratuitement
              </a>
            </div>
          </div>

          <!-- EXPERT -->
          <div class="group relative bg-white rounded-3xl p-8 border-2 border-primary-100 hover:border-primary-300 transition-all hover:shadow-xl">
            <div class="mb-6">
              <span class="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm px-4 py-1.5 rounded-full font-medium">
                <i class="ph ph-crown"></i>
                EXPERT
              </span>
            </div>
            <div class="mb-6">
              <div class="flex items-baseline gap-2 mb-1">
                <span class="text-lg text-secondary-400 line-through">120 000</span>
                <span class="text-4xl font-bold text-secondary-900">100 000</span>
                <span class="text-secondary-500">XAF/an</span>
              </div>
              <p class="text-sm text-green-600 font-medium">Economisez 20 000 XAF</p>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-secondary-600">Tout PRO inclus</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-secondary-600"><strong>100 questions IA/mois</strong></span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-secondary-600">Exports PDF illimites</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-secondary-600">Support prioritaire 24h</span>
              </li>
            </ul>
            <a routerLink="/auth/register" class="block w-full py-3.5 px-4 text-center bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">
              Souscrire
            </a>
          </div>
        </div>

        <!-- Packs IA -->
        <div class="mt-16 text-center">
          <p class="text-secondary-600 mb-4">
            <strong>Besoin de plus de questions IA ?</strong>
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <span class="bg-white px-4 py-2 rounded-full text-sm text-secondary-600 border border-secondary-200">20 questions - 5 000 XAF</span>
            <span class="bg-white px-4 py-2 rounded-full text-sm text-secondary-600 border border-secondary-200">50 questions - 10 000 XAF</span>
            <span class="bg-white px-4 py-2 rounded-full text-sm text-secondary-600 border border-secondary-200">100 questions - 18 000 XAF</span>
            <span class="bg-white px-4 py-2 rounded-full text-sm text-secondary-600 border border-secondary-200">200 questions - 30 000 XAF</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact - Modern CTA -->
    <section id="contact" class="py-24 bg-secondary-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Contact</span>
          <h2 class="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">Une question ? Contactez-nous</h2>
          <p class="text-lg text-secondary-600">Notre equipe est a votre disposition pour vous accompagner.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          @if (formSubmitted()) {
            <div class="text-center py-8">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-secondary-900 mb-2">Message envoyé !</h3>
              <p class="text-secondary-600">Nous vous répondrons dans les plus brefs délais.</p>
            </div>
          } @else {
            <form (ngSubmit)="submitContactForm()" class="space-y-6">
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-secondary-700 mb-2">Nom complet</label>
                  <input type="text" id="name" name="name" [(ngModel)]="contactForm.name" required
                         class="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                         placeholder="Votre nom">
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-secondary-700 mb-2">Email</label>
                  <input type="email" id="email" name="email" [(ngModel)]="contactForm.email" required
                         class="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                         placeholder="votre&#64;email.com">
                </div>
              </div>

              <div>
                <label for="subject" class="block text-sm font-medium text-secondary-700 mb-2">Sujet</label>
                <select id="subject" name="subject" [(ngModel)]="contactForm.subject" required
                        class="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors">
                  <option value="">Sélectionnez un sujet</option>
                  <option value="demo">Demande de démonstration</option>
                  <option value="info">Informations sur les offres</option>
                  <option value="support">Support technique</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-secondary-700 mb-2">Message</label>
                <textarea id="message" name="message" [(ngModel)]="contactForm.message" required rows="5"
                          class="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                          placeholder="Votre message..."></textarea>
              </div>

              <button type="submit"
                      class="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all">
                Envoyer le message
              </button>
            </form>
          }

          <div class="mt-8 pt-8 border-t border-secondary-100 flex flex-col sm:flex-row items-center justify-center gap-6 text-secondary-600">
            <a href="mailto:contact@normx-ai.com" class="flex items-center gap-2 hover:text-primary-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              contact&#64;normx-ai.com
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer - Modern -->
    <footer class="bg-secondary-900 text-white pt-20 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-12 mb-16">
          <div class="md:col-span-2">
            <img src="assets/images/logo_cgi_transp_sm.webp" alt="CGI 242" class="h-40 mb-6" />
            <p class="text-secondary-400 mb-6 max-w-md">
              Assistant fiscal intelligent pour le Code General des Impots du Congo-Brazzaville.
              Recherche semantique, simulateurs et IA au service des professionnels.
            </p>
            <p class="text-secondary-500 text-sm">
              Un produit <a [href]="normxUrl" class="text-primary-400 hover:text-primary-300 transition-colors">NORMX AI</a>
            </p>
          </div>

          <div>
            <h4 class="font-semibold text-lg mb-6">Liens rapides</h4>
            <ul class="space-y-3 text-secondary-400">
              <li><a href="#fonctionnalites" class="hover:text-white transition-colors">Fonctionnalites</a></li>
              <li><a href="#tarifs" class="hover:text-white transition-colors">Tarifs</a></li>
              <li><a routerLink="/auth/login" class="hover:text-white transition-colors">Connexion</a></li>
              <li><a routerLink="/auth/register" class="hover:text-white transition-colors">Inscription</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-lg mb-6">Contact</h4>
            <ul class="space-y-3 text-secondary-400">
              <li class="flex items-center gap-3">
                <div class="w-8 h-8 bg-secondary-800 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <a href="mailto:contact@normx-ai.com" class="hover:text-white transition-colors">contact&#64;normx-ai.com</a>
              </li>
              <li class="flex items-center gap-3">
                <div class="w-8 h-8 bg-secondary-800 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                  </svg>
                </div>
                <a [href]="normxUrl" class="hover:text-white transition-colors">www.normx-ai.com</a>
              </li>
              <li class="flex items-center gap-3">
                <div class="w-8 h-8 bg-secondary-800 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <span>Brazzaville, Congo</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-secondary-800 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-secondary-500 text-sm">
              {{ currentYear }} CGI 242 by NORMX AI - Tous droits reserves
            </p>
            <div class="flex gap-6 text-secondary-400 text-sm">
              <a routerLink="/cgv" class="hover:text-white transition-colors">CGV</a>
              <a routerLink="/confidentialite" class="hover:text-white transition-colors">Confidentialite</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes gradient {
      0%, 100% { background-size: 200% 200%; background-position: left center; }
      50% { background-size: 200% 200%; background-position: right center; }
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }

    .animate-slideUp {
      animation: slideUp 0.8s ease-out forwards;
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }

    .animate-gradient {
      animation: gradient 3s ease infinite;
      background-size: 200% 200%;
    }
  `]
})
export class Cgi242LandingComponent implements OnInit {
  currentYear = new Date().getFullYear();
  mobileMenuOpen = signal(false);
  scrolled = signal(false);
  formSubmitted = signal(false);
  normxUrl = environment.production ? `https://${environment.landingDomain}` : '/';

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  submitContactForm(): void {
    console.log('Contact form submitted:', this.contactForm);
    this.formSubmitted.set(true);
  }

  features = [
    {
      icon: 'ph-magnifying-glass',
      title: 'Recherche semantique',
      description: 'Trouvez instantanement les articles pertinents grace a notre moteur de recherche intelligent.',
      badge: null
    },
    {
      icon: 'ph-chat-centered-text',
      title: 'Chat IA Fiscal',
      description: 'Posez vos questions en langage naturel et obtenez des reponses precises avec references aux articles.',
      badge: 'PRO & EXPERT'
    },
    {
      icon: 'ph-book-open',
      title: 'Navigateur CGI',
      description: 'Parcourez l\'integralite du Code General des Impots 2026 (provisoire) avec une navigation intuitive.',
      badge: null
    },
    {
      icon: 'ph-calculator',
      title: 'Simulateurs d\'impots',
      description: 'IS, IRPP, ITS, TVA, Patente, Taxe fonciere, Droits d\'enregistrement. Resultats instantanes.',
      badge: null
    },
    {
      icon: 'ph-calendar',
      title: 'Calendrier fiscal',
      description: 'Toutes les echeances legales avec rappels automatiques. Export iCal et Google Calendar.',
      badge: null
    },
    {
      icon: 'ph-bell',
      title: 'Veille fiscale',
      description: 'Alertes sur les nouvelles lois, circulaires DGID et notes de service.',
      badge: 'PRO & EXPERT'
    }
  ];

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled.set(window.scrollY > 50);
      });
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
