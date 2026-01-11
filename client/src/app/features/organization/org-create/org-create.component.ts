import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrganizationService } from '@core/services/organization.service';
import { TenantService } from '@core/services/tenant.service';
import { ToastService } from '@core/services/toast.service';
import { HeaderComponent } from '@shared/components/header/header.component';

@Component({
  selector: 'app-org-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HeaderComponent],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <app-header />

      <div class="max-w-2xl mx-auto py-12 px-4">
        <div class="mb-8">
          <a routerLink="/dashboard" class="text-sm text-secondary-600 hover:text-secondary-900 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Retour
          </a>
        </div>

        <div class="card p-8">
          <h1 class="text-2xl font-bold text-secondary-900 mb-2">Créer une organisation</h1>
          <p class="text-secondary-600 mb-8">
            Créez un espace de travail pour votre équipe et collaborez sur vos recherches fiscales.
          </p>

          @if (errorMessage()) {
            <div class="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="space-y-6">
              <div>
                <label for="name" class="label">Nom de l'organisation *</label>
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  class="input"
                  placeholder="Cabinet Dupont & Associés">
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <p class="text-red-500 text-xs mt-1">Le nom est requis</p>
                }
              </div>

              <div>
                <label for="slug" class="label">URL personnalisée</label>
                <div class="flex">
                  <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-secondary-300 bg-secondary-50 text-secondary-500 text-sm">
                    cgi-242.com/org/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    formControlName="slug"
                    class="input rounded-l-none"
                    placeholder="cabinet-dupont">
                </div>
                <p class="text-xs text-secondary-500 mt-1">
                  Lettres minuscules, chiffres et tirets uniquement
                </p>
              </div>

              <div>
                <label for="website" class="label">Site web</label>
                <input
                  type="url"
                  id="website"
                  formControlName="website"
                  class="input"
                  placeholder="https://www.cabinet-dupont.com">
              </div>

              <div>
                <label for="phone" class="label">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  formControlName="phone"
                  class="input"
                  placeholder="+242 06 xxx xxxx">
              </div>

              <div class="pt-4 flex gap-4">
                <button
                  type="button"
                  routerLink="/dashboard"
                  class="btn-outline flex-1">
                  Annuler
                </button>
                <button
                  type="submit"
                  class="btn-primary flex-1"
                  [disabled]="form.invalid || isLoading()">
                  @if (isLoading()) {
                    Création...
                  } @else {
                    Créer l'organisation
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class OrgCreateComponent {
  private fb = inject(FormBuilder);
  private orgService = inject(OrganizationService);
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private toast = inject(ToastService);

  isLoading = signal(false);
  errorMessage = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', Validators.pattern(/^[a-z0-9-]+$/)],
    website: [''],
    phone: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const data = this.form.getRawValue();

    this.orgService.createOrganization(data).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.tenantService.setOrganizationContext({
            id: res.data.id,
            name: res.data.name,
            slug: res.data.slug,
            role: 'OWNER',
          });
          this.toast.success({
            title: 'Organisation créée',
            message: `${res.data.name} a été créée avec succès`
          });
          this.router.navigate(['/organization']);
        } else {
          this.errorMessage.set(res.error ?? 'Erreur lors de la création');
          this.toast.error(res.error ?? 'Erreur lors de la création');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Erreur lors de la création');
        this.toast.error('Erreur lors de la création');
      },
    });
  }
}
