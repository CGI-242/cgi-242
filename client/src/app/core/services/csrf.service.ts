import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';

interface CsrfResponse {
  success: boolean;
  data?: { csrfToken: string };
}

@Injectable({ providedIn: 'root' })
export class CsrfService {
  private http = inject(HttpClient);
  private tokenSignal = signal<string | null>(null);
  private fetchPromise: Promise<string | null> | null = null;

  token = this.tokenSignal.asReadonly();

  async fetchToken(): Promise<string | null> {
    // Avoid multiple concurrent fetches
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.doFetchToken();
    const token = await this.fetchPromise;
    this.fetchPromise = null;
    return token;
  }

  private async doFetchToken(): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<CsrfResponse>(`${environment.apiUrl}/auth/csrf-token`, {
          withCredentials: true,
        })
      );

      if (response.success && response.data?.csrfToken) {
        this.tokenSignal.set(response.data.csrfToken);
        return response.data.csrfToken;
      }
    } catch (error) {
      console.error('[CsrfService] Failed to fetch CSRF token:', error);
    }

    return null;
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  clearToken(): void {
    this.tokenSignal.set(null);
  }
}
