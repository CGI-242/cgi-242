import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-lg">CGI</span>
          </div>
          <h1 class="text-2xl font-bold text-secondary-900">Mot de passe oublié</h1>
          <p class="text-secondary-600 mt-2">Entrez votre email pour réinitialiser votre mot de passe</p>
        </div>

        <div class="card p-6">
          @if (successMessage()) {
            <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {{ successMessage() }}
            </div>
          }

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
                  placeholder="votre@email.com">
              </div>

              <button
                type="submit"
                class="btn-primary w-full"
                [disabled]="form.invalid || isLoading()">
                @if (isLoading()) {
                  Envoi en cours...
                } @else {
                  Envoyer le lien
                }
              </button>
            </div>
          </form>

          <p class="text-center text-sm text-secondary-600 mt-6">
            <a routerLink="/auth/login" class="link">Retour à la connexion</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.forgotPassword(this.form.getRawValue().email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set(
          'Si cette adresse existe, vous recevrez un email de réinitialisation.'
        );
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Une erreur est survenue');
      },
    });
  }
}
