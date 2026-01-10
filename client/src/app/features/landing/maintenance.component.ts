import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-normx-off-white flex items-center justify-center px-4">
      <div class="max-w-lg w-full text-center">
        <!-- Logo -->
        <div class="mb-8">
          <a routerLink="/" class="inline-block">
            <span class="font-heading font-bold text-4xl text-primary-500">NORMX</span>
            <span class="text-secondary-400 text-4xl ml-1">AI</span>
          </a>
        </div>

        <!-- Icon -->
        <div class="w-24 h-24 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-8">
          <i class="ph ph-wrench text-5xl text-warning"></i>
        </div>

        <!-- Title -->
        <h1 class="text-3xl md:text-4xl font-heading font-bold text-secondary-800 mb-4">
          {{ productName }}
        </h1>

        <!-- Message -->
        <p class="text-lg text-secondary-600 mb-8">
          Ce produit est actuellement en cours de développement.
          <br>
          Revenez bientôt pour découvrir {{ productName }} !
        </p>

        <!-- Progress -->
        <div class="bg-white rounded-lg p-6 shadow-normx mb-8">
          <div class="flex justify-between text-sm text-secondary-500 mb-2">
            <span>Progression</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="h-3 bg-normx-light rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              [style.width.%]="progress">
            </div>
          </div>
        </div>

        <!-- Features coming -->
        <div class="text-left bg-white rounded-lg p-6 shadow-normx mb-8">
          <h3 class="font-heading font-semibold text-secondary-800 mb-4">
            Fonctionnalités à venir :
          </h3>
          <ul class="space-y-2">
            @for (feature of features; track feature) {
              <li class="flex items-center text-secondary-600">
                <i class="ph ph-clock text-warning mr-3"></i>
                {{ feature }}
              </li>
            }
          </ul>
        </div>

        <!-- CTA -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/" class="btn-primary">
            <i class="ph ph-arrow-left mr-2"></i>
            Retour à l'accueil
          </a>
          <a href="mailto:contact@normx-ai.com" class="btn-secondary">
            <i class="ph ph-envelope mr-2"></i>
            Nous contacter
          </a>
        </div>

        <!-- Footer -->
        <p class="text-secondary-400 text-sm mt-12">
          © {{ currentYear }} NORMX AI - Tous droits réservés
        </p>
      </div>
    </div>
  `
})
export class MaintenanceComponent implements OnInit {
  private route = inject(ActivatedRoute);

  productName = 'Ce produit';
  progress = 30;
  features: string[] = ['Fonctionnalité 1', 'Fonctionnalité 2', 'Fonctionnalité 3'];
  currentYear = new Date().getFullYear();

  ngOnInit() {
    const data = this.route.snapshot.data;
    if (data['productName']) {
      this.productName = data['productName'];
    }
    if (data['progress']) {
      this.progress = data['progress'];
    }
    if (data['features']) {
      this.features = data['features'];
    }
  }
}
