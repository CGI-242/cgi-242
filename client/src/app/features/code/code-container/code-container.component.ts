import { Component, inject, OnInit, signal, computed } from '@angular/core';
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
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, CodeSommaireComponent, AudioButtonComponent],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="sidebarCollapsed" />

        <main
          class="flex-1 transition-all duration-300"
          [class.ml-56]="!sidebarCollapsed"
          [class.ml-14]="sidebarCollapsed">
          <div class="flex h-[calc(100vh-4rem)]">
            <!-- Sidebar navigation -->
            <div class="w-[540px] border-r border-secondary-200 bg-white flex flex-col">
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
                      @for (article of filteredArticles(); track article.id) {
                        <button
                          (click)="selectArticle(article)"
                          class="w-full text-left px-3 py-1.5 hover:bg-secondary-50 transition-colors flex items-center gap-2"
                          [class.bg-primary-50]="selectedArticle()?.id === article.id"
                          [class.border-l-2]="selectedArticle()?.id === article.id"
                          [class.border-l-primary-600]="selectedArticle()?.id === article.id">
                          <span class="font-medium text-primary-700 text-sm whitespace-nowrap">Art. {{ article.numero }}</span>
                          @if (article.titre) {
                            <span class="text-xs text-secondary-500 truncate">{{ article.titre }}</span>
                          }
                        </button>
                      } @empty {
                        <div class="p-3 text-center text-secondary-500 text-sm">
                          Aucun article trouvé
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Total count -->
                <div class="p-3 border-t border-secondary-200 bg-secondary-50">
                  <p class="text-xs text-secondary-500 text-center">
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
                    <div>
                      <h1 class="text-2xl font-bold text-secondary-900">{{ article.numero }}</h1>
                      @if (article.titre) {
                        <p class="text-lg text-secondary-600 mt-1">{{ article.titre }}</p>
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
                        <span class="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded">{{ article.tome }}</span>
                      }
                      @if (article.chapitre) {
                        <span class="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded">{{ article.chapitre }}</span>
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
                    <div class="article-content text-secondary-800 leading-loose text-[15px] text-justify" [innerHTML]="formatArticleContent(article.contenu)">
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
                      Sélectionnez un article dans la liste pour consulter son contenu exact.
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

  sidebarCollapsed = false;
  searchQuery = '';
  articleRange = signal<string | null>(null);
  selectedArticle = this.articlesService.selectedArticle;
  copied = signal(false);
  activeTab = signal<'sommaire' | 'articles'>('sommaire');

  filteredArticles = computed(() => {
    const articles = this.articlesService.articles();
    const range = this.articleRange();
    const query = this.searchQuery.toLowerCase().trim();

    let result: Article[];

    // Si une plage d'articles est définie, filtrer par numéro
    if (range) {
      result = articles.filter(a => this.isArticleInRange(a.numero, range));
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

    // Trier numériquement
    return result.sort((a, b) => {
      const numA = parseInt(a.numero.match(/^(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.numero.match(/^(\d+)/)?.[1] || '0', 10);
      if (numA !== numB) return numA - numB;
      // Si même numéro, trier par suffixe (bis, ter, etc.)
      return a.numero.localeCompare(b.numero);
    });
  });

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
    this.route.params.subscribe(params => {
      const version = params['version'] as '2025' | '2026';
      if (version === '2025' || version === '2026') {
        this.articlesService.setVersion(version);
      }
      this.loadArticles();
    });
  }

  loadArticles(): void {
    this.articlesService.loadArticles({ limit: 500 }).subscribe();
  }

  onSearch(): void {
    // Réinitialiser la plage d'articles quand l'utilisateur tape
    this.articleRange.set(null);
  }

  selectArticle(article: Article): void {
    this.articlesService.selectArticle(article);
  }

  onSommaireSelect(selection: SommaireSelection): void {
    // Si une plage d'articles est définie, l'utiliser pour filtrer
    if (selection.articles) {
      this.searchQuery = '';
      this.articleRange.set(selection.articles);
    } else {
      // Sinon, utiliser le titre pour la recherche
      this.articleRange.set(null);
      this.searchQuery = selection.titre;
    }
    this.activeTab.set('articles');
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

  formatArticleContent(contenu: string): SafeHtml {
    if (!contenu) return '';

    let html = contenu
      // Échapper les caractères HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Formater les numéros principaux (1), 2), etc.)
      .replace(/^(\d+)\)\s*/gm, '<div class="mt-6 mb-2"><span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm mr-2">$1</span>')
      .replace(/^(\d+)\)\s*([a-z]\))/gm, '<div class="mt-6 mb-2"><span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm mr-2">$1</span>$2')
      // Formater les lettres a), b), etc.
      .replace(/^([a-z])\)\s*/gm, '<div class="ml-4 mt-3 mb-1"><span class="font-semibold text-primary-600 mr-2">$1)</span>')
      // Formater les sous-numéros 1°, 2°, etc.
      .replace(/^(\d+)°\s*/gm, '<div class="ml-8 mt-2 pl-4 border-l-2 border-secondary-200"><span class="font-medium text-secondary-700 mr-2">$1°</span>')
      // Formater les tirets en liste
      .replace(/^[-–—]\s*/gm, '<div class="ml-6 mt-1 flex"><span class="text-primary-500 mr-3">•</span><span>')
      // Fermer les divs pour les tirets
      .replace(/<span>([^<]+)$/gm, '<span>$1</span></div>')
      // Paragraphes vides = espacement
      .replace(/\n\n+/g, '</div><div class="mt-4">')
      // Retours à la ligne simples
      .replace(/\n/g, '</div><div class="mt-2">');

    // Envelopper le tout
    html = '<div class="mt-2">' + html + '</div>';

    // Nettoyer les divs vides
    html = html.replace(/<div class="[^"]*"><\/div>/g, '');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
