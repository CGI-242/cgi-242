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
      <!-- Section Gauche - Logo sur fond blanc -->
      <div class="register-left bg-white">
        <div class="text-center">
          <a routerLink="/">
            <img src="assets/images/logo_transp.webp" alt="CGI 242" class="h-48 md:h-64 cursor-pointer" />
          </a>
          <p class="text-primary-600 mt-4 text-lg font-medium">Assistant Fiscal IA</p>
          <p class="text-secondary-500 text-sm mt-2">Congo-Brazzaville</p>
        </div>
      </div>

      <!-- Section Droite - Formulaire sur fond bleu -->
      <div class="register-right bg-primary-600">
        <div class="register-form">
          <!-- Logo mobile -->
          <div class="text-center mb-6">
            <a routerLink="/" class="inline-block md:hidden">
              <img src="assets/images/logo_transp.webp" alt="CGI 242" class="h-16 mx-auto mb-4" />
            </a>
            <h2 class="text-2xl font-heading font-semibold text-white">
              Créer un compte
            </h2>
            <p class="text-white/70">Rejoignez CGI 242 gratuitement</p>
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
                <label for="firstName" class="form-label text-white/80">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  formControlName="firstName"
                  class="form-input"
                  placeholder="Jean">
              </div>
              <div>
                <label for="lastName" class="form-label text-white/80">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  formControlName="lastName"
                  class="form-input"
                  placeholder="Dupont">
              </div>
            </div>

            <div>
              <label for="email" class="form-label text-white/80">Email</label>
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
              <label for="profession" class="form-label text-white/80">Profession</label>
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
              <label for="password" class="form-label text-white/80">Mot de passe</label>
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
                <p class="text-red-300 text-xs mt-1">
                  Min. 8 caractères, une majuscule et un chiffre
                </p>
              }
              <!-- Indicateur de force du mot de passe -->
              @if (form.get('password')?.value) {
                <div class="mt-3 p-3 bg-white/10 rounded-lg">
                  <app-password-strength [password]="form.get('password')?.value || ''" [showDetails]="true" />
                </div>
              }
            </div>

            <div>
              <label for="confirmPassword" class="form-label text-white/80">Confirmer le mot de passe</label>
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
                <p class="text-red-300 text-xs mt-1">
                  Les mots de passe ne correspondent pas
                </p>
              }
            </div>

            <div class="flex items-start">
              <input
                type="checkbox"
                id="terms"
                formControlName="terms"
                class="mt-1 rounded border-white/30 bg-white/10 text-white focus:ring-white/50">
              <label for="terms" class="ml-2 text-sm text-white/80">
                J'accepte les <a href="#" class="text-white hover:underline">conditions d'utilisation</a>
                et la <a href="#" class="text-white hover:underline">politique de confidentialité</a>
              </label>
            </div>

            <button
              type="submit"
              class="w-full flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
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
            <p class="text-sm text-white/80">
              Déjà un compte ?
              <a routerLink="/auth/login" class="text-white hover:underline font-medium">Se connecter</a>
            </p>
          </div>

          <div class="mt-6 pt-6 border-t border-white/20 text-center">
            <p class="text-sm text-white/80">
              CGI 242 by NORMX AI
            </p>
            <p class="text-xs text-white/60 mt-1">
              Code Général des Impôts - Congo-Brazzaville
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      @apply min-h-screen flex flex-col md:flex-row;
    }

    .register-left {
      @apply hidden md:flex md:w-1/2 items-center justify-center p-8;
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
