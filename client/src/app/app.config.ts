import { ApplicationConfig, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { tenantInterceptor } from './core/interceptors/tenant.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { csrfInterceptor } from './core/interceptors/csrf.interceptor';
import { AuthService } from './core/services/auth.service';
// Chart.js registration - ng2-charts handles this internally via NgChartsModule
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

/**
 * Valide la session utilisateur au démarrage de l'application
 * Vérifie que les cookies httpOnly sont valides auprès du backend
 */
function initializeAuth(authService: AuthService) {
  return async () => {
    // Si l'utilisateur a des données en localStorage, valider la session
    if (authService.isAuthenticated()) {
      try {
        await firstValueFrom(authService.refreshCurrentUser());
      } catch {
        // Session invalide, l'utilisateur sera déconnecté automatiquement
      }
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([csrfInterceptor, authInterceptor, tenantInterceptor, errorInterceptor])
    ),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authService = inject(AuthService);
        return initializeAuth(authService);
      },
      multi: true,
    },
  ],
};
