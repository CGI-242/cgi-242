import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { PasswordStrengthComponent } from '@shared/components/password-strength/password-strength.component';

// Validateur personnalisé pour vérifier que les mots de passe correspondent
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PasswordStrengthComponent],
  template: `
    <div class="register-page">
      <!-- Bouton retour accueil CGI 242 -->
      <a routerLink="/accueil" class="home-button" title="Retour à l'accueil CGI 242">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      </a>

      <!-- Section Gauche - Design animé impressionnant -->
      <div class="register-left">
        <!-- Fond gradient animé -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 animated-gradient"></div>

        <!-- Particules flottantes -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
          <div class="particle particle-5"></div>
          <div class="particle particle-6"></div>
        </div>

        <!-- Lignes géométriques animées -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="geo-line geo-line-1"></div>
          <div class="geo-line geo-line-2"></div>
          <div class="geo-line geo-line-3"></div>
        </div>

        <!-- Contenu principal -->
        <div class="relative z-10 text-center px-8">
          <!-- Logo avec animation -->
          <a routerLink="/" class="block logo-container">
            <div class="logo-glow"></div>
            <img src="assets/images/logo_transp.webp" alt="CGI 242" class="h-36 md:h-48 mx-auto relative z-10 logo-animate" />
          </a>

          <!-- Texte animé -->
          <div class="mt-6 space-y-3">
            <h2 class="text-2xl md:text-3xl font-bold text-white text-reveal">
              Rejoignez CGI 242
            </h2>
            <p class="text-white/80 text-base md:text-lg text-reveal-delay">
              L'assistant fiscal intelligent
            </p>
          </div>

          <!-- Avantages animés -->
          <div class="mt-10 space-y-3">
            <div class="benefit-item benefit-1">
              <div class="benefit-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-white/90 text-sm">Gratuit pour commencer</span>
            </div>
            <div class="benefit-item benefit-2">
              <div class="benefit-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
              </div>
              <span class="text-white/90 text-sm">Accès immédiat au CGI 25/26</span>
            </div>
            <div class="benefit-item benefit-3">
              <div class="benefit-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <span class="text-white/90 text-sm">Chatbot IA disponible 24/7</span>
            </div>
            <div class="benefit-item benefit-4">
              <div class="benefit-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <span class="text-white/90 text-sm">Données 100% sécurisées</span>
            </div>
            <div class="benefit-item benefit-5">
              <div class="benefit-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </div>
              <span class="text-white/90 text-sm">Amélioration continue</span>
            </div>
          </div>

          <!-- Statistique animée -->
          <div class="mt-8 stats-container">
            <div class="stat-card">
              <span class="stat-number">100%</span>
              <span class="stat-label">Gratuit</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Droite - Formulaire sur fond blanc cassé -->
      <div class="register-right bg-secondary-50">
        <div class="register-form">
          <!-- Logo mobile -->
          <div class="text-center mb-6">
            <a routerLink="/" class="inline-block md:hidden">
              <img src="assets/images/logo_transp.webp" alt="CGI 242" class="h-16 mx-auto mb-4" />
            </a>
            <h2 class="text-2xl font-heading font-semibold text-primary-600">
              Créer un compte
            </h2>
            <p class="text-secondary-500">Rejoignez CGI 242 gratuitement</p>
          </div>

          <!-- Message d'erreur -->
          @if (errorMessage()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="form-label text-primary-700">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  formControlName="firstName"
                  class="form-input"
                  placeholder="Jean">
              </div>
              <div>
                <label for="lastName" class="form-label text-primary-700">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  formControlName="lastName"
                  class="form-input"
                  placeholder="Dupont">
              </div>
            </div>

            <div>
              <label for="email" class="form-label text-primary-700">Email</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="form-input"
                [class.border-red-500]="form.get('email')?.invalid && form.get('email')?.touched"
                placeholder="votre@email.com">
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-red-300 text-xs mt-1">Email invalide</p>
              }
            </div>

            <div>
              <label for="profession" class="form-label text-primary-700">Profession</label>
              <select id="profession" formControlName="profession" class="form-input">
                <option value="">Sélectionnez votre profession</option>
                <option value="Fiscaliste">Fiscaliste</option>
                <option value="Expert-comptable">Expert-comptable</option>
                <option value="Avocat fiscaliste">Avocat fiscaliste</option>
                <option value="Commissaire aux comptes">Commissaire aux comptes</option>
                <option value="DAF">Directeur Administratif et Financier</option>
                <option value="Comptable">Comptable</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label for="password" class="form-label text-primary-700">Mot de passe</label>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  id="password"
                  formControlName="password"
                  class="form-input pr-12"
                  [class.border-red-500]="form.get('password')?.invalid && form.get('password')?.touched"
                  placeholder="Min. 8 caractères">
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-primary-600 transition-colors">
                  @if (!showPassword()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  }
                </button>
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-red-500 text-xs mt-1">
                  Min. 8 caractères, une majuscule et un chiffre
                </p>
              }
              <!-- Indicateur de force du mot de passe -->
              @if (form.get('password')?.value) {
                <div class="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <app-password-strength [password]="form.get('password')?.value || ''" [showDetails]="true" />
                </div>
              }
            </div>

            <div>
              <label for="confirmPassword" class="form-label text-primary-700">Confirmer le mot de passe</label>
              <div class="relative">
                <input
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  id="confirmPassword"
                  formControlName="confirmPassword"
                  class="form-input pr-12"
                  [class.border-red-500]="form.get('confirmPassword')?.touched && form.hasError('passwordMismatch')"
                  placeholder="Confirmez votre mot de passe">
                <button
                  type="button"
                  (click)="showConfirmPassword.set(!showConfirmPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-primary-600 transition-colors">
                  @if (!showConfirmPassword()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  }
                </button>
              </div>
              @if (form.get('confirmPassword')?.touched && form.hasError('passwordMismatch')) {
                <p class="text-red-500 text-xs mt-1">
                  Les mots de passe ne correspondent pas
                </p>
              }
            </div>

            <div class="flex items-start">
              <input
                type="checkbox"
                id="terms"
                formControlName="terms"
                class="mt-1 rounded border-secondary-300 bg-white text-primary-600 focus:ring-primary-500">
              <label for="terms" class="ml-2 text-sm text-secondary-600">
                J'accepte les <a href="#" class="text-primary-600 hover:underline">conditions d'utilisation</a>
                et la <a href="#" class="text-primary-600 hover:underline">politique de confidentialité</a>
              </label>
            </div>

            <button
              type="submit"
              class="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              [disabled]="form.invalid || isLoading()">
              @if (isLoading()) {
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription...
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
                Créer mon compte
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-secondary-600">
              Déjà un compte ?
              <a routerLink="/auth/login" class="text-primary-600 hover:underline font-medium">Se connecter</a>
            </p>
          </div>

          <div class="mt-6 pt-6 border-t border-secondary-200 text-center">
            <p class="text-sm text-primary-600 font-medium">
              CGI 242 by NORMX AI
            </p>
            <p class="text-xs text-secondary-500 mt-1">
              Code Général des Impôts - Congo-Brazzaville
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      @apply min-h-screen flex flex-col md:flex-row relative;
    }

    /* Bouton Home */
    .home-button {
      @apply fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 hover:scale-110 transition-all duration-300;
    }

    .register-left {
      @apply hidden md:flex md:w-1/2 items-center justify-center p-8 relative overflow-hidden;
    }

    .register-right {
      @apply flex-1 flex items-center justify-center p-6;
    }

    .register-form {
      @apply w-full max-w-md p-6;
    }

    .form-label {
      @apply block text-sm font-medium mb-1;
    }

    .form-input {
      @apply w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors;
    }

    /* Gradient animé */
    .animated-gradient {
      background-size: 400% 400%;
      animation: gradientShift 15s ease infinite;
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    /* Particules flottantes */
    .particle {
      @apply absolute rounded-full bg-white/10;
      animation: float 20s infinite ease-in-out;
    }

    .particle-1 {
      width: 70px; height: 70px;
      top: 15%; left: 15%;
      animation-delay: 0s;
      animation-duration: 22s;
    }

    .particle-2 {
      width: 50px; height: 50px;
      top: 65%; left: 75%;
      animation-delay: -4s;
      animation-duration: 18s;
    }

    .particle-3 {
      width: 35px; height: 35px;
      top: 85%; left: 25%;
      animation-delay: -8s;
      animation-duration: 20s;
    }

    .particle-4 {
      width: 90px; height: 90px;
      top: 25%; left: 65%;
      animation-delay: -6s;
      animation-duration: 26s;
    }

    .particle-5 {
      width: 45px; height: 45px;
      top: 55%; left: 10%;
      animation-delay: -2s;
      animation-duration: 16s;
    }

    .particle-6 {
      width: 60px; height: 60px;
      top: 90%; left: 55%;
      animation-delay: -10s;
      animation-duration: 21s;
    }

    @keyframes float {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 0.25;
      }
      25% {
        transform: translate(25px, -25px) rotate(90deg);
        opacity: 0.45;
      }
      50% {
        transform: translate(-15px, 15px) rotate(180deg);
        opacity: 0.25;
      }
      75% {
        transform: translate(15px, 25px) rotate(270deg);
        opacity: 0.45;
      }
    }

    /* Lignes géométriques */
    .geo-line {
      @apply absolute bg-gradient-to-r from-transparent via-white/20 to-transparent;
      height: 1px;
      animation: lineMove 12s linear infinite;
    }

    .geo-line-1 {
      width: 200px;
      top: 30%;
      left: -200px;
      animation-delay: 0s;
    }

    .geo-line-2 {
      width: 150px;
      top: 50%;
      left: -150px;
      animation-delay: -4s;
    }

    .geo-line-3 {
      width: 180px;
      top: 70%;
      left: -180px;
      animation-delay: -8s;
    }

    @keyframes lineMove {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(100vw + 400px)); }
    }

    /* Logo animations */
    .logo-container {
      @apply relative inline-block;
    }

    .logo-glow {
      @apply absolute inset-0 bg-white/20 rounded-full blur-3xl;
      animation: glow 3s infinite ease-in-out;
    }

    @keyframes glow {
      0%, 100% {
        transform: scale(0.8);
        opacity: 0.3;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.5;
      }
    }

    .logo-animate {
      animation: logoEntrance 1s ease-out forwards, logoFloat 6s infinite ease-in-out 1s;
      opacity: 0;
    }

    @keyframes logoEntrance {
      from {
        opacity: 0;
        transform: scale(0.5) translateY(30px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes logoFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    /* Text reveal animations */
    .text-reveal {
      animation: textReveal 0.8s ease-out forwards;
      animation-delay: 0.3s;
      opacity: 0;
    }

    .text-reveal-delay {
      animation: textReveal 0.8s ease-out forwards;
      animation-delay: 0.5s;
      opacity: 0;
    }

    @keyframes textReveal {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Benefit items */
    .benefit-item {
      @apply flex items-center gap-3 px-4 py-2.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10;
      animation: slideInRight 0.5s ease-out forwards;
      opacity: 0;
    }

    .benefit-1 { animation-delay: 0.5s; }
    .benefit-2 { animation-delay: 0.65s; }
    .benefit-3 { animation-delay: 0.8s; }
    .benefit-4 { animation-delay: 0.95s; }
    .benefit-5 { animation-delay: 1.1s; }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .benefit-icon {
      @apply w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white flex-shrink-0;
    }

    /* Stats container */
    .stats-container {
      animation: fadeInUp 0.8s ease-out forwards;
      animation-delay: 1.1s;
      opacity: 0;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .stat-card {
      @apply inline-flex flex-col items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20;
    }

    .stat-number {
      @apply text-3xl font-bold text-white;
      animation: countUp 1.5s ease-out forwards;
      animation-delay: 1.3s;
    }

    .stat-label {
      @apply text-sm text-white/70 mt-1;
    }

    @keyframes countUp {
      from { opacity: 0.5; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.nonNullable.group({
    firstName: [''],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    profession: [''],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/)]],
    confirmPassword: ['', Validators.required],
    terms: [false, Validators.requiredTrue],
  }, { validators: passwordMatchValidator });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password, firstName, lastName, profession } = this.form.getRawValue();

    this.authService.register({ email, password, firstName, lastName, profession }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toast.success({
            title: 'Compte créé',
            message: 'Bienvenue sur CGI 242 !'
          });
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(res.error ?? "Erreur lors de l'inscription");
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set("Erreur lors de l'inscription");
      },
    });
  }
}
