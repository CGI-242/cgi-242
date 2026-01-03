import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-secondary-900 mb-2">Calculateur {{ title }}</h2>
        <p class="text-secondary-600 mb-6">Ce calculateur sera bientôt disponible.</p>
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-lg text-sm text-secondary-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          En cours de développement
        </div>
      </div>
    </div>
  `,
})
export class ComingSoonComponent {
  private route = inject(ActivatedRoute);
  title = this.route.snapshot.data['title'] || 'Calculateur';
}
