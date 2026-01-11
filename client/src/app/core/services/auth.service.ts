import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, ApiResponse } from './api.service';
import { Observable, tap, catchError, of, firstValueFrom } from 'rxjs';
import { LoggerService } from './logger.service';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profession: string | null;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  // Tokens gérés par cookies httpOnly (non accessibles en JS)
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profession?: string;
}

// Seules les données utilisateur sont stockées localement (pour l'état UI)
// Les tokens JWT sont gérés exclusivement via cookies httpOnly (protection XSS)
const USER_KEY = 'cgi_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private logger = inject(LoggerService);

  private userSignal = signal<User | null>(this.loadUser());

  user = this.userSignal.asReadonly();
  isAuthenticated = computed(() => !!this.userSignal());
  userFullName = computed(() => {
    const u = this.userSignal();
    if (!u) return '';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
  });

  register(data: RegisterData): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  login(credentials: LoginCredentials): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  /**
   * Déconnexion sécurisée
   * Appelle le backend pour invalider les tokens (blacklist) et supprimer les cookies
   */
  async logout(): Promise<void> {
    try {
      // Appeler le backend pour blacklister les tokens et supprimer les cookies httpOnly
      await firstValueFrom(this.api.post<null>('/auth/logout', {}));
    } catch {
      // En cas d'erreur réseau, on continue la déconnexion locale
      this.logger.warn('Logout API call failed, proceeding with local cleanup', 'AuthService');
    }

    // Nettoyer l'état local
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Déconnexion de toutes les sessions
   * Invalide tous les tokens de l'utilisateur sur tous les appareils
   */
  async logoutAll(): Promise<void> {
    try {
      await firstValueFrom(this.api.post<null>('/auth/logout-all', {}));
    } catch {
      this.logger.warn('Logout all API call failed', 'AuthService');
    }

    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  forgotPassword(email: string): Observable<ApiResponse<null>> {
    return this.api.post<null>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Observable<ApiResponse<null>> {
    return this.api.post<null>('/auth/reset-password', { token, password });
  }

  verifyEmail(token: string): Observable<ApiResponse<null>> {
    return this.api.get<null>('/auth/verify-email', { token });
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  updateProfile(data: Partial<Pick<User, 'firstName' | 'lastName' | 'profession'>>): Observable<ApiResponse<{ user: User }>> {
    return this.api.patch<{ user: User }>('/auth/profile', data).pipe(
      tap((res) => {
        if (res.success && res.data?.user) {
          this.userSignal.set(res.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        }
      })
    );
  }

  /**
   * Changer le mot de passe (utilisateur connecté)
   */
  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<null>> {
    return this.api.post<null>('/auth/change-password', { currentPassword, newPassword });
  }

  /**
   * Renvoyer l'email de vérification
   */
  resendVerificationEmail(): Observable<ApiResponse<null>> {
    return this.api.post<null>('/auth/resend-verification', {});
  }

  /**
   * Vérifie si l'utilisateur est authentifié en appelant le backend
   * Les cookies httpOnly sont envoyés automatiquement
   */
  refreshCurrentUser(): Observable<ApiResponse<{ user: User }>> {
    return this.api.get<{ user: User }>('/auth/me').pipe(
      tap((res) => {
        if (res.success && res.data?.user) {
          this.userSignal.set(res.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        }
      }),
      catchError(() => {
        // Session invalide, nettoyer l'état local sans appeler logout API
        localStorage.removeItem(USER_KEY);
        this.userSignal.set(null);
        return of({ success: false } as ApiResponse<{ user: User }>);
      })
    );
  }

  /**
   * Stocke uniquement les données utilisateur (pas les tokens)
   * Les tokens sont gérés par les cookies httpOnly côté serveur
   */
  private setSession(auth: AuthResponse): void {
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    this.userSignal.set(auth.user);
  }

  private loadUser(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }
}
