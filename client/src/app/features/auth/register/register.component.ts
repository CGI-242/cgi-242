import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

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
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <!-- Lien retour vitrine -->
      <a routerLink="/landing" class="absolute top-6 left-6 flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        <span>Retour à l'accueil</span>
      </a>

      <div class="max-w-md w-full">
        <!-- Logo -->
        <div class="text-center mb-8">
          <a routerLink="/landing" class="inline-block">
            <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 hover:bg-primary-700 transition">
              <span class="text-white font-bold text-lg">CGI</span>
            </div>
          </a>
          <h1 class="text-2xl font-bold text-secondary-900">Créer un compte</h1>
          <p class="text-secondary-600 mt-2">Rejoignez CGI 242 gratuitement</p>
        </div>

        <!-- Form -->
        <div class="card p-6">
          @if (errorMessage()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="label">Prénom</label>
                  <input
                    type="text"
                    id="firstName"
                    formControlName="firstName"
                    class="input"
                    placeholder="Jean">
                </div>
                <div>
                  <label for="lastName" class="label">Nom</label>
                  <input
                    type="text"
                    id="lastName"
                    formControlName="lastName"
                    class="input"
                    placeholder="Dupont">
                </div>
              </div>

              <div>
                <label for="email" class="label">Email</label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  class="input"
                  [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched"
                  placeholder="votre@email.com">
                @if (form.get('email')?.invalid && form.get('email')?.touched) {
                  <p class="text-red-500 text-xs mt-1">Email invalide</p>
                }
              </div>

              <div>
                <label for="profession" class="label">Profession</label>
                <select id="profession" formControlName="profession" class="input">
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
                <label for="password" class="label">Mot de passe</label>
                <div class="relative">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    id="password"
                    formControlName="password"
                    class="input pr-10"
                    [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched"
                    placeholder="Min. 8 caractères">
                  <button
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600">
                    @if (showPassword()) {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    }
                  </button>
                </div>
                @if (form.get('password')?.invalid && form.get('password')?.touched) {
                  <p class="text-red-500 text-xs mt-1">
                    Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre
                  </p>
                }
              </div>

              <div>
                <label for="confirmPassword" class="label">Confirmer le mot de passe</label>
                <div class="relative">
                  <input
                    [type]="showConfirmPassword() ? 'text' : 'password'"
                    id="confirmPassword"
                    formControlName="confirmPassword"
                    class="input pr-10"
                    [class.input-error]="form.get('confirmPassword')?.touched && form.hasError('passwordMismatch')"
                    placeholder="Confirmez votre mot de passe">
                  <button
                    type="button"
                    (click)="showConfirmPassword.set(!showConfirmPassword())"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600">
                    @if (showConfirmPassword()) {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
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
                  class="mt-1 rounded border-secondary-300 text-primary-600 focus:ring-primary-500">
                <label for="terms" class="ml-2 text-sm text-secondary-600">
                  J'accepte les <a href="#" class="link">conditions d'utilisation</a>
                  et la <a href="#" class="link">politique de confidentialité</a>
                </label>
              </div>

              <button
                type="submit"
                class="btn-primary w-full"
                [disabled]="form.invalid || isLoading()">
                @if (isLoading()) {
                  <span class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Inscription...
                  </span>
                } @else {
                  Créer mon compte
                }
              </button>
            </div>
          </form>

          <p class="text-center text-sm text-secondary-600 mt-6">
            Déjà un compte ?
            <a routerLink="/auth/login" class="link">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

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
