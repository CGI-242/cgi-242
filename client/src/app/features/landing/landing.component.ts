import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'available' | 'coming-soon' | 'maintenance';
  url: string;
  features: string[];
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Header -->
    <header class="bg-primary-500 text-white sticky top-0 z-50 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <span class="font-heading font-bold text-2xl">NORMX</span>
            <span class="text-gray-200 text-2xl ml-1">AI</span>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center space-x-8">
            <a href="#produits" class="hover:text-gray-200 transition-colors">Produits</a>
            <a href="#apropos" class="hover:text-gray-200 transition-colors">À propos</a>
            <a href="#contact" class="hover:text-gray-200 transition-colors">Contact</a>
          </nav>

          <!-- CTA -->
          <div class="flex items-center space-x-4">
            <a [href]="cgi242Url"
               class="bg-white text-primary-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Accéder à CGI 242
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-500 to-primary-600 text-white py-20 md:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-6xl font-heading font-bold mb-6 animate-fade-in text-white">
          Solutions IA pour l'Afrique
        </h1>
        <p class="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto mb-10 animate-fade-in-up">
          NORMX AI développe des solutions logicielles innovantes basées sur l'intelligence artificielle,
          adaptées aux besoins du marché africain francophone.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-2">
          <a href="#produits"
             class="bg-white text-primary-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
            Découvrir nos produits
          </a>
          <a href="#contact"
             class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-500 transition-all">
            Nous contacter
          </a>
        </div>
      </div>
    </section>

    <!-- Products Section -->
    <section id="produits" class="py-20 bg-normx-off-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-primary-500 mb-4">
            Nos Produits
          </h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            Des solutions professionnelles conçues pour simplifier votre quotidien
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          @for (product of products; track product.id) {
            <div class="card-normx hover:shadow-normx-lg transition-all duration-300 flex flex-col">
              <!-- Icon -->
              <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <i [class]="'ph ph-' + product.icon + ' text-3xl text-primary-500'"></i>
              </div>

              <!-- Status Badge -->
              <div class="mb-3">
                @if (product.status === 'available') {
                  <span class="badge-normx bg-success-light text-success-dark">Disponible</span>
                } @else if (product.status === 'coming-soon') {
                  <span class="badge-normx bg-warning-light text-warning-dark">Bientôt</span>
                } @else {
                  <span class="badge-normx bg-secondary-100 text-secondary-600">Maintenance</span>
                }
              </div>

              <!-- Content -->
              <h3 class="text-xl font-heading font-bold text-secondary-800 mb-2">
                {{ product.name }}
              </h3>
              <p class="text-secondary-600 mb-4 flex-grow">
                {{ product.description }}
              </p>

              <!-- Features -->
              <ul class="text-sm text-secondary-500 mb-6 space-y-1">
                @for (feature of product.features; track feature) {
                  <li class="flex items-center">
                    <i class="ph ph-check-circle text-success mr-2"></i>
                    {{ feature }}
                  </li>
                }
              </ul>

              <!-- CTA -->
              @if (product.status === 'available') {
                <a [href]="product.url"
                   class="btn-primary w-full text-center">
                  Accéder
                  <i class="ph ph-arrow-right ml-2"></i>
                </a>
              } @else {
                <button disabled class="btn-outline w-full opacity-60 cursor-not-allowed">
                  {{ product.status === 'coming-soon' ? 'Prochainement' : 'En maintenance' }}
                </button>
              }
            </div>
          }
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="apropos" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl md:text-4xl font-heading font-bold text-primary-500 mb-6">
              À propos de NORMX AI
            </h2>
            <p class="text-lg text-secondary-600 mb-6">
              NORMX AI est une marque française déposée à l'INPI, spécialisée dans le développement
              de solutions logicielles innovantes basées sur l'intelligence artificielle.
            </p>
            <p class="text-lg text-secondary-600 mb-8">
              Notre mission : rendre l'IA accessible et utile pour les professionnels africains,
              avec des solutions adaptées aux réalités locales.
            </p>

            <!-- Values -->
            <div class="grid grid-cols-2 gap-4">
              @for (value of values; track value.title) {
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <i [class]="'ph ph-' + value.icon + ' text-xl text-primary-500'"></i>
                  </div>
                  <div>
                    <h4 class="font-semibold text-secondary-800">{{ value.title }}</h4>
                    <p class="text-sm text-secondary-500">{{ value.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Stats -->
          <div class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
            <div class="grid grid-cols-2 gap-6">
              <div class="text-center p-4">
                <div class="text-4xl font-bold mb-2">4+</div>
                <div class="text-gray-200">Produits</div>
              </div>
              <div class="text-center p-4">
                <div class="text-4xl font-bold mb-2">5+</div>
                <div class="text-gray-200">Pays ciblés</div>
              </div>
              <div class="text-center p-4">
                <div class="text-4xl font-bold mb-2">2K+</div>
                <div class="text-gray-200">Articles CGI</div>
              </div>
              <div class="text-center p-4">
                <div class="text-4xl font-bold mb-2">24/7</div>
                <div class="text-gray-200">Disponibilité</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-20 bg-normx-off-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-heading font-bold text-primary-500 mb-6">
          Contactez-nous
        </h2>
        <p class="text-lg text-secondary-600 mb-8">
          Une question ? Un projet ? N'hésitez pas à nous contacter.
        </p>

        <div class="flex flex-col sm:flex-row gap-6 justify-center">
          <a href="mailto:contact@normx-ai.com"
             class="card-normx flex items-center justify-center p-6 hover:shadow-normx-lg transition-all">
            <i class="ph ph-envelope text-2xl text-primary-500 mr-3"></i>
            <span class="text-secondary-800 font-medium">contact&#64;normx-ai.com</span>
          </a>
          <a href="https://www.normx-ai.com" target="_blank"
             class="card-normx flex items-center justify-center p-6 hover:shadow-normx-lg transition-all">
            <i class="ph ph-globe text-2xl text-primary-500 mr-3"></i>
            <span class="text-secondary-800 font-medium">www.normx-ai.com</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-secondary-800 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-6 md:mb-0">
            <span class="font-heading font-bold text-2xl">NORMX</span>
            <span class="text-gray-400 text-2xl ml-1">AI</span>
            <p class="text-gray-400 mt-2">Solutions IA pour l'Afrique</p>
          </div>

          <div class="text-center md:text-right">
            <p class="text-gray-400 text-sm">
              Marque déposée INPI n°5146181
            </p>
            <p class="text-gray-400 text-sm mt-1">
              © {{ currentYear }} NORMX AI - Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LandingComponent {
  currentYear = new Date().getFullYear();

  // URL dynamique selon l'environnement (localhost en dev, cgi242.normx-ai.com en prod)
  cgi242Url = environment.production
    ? `https://${environment.appDomain}`
    : `http://${environment.appDomain}`;

  products: Product[] = [
    {
      id: 'cgi242',
      name: 'CGI 242',
      description: 'Assistant fiscal intelligent pour le Code Général des Impôts du Congo-Brazzaville.',
      icon: 'scales',
      status: 'available',
      url: this.cgi242Url,
      features: ['2000+ articles', 'Recherche IA', 'Mises à jour 2025']
    },
    {
      id: 'tauly',
      name: 'TAULY',
      description: 'Plateforme de gestion RH et staffing avec matching IA intelligent.',
      icon: 'users-three',
      status: 'available',
      url: 'https://tauly-africa.com',
      features: ['Matching IA', 'Gestion talents', 'Analytics RH']
    },
    {
      id: 'paie-congo',
      name: 'Paie Congo',
      description: 'Solution de paie 100% conforme à la législation congolaise.',
      icon: 'money',
      status: 'coming-soon',
      url: '#',
      features: ['CNSS intégré', 'Bulletins auto', 'Déclarations']
    },
    {
      id: 'ohada-compta',
      name: 'OHADA Compta',
      description: 'Comptabilité SYSCOHADA avec contrôles automatisés par IA.',
      icon: 'chart-pie',
      status: 'coming-soon',
      url: '#',
      features: ['Plan OHADA', 'Contrôles IA', 'États financiers']
    }
  ];

  values = [
    { icon: 'shield-check', title: 'Confiance', description: 'Solutions fiables et sécurisées' },
    { icon: 'lightning', title: 'Innovation', description: 'Technologies IA de pointe' },
    { icon: 'hand-coins', title: 'Accessibilité', description: 'Prix adaptés au marché' },
    { icon: 'graduation-cap', title: 'Expertise', description: 'Connaissance locale approfondie' }
  ];
}
