import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService, ApiResponse } from './api.service';
import { Observable, tap } from 'rxjs';

export interface Article {
  id: string;
  numero: string;
  titre?: string;
  chapeau?: string;
  contenu: string;
  tome?: string;
  chapitre?: string;
  version?: string; // "2025" ou "2026"
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  limit: number;
  offset: number;
}

export interface CgiStructure {
  tomes: string[];
  chapitres: string[];
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private api = inject(ApiService);

  // State
  articles = signal<Article[]>([]);
  structure = signal<CgiStructure>({ tomes: [], chapitres: [] });
  selectedArticle = signal<Article | null>(null);
  isLoading = signal(false);
  total = signal(0);
  currentVersion = signal<'2025' | '2026'>('2025');

  // Computed
  filteredArticles = computed(() => {
    const version = this.currentVersion();
    return this.articles().filter(a => !a.version || a.version === version);
  });

  /**
   * Charge la liste des articles
   */
  loadArticles(options?: {
    limit?: number;
    offset?: number;
    tome?: string;
    chapitre?: string;
    search?: string;
  }): Observable<ApiResponse<ArticlesResponse>> {
    this.isLoading.set(true);

    const params: Record<string, string> = {};
    // Toujours passer la version courante
    params['version'] = this.currentVersion();
    if (options?.limit) params['limit'] = options.limit.toString();
    if (options?.offset) params['offset'] = options.offset.toString();
    if (options?.tome) params['tome'] = options.tome;
    if (options?.chapitre) params['chapitre'] = options.chapitre;
    if (options?.search) params['search'] = options.search;

    return this.api.get<ArticlesResponse>('/articles', params).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.articles.set(res.data.articles);
          this.total.set(res.data.total);
        }
      })
    );
  }

  /**
   * Charge la structure du CGI (tomes, chapitres)
   */
  loadStructure(): Observable<ApiResponse<CgiStructure>> {
    return this.api.get<CgiStructure>('/articles/structure').pipe(
      tap(res => {
        if (res.success && res.data) {
          this.structure.set(res.data);
        }
      })
    );
  }

  /**
   * Charge un article spécifique
   */
  loadArticle(numero: string): Observable<ApiResponse<Article>> {
    return this.api.get<Article>(`/articles/${encodeURIComponent(numero)}`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.selectedArticle.set(res.data);
        }
      })
    );
  }

  /**
   * Change la version du CGI affichée
   */
  setVersion(version: '2025' | '2026'): void {
    this.currentVersion.set(version);
  }

  /**
   * Sélectionne un article
   */
  selectArticle(article: Article | null): void {
    this.selectedArticle.set(article);
  }
}
