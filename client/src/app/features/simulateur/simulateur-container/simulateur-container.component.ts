import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-simulateur-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, BreadcrumbComponent],
  template: `
    <div class="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="sidebarCollapsed" />

        <main
          class="flex-1 transition-all duration-300"
          [class.ml-52]="!sidebarCollapsed"
          [class.ml-14]="sidebarCollapsed">
          <div class="p-4 md:p-6 lg:px-8">
            <!-- Breadcrumb -->
            <div class="mb-4">
              <app-breadcrumb />
            </div>

            <!-- Header -->
            <div class="mb-6">
              <h1 class="text-2xl font-bold text-secondary-900 dark:text-white">Simulateur fiscal</h1>
              <p class="text-secondary-600 dark:text-secondary-400 mt-1">Simulez vos impôts selon le CGI Congo-Brazzaville</p>
            </div>


            <!-- Contenu du simulateur -->
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class SimulateurContainerComponent {
  sidebarCollapsed = false;
}
