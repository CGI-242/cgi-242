import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '@core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        (click)="toggleDropdown()"
        class="flex items-center justify-center w-9 h-9 rounded-lg text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700 transition-colors"
        [attr.aria-label]="'Theme: ' + themeService.preference()"
        [title]="getTooltip()">
        <!-- Sun icon (light mode) -->
        @if (!themeService.isDark()) {
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        }
        <!-- Moon icon (dark mode) -->
        @if (themeService.isDark()) {
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        }
      </button>

      <!-- Dropdown menu -->
      @if (isOpen) {
        <div
          class="absolute right-0 mt-2 w-36 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 py-1 z-50"
          (clickOutside)="isOpen = false">
          <button
            (click)="setTheme('light')"
            class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-secondary-100 dark:hover:bg-secondary-700"
            [class.text-primary-600]="themeService.preference() === 'light'"
            [class.dark:text-primary-400]="themeService.preference() === 'light'"
            [class.text-secondary-700]="themeService.preference() !== 'light'"
            [class.dark:text-secondary-300]="themeService.preference() !== 'light'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            Clair
            @if (themeService.preference() === 'light') {
              <svg class="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            }
          </button>
          <button
            (click)="setTheme('dark')"
            class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-secondary-100 dark:hover:bg-secondary-700"
            [class.text-primary-600]="themeService.preference() === 'dark'"
            [class.dark:text-primary-400]="themeService.preference() === 'dark'"
            [class.text-secondary-700]="themeService.preference() !== 'dark'"
            [class.dark:text-secondary-300]="themeService.preference() !== 'dark'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
            Sombre
            @if (themeService.preference() === 'dark') {
              <svg class="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            }
          </button>
          <button
            (click)="setTheme('system')"
            class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-secondary-100 dark:hover:bg-secondary-700"
            [class.text-primary-600]="themeService.preference() === 'system'"
            [class.dark:text-primary-400]="themeService.preference() === 'system'"
            [class.text-secondary-700]="themeService.preference() !== 'system'"
            [class.dark:text-secondary-300]="themeService.preference() !== 'system'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Système
            @if (themeService.preference() === 'system') {
              <svg class="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            }
          </button>
        </div>
      }
    </div>
  `,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.isOpen = false;
  }

  getTooltip(): string {
    const pref = this.themeService.preference();
    const labels: Record<Theme, string> = {
      light: 'Mode clair',
      dark: 'Mode sombre',
      system: 'Thème système',
    };
    return labels[pref];
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-theme-toggle')) {
      this.isOpen = false;
    }
  }
}
