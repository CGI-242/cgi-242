import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'cgi242-theme';

  // Theme preference (what the user selected)
  private themePreference = signal<Theme>('system');

  // Actual applied theme (light or dark)
  private appliedTheme = signal<'light' | 'dark'>('light');

  // Public readonly signals
  readonly preference = this.themePreference.asReadonly();
  readonly isDark = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      this.watchSystemTheme();

      // Effect to apply theme changes
      effect(() => {
        const pref = this.themePreference();
        this.applyTheme(pref);
      });
    }
  }

  private initializeTheme(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      this.themePreference.set(stored);
    } else {
      this.themePreference.set('system');
    }
  }

  private watchSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.themePreference() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  private applyTheme(theme: Theme): void {
    let isDarkMode: boolean;

    if (theme === 'system') {
      isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDarkMode = theme === 'dark';
    }

    // Apply to document
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    this.appliedTheme.set(isDarkMode ? 'dark' : 'light');
    this.isDark.set(isDarkMode);
  }

  setTheme(theme: Theme): void {
    this.themePreference.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  toggle(): void {
    const current = this.isDark();
    this.setTheme(current ? 'light' : 'dark');
  }

  cycleTheme(): void {
    const current = this.themePreference();
    const order: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = order.indexOf(current);
    const nextIndex = (currentIndex + 1) % order.length;
    this.setTheme(order[nextIndex]);
  }
}
