import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-profile-security',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Changement de mot de passe -->
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-secondary-900">Changer le mot de passe</h2>
            <p class="text-sm text-secondary-600">Mettez à jour votre mot de passe régulièrement pour plus de sécurité</p>
          </div>
        </div>

        <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Mot de passe actuel -->
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-secondary-700 mb-1">
              Mot de passe actuel
            </label>
            <div class="relative">
              <input
                [type]="showCurrentPassword() ? 'text' : 'password'"
                id="currentPassword"
                formControlName="currentPassword"
                class="w-full px-4 py-2 pr-10 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Entrez votre mot de passe actuel"
              />
              <button
                type="button"
                (click)="showCurrentPassword.set(!showCurrentPassword())"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600">
                @if (showCurrentPassword()) {
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
          </div>

          <!-- Nouveau mot de passe -->
          <div>
            <label for="newPassword" class="block text-sm font-medium text-secondary-700 mb-1">
              Nouveau mot de passe
            </label>
            <div class="relative">
              <input
                [type]="showNewPassword() ? 'text' : 'password'"
                id="newPassword"
                formControlName="newPassword"
                class="w-full px-4 py-2 pr-10 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Minimum 8 caractères"
              />
              <button
                type="button"
                (click)="showNewPassword.set(!showNewPassword())"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600">
                @if (showNewPassword()) {
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
            <!-- Critères du mot de passe -->
            <div class="mt-2 space-y-1">
              <p class="text-xs" [class]="hasMinLength ? 'text-green-600' : 'text-secondary-500'">
                <span class="mr-1">{{ hasMinLength ? '✓' : '○' }}</span> Au moins 8 caractères
              </p>
              <p class="text-xs" [class]="hasUppercase ? 'text-green-600' : 'text-secondary-500'">
                <span class="mr-1">{{ hasUppercase ? '✓' : '○' }}</span> Une lettre majuscule
              </p>
              <p class="text-xs" [class]="hasLowercase ? 'text-green-600' : 'text-secondary-500'">
                <span class="mr-1">{{ hasLowercase ? '✓' : '○' }}</span> Une lettre minuscule
              </p>
              <p class="text-xs" [class]="hasNumber ? 'text-green-600' : 'text-secondary-500'">
                <span class="mr-1">{{ hasNumber ? '✓' : '○' }}</span> Un chiffre
              </p>
            </div>
          </div>

          <!-- Confirmer le nouveau mot de passe -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-secondary-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              [type]="showNewPassword() ? 'text' : 'password'"
              id="confirmPassword"
              formControlName="confirmPassword"
              class="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Confirmez votre nouveau mot de passe"
            />
            @if (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmPassword')?.touched) {
              <p class="mt-1 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
            }
          </div>

          <!-- Messages -->
          @if (successMessage()) {
            <div class="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              {{ successMessage() }}
            </div>
          }

          @if (errorMessage()) {
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              {{ errorMessage() }}
            </div>
          }

          <!-- Submit -->
          <div class="flex justify-end">
            <button
              type="submit"
              [disabled]="isLoading() || passwordForm.invalid"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Modification en cours...
              } @else {
                Changer le mot de passe
              }
            </button>
          </div>
        </form>
      </div>

      <!-- Sessions actives -->
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-secondary-900">Sessions actives</h2>
              <p class="text-sm text-secondary-600">Gérez vos connexions sur différents appareils</p>
            </div>
          </div>
        </div>

        <div class="border border-secondary-200 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-secondary-900">Session actuelle</p>
                <p class="text-sm text-secondary-500">Cet appareil</p>
              </div>
            </div>
            <span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
          </div>
        </div>

        <button
          (click)="logoutAllSessions()"
          [disabled]="isLoggingOutAll()"
          class="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
          @if (isLoggingOutAll()) {
            Déconnexion en cours...
          } @else {
            Se déconnecter de toutes les sessions
          }
        </button>
      </div>

      <!-- Conseils de sécurité -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 class="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Conseils de sécurité
        </h3>
        <ul class="space-y-2 text-sm text-blue-800">
          <li class="flex items-start gap-2">
            <span class="text-blue-500 mt-0.5">•</span>
            Utilisez un mot de passe unique pour chaque compte
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-500 mt-0.5">•</span>
            Changez votre mot de passe régulièrement (tous les 3-6 mois)
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-500 mt-0.5">•</span>
            N'utilisez jamais d'informations personnelles dans votre mot de passe
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-500 mt-0.5">•</span>
            Utilisez un gestionnaire de mots de passe (LastPass, 1Password, Dashlane)
          </li>
        </ul>
      </div>
    </div>
  `,
})
export class ProfileSecurityComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  passwordForm: FormGroup;
  isLoading = signal(false);
  isLoggingOutAll = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/[A-Z]/),
        Validators.pattern(/[a-z]/),
        Validators.pattern(/[0-9]/),
      ]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  get hasMinLength(): boolean {
    return (this.passwordForm.get('newPassword')?.value?.length ?? 0) >= 8;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordForm.get('newPassword')?.value ?? '');
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.passwordForm.get('newPassword')?.value ?? '');
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.passwordForm.get('newPassword')?.value ?? '');
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toast.success({
            title: 'Mot de passe modifié',
            message: 'Votre mot de passe a été changé avec succès',
          });
          this.passwordForm.reset();
        } else {
          this.toast.error(res.error || 'Mot de passe actuel incorrect');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Erreur de connexion au serveur');
      },
    });
  }

  logoutAllSessions(): void {
    this.isLoggingOutAll.set(true);
    this.authService.logoutAll();
  }
}
