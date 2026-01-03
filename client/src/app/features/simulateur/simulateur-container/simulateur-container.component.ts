import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-simulateur-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="sidebarCollapsed" />

        <main
          class="flex-1 transition-all duration-300"
          [class.ml-56]="!sidebarCollapsed"
          [class.ml-14]="sidebarCollapsed">
          <div class="p-6">
            <!-- Header -->
            <div class="mb-6">
              <h1 class="text-2xl font-bold text-secondary-900">Simulateur fiscal</h1>
              <p class="text-secondary-600 mt-1">Simulez vos impôts selon le CGI Congo-Brazzaville</p>
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
