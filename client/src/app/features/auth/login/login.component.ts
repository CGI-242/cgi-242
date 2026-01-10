import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <!-- Section Gauche - Branding avec logo -->
      <div class="login-left bg-primary-600">
        <div class="text-center">
          <a routerLink="/">
            <img src="assets/images/logo_transp.webp" alt="CGI 242" class="h-48 md:h-64 cursor-pointer" />
          </a>
          <p class="text-white/80 mt-4 text-lg">Assistant Fiscal IA</p>
          <p class="text-white/60 text-sm mt-2">Congo-Brazzaville</p>
        </div>
      </div>

      <!-- Section Droite - Formulaire -->
      <div class="login-right">
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

          <!-- Message d'erreur -->
          @if (errorMessage()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="form-label">Email</label>
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
              <label for="password" class="form-label">Mot de passe</label>
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

            <div class="flex items-center justify-between">
              <label for="rememberMe" class="flex items-center gap-2 text-sm text-secondary-600">
                <input type="checkbox" id="rememberMe" class="rounded border-secondary-300 text-primary-600" />
                Se souvenir de moi
              </label>
              <a routerLink="/auth/forgot-password" class="text-sm text-primary-600 hover:underline">
                Mot de passe oublié?
              </a>
            </div>

            <button
              type="submit"
              class="btn-primary w-full flex items-center justify-center gap-2"
              [disabled]="form.invalid || isLoading()"
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
            <p class="text-sm text-secondary-500">
              CGI 242 by NORMX AI
            </p>
            <p class="text-xs text-secondary-400 mt-1">
              Code Général des Impôts - Congo-Brazzaville
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      @apply min-h-screen flex flex-col md:flex-row;
    }

    .login-left {
      @apply hidden md:flex md:w-1/2 items-center justify-center p-8;
    }

    .login-right {
      @apply flex-1 flex items-center justify-center p-6 bg-secondary-50;
    }

    .login-form {
      @apply w-full max-w-md bg-white rounded-2xl shadow-lg p-8;
    }

    .form-label {
      @apply block text-sm font-medium text-secondary-700 mb-1;
    }

    .form-input {
      @apply w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(res.error ?? 'Erreur de connexion');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Email ou mot de passe incorrect');
      },
    });
  }
}
