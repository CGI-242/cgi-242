import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ArticlesService, Article } from '@core/services/articles.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { AudioButtonComponent } from '@shared/components/audio-button/audio-button.component';
import { CodeSommaireComponent, SommaireSelection } from '../code-sommaire/code-sommaire.component';

@Component({
  selector: 'app-code-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, CodeSommaireComponent, AudioButtonComponent],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="sidebarCollapsed" />

        <main
          class="flex-1 transition-all duration-300"
          [class.ml-64]="!sidebarCollapsed"
          [class.ml-14]="sidebarCollapsed">
          <div class="flex h-[calc(100vh-5rem)]">
            <!-- Sidebar navigation -->
            <div class="w-[640px] border-r border-secondary-200 bg-white flex flex-col">
              <!-- Header avec version -->
              <div class="p-4 border-b border-secondary-200 bg-primary-50">
                <h2 class="font-semibold text-primary-900">CGI {{ articlesService.currentVersion() }}</h2>
                <p class="text-xs text-primary-600 mt-1">Code Général des Impôts</p>
              </div>

              <!-- Tabs Sommaire / Articles -->
              <div class="flex border-b border-secondary-200">
                <button
                  (click)="activeTab.set('sommaire')"
                  class="flex-1 py-2.5 text-sm font-medium transition-colors"
                  [class.text-primary-600]="activeTab() === 'sommaire'"
                  [class.border-b-2]="activeTab() === 'sommaire'"
                  [class.border-primary-600]="activeTab() === 'sommaire'"
                  [class.text-secondary-500]="activeTab() !== 'sommaire'">
                  Sommaire
                </button>
                <button
                  (click)="activeTab.set('articles')"
                  class="flex-1 py-2.5 text-sm font-medium transition-colors"
                  [class.text-primary-600]="activeTab() === 'articles'"
                  [class.border-b-2]="activeTab() === 'articles'"
                  [class.border-primary-600]="activeTab() === 'articles'"
                  [class.text-secondary-500]="activeTab() !== 'articles'">
                  Articles
                </button>
              </div>

              <!-- Tab content -->
              @if (activeTab() === 'sommaire') {
                <!-- Sommaire officiel -->
                <div class="flex-1 overflow-y-auto">
                  <app-code-sommaire
                    [version]="articlesService.currentVersion()"
                    (selection)="onSommaireSelect($event)" />
                </div>
              } @else {
                <!-- Search -->
                <div class="p-4 border-b border-secondary-200">
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                      type="text"
                      [(ngModel)]="searchQuery"
                      (input)="onSearch()"
                      placeholder="Rechercher un article..."
                      class="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  </div>
                </div>

                <!-- Articles list -->
                <div class="flex-1 overflow-y-auto">
                  @if (articlesService.isLoading()) {
                    <div class="flex items-center justify-center h-32">
                      <div class="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  } @else {
                    <div class="divide-y divide-secondary-100">
                      @for (article of filteredArticles(); track article.id; let i = $index) {
                        <!-- Séparateur sous-section si c'est le premier article de la sous-section -->
                        @if (getSousSectionHeader(article.numero); as ssHeader) {
                          <div class="px-3 py-2 bg-primary-100 border-l-4 border-primary-500">
                            <span class="text-sm font-semibold text-primary-800">Sous-section {{ ssHeader }}</span>
                          </div>
                        }
                        <!-- Header point romain (I. Personnes imposables, II. Lieu d'imposition) -->
                        @if (getRomanHeader(article, i); as romanHeader) {
                          <div class="px-3 py-2 bg-primary-50 border-l-4 border-primary-400">
                            <span class="text-sm font-semibold text-primary-700">{{ romanHeader }}</span>
                          </div>
                        }
                        <!-- Sous-header de paragraphe (1) Définition, 2) Exemptions...) -->
                        @if (isFirstOfParagraph(article, i)) {
                          <div class="px-3 py-2 bg-primary-50 border-l-3 border-primary-400 ml-2">
                            <span class="text-sm font-semibold text-primary-700">{{ getParagraphHeader(article) }}</span>
                          </div>
                        }
                        <!-- Sous-header de lettre (a) Régime du forfait, b) Régime du réel...) -->
                        @if (isFirstOfLetter(article, i)) {
                          <div class="px-3 py-2 bg-secondary-50 border-l-2 border-secondary-400 ml-4">
                            <span class="text-sm font-semibold text-secondary-700">{{ getLetterHeader(article) }}</span>
                          </div>
                        }
                        <button
                          (click)="selectArticle(article)"
                          class="w-full text-left px-3 py-1.5 hover:bg-secondary-50 transition-colors flex items-center gap-2"
                          [class.bg-primary-50]="selectedArticle()?.id === article.id"
                          [class.border-l-2]="selectedArticle()?.id === article.id"
                          [class.border-l-primary-600]="selectedArticle()?.id === article.id">
                          <span class="font-medium text-primary-700 text-base whitespace-nowrap">Art. {{ article.numero }}</span>
                          @if (article.titre) {
                            <span class="text-sm text-secondary-500 truncate">{{ getCleanTitle(article.titre) }}</span>
                          }
                        </button>
                      } @empty {
                        <div class="p-3 text-center text-secondary-500 text-base">
                          Aucun article trouvé
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Total count -->
                <div class="p-3 border-t border-secondary-200 bg-secondary-50">
                  <p class="text-sm text-secondary-500 text-center">
                    {{ filteredArticles().length }} article(s) sur {{ articlesService.total() }}
                  </p>
                </div>
              }
            </div>

            <!-- Article content -->
            <div class="flex-1 flex flex-col bg-white">
              @if (selectedArticle(); as article) {
                <!-- Article header -->
                <div class="p-6 border-b border-secondary-200">
                  <div class="flex items-start justify-between">
                    <div class="flex items-baseline gap-3">
                      <h1 class="text-2xl font-bold text-secondary-900">Art. {{ article.numero }}</h1>
                      @if (article.titre) {
                        <p class="text-lg text-secondary-600">{{ getCleanTitle(article.titre) }}</p>
                      }
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                        CGI {{ articlesService.currentVersion() }}
                      </span>
                      <!-- Audio button -->
                      <app-audio-button
                        [text]="getArticleTextForSpeech(article)"
                        size="small" />
                      <button
                        (click)="copyArticle(article)"
                        class="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="Copier l'article">
                        <svg class="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  @if (article.tome || article.chapitre) {
                    <div class="flex items-center gap-2 mt-3">
                      @if (article.tome) {
                        <span class="px-2 py-1 bg-secondary-100 text-secondary-600 text-sm rounded">Tome {{ article.tome }}</span>
                      }
                      @if (article.chapitre) {
                        <span class="px-2 py-1 bg-secondary-100 text-secondary-600 text-sm rounded">{{ article.chapitre }}</span>
                      }
                    </div>
                  }
                </div>

                <!-- Article content -->
                <div class="flex-1 overflow-y-auto p-6 bg-secondary-50/50">
                  <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-secondary-100 p-8">
                    @if (article.chapeau) {
                      <div class="chapeau text-secondary-700 font-medium italic mb-4 pb-4 border-b border-secondary-200">
                        {{ article.chapeau }}
                      </div>
                    }
                    <div class="article-content text-secondary-800 leading-loose text-base text-justify" [innerHTML]="formatArticleContent(article.contenu)">
                    </div>

                    <!-- Audio button at bottom for long articles -->
                    @if (article.contenu.length > 500) {
                      <div class="mt-6 pt-4 border-t border-secondary-200 flex justify-center">
                        <app-audio-button
                          [text]="getArticleTextForSpeech(article)"
                          size="default" />
                      </div>
                    }
                  </div>
                </div>

                <!-- Copy confirmation -->
                @if (copied()) {
                  <div class="absolute bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                    Article copié !
                  </div>
                }
              } @else if (filteredArticles().length > 0) {
                <!-- Vue multi-articles (lecture continue) -->
                <div class="flex-1 overflow-y-auto p-6 bg-secondary-50/50">
                  <div class="max-w-4xl mx-auto space-y-6">
                    @for (article of filteredArticles(); track article.id; let i = $index) {
                      <!-- Séparateur sous-section -->
                      @if (getSousSectionHeader(article.numero); as ssHeader) {
                        <div class="py-4 px-6 bg-primary-100 border-l-4 border-primary-500 rounded-r-lg">
                          <h2 class="text-lg font-bold text-primary-800">Sous-section {{ ssHeader }}</h2>
                        </div>
                      }
                      <!-- Header point romain (I. Personnes imposables, II. Lieu d'imposition) -->
                      @if (getRomanHeader(article, i); as romanHeader) {
                        <div class="py-3 px-6 bg-primary-50 border-l-4 border-primary-400 rounded-r-lg">
                          <h2 class="text-lg font-semibold text-primary-700">{{ romanHeader }}</h2>
                        </div>
                      }
                      <!-- Sous-header de paragraphe (1) Définition, 2) Exemptions...) -->
                      @if (isFirstOfParagraph(article, i)) {
                        <div class="py-3 px-5 bg-primary-50 border-l-4 border-primary-400 rounded-r-lg ml-4">
                          <h3 class="text-lg font-semibold text-primary-700">{{ getParagraphHeader(article) }}</h3>
                        </div>
                      }
                      <!-- Article -->
                      <div [id]="'article-' + article.numero.replace(' ', '-')" class="bg-white rounded-xl shadow-sm border border-secondary-100 p-6">
                        <div class="flex items-baseline gap-3 mb-4 pb-3 border-b border-secondary-200">
                          <h3 class="text-xl font-bold text-secondary-900">Art. {{ article.numero }}</h3>
                          @if (article.titre) {
                            <span class="text-base text-secondary-600">{{ getCleanTitle(article.titre) }}</span>
                          }
                        </div>
                        @if (article.chapeau) {
                          <div class="text-secondary-700 font-medium italic mb-4 pb-4 border-b border-secondary-200">
                            {{ article.chapeau }}
                          </div>
                        }
                        <div class="article-content text-secondary-800 leading-loose text-base text-justify" [innerHTML]="formatArticleContent(article.contenu)">
                        </div>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <!-- Empty state -->
                <div class="flex-1 flex items-center justify-center">
                  <div class="text-center max-w-md">
                    <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-secondary-900 mb-2">
                      Code Général des Impôts
                    </h3>
                    <p class="text-secondary-600 text-sm">
                      Sélectionnez une section dans le sommaire pour consulter les articles.
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class CodeContainerComponent implements OnInit {
  articlesService = inject(ArticlesService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);

  sidebarCollapsed = false;
  searchQuery = '';
  articleRange = signal<string | null>(null);
  selectedTome = signal<number | null>(null); // Tome sélectionné pour filtrer
  selectedChapitre = signal<string | null>(null); // Titre du chapitre pour filtrer
  selectedSection = signal<string | null>(null); // Titre de la section pour filtrer
  sousSections = signal<{ titre: string; articles: string }[]>([]); // Sous-sections pour les séparateurs
  selectedArticle = this.articlesService.selectedArticle;
  copied = signal(false);
  activeTab = signal<'sommaire' | 'articles'>('sommaire');

  filteredArticles = computed(() => {
    const articles = this.articlesService.articles();
    const range = this.articleRange();
    const tome = this.selectedTome();
    const chapitre = this.selectedChapitre();
    const section = this.selectedSection();
    const query = this.searchQuery.toLowerCase().trim();

    // DEBUG: Afficher les paramètres de filtrage
    console.log('[Filtrage] Plage:', range, '| Tome:', tome, '| Chapitre:', chapitre, '| Section:', section);

    let result: Article[];

    // Si une plage d'articles est définie, filtrer par numéro ET par tome/chapitre/section
    if (range) {
      result = articles.filter(a => {
        const inRange = this.isArticleInRange(a.numero, range);
        if (!inRange) return false;

        // Filtrer par tome si spécifié
        if (tome) {
          const selectedTomeStr = String(tome);
          if (!a.tome || a.tome !== selectedTomeStr) {
            return false;
          }
        }

        // Filtrer par chapitre si spécifié (comparaison partielle car les titres peuvent différer légèrement)
        if (chapitre && a.chapitre) {
          // Vérifier si le chapitre de l'article contient le titre sélectionné ou vice versa
          const chapLower = chapitre.toLowerCase();
          const articleChapLower = a.chapitre.toLowerCase();
          if (!articleChapLower.includes(chapLower) && !chapLower.includes(articleChapLower)) {
            return false;
          }
        }

        return true;
      });
    } else if (!query) {
      result = articles;
    } else {
      result = articles.filter(a =>
        a.numero.toLowerCase().includes(query) ||
        a.titre?.toLowerCase().includes(query) ||
        a.contenu.toLowerCase().includes(query)
      );
    }

    // Dédupliquer par numéro d'article
    const seen = new Set<string>();
    result = result.filter(a => {
      if (seen.has(a.numero)) return false;
      seen.add(a.numero);
      return true;
    });

    // DEBUG: Afficher le résultat après filtrage avec chapitre
    console.log('[Filtrage] Résultat:', result.length, 'articles:', result.map(a => `${a.numero}(chap:${a.chapitre?.substring(0, 20)})`).join(', '));

    // Trier numériquement avec gestion des suffixes latins
    return result.sort((a, b) => {
      const numA = parseInt(a.numero.match(/^(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.numero.match(/^(\d+)/)?.[1] || '0', 10);
      if (numA !== numB) return numA - numB;
      // Si même numéro, trier par suffixe latin (bis, ter, quater...)
      return this.getLatinSuffixOrder(a.numero) - this.getLatinSuffixOrder(b.numero);
    });
  });

  // Ordre des suffixes latins
  private getLatinSuffixOrder(numero: string): number {
    const suffixes = ['', 'bis', 'ter', 'quater', 'quinquies', 'sexies', 'septies', 'octies', 'novies', 'decies', 'undecies', 'duodecies'];
    const lower = numero.toLowerCase();
    for (let i = suffixes.length - 1; i >= 0; i--) {
      if (suffixes[i] && lower.includes(suffixes[i])) {
        return i;
      }
    }
    return 0;
  }

  // Vérifie si un numéro d'article est dans une plage (ex: "1-65 bis") ou correspond à un article unique
  private isArticleInRange(numero: string, range: string): boolean {
    // Extraire le numéro de l'article (ex: "5", "65 bis", "13 ter", "105A" -> partie numérique)
    const match = numero.match(/^(\d+)/);
    if (!match) return false;
    const articleNum = parseInt(match[1], 10);

    // Parser la plage (ex: "1-65 bis" -> start=1, end=65)
    const rangeMatch = range.match(/(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      return articleNum >= start && articleNum <= end;
    }

    // Si pas de plage, vérifier si c'est un article unique ou une liste
    // Ex: "1" correspond à "1", "1A", "1B", etc.
    // Ex: "4-4A-7" correspond à 4, 4A, 5, 6, 7
    const parts = range.split('-').map(p => p.trim());

    // Si c'est un seul article (ex: "1")
    if (parts.length === 1) {
      const singleNum = parseInt(parts[0].match(/^(\d+)/)?.[1] || '0', 10);
      return articleNum === singleNum;
    }

    // Si c'est une liste avec lettres (ex: "4-4A-7" ou "3-3A")
    // Trouver le min et max numériques
    const nums = parts.map(p => parseInt(p.match(/^(\d+)/)?.[1] || '0', 10)).filter(n => n > 0);
    if (nums.length >= 2) {
      const start = Math.min(...nums);
      const end = Math.max(...nums);
      return articleNum >= start && articleNum <= end;
    }

    return false;
  }

  ngOnInit(): void {
    // Récupérer la version depuis l'URL
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const version = params['version'] as '2025' | '2026';
        if (version === '2025' || version === '2026') {
          this.articlesService.setVersion(version);
        }
        this.loadArticles();
      });
  }

  loadArticles(): void {
    // Charger tous les articles (1149+ pour Tome 1 et 2)
    this.articlesService.loadArticles({ limit: 2000 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // Sélection par défaut: Chapitre 1 du Tome 1 (IRPP, Art. 1-65 bis)
        this.setDefaultSelection();
      });
  }

  private setDefaultSelection(): void {
    const version = this.articlesService.currentVersion();
    if (version === '2026') {
      // CGI 2026: Chapitre 1 = Impôt sur les sociétés (IS)
      this.articleRange.set('1-89');
      this.selectedTome.set(1);
      this.selectedChapitre.set('Impôt sur les sociétés');
    } else {
      // CGI 2025: Chapitre 1 = IRPP
      this.articleRange.set('1-65');
      this.selectedTome.set(1);
      this.selectedChapitre.set('Impôt sur le revenu des personnes physiques');
    }
    this.activeTab.set('articles');
  }

  onSearch(): void {
    // Réinitialiser tous les filtres quand l'utilisateur tape
    this.articleRange.set(null);
    this.selectedTome.set(null);
    this.selectedChapitre.set(null);
    this.selectedSection.set(null);
  }

  selectArticle(article: Article): void {
    // Si on est en vue multi-articles, scroller vers l'article au lieu de changer de vue
    if (!this.selectedArticle() && this.filteredArticles().length > 0) {
      const elementId = 'article-' + article.numero.replace(' ', '-');
      const element = document.getElementById(elementId);
      if (element) {
        // Scroll avec offset pour le header (80px)
        const container = element.closest('.overflow-y-auto');
        if (container) {
          const elementTop = element.offsetTop - 100; // 100px d'offset pour le header + marge
          container.scrollTo({ top: elementTop, behavior: 'smooth' });
        }
        // Highlight temporaire
        element.classList.add('ring-2', 'ring-primary-500');
        setTimeout(() => element.classList.remove('ring-2', 'ring-primary-500'), 2000);
        return;
      }
    }
    this.articlesService.selectArticle(article);
  }

  onSommaireSelect(selection: SommaireSelection): void {
    // Désélectionner l'article pour afficher la vue multi-articles
    this.articlesService.selectArticle(null);

    // Si une plage d'articles est définie, l'utiliser pour filtrer
    if (selection.articles) {
      this.searchQuery = '';
      this.articleRange.set(selection.articles);
      this.selectedTome.set(selection.tome ?? null); // Filtrer par tome si spécifié
      this.selectedChapitre.set(selection.chapitreTitre ?? null); // Filtrer par chapitre si spécifié
      this.selectedSection.set(selection.sectionTitre ?? null); // Filtrer par section si spécifié
      this.sousSections.set(selection.sousSections ?? []); // Stocker les sous-sections pour les séparateurs
    } else {
      // Sinon, utiliser le titre pour la recherche
      this.articleRange.set(null);
      this.selectedTome.set(null);
      this.selectedChapitre.set(null);
      this.selectedSection.set(null);
      this.sousSections.set([]);
      this.searchQuery = selection.titre;
    }
    this.activeTab.set('articles');
  }

  // Retourne le titre de la sous-section si l'article est le premier de cette sous-section
  getSousSectionHeader(articleNumero: string): string | null {
    const sousSections = this.sousSections();
    if (!sousSections.length) return null;

    // Normaliser le numéro d'article (ex: "12 bis" -> "12bis", "12" -> "12")
    const normalizedNumero = articleNumero.toLowerCase().replace(/\s+/g, '');

    for (const ss of sousSections) {
      // Extraire le premier article de la plage (ex: "12-65 bis" -> "12")
      const ssMatch = ss.articles.match(/^(\d+)/);
      if (ssMatch) {
        const ssStart = ssMatch[1]; // Juste le numéro sans suffixe
        // Vérifier que c'est exactement le premier article (pas "12 bis" quand on veut "12")
        if (normalizedNumero === ssStart) {
          return ss.titre;
        }
      }
    }
    return null;
  }

  // Extrait le préfixe romain (I., II., III...) ou numéroté (1), 2)...) du titre
  private getRomanPrefix(titre: string | undefined): string | null {
    if (!titre) return null;
    // Format "I. Personnes imposables" ou "II. Lieu d'imposition"
    const romanMatch = titre.match(/^(I{1,3}|IV|V|VI)\.\s*/);
    if (romanMatch) return romanMatch[1];
    return null;
  }

  // Nettoie le titre pour l'affichage (retire les préfixes "I. Xxx :" et "1) Xxx")
  getCleanTitle(titre: string | undefined): string {
    if (!titre) return '';
    // Extraire la dernière partie après le dernier ":"
    const parts = titre.split(':');
    let result = parts.length > 1 ? parts[parts.length - 1].trim() : titre;
    // Retirer le préfixe numéroté "1) ", "2) ", "3) "...
    result = result.replace(/^\d+\)\s*/, '');
    // Retirer le préfixe lettre "a) ", "b) "...
    result = result.replace(/^[a-z]\)\s*/, '');
    return result;
  }

  // Retourne le sous-header de paragraphe (3) Détermination...) extrait du titre
  getParagraphHeader(article: Article): string | null {
    if (!article.titre) return null;

    // Format: "I. Revenus fonciers : 3) Détermination du revenu imposable : Revenu net"
    // -> extraire "3) Détermination du revenu imposable"
    const match = article.titre.match(/:\s*(\d+\)\s*[^:]+)/);
    if (match) {
      return match[1].trim();
    }
    return null;
  }

  // Retourne le header du point romain (I. Personnes imposables) si c'est le premier article
  getRomanHeader(article: Article, index: number): string | null {
    if (!article.titre) return null;

    const romanPrefix = this.getRomanPrefix(article.titre);
    if (!romanPrefix) return null;

    // Si c'est le premier article, afficher le header
    if (index === 0) {
      // Extraire "I. Personnes imposables" du titre complet
      const match = article.titre.match(/^(I{1,3}|IV|V|VI)\.\s*([^:]+)/);
      if (match) return `${match[1]}. ${match[2].trim()}`;
    }

    // Sinon vérifier si l'article précédent a un préfixe différent
    const articles = this.filteredArticles();
    const prevArticle = articles[index - 1];
    const prevRomanPrefix = this.getRomanPrefix(prevArticle?.titre);

    if (romanPrefix !== prevRomanPrefix) {
      const match = article.titre.match(/^(I{1,3}|IV|V|VI)\.\s*([^:]+)/);
      if (match) return `${match[1]}. ${match[2].trim()}`;
    }

    return null;
  }

  // Vérifie si c'est le premier article d'un nouveau paragraphe numéroté (1), 2)...)
  isFirstOfParagraph(article: Article, index: number): boolean {
    const paragraphHeader = this.getParagraphHeader(article);
    if (!paragraphHeader) return false;

    // Extraire le numéro du paragraphe (1, 2, 3...)
    const paragraphNum = paragraphHeader.match(/^(\d+)\)/)?.[1];
    if (!paragraphNum) return false;

    // Si c'est le premier article ou si l'article précédent a un paragraphe différent
    if (index === 0) return true;

    const articles = this.filteredArticles();
    const prevArticle = articles[index - 1];
    const prevParagraphHeader = this.getParagraphHeader(prevArticle);

    if (!prevParagraphHeader) return true;

    const prevParagraphNum = prevParagraphHeader.match(/^(\d+)\)/)?.[1];
    return paragraphNum !== prevParagraphNum;
  }

  // Retourne le sous-header de lettre (a) Régime du forfait...) extrait du titre
  getLetterHeader(article: Article): string | null {
    if (!article.titre) return null;

    // Format: "II. BICA : 4) Fixation du bénéfice : a) Régime du forfait : Titre"
    // -> extraire "a) Régime du forfait"
    const match = article.titre.match(/:\s*([a-z]\)\s*[^:]+)/);
    if (match) {
      return match[1].trim();
    }
    return null;
  }

  // Vérifie si c'est le premier article d'une nouvelle catégorie lettre (a), b)...)
  isFirstOfLetter(article: Article, index: number): boolean {
    const letterHeader = this.getLetterHeader(article);
    if (!letterHeader) return false;

    // Extraire la lettre (a, b, c...)
    const letter = letterHeader.match(/^([a-z])\)/)?.[1];
    if (!letter) return false;

    // Si c'est le premier article ou si l'article précédent a une lettre différente
    if (index === 0) return true;

    const articles = this.filteredArticles();
    const prevArticle = articles[index - 1];
    const prevLetterHeader = this.getLetterHeader(prevArticle);

    if (!prevLetterHeader) return true;

    const prevLetter = prevLetterHeader.match(/^([a-z])\)/)?.[1];
    return letter !== prevLetter;
  }

  async copyArticle(article: Article): Promise<void> {
    const chapeau = article.chapeau ? `\n\n${article.chapeau}` : '';
    const text = `${article.numero}${article.titre ? ' - ' + article.titre : ''}${chapeau}\n\n${article.contenu}\n\nSource: CGI Congo-Brazzaville ${this.articlesService.currentVersion()}`;

    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  }

  getArticleTextForSpeech(article: Article): string {
    const parts: string[] = [];
    parts.push(`Article ${article.numero}`);
    if (article.titre) {
      parts.push(article.titre);
    }
    if (article.chapeau) {
      parts.push(article.chapeau);
    }
    parts.push(article.contenu);
    return parts.join('. ');
  }

  /**
   * Formate le contenu de l'article pour l'affichage HTML
   * SÉCURITÉ: bypassSecurityTrustHtml est utilisé de manière sécurisée car:
   * 1. Le contenu provient de la DB (articles CGI), pas d'input utilisateur
   * 2. Tous les caractères HTML sont échappés AVANT le formatage (&, <, >)
   * 3. Seul du HTML prédéfini et contrôlé est ajouté (classes CSS)
   */
  formatArticleContent(contenu: string): SafeHtml {
    if (!contenu) return '';

    // D'abord, diviser le contenu en lignes pour traiter chaque ligne
    const lines = contenu.split('\n');
    const formattedLines = lines.map(line => {
      // Échapper les caractères HTML
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

      // Formater "1) a)" directement
      if (/^(\d+)\)[ \t]*([a-z])\)[ \t]*(.*)$/.test(escaped)) {
        return escaped.replace(/^(\d+)\)[ \t]*([a-z])\)[ \t]*(.*)$/,
          '<div class="mt-6 mb-2 flex items-start gap-2"><span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">$1</span></div><div class="ml-10 mt-2 mb-1 flex items-start gap-2"><span class="font-semibold text-primary-600 flex-shrink-0">$2)</span><span>$3</span></div>');
      }
      // Formater les numéros seuls (1), 2), etc.)
      if (/^(\d+)\)[ \t]*/.test(escaped)) {
        return escaped.replace(/^(\d+)\)[ \t]*(.*)$/,
          '<div class="mt-6 mb-2 flex items-start gap-2"><span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">$1</span><span>$2</span></div>');
      }
      // Formater les lettres a), b), etc.
      if (/^([a-z])\)[ \t]*/.test(escaped)) {
        return escaped.replace(/^([a-z])\)[ \t]*(.*)$/,
          '<div class="ml-10 mt-2 mb-1 flex items-start gap-2"><span class="font-semibold text-primary-600 flex-shrink-0">$1)</span><span>$2</span></div>');
      }
      // Formater les sous-numéros 1°, 2°, etc.
      if (/^(\d+)°[ \t]*/.test(escaped)) {
        return escaped.replace(/^(\d+)°[ \t]*(.*)$/,
          '<div class="ml-14 mt-2 pl-4 border-l-2 border-secondary-200 flex items-start gap-2"><span class="font-medium text-secondary-700 flex-shrink-0">$1°</span><span>$2</span></div>');
      }
      // Formater les tirets en liste
      if (/^[-–—][ \t]*/.test(escaped)) {
        return escaped.replace(/^[-–—][ \t]*(.*)$/,
          '<div class="ml-6 mt-1 flex items-start gap-2"><span class="text-primary-500 flex-shrink-0">•</span><span>$1</span></div>');
      }
      // Ligne vide = espacement
      if (escaped.trim() === '') {
        return '<div class="mt-4"></div>';
      }
      // Ligne normale (texte de continuation)
      return '<div class="mt-2">' + escaped + '</div>';
    });

    let html = formattedLines.join('');

    // Formater les notes NB entre crochets en italique
    html = html.replace(/\[NB-([^\]]+)\]/g, '<em class="text-secondary-500 italic">[NB-$1]</em>');

    // Envelopper le tout
    html = '<div class="mt-2">' + html + '</div>';

    // Nettoyer les divs de texte vides (mais garder les espacements mt-4)
    html = html.replace(/<div class="mt-2"><\/div>/g, '');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
