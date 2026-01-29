import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService, ApiResponse } from './api.service';
import { Observable, tap } from 'rxjs';

// Types
export type AlerteType = 'ECHEANCE' | 'SEUIL' | 'TAUX' | 'SANCTION' | 'OBLIGATION';
export type AlerteCategorie = 'IS' | 'PM_ETRANGERES' | 'MINIMUM_PERCEPTION' | 'PRIX_TRANSFERT' | 'DECLARATIONS';

export interface AlerteFiscale {
  id: string;
  type: AlerteType;
  categorie: AlerteCategorie;
  titre: string;
  description: string;
  valeur?: string;
  valeurNumerique?: number;
  unite?: string;
  periodicite?: string;
  articleId?: string;
  articleNumero: string;
  version: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  article?: {
    id: string;
    numero: string;
    titre?: string;
    contenu?: string;
  };
}

export interface AlertesResponse {
  alertes: AlerteFiscale[];
  total: number;
}

export interface AlerteFilters {
  type?: AlerteType;
  categorie?: AlerteCategorie;
  version?: string;
  articleNumero?: string;
  actif?: boolean;
}

export interface AlerteStats {
  ECHEANCE: number;
  SEUIL: number;
  TAUX: number;
  SANCTION: number;
  OBLIGATION: number;
}

export interface CategorieStats {
  IS: number;
  PM_ETRANGERES: number;
  MINIMUM_PERCEPTION: number;
  PRIX_TRANSFERT: number;
  DECLARATIONS: number;
}

// Labels pour l'affichage
export const ALERTE_TYPE_LABELS: Record<AlerteType, string> = {
  ECHEANCE: 'Échéance',
  SEUIL: 'Seuil',
  TAUX: 'Taux',
  SANCTION: 'Sanction',
  OBLIGATION: 'Obligation',
};

export const ALERTE_CATEGORIE_LABELS: Record<AlerteCategorie, string> = {
  IS: 'Impôt sur les sociétés',
  PM_ETRANGERES: 'PM étrangères',
  MINIMUM_PERCEPTION: 'Minimum de perception',
  PRIX_TRANSFERT: 'Prix de transfert',
  DECLARATIONS: 'Déclarations',
};

// Couleurs pour les badges
export const ALERTE_TYPE_COLORS: Record<AlerteType, string> = {
  ECHEANCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  SEUIL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  TAUX: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  SANCTION: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  OBLIGATION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

// Icônes pour les types
export const ALERTE_TYPE_ICONS: Record<AlerteType, string> = {
  ECHEANCE: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', // calendar
  SEUIL: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', // chart
  TAUX: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', // trending
  SANCTION: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', // warning
  OBLIGATION: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', // check-circle
};

@Injectable({ providedIn: 'root' })
export class AlertesFiscalesService {
  private api = inject(ApiService);

  // State
  alertes = signal<AlerteFiscale[]>([]);
  selectedAlerte = signal<AlerteFiscale | null>(null);
  isLoading = signal(false);
  total = signal(0);
  statsByType = signal<AlerteStats | null>(null);
  statsByCategorie = signal<CategorieStats | null>(null);

  // Filters
  currentFilters = signal<AlerteFilters>({});

  // Computed
  filteredAlertes = computed(() => {
    const filters = this.currentFilters();
    let result = this.alertes();

    if (filters.type) {
      result = result.filter(a => a.type === filters.type);
    }
    if (filters.categorie) {
      result = result.filter(a => a.categorie === filters.categorie);
    }

    return result;
  });

  alertesByType = computed(() => {
    const alertes = this.alertes();
    const grouped: Record<AlerteType, AlerteFiscale[]> = {
      ECHEANCE: [],
      SEUIL: [],
      TAUX: [],
      SANCTION: [],
      OBLIGATION: [],
    };

    alertes.forEach(a => {
      if (grouped[a.type]) {
        grouped[a.type].push(a);
      }
    });

    return grouped;
  });

  /**
   * Charge la liste des alertes fiscales
   */
  loadAlertes(filters?: AlerteFilters): Observable<ApiResponse<AlertesResponse>> {
    this.isLoading.set(true);

    const params: Record<string, string> = {};
    if (filters?.type) params['type'] = filters.type;
    if (filters?.categorie) params['categorie'] = filters.categorie;
    if (filters?.version) params['version'] = filters.version;
    if (filters?.articleNumero) params['articleNumero'] = filters.articleNumero;
    if (filters?.actif !== undefined) params['actif'] = filters.actif.toString();

    return this.api.get<AlertesResponse>('/alertes-fiscales', params).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.alertes.set(res.data.alertes);
          this.total.set(res.data.total);
        }
      })
    );
  }

  /**
   * Charge une alerte par son ID
   */
  loadAlerte(id: string): Observable<ApiResponse<AlerteFiscale>> {
    this.isLoading.set(true);

    return this.api.get<AlerteFiscale>(`/alertes-fiscales/${id}`).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.selectedAlerte.set(res.data);
        }
      })
    );
  }

  /**
   * Charge les alertes d'un article spécifique
   */
  loadAlertesForArticle(numero: string): Observable<ApiResponse<AlertesResponse>> {
    return this.api.get<AlertesResponse>(`/alertes-fiscales/article/${encodeURIComponent(numero)}`);
  }

  /**
   * Charge les statistiques par type
   */
  loadStatsByType(): Observable<ApiResponse<AlerteStats>> {
    return this.api.get<AlerteStats>('/alertes-fiscales/stats/by-type').pipe(
      tap(res => {
        if (res.success && res.data) {
          this.statsByType.set(res.data);
        }
      })
    );
  }

  /**
   * Charge les statistiques par catégorie
   */
  loadStatsByCategorie(): Observable<ApiResponse<CategorieStats>> {
    return this.api.get<CategorieStats>('/alertes-fiscales/stats/by-categorie').pipe(
      tap(res => {
        if (res.success && res.data) {
          this.statsByCategorie.set(res.data);
        }
      })
    );
  }

  /**
   * Met à jour les filtres
   */
  setFilters(filters: AlerteFilters): void {
    this.currentFilters.set(filters);
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.currentFilters.set({});
  }

  /**
   * Sélectionne une alerte
   */
  selectAlerte(alerte: AlerteFiscale | null): void {
    this.selectedAlerte.set(alerte);
  }

  /**
   * Obtient le label d'un type
   */
  getTypeLabel(type: AlerteType): string {
    return ALERTE_TYPE_LABELS[type] || type;
  }

  /**
   * Obtient le label d'une catégorie
   */
  getCategorieLabel(categorie: AlerteCategorie): string {
    return ALERTE_CATEGORIE_LABELS[categorie] || categorie;
  }

  /**
   * Obtient la classe CSS pour un type
   */
  getTypeColorClass(type: AlerteType): string {
    return ALERTE_TYPE_COLORS[type] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtient l'icône SVG path pour un type
   */
  getTypeIcon(type: AlerteType): string {
    return ALERTE_TYPE_ICONS[type] || '';
  }
}
