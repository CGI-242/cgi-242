import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepteur HTTP pour l'authentification par cookies httpOnly
 *
 * Sécurité:
 * - withCredentials: true → envoie automatiquement les cookies httpOnly
 * - Pas de header Authorization → les tokens ne sont JAMAIS accessibles en JavaScript
 * - Protection totale contre les attaques XSS (tokens inaccessibles)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Cloner la requête avec withCredentials pour envoyer les cookies httpOnly
  // Le serveur vérifiera les cookies cgi_access_token et cgi_refresh_token
  const clonedReq = req.clone({ withCredentials: true });

  return next(clonedReq);
};
