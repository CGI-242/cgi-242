import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import {
  AlertesFiscalesService,
  AlerteFiscale,
  AlerteType,
  AlerteCategorie,
  ALERTE_TYPE_LABELS,
  ALERTE_CATEGORIE_LABELS,
} from '../../core/services/alertes-fiscales.service';

@Component({
  selector: 'app-alertes-fiscales',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, HeaderComponent, SidebarComponent, BreadcrumbComponent],
  template: `
    <div class="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
      <app-header />

      <div class="flex">
        <app-sidebar [(collapsed)]="sidebarCollapsed" />

        <main
          class="flex-1 transition-all duration-300 p-4"
          [class.ml-52]="!sidebarCollapsed"
          [class.ml-14]="sidebarCollapsed">
          <div class="px-2">
            <!-- Breadcrumb -->
            <div class="mb-4">
              <app-breadcrumb />
            </div>

            <!-- Header -->
            <div class="mb-8">
              <h1 class="text-2xl font-bold text-secondary-900 dark:text-white">
                Alertes Fiscales
              </h1>
              <p class="text-secondary-600 dark:text-secondary-400 mt-1">
                Échéances, seuils, taux et sanctions du Code Général des Impôts
              </p>
            </div>

            <!-- Stats Cards -->
            @if (stats(); as statsData) {
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                @for (type of typesList; track type) {
                  <button
                    (click)="filterByType(type)"
                    class="card p-4 text-left transition-all hover:shadow-md"
                    [class.ring-2]="selectedType() === type"
                    [class.ring-primary-500]="selectedType() === type">
                    <div class="flex items-center gap-3">
                      <div [class]="getIconBgClass(type)" class="w-10 h-10 rounded-xl flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getTypeIcon(type)"/>
                        </svg>
                      </div>
                      <div>
                        <p class="text-2xl font-bold text-secondary-900 dark:text-white">{{ statsData[type] || 0 }}</p>
                        <p class="text-sm text-secondary-500 dark:text-secondary-400">{{ getTypeLabel(type) }}</p>
                      </div>
                    </div>
                  </button>
                }
              </div>
            }

            <!-- Filters -->
            <div class="card p-4 mb-6">
              <div class="flex flex-wrap gap-4 items-center">
                <!-- Filter by Type -->
                <div class="flex items-center gap-2">
                  <label for="filter-type" class="text-sm font-medium text-secondary-700 dark:text-secondary-300">Type:</label>
                  <select
                    id="filter-type"
                    (change)="onTypeChange($event)"
                    [value]="selectedType() || ''"
                    class="rounded-lg border-secondary-300 dark:border-secondary-600 dark:bg-secondary-700 dark:text-white text-sm focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Tous</option>
                    @for (type of typesList; track type) {
                      <option [value]="type">{{ getTypeLabel(type) }}</option>
                    }
                  </select>
                </div>

                <!-- Filter by Category -->
                <div class="flex items-center gap-2">
                  <label for="filter-categorie" class="text-sm font-medium text-secondary-700 dark:text-secondary-300">Catégorie:</label>
                  <select
                    id="filter-categorie"
                    (change)="onCategorieChange($event)"
                    [value]="selectedCategorie() || ''"
                    class="rounded-lg border-secondary-300 dark:border-secondary-600 dark:bg-secondary-700 dark:text-white text-sm focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Toutes</option>
                    @for (cat of categoriesList; track cat) {
                      <option [value]="cat">{{ getCategorieLabel(cat) }}</option>
                    }
                  </select>
                </div>

                <!-- Reset Button -->
                @if (hasFilters()) {
                  <button
                    (click)="resetFilters()"
                    class="ml-auto text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Réinitialiser
                  </button>
                }
              </div>
            </div>

            <!-- Loading -->
            @if (alertesService.isLoading()) {
              <div class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            } @else {
              <!-- Alertes List -->
              <div class="space-y-4">
                @for (alerte of filteredAlertes(); track alerte.id) {
                  <div
                    class="card p-5 hover:shadow-md transition-shadow cursor-pointer"
                    tabindex="0"
                    role="button"
                    (click)="openDetail(alerte)"
                    (keyup.enter)="openDetail(alerte)">
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex-1">
                        <!-- Header -->
                        <div class="flex items-center gap-3 mb-2">
                          <span [class]="getTypeBadgeClass(alerte.type)"
                                class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {{ getTypeLabel(alerte.type) }}
                          </span>
                          <span class="text-xs text-secondary-500 dark:text-secondary-400">
                            Article {{ alerte.articleNumero }}
                          </span>
                        </div>

                        <!-- Title -->
                        <h3 class="text-lg font-semibold text-secondary-900 dark:text-white mb-1">
                          {{ alerte.titre }}
                        </h3>

                        <!-- Description -->
                        <p class="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                          {{ alerte.description }}
                        </p>
                      </div>

                      <!-- Value -->
                      @if (alerte.valeur) {
                        <div class="text-right shrink-0">
                          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {{ alerte.valeur }}
                          </p>
                          @if (alerte.periodicite) {
                            <p class="text-xs text-secondary-500 dark:text-secondary-400">
                              {{ alerte.periodicite }}
                            </p>
                          }
                        </div>
                      }
                    </div>

                    <!-- Footer -->
                    <div class="mt-4 pt-3 border-t border-secondary-100 dark:border-secondary-700 flex items-center justify-between">
                      <span class="text-xs px-2 py-1 bg-secondary-100 dark:bg-secondary-700 rounded text-secondary-600 dark:text-secondary-400">
                        {{ getCategorieLabel(alerte.categorie) }}
                      </span>
                      <span class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
                        Voir détails
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                } @empty {
                  <div class="card text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p class="mt-4 text-secondary-600 dark:text-secondary-400">Aucune alerte trouvée</p>
                  </div>
                }
              </div>
            }
          </div>
        </main>
      </div>

      <!-- Detail Modal -->
      @if (selectedAlerte(); as alerte) {
        <div
          class="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          (click)="closeDetail()"
          (keyup.escape)="closeDetail()">
          <div class="flex min-h-screen items-center justify-center p-4">
            <div class="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true"></div>

            <div
              class="relative bg-white dark:bg-secondary-800 rounded-2xl shadow-xl max-w-2xl w-full p-6"
              role="document"
              (click)="$event.stopPropagation()"
              (keyup.enter)="$event.stopPropagation()"
              (keyup.escape)="closeDetail()"
              tabindex="-1">
              <!-- Close button -->
              <button
                type="button"
                (click)="closeDetail()"
                aria-label="Fermer"
                class="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <!-- Header -->
              <div class="flex items-center gap-3 mb-4">
                <div [class]="getIconBgClass(alerte.type)" class="w-12 h-12 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getTypeIcon(alerte.type)"/>
                  </svg>
                </div>
                <div>
                  <span [class]="getTypeBadgeClass(alerte.type)"
                        class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ getTypeLabel(alerte.type) }}
                  </span>
                </div>
              </div>

              <!-- Title & Value -->
              <div class="mb-6">
                <h2 class="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                  {{ alerte.titre }}
                </h2>
                @if (alerte.valeur) {
                  <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {{ alerte.valeur }}
                  </p>
                }
              </div>

              <!-- Description -->
              <div class="mb-6">
                <h3 class="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-2">Description</h3>
                <p class="text-secondary-700 dark:text-secondary-300">
                  {{ alerte.description }}
                </p>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-secondary-50 dark:bg-secondary-700/50 rounded-lg p-3">
                  <p class="text-xs text-secondary-500 dark:text-secondary-400">Article</p>
                  <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ alerte.articleNumero }}</p>
                </div>
                <div class="bg-secondary-50 dark:bg-secondary-700/50 rounded-lg p-3">
                  <p class="text-xs text-secondary-500 dark:text-secondary-400">Catégorie</p>
                  <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ getCategorieLabel(alerte.categorie) }}</p>
                </div>
                @if (alerte.periodicite) {
                  <div class="bg-secondary-50 dark:bg-secondary-700/50 rounded-lg p-3">
                    <p class="text-xs text-secondary-500 dark:text-secondary-400">Périodicité</p>
                    <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ alerte.periodicite }}</p>
                  </div>
                }
                @if (alerte.unite) {
                  <div class="bg-secondary-50 dark:bg-secondary-700/50 rounded-lg p-3">
                    <p class="text-xs text-secondary-500 dark:text-secondary-400">Unité</p>
                    <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ alerte.unite }}</p>
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <a
                  [routerLink]="['/code']"
                  [queryParams]="{ article: alerte.articleNumero }"
                  class="flex-1 btn-primary text-center">
                  Voir l'article {{ alerte.articleNumero }}
                </a>
                <button
                  (click)="closeDetail()"
                  class="px-4 py-2.5 border border-secondary-300 dark:border-secondary-600 rounded-lg text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AlertesFiscalesComponent implements OnInit {
  alertesService = inject(AlertesFiscalesService);

  sidebarCollapsed = false;

  // Lists for iteration
  typesList: AlerteType[] = ['ECHEANCE', 'SEUIL', 'TAUX', 'SANCTION', 'OBLIGATION'];
  categoriesList: AlerteCategorie[] = ['IS', 'PM_ETRANGERES', 'MINIMUM_PERCEPTION', 'PRIX_TRANSFERT', 'DECLARATIONS'];

  // Local state
  selectedType = signal<AlerteType | null>(null);
  selectedCategorie = signal<AlerteCategorie | null>(null);
  selectedAlerte = signal<AlerteFiscale | null>(null);

  // Computed
  stats = computed(() => this.alertesService.statsByType());

  filteredAlertes = computed(() => {
    let alertes = this.alertesService.alertes();
    const type = this.selectedType();
    const categorie = this.selectedCategorie();

    if (type) {
      alertes = alertes.filter(a => a.type === type);
    }
    if (categorie) {
      alertes = alertes.filter(a => a.categorie === categorie);
    }

    return alertes;
  });

  hasFilters = computed(() => this.selectedType() !== null || this.selectedCategorie() !== null);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.alertesService.loadAlertes().subscribe();
    this.alertesService.loadStatsByType().subscribe();
  }

  onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedType.set(value ? value as AlerteType : null);
  }

  onCategorieChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategorie.set(value ? value as AlerteCategorie : null);
  }

  filterByType(type: AlerteType): void {
    if (this.selectedType() === type) {
      this.selectedType.set(null);
    } else {
      this.selectedType.set(type);
    }
  }

  resetFilters(): void {
    this.selectedType.set(null);
    this.selectedCategorie.set(null);
  }

  openDetail(alerte: AlerteFiscale): void {
    this.selectedAlerte.set(alerte);
  }

  closeDetail(): void {
    this.selectedAlerte.set(null);
  }

  getTypeLabel(type: AlerteType): string {
    return ALERTE_TYPE_LABELS[type] || type;
  }

  getCategorieLabel(categorie: AlerteCategorie): string {
    return ALERTE_CATEGORIE_LABELS[categorie] || categorie;
  }

  getTypeBadgeClass(type: AlerteType): string {
    const colors: Record<AlerteType, string> = {
      ECHEANCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      SEUIL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      TAUX: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      SANCTION: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      OBLIGATION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return colors[type] || 'bg-secondary-100 text-secondary-800';
  }

  getIconBgClass(type: AlerteType): string {
    const colors: Record<AlerteType, string> = {
      ECHEANCE: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      SEUIL: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      TAUX: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      SANCTION: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      OBLIGATION: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[type] || 'bg-secondary-100 text-secondary-600';
  }

  getTypeIcon(type: AlerteType): string {
    const icons: Record<AlerteType, string> = {
      ECHEANCE: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      SEUIL: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      TAUX: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
      SANCTION: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      OBLIGATION: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[type] || '';
  }
}
