import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Routes d'auth à ignorer pour éviter les boucles de logout
const AUTH_ROUTES = ['/auth/login', '/auth/logout', '/auth/register', '/auth/csrf-token'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Vérifier si c'est une route d'auth (évite boucle infinie de logout)
  const isAuthRoute = AUTH_ROUTES.some(route => req.url.includes(route));

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ne pas déclencher logout sur les routes d'auth pour éviter les boucles
      if (error.status === 401 && !isAuthRoute) {
        // Nettoyer l'état local sans appeler l'API logout
        localStorage.removeItem('cgi_user');
        router.navigate(['/auth/login']);
      }

      // Don't redirect for CSRF errors (handled by csrf interceptor)
      if (error.status === 403 && error.error?.code !== 'CSRF_INVALID') {
        router.navigate(['/forbidden']);
      }

      return throwError(() => error);
    })
  );
};
