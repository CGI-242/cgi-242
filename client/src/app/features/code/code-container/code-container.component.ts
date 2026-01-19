import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ArticlesService, Article } from '@core/services/articles.service';
import { LoggerService } from '@core/services/logger.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { AudioButtonComponent } from '@shared/components/audio-button/audio-button.component';
import { CodeSommaireComponent, SommaireSelection } from '../code-sommaire/code-sommaire.component';
import { ArticleFormatPipe } from './article-format.pipe';
import {
  getArticleSortOrder,
  isArticleInRange,
  getSousSectionHeader as getSousSectionHeaderUtil,
  getRomanPrefix,
  getParagraphPrefix,
  getLetterPrefix,
  getCleanTitle as getCleanTitleUtil,
  getParagraphHeader as getParagraphHeaderUtil,
  getLetterHeader as getLetterHeaderUtil,
  getUpperLetterHeader as getUpperLetterHeaderUtil,
  getRomanHeader as getRomanHeaderUtil,
} from './article.utils';

@Component({
  selector: 'app-code-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    HeaderComponent,
    SidebarComponent,
    CodeSommaireComponent,
    AudioButtonComponent,
    ArticleFormatPipe,
  ],
  templateUrl: './code-container.component.html',
})
export class CodeContainerComponent implements OnInit {
  // Services
  articlesService = inject(ArticlesService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private logger = inject(LoggerService);

  // State
  sidebarCollapsed = false;
  searchQuery = '';
  activeTab = signal<'sommaire' | 'articles'>('sommaire');
  copied = signal(false);

  // Filtres
  articleRange = signal<string | null>(null);
  selectedTome = signal<number | null>(null);
  selectedChapitre = signal<string | null>(null);
  selectedSection = signal<string | null>(null);
  sousSections = signal<{ titre: string; articles: string }[]>([]);

  // Computed
  selectedArticle = computed(() => this.articlesService.selectedArticle());

  filteredArticles = computed(() => {
    const articles = this.articlesService.articles();
    const query = this.searchQuery.toLowerCase().trim();
    const range = this.articleRange();
    const tome = this.selectedTome();
    const chapitre = this.selectedChapitre();

    let result: Article[];

    if (range) {
      result = articles.filter(a => {
        const inRange = isArticleInRange(a.numero, range);
        if (!inRange) return false;

        if (tome) {
          const selectedTomeStr = String(tome);
          if (!a.tome || a.tome !== selectedTomeStr) {
            return false;
          }
        }

        if (chapitre && a.chapitre) {
          const chapLower = chapitre.toLowerCase();
          const articleChapLower = a.chapitre.toLowerCase();
          if (!articleChapLower.includes(chapLower) && !chapLower.includes(articleChapLower)) {
            return false;
          }
        }

        return true;
      });
    } else if (!query) {
      result = [];
    } else {
      result = articles.filter(a =>
        a.numero.toLowerCase().includes(query) ||
        a.titre?.toLowerCase().includes(query) ||
        a.contenu.toLowerCase().includes(query)
      );
    }

    // Trier par numéro d'article
    return result.sort((a, b) => {
      const numA = parseInt(a.numero.match(/^(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.numero.match(/^(\d+)/)?.[1] || '0', 10);
      if (numA !== numB) return numA - numB;
      return getArticleSortOrder(a.numero) - getArticleSortOrder(b.numero);
    });
  });

  // Lifecycle
  ngOnInit(): void {
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

  // Data loading
  loadArticles(): void {
    this.articlesService.loadArticles({ limit: 2000 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setDefaultSelection();
      });
  }

  private setDefaultSelection(): void {
    this.articleRange.set(null);
    this.selectedTome.set(null);
    this.selectedChapitre.set(null);
    this.activeTab.set('sommaire');
  }

  // Event handlers
  onSearch(): void {
    this.articleRange.set(null);
    this.selectedTome.set(null);
    this.selectedChapitre.set(null);
    this.selectedSection.set(null);
  }

  selectArticle(article: Article): void {
    if (!this.selectedArticle() && this.filteredArticles().length > 0) {
      const elementId = 'article-' + article.numero.replace(' ', '-');
      const element = document.getElementById(elementId);
      if (element) {
        const container = element.closest('.overflow-y-auto');
        if (container) {
          const elementTop = element.offsetTop - 100;
          container.scrollTo({ top: elementTop, behavior: 'smooth' });
        }
        element.classList.add('ring-2', 'ring-primary-500');
        setTimeout(() => element.classList.remove('ring-2', 'ring-primary-500'), 2000);
        return;
      }
    }
    this.articlesService.selectArticle(article);
  }

  onSommaireSelect(selection: SommaireSelection): void {
    this.articlesService.selectArticle(null);

    if (selection.articles) {
      this.searchQuery = '';
      this.articleRange.set(selection.articles);
      this.selectedTome.set(selection.tome ?? null);
      this.selectedChapitre.set(selection.chapitreTitre ?? null);
      this.selectedSection.set(selection.sectionTitre ?? null);
      this.sousSections.set(selection.sousSections ?? []);
    } else {
      this.articleRange.set(null);
      this.selectedTome.set(null);
      this.selectedChapitre.set(null);
      this.selectedSection.set(null);
      this.sousSections.set([]);
      this.searchQuery = selection.titre;
    }
    this.activeTab.set('articles');
  }

  // Header detection methods
  getSousSectionHeader(articleNumero: string): string | null {
    return getSousSectionHeaderUtil(articleNumero, this.sousSections());
  }

  getRomanHeader(article: Article, index: number): string | null {
    if (!article.titre) return null;

    const romanPrefix = getRomanPrefix(article.titre);
    if (!romanPrefix) return null;

    if (index === 0) {
      return getRomanHeaderUtil(article.titre);
    }

    const articles = this.filteredArticles();
    for (let i = index - 1; i >= 0; i--) {
      const prevRomanPrefix = getRomanPrefix(articles[i].titre);
      if (prevRomanPrefix) {
        return romanPrefix !== prevRomanPrefix ? getRomanHeaderUtil(article.titre) : null;
      }
    }

    return getRomanHeaderUtil(article.titre);
  }

  isFirstOfUpperLetter(article: Article, index: number): boolean {
    const upperLetterHeader = getUpperLetterHeaderUtil(article.titre);
    if (!upperLetterHeader) return false;

    if (index === 0) return true;

    const articles = this.filteredArticles();
    for (let i = index - 1; i >= 0; i--) {
      const prevUpperLetterHeader = getUpperLetterHeaderUtil(articles[i].titre);
      if (prevUpperLetterHeader) {
        return upperLetterHeader !== prevUpperLetterHeader;
      }
    }

    return true;
  }

  getUpperLetterHeader(article: Article): string | null {
    return getUpperLetterHeaderUtil(article.titre);
  }

  isFirstOfParagraph(article: Article, index: number): boolean {
    const paragraphPrefix = getParagraphPrefix(article.titre);
    if (!paragraphPrefix) return false;

    if (index === 0) return true;

    const articles = this.filteredArticles();
    for (let i = index - 1; i >= 0; i--) {
      const prevParagraphPrefix = getParagraphPrefix(articles[i].titre);
      if (prevParagraphPrefix) {
        return paragraphPrefix !== prevParagraphPrefix;
      }
    }

    return true;
  }

  getParagraphHeader(article: Article): string | null {
    return getParagraphHeaderUtil(article.titre);
  }

  isFirstOfLetter(article: Article, index: number): boolean {
    const letterPrefix = getLetterPrefix(article.titre);
    if (!letterPrefix) return false;

    if (index === 0) return true;

    const articles = this.filteredArticles();
    for (let i = index - 1; i >= 0; i--) {
      const prevLetterPrefix = getLetterPrefix(articles[i].titre);
      if (prevLetterPrefix) {
        return letterPrefix !== prevLetterPrefix;
      }
    }

    return true;
  }

  getLetterHeader(article: Article): string | null {
    return getLetterHeaderUtil(article.titre);
  }

  getCleanTitle(titre: string | undefined): string {
    return getCleanTitleUtil(titre);
  }

  // Actions
  async copyArticle(article: Article): Promise<void> {
    const chapeau = article.chapeau ? `\n\n${article.chapeau}` : '';
    const text = `${article.numero}${article.titre ? ' - ' + article.titre : ''}${chapeau}\n\n${article.contenu}\n\nSource: CGI Congo-Brazzaville ${this.articlesService.currentVersion()}`;

    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.logger.warn('Échec de la copie dans le presse-papiers', 'CodeContainer');
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

  // Virtual scrolling helpers
  trackByArticleId(index: number, article: Article): string {
    return article.id;
  }

  getViewportHeight(): number {
    return Math.max(400, window.innerHeight - 280);
  }
}
