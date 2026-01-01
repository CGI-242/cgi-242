import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, ApiResponse } from './api.service';
import { Observable, tap, catchError, of } from 'rxjs';

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
  accessToken: string;
  refreshToken: string;
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

const TOKEN_KEY = 'cgi_access_token';
const REFRESH_KEY = 'cgi_refresh_token';
const USER_KEY = 'cgi_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

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

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
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

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  refreshCurrentUser(): Observable<ApiResponse<{ user: User }>> {
    return this.api.get<{ user: User }>('/auth/me').pipe(
      tap((res) => {
        if (res.success && res.data?.user) {
          this.userSignal.set(res.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        }
      }),
      catchError(() => {
        this.logout();
        return of({ success: false } as ApiResponse<{ user: User }>);
      })
    );
  }

  private setSession(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_KEY, auth.refreshToken);
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
