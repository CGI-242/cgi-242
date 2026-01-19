import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Informations personnelles -->
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <h2 class="text-lg font-semibold text-secondary-900 mb-4">Informations personnelles</h2>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Prénom -->
            <div>
              <label for="firstName" class="block text-sm font-medium text-secondary-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                formControlName="firstName"
                class="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Votre prénom"
              />
            </div>

            <!-- Nom -->
            <div>
              <label for="lastName" class="block text-sm font-medium text-secondary-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                formControlName="lastName"
                class="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <!-- Email (lecture seule) -->
          <div>
            <label for="email" class="block text-sm font-medium text-secondary-700 mb-1">
              Email
            </label>
            <div class="relative">
              <input
                type="email"
                id="email"
                [value]="authService.user()?.email"
                disabled
                class="w-full px-4 py-2 border border-secondary-200 rounded-lg bg-secondary-50 text-secondary-500 cursor-not-allowed"
              />
              @if (authService.user()?.isEmailVerified) {
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </span>
              }
            </div>
            @if (!authService.user()?.isEmailVerified) {
              <button
                type="button"
                (click)="resendVerification()"
                [disabled]="isResending()"
                class="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                {{ isResending() ? 'Envoi en cours...' : "Renvoyer l'email de vérification" }}
              </button>
            }
          </div>

          <!-- Profession -->
          <div>
            <label for="profession" class="block text-sm font-medium text-secondary-700 mb-1">
              Profession
            </label>
            <input
              type="text"
              id="profession"
              formControlName="profession"
              class="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Expert-comptable, Fiscaliste, Avocat..."
            />
          </div>

          <!-- Messages -->
          @if (successMessage()) {
            <div class="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {{ successMessage() }}
            </div>
          }

          @if (errorMessage()) {
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <!-- Submit -->
          <div class="flex justify-end">
            <button
              type="submit"
              [disabled]="isLoading() || !profileForm.dirty"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              } @else {
                Enregistrer les modifications
              }
            </button>
          </div>
        </form>
      </div>

      <!-- Statistiques -->
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <h2 class="text-lg font-semibold text-secondary-900 mb-4">Votre compte</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-secondary-50 rounded-lg">
            <p class="text-sm text-secondary-600">Membre depuis</p>
            <p class="text-lg font-semibold text-secondary-900">{{ memberSince }}</p>
          </div>
          <div class="p-4 bg-secondary-50 rounded-lg">
            <p class="text-sm text-secondary-600">Email vérifié</p>
            <p class="text-lg font-semibold" [class]="authService.user()?.isEmailVerified ? 'text-green-600' : 'text-amber-600'">
              {{ authService.user()?.isEmailVerified ? 'Oui' : 'Non' }}
            </p>
          </div>
          <div class="p-4 bg-secondary-50 rounded-lg">
            <p class="text-sm text-secondary-600">ID utilisateur</p>
            <p class="text-sm font-mono text-secondary-700 truncate" [title]="authService.user()?.id">
              {{ authService.user()?.id?.slice(0, 8) }}...
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileInfoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  authService = inject(AuthService);

  profileForm!: FormGroup;
  isLoading = signal(false);
  isResending = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  ngOnInit(): void {
    const user = this.authService.user();
    this.profileForm = this.fb.group({
      firstName: [user?.firstName ?? '', [Validators.maxLength(50)]],
      lastName: [user?.lastName ?? '', [Validators.maxLength(50)]],
      profession: [user?.profession ?? '', [Validators.maxLength(100)]],
    });
  }

  readonly memberSince = 'Récemment';

  onSubmit(): void {
    if (this.profileForm.invalid || !this.profileForm.dirty) return;

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toast.success('Profil mis à jour avec succès');
          this.profileForm.markAsPristine();
        } else {
          this.toast.error(res.error || 'Erreur lors de la mise à jour');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Erreur de connexion au serveur');
      },
    });
  }

  resendVerification(): void {
    this.isResending.set(true);
    this.authService.resendVerificationEmail().subscribe({
      next: (res) => {
        this.isResending.set(false);
        if (res.success) {
          this.toast.success({
            title: 'Email envoyé',
            message: 'Vérifiez votre boîte de réception',
          });
        } else {
          this.toast.error(res.error || 'Erreur lors de l\'envoi');
        }
      },
      error: () => {
        this.isResending.set(false);
        this.toast.error('Erreur de connexion au serveur');
      },
    });
  }
}
