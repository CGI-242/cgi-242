import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationService } from '@core/services/organization.service';
import { AuthService } from '@core/services/auth.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-lg">CGI</span>
          </div>
        </div>

        <div class="card p-6 text-center">
          @if (isLoading()) {
            <app-loading-spinner size="lg" text="Traitement de l'invitation..." />
          } @else if (errorMessage()) {
            <div class="py-6">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-secondary-900 mb-2">Erreur</h2>
              <p class="text-secondary-600 mb-6">{{ errorMessage() }}</p>
              <a routerLink="/auth/login" class="btn-primary">Retour à la connexion</a>
            </div>
          } @else if (successMessage()) {
            <div class="py-6">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-secondary-900 mb-2">Bienvenue !</h2>
              <p class="text-secondary-600 mb-6">{{ successMessage() }}</p>
              <a routerLink="/chat" class="btn-primary">Accéder au chat</a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AcceptInvitationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrganizationService);
  private authService = inject(AuthService);

  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.isLoading.set(false);
      this.errorMessage.set("Token d'invitation manquant");
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirect: `/auth/accept-invitation?token=${token}` },
      });
      return;
    }

    this.acceptInvitation(token);
  }

  private acceptInvitation(token: string): void {
    this.orgService.acceptInvitation(token).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.successMessage.set("Vous avez rejoint l'organisation avec succès !");
        } else {
          this.errorMessage.set(res.error ?? "Erreur lors de l'acceptation");
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set("Cette invitation n'est plus valide ou a expiré");
      },
    });
  }
}
