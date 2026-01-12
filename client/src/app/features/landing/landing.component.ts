import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  status: 'available' | 'coming-soon';
  url: string;
  features: string[];
  gradient: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styles: [`
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-25px) rotate(2deg); }
    }
    @keyframes floatReverse {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(25px) rotate(-2deg); }
    }
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
    }
    .animate-slideUp { animation: slideUp 0.8s ease-out forwards; }
    .animate-slideDown { animation: slideDown 0.6s ease-out forwards; }
    .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-floatReverse { animation: floatReverse 7s ease-in-out infinite; }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 4s ease infinite;
    }
    .animate-shimmer {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }
    .animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }
    .animate-glow { animation: glow 3s ease-in-out infinite; }
    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; }
    .delay-700 { animation-delay: 0.7s; }
    .delay-1000 { animation-delay: 1s; }
    .opacity-0 { opacity: 0; }
  `],
  template: `
    <!-- Header Glassmorphism -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <a href="#" class="block"><img src="assets/images/normx_ai_transp_slogan_sm.webp" alt="NORMX AI" class="h-48 w-auto hover:opacity-80 transition-opacity" /></a>
          <nav class="hidden md:flex items-center space-x-8">
            <a href="#solutions" class="text-secondary-600 hover:text-primary-600 transition-colors font-medium">Solutions</a>
            <a href="#apropos" class="text-secondary-600 hover:text-primary-600 transition-colors font-medium">A propos</a>
          </nav>
          <a href="#contact" class="hidden md:inline-flex bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all">
            Nous contacter
          </a>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 pt-20">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-float"></div>
        <div class="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-floatReverse"></div>
        <div class="absolute bottom-20 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
        <div class="absolute top-1/4 right-1/3 w-48 h-48 bg-green-500/15 rounded-full blur-3xl animate-floatReverse" style="animation-delay: 3s;"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 animate-fadeIn">
          <span class="text-lg">🚀</span>
          <span class="text-white/80 text-sm font-medium">Solutions IA concues pour l'Afrique francophone</span>
        </div>

        <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight animate-fadeIn">
          <span class="text-white">L'IA au service des</span>
          <br>
          <span class="bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">professionnels</span>
        </h1>

        <p class="text-xl text-primary-300 font-medium mb-6 animate-fadeIn">
          Fiscalite • Paie • Comptabilite
        </p>

        <p class="text-lg text-white/70 max-w-2xl mx-auto mb-10 animate-fadeIn">
          NORMX AI developpe des solutions logicielles innovantes basees sur l'IA,
          adaptees aux besoins du marche africain francophone.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn">
          <a href="#solutions" class="group inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-white/25 hover:-translate-y-1 transition-all">
            Voir nos solutions
            <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </a>
          <a href="#contact" class="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all">
            Demander une demo
          </a>
        </div>

        <!-- Stats -->
        <div class="flex flex-wrap justify-center gap-12 mt-16 animate-fadeIn">
          @for (stat of stats; track stat.label; let i = $index) {
            <div class="text-center group hover:scale-110 transition-transform duration-300">
              <div class="text-4xl md:text-5xl font-bold text-white group-hover:text-primary-300 transition-colors">{{ stat.value }}</div>
              <div class="text-white/60 text-sm mt-1">{{ stat.label }}</div>
            </div>
          }
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </section>

    <!-- Products -->
    <section id="solutions" class="py-24 bg-gradient-to-b from-white to-secondary-50 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Nos Solutions</span>
          <h2 class="text-3xl md:text-5xl font-bold text-secondary-900 mb-4">Des solutions professionnelles</h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">Concues pour simplifier votre quotidien</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (product of products; track product.id; let i = $index) {
            <div class="group relative bg-white rounded-2xl p-6 border border-secondary-100 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-3">

              <!-- Icon -->
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" [class]="product.gradient">
                <i [class]="'ph ph-' + product.icon + ' text-3xl text-white'"></i>
              </div>

              <!-- Status badge -->
              @if (product.status === 'available') {
                <span class="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium mb-3">Disponible</span>
              } @else {
                <span class="inline-block bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium mb-3">Bientot</span>
              }

              <!-- Content -->
              <h3 class="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">{{ product.name }}</h3>
              <p class="text-secondary-600 text-sm mb-5">{{ product.description }}</p>

              <ul class="text-xs text-secondary-500 space-y-2 mb-6">
                @for (feature of product.features; track feature) {
                  <li class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ feature }}
                  </li>
                }
              </ul>

              @if (product.status === 'available') {
                <a [href]="product.url" class="block w-full py-3 text-center bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all">
                  Acceder
                </a>
              } @else {
                <button disabled class="w-full py-3 text-center bg-secondary-100 text-secondary-400 rounded-xl font-medium cursor-not-allowed">
                  Prochainement
                </button>
              }
            </div>
          }
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="apropos" class="py-24 bg-white overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div class="opacity-0 animate-slideUp" style="animation-delay: 0.2s;">
            <span class="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">A propos</span>
            <h2 class="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">NORMX AI</h2>
            <p class="text-lg text-secondary-600 mb-6">
              Marque francaise deposee a l'INPI, specialisee dans le developpement
              de solutions logicielles innovantes basees sur l'intelligence artificielle.
            </p>
            <p class="text-lg text-secondary-600 mb-8">
              Notre mission : rendre l'IA accessible et utile pour les professionnels africains,
              avec des solutions adaptees aux realites locales.
            </p>
            <div class="grid grid-cols-2 gap-4">
              @for (value of values; track value.title) {
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i [class]="'ph ph-' + value.icon + ' text-xl text-primary-600'"></i>
                  </div>
                  <div>
                    <h4 class="font-semibold text-secondary-900">{{ value.title }}</h4>
                    <p class="text-sm text-secondary-500">{{ value.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
          <div class="relative opacity-0 animate-slideUp" style="animation-delay: 0.4s;">
            <div class="absolute -inset-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-3xl blur-2xl opacity-20 animate-float"></div>
            <div class="relative bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 text-white animate-glow">
              <div class="grid grid-cols-2 gap-6">
                @for (stat of stats; track stat.label) {
                  <div class="text-center p-4 bg-white/10 rounded-xl">
                    <div class="text-3xl font-bold mb-1">{{ stat.value }}</div>
                    <div class="text-white/70 text-sm">{{ stat.label }}</div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="py-24 bg-secondary-50 overflow-hidden">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Contact</span>
          <h2 class="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">Contactez-nous</h2>
          <p class="text-lg text-secondary-600">Une question ? Un projet ? N'hesitez pas a nous ecrire.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          @if (formSubmitted) {
            <div class="text-center py-8">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="ph ph-check text-3xl text-green-600"></i>
              </div>
              <h3 class="text-xl font-bold text-secondary-900 mb-2">Message envoye !</h3>
              <p class="text-secondary-600">Nous vous repondrons dans les plus brefs delais.</p>
            </div>
          } @else {
            <form (ngSubmit)="submitForm()" class="space-y-6">
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
                  <option value="">Selectionnez un sujet</option>
                  <option value="demo">Demande de demo</option>
                  <option value="info">Demande d'informations</option>
                  <option value="partnership">Partenariat</option>
                  <option value="support">Support technique</option>
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
              <i class="ph ph-envelope text-xl"></i>
              contact&#64;normx-ai.com
            </a>
            <span class="hidden sm:inline text-secondary-300">|</span>
            <span class="flex items-center gap-2">
              <i class="ph ph-map-pin text-xl"></i>
              France / Congo-Brazzaville
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-secondary-900 text-white py-16 opacity-0 animate-fadeIn" style="animation-delay: 0.3s;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-12 mb-12">
          <!-- Logo et description -->
          <div class="md:col-span-1">
            <a href="#" class="block"><img src="assets/images/normx_ai_transp_slogan.webp" alt="NORMX AI" class="h-50 w-auto mb-4 -ml-6 hover:opacity-80 transition-opacity" /></a>
            <p class="text-secondary-400 text-sm leading-relaxed">
              Solutions logicielles innovantes basees sur l'intelligence artificielle, concues pour les professionnels africains.
            </p>
          </div>

          <!-- Navigation -->
          <div class="md:col-span-1">
            <h4 class="text-lg font-semibold mb-4">Navigation</h4>
            <nav class="flex flex-col space-y-3">
              <a href="#solutions" class="text-secondary-400 hover:text-white transition-colors">Solutions</a>
              <a href="#apropos" class="text-secondary-400 hover:text-white transition-colors">A propos</a>
              <a href="#contact" class="text-secondary-400 hover:text-white transition-colors">Contact</a>
            </nav>
          </div>

          <!-- Contact -->
          <div class="md:col-span-1">
            <h4 class="text-lg font-semibold mb-4">Contact</h4>
            <div class="flex flex-col space-y-3 text-secondary-400">
              <a href="mailto:contact@normx-ai.com" class="hover:text-white transition-colors flex items-center gap-2">
                <i class="ph ph-envelope text-lg"></i>
                contact&#64;normx-ai.com
              </a>
              <p class="flex items-center gap-2">
                <i class="ph ph-map-pin text-lg"></i>
                France / Congo-Brazzaville
              </p>
            </div>
          </div>
        </div>

        <!-- Separateur -->
        <div class="border-t border-secondary-800 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-secondary-400 text-sm">Marque deposee INPI n°5146181</p>
            <p class="text-secondary-400 text-sm">© {{ currentYear }} NORMX AI - Tous droits reserves</p>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class LandingComponent {
  currentYear = new Date().getFullYear();
  cgi242Url = environment.production ? `https://${environment.appDomain}` : '/accueil';
  paie242Url = environment.production ? `https://${environment.paieDomain}` : 'http://localhost:4201';

  stats = [
    { value: '4+', label: 'Produits' },
    { value: '5+', label: 'Pays cibles' },
    { value: '24/7', label: 'Disponibilite' }
  ];

  products: Product[] = [
    { id: 'cgi242', name: 'CGI 242', description: 'Assistant fiscal IA pour le Congo-Brazzaville.', icon: 'scales', image: 'assets/images/products/cgi242.webp', status: 'available', url: this.cgi242Url, features: ['2000+ articles', 'Recherche IA', 'CGI 2026'], gradient: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { id: 'paie242', name: 'Paie 242', description: 'Solution de paie conforme a la legislation congolaise.', icon: 'money', image: 'assets/images/products/paie-242.webp', status: 'available', url: this.paie242Url, features: ['CNSS integre', 'Bulletins auto', 'Declarations'], gradient: 'bg-gradient-to-br from-green-500 to-green-600' },
    { id: 'ohada17', name: 'Ohada 17', description: 'Comptabilite SYSCOHADA pour les 17 pays membres.', icon: 'chart-pie', image: 'assets/images/products/ohada-17.webp', status: 'coming-soon', url: '#', features: ['Plan OHADA', 'Controles IA', 'Etats financiers'], gradient: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { id: 'labodec', name: 'Labo Dec', description: 'Laboratoire de declarations fiscales et sociales.', icon: 'flask', image: 'assets/images/products/labo-dec.webp', status: 'coming-soon', url: '#', features: ['DSF automatisee', 'Liasses fiscales', 'Teledeclaration'], gradient: 'bg-gradient-to-br from-purple-500 to-purple-600' }
  ];

  values = [
    { icon: 'shield-check', title: 'Confiance', description: 'Solutions fiables' },
    { icon: 'lightning', title: 'Innovation', description: 'Technologies IA' },
    { icon: 'hand-coins', title: 'Accessibilite', description: 'Prix adaptes' },
    { icon: 'graduation-cap', title: 'Expertise', description: 'Connaissance locale' }
  ];

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  formSubmitted = false;

  submitForm(): void {
    console.log('Contact form submitted:', this.contactForm);
    this.formSubmitted = true;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/products/placeholder.webp';
    }
  }
}
