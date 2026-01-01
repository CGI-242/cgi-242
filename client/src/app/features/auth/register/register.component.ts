import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div class="max-w-md w-full">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-lg">CGI</span>
          </div>
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
                <input
                  type="password"
                  id="password"
                  formControlName="password"
                  class="input"
                  [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched"
                  placeholder="Min. 8 caractères">
                @if (form.get('password')?.invalid && form.get('password')?.touched) {
                  <p class="text-red-500 text-xs mt-1">
                    Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre
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

  form = this.fb.nonNullable.group({
    firstName: [''],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    profession: [''],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/)]],
    terms: [false, Validators.requiredTrue],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password, firstName, lastName, profession } = this.form.getRawValue();

    this.authService.register({ email, password, firstName, lastName, profession }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.router.navigate(['/chat']);
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
