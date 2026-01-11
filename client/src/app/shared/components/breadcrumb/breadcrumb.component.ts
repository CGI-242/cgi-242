import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <nav aria-label="Fil d'Ariane" class="flex items-center text-sm">
      <!-- Home link -->
      <a
        routerLink="/dashboard"
        class="flex items-center text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        title="Accueil">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      </a>

      <!-- Breadcrumb items -->
      @for (item of breadcrumbService.breadcrumbs(); track item.route; let last = $last) {
        <!-- Separator -->
        <svg class="w-4 h-4 mx-2 text-secondary-400 dark:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>

        @if (last) {
          <!-- Current page (not clickable) -->
          <span class="font-medium text-secondary-900 dark:text-white truncate max-w-[200px]" [title]="item.label">
            {{ item.label }}
          </span>
        } @else {
          <!-- Link to parent page -->
          <a
            [routerLink]="item.route"
            class="text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate max-w-[150px]"
            [title]="item.label">
            {{ item.label }}
          </a>
        }
      }
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BreadcrumbComponent {
  breadcrumbService = inject(BreadcrumbService);
}
