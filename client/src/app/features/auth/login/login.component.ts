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
          <h1 class="text-2xl font-bold text-secondary-900">Connexion</h1>
          <p class="text-secondary-600 mt-2">Accédez à votre assistant fiscal IA</p>
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
                <label for="password" class="label">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  formControlName="password"
                  class="input"
                  [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched"
                  placeholder="Votre mot de passe">
              </div>

              <div class="flex items-center justify-between">
                <label class="flex items-center">
                  <input type="checkbox" class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500">
                  <span class="ml-2 text-sm text-secondary-600">Se souvenir de moi</span>
                </label>
                <a routerLink="/auth/forgot-password" class="text-sm link">Mot de passe oublié ?</a>
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
                    Connexion...
                  </span>
                } @else {
                  Se connecter
                }
              </button>
            </div>
          </form>

          <p class="text-center text-sm text-secondary-600 mt-6">
            Pas encore de compte ?
            <a routerLink="/auth/register" class="link">S'inscrire</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

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
