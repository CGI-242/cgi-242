import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { tenantInterceptor } from './core/interceptors/tenant.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { csrfInterceptor } from './core/interceptors/csrf.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([csrfInterceptor, authInterceptor, tenantInterceptor, errorInterceptor])
    ),
    provideAnimations(),
  ],
};
