import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { AuditService } from '@core/services/audit.service';

const MAX_FAILED_ATTEMPTS = 3;
const BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <!-- Bouton retour accueil CGI 242 -->
      <a routerLink="/accueil" class="home-button" title="Retour à l'accueil CGI 242">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      </a>

      <!-- Section Gauche - Design animé impressionnant -->
      <div class="login-left">
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

        <!-- Cercles décoratifs -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="circle-decoration circle-1"></div>
          <div class="circle-decoration circle-2"></div>
          <div class="circle-decoration circle-3"></div>
        </div>

        <!-- Contenu principal -->
        <div class="relative z-10 text-center px-8">
          <!-- Logo avec animation -->
          <a routerLink="/" class="block logo-container">
            <div class="logo-glow"></div>
            <img src="assets/images/logo_transp.webp" alt="CGI 242" class="h-40 md:h-52 mx-auto relative z-10 logo-animate" />
          </a>

          <!-- Texte animé -->
          <div class="mt-8 space-y-4">
            <h2 class="text-3xl font-bold text-white text-reveal">
              Assistant Fiscal IA
            </h2>
            <p class="text-white/80 text-lg text-reveal-delay">
              Congo-Brazzaville
            </p>
          </div>

          <!-- Features animées -->
          <div class="mt-12 space-y-4">
            <div class="feature-item feature-1">
              <div class="feature-icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-white/90">Accès au CGI 25/26</span>
            </div>
            <div class="feature-item feature-2">
              <div class="feature-icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="text-white/90">Réponses instantanées par IA</span>
            </div>
            <div class="feature-item feature-3">
              <div class="feature-icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <span class="text-white/90">Simulateurs fiscaux intégrés</span>
            </div>
            <div class="feature-item feature-4">
              <div class="feature-icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </div>
              <span class="text-white/90">Amélioration continue</span>
            </div>
          </div>

          <!-- Badge animé -->
          <div class="mt-12 badge-pulse">
            <span class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm border border-white/20">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Disponible 24/7
            </span>
          </div>
        </div>
      </div>

      <!-- Section Droite - Formulaire sur fond blanc cassé -->
      <div class="login-right bg-secondary-50">
        <div class="login-form">
          <!-- Logo mobile -->
          <div class="text-center mb-8">
            <a routerLink="/" class="inline-block md:hidden">
              <img src="assets/images/logo_transp.webp" alt="CGI 242" class="h-20 mx-auto mb-4" />
            </a>
            <h2 class="text-2xl font-heading font-semibold text-primary-600">
              Bienvenue
            </h2>
            <p class="text-secondary-500">Connectez-vous pour continuer</p>
          </div>

          <!-- Message de blocage temporaire -->
          @if (isBlocked()) {
            <div class="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
              <div class="flex items-center gap-3">
                <svg class="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <div>
                  <p class="text-amber-800 font-medium">Compte temporairement bloque</p>
                  <p class="text-amber-700 text-sm mt-1">
                    Trop de tentatives echouees. Reessayez dans {{ remainingBlockTime() }}.
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- Message d'erreur -->
          @if (errorMessage() && !isBlocked()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {{ errorMessage() }}
              @if (failedAttempts() > 0 && failedAttempts() < MAX_FAILED_ATTEMPTS) {
                <p class="mt-1 text-xs">
                  Tentative {{ failedAttempts() }}/{{ MAX_FAILED_ATTEMPTS }}
                </p>
              }
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="form-label text-primary-700">Email</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="form-input"
                [class.border-red-500]="form.get('email')?.invalid && form.get('email')?.touched"
                placeholder="votre@email.com"
              />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-red-500 text-xs mt-1">Email invalide</p>
              }
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
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-primary-600 transition-colors"
                >
                  @if (!showPassword()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                  @if (showPassword()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- CAPTCHA apres 3 tentatives echouees -->
            @if (showCaptcha()) {
              <div class="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <label for="captcha" class="form-label text-primary-700 mb-2">Verification de securite</label>
                <p class="text-primary-800 text-lg font-mono mb-2">
                  {{ captchaQuestion() }}
                </p>
                <input
                  type="number"
                  id="captcha"
                  formControlName="captcha"
                  class="form-input w-32"
                  placeholder="?"
                  [class.border-red-500]="captchaError()"
                />
                @if (captchaError()) {
                  <p class="text-red-500 text-xs mt-1">Reponse incorrecte</p>
                }
              </div>
            }

            <div class="flex items-center justify-between">
              <label for="rememberMe" class="flex items-center gap-2 text-sm text-secondary-600">
                <input type="checkbox" id="rememberMe" class="rounded border-secondary-300 bg-white text-primary-600" />
                Se souvenir de moi
              </label>
              <a routerLink="/auth/forgot-password" class="text-sm text-primary-600 hover:underline">
                Mot de passe oublié?
              </a>
            </div>

            <button
              type="submit"
              class="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              [disabled]="form.invalid || isLoading() || isBlocked() || (showCaptcha() && !isCaptchaValid())"
            >
              @if (isLoading()) {
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                Se connecter
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-secondary-600">
              Pas encore de compte ?
              <a routerLink="/auth/register" class="text-primary-600 hover:underline font-medium">Créer un compte</a>
            </p>
          </div>

          <div class="mt-8 pt-8 border-t border-secondary-200 text-center">
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
    .login-page {
      @apply min-h-screen flex flex-col md:flex-row relative;
    }

    /* Bouton Home */
    .home-button {
      @apply fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 hover:scale-110 transition-all duration-300;
    }

    .login-left {
      @apply hidden md:flex md:w-1/2 items-center justify-center p-8 relative overflow-hidden;
    }

    .login-right {
      @apply flex-1 flex items-center justify-center p-6;
    }

    .login-form {
      @apply w-full max-w-md p-8;
    }

    .form-label {
      @apply block text-sm font-medium text-secondary-700 mb-1;
    }

    .form-input {
      @apply w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors;
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
      width: 80px; height: 80px;
      top: 10%; left: 10%;
      animation-delay: 0s;
      animation-duration: 25s;
    }

    .particle-2 {
      width: 60px; height: 60px;
      top: 60%; left: 80%;
      animation-delay: -5s;
      animation-duration: 20s;
    }

    .particle-3 {
      width: 40px; height: 40px;
      top: 80%; left: 20%;
      animation-delay: -10s;
      animation-duration: 22s;
    }

    .particle-4 {
      width: 100px; height: 100px;
      top: 20%; left: 70%;
      animation-delay: -7s;
      animation-duration: 28s;
    }

    .particle-5 {
      width: 50px; height: 50px;
      top: 50%; left: 5%;
      animation-delay: -3s;
      animation-duration: 18s;
    }

    .particle-6 {
      width: 70px; height: 70px;
      top: 85%; left: 60%;
      animation-delay: -12s;
      animation-duration: 24s;
    }

    @keyframes float {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 0.3;
      }
      25% {
        transform: translate(30px, -30px) rotate(90deg);
        opacity: 0.5;
      }
      50% {
        transform: translate(-20px, 20px) rotate(180deg);
        opacity: 0.3;
      }
      75% {
        transform: translate(20px, 30px) rotate(270deg);
        opacity: 0.5;
      }
    }

    /* Cercles décoratifs */
    .circle-decoration {
      @apply absolute rounded-full border-2 border-white/10;
      animation: pulse-circle 8s infinite ease-in-out;
    }

    .circle-1 {
      width: 300px; height: 300px;
      top: -100px; right: -100px;
      animation-delay: 0s;
    }

    .circle-2 {
      width: 200px; height: 200px;
      bottom: -50px; left: -50px;
      animation-delay: -2s;
    }

    .circle-3 {
      width: 150px; height: 150px;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: -4s;
    }

    @keyframes pulse-circle {
      0%, 100% {
        transform: scale(1);
        opacity: 0.1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.2;
      }
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
        opacity: 0.6;
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
      50% { transform: translateY(-10px); }
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

    /* Feature items */
    .feature-item {
      @apply flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10;
      animation: slideInLeft 0.6s ease-out forwards;
      opacity: 0;
    }

    .feature-1 { animation-delay: 0.6s; }
    .feature-2 { animation-delay: 0.8s; }
    .feature-3 { animation-delay: 1s; }
    .feature-4 { animation-delay: 1.2s; }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .feature-icon {
      @apply w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white;
    }

    /* Badge pulse */
    .badge-pulse {
      animation: fadeInUp 0.8s ease-out forwards;
      animation-delay: 1.2s;
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
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private auditService = inject(AuditService);

  readonly MAX_FAILED_ATTEMPTS = MAX_FAILED_ATTEMPTS;

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  failedAttempts = signal(0);
  blockEndTime = signal<Date | null>(null);
  captchaError = signal(false);

  // CAPTCHA simple: addition de deux nombres
  private captchaA = signal(Math.floor(Math.random() * 10) + 1);
  private captchaB = signal(Math.floor(Math.random() * 10) + 1);

  showCaptcha = computed(() => this.failedAttempts() >= MAX_FAILED_ATTEMPTS);
  captchaQuestion = computed(() => `${this.captchaA()} + ${this.captchaB()} = ?`);
  captchaAnswer = computed(() => this.captchaA() + this.captchaB());

  isBlocked = computed(() => {
    const endTime = this.blockEndTime();
    if (!endTime) return false;
    return new Date() < endTime;
  });

  remainingBlockTime = computed(() => {
    const endTime = this.blockEndTime();
    if (!endTime) return '';
    const remaining = Math.max(0, endTime.getTime() - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  isCaptchaValid = computed(() => {
    const captchaValue = this.form.get('captcha')?.value;
    return captchaValue === this.captchaAnswer();
  });

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    captcha: [null as number | null],
  });

  private regenerateCaptcha(): void {
    this.captchaA.set(Math.floor(Math.random() * 10) + 1);
    this.captchaB.set(Math.floor(Math.random() * 10) + 1);
    this.form.patchValue({ captcha: null });
    this.captchaError.set(false);
  }

  private handleFailedAttempt(): void {
    const attempts = this.failedAttempts() + 1;
    this.failedAttempts.set(attempts);

    // AUDIT: Log de la tentative echouee pour detection brute force
    const email = this.form.get('email')?.value ?? '';
    this.auditService.logFailedLogin(email);

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      // Activer le blocage temporaire
      this.blockEndTime.set(new Date(Date.now() + BLOCK_DURATION_MS));
      this.regenerateCaptcha();

      // Lancer un timer pour mettre a jour l'affichage
      const interval = setInterval(() => {
        if (!this.isBlocked()) {
          clearInterval(interval);
          this.blockEndTime.set(null);
        }
      }, 1000);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isBlocked()) return;

    // Verifier le CAPTCHA si requis
    if (this.showCaptcha() && !this.isCaptchaValid()) {
      this.captchaError.set(true);
      this.regenerateCaptcha();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.captchaError.set(false);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          // Reinitialiser les tentatives en cas de succes
          this.failedAttempts.set(0);
          this.blockEndTime.set(null);
          this.toast.success('Connexion réussie');
          this.router.navigate(['/dashboard']);
        } else {
          this.handleFailedAttempt();
          this.errorMessage.set(res.error ?? 'Erreur de connexion');
          this.regenerateCaptcha();
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.handleFailedAttempt();
        this.errorMessage.set('Email ou mot de passe incorrect');
        this.regenerateCaptcha();
      },
    });
  }
}
