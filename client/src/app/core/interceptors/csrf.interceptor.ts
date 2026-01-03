import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { CsrfService } from '../services/csrf.service';

const CSRF_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfService = inject(CsrfService);

  // Only add CSRF token for methods that modify data
  if (!CSRF_METHODS.includes(req.method.toUpperCase())) {
    return next(req);
  }

  // Skip CSRF for external URLs
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  const token = csrfService.getToken();

  // If we have a token, add it to the request
  if (token) {
    const clonedReq = req.clone({
      setHeaders: { 'X-CSRF-Token': token },
      withCredentials: true,
    });

    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // If CSRF error, try to refresh token and retry once
        if (error.status === 403 && error.error?.code === 'CSRF_INVALID') {
          return from(csrfService.fetchToken()).pipe(
            switchMap((newToken) => {
              if (newToken) {
                const retryReq = req.clone({
                  setHeaders: { 'X-CSRF-Token': newToken },
                  withCredentials: true,
                });
                return next(retryReq);
              }
              return throwError(() => error);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  // No token yet - fetch one first, then make the request
  return from(csrfService.fetchToken()).pipe(
    switchMap((newToken) => {
      if (newToken) {
        const clonedReq = req.clone({
          setHeaders: { 'X-CSRF-Token': newToken },
          withCredentials: true,
        });
        return next(clonedReq);
      }
      // No token available, try without (will likely fail)
      return next(req.clone({ withCredentials: true }));
    })
  );
};
