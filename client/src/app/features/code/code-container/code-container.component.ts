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
  selectedLivre = signal<number | null>(null); // Pour filtrer par livre (Tome 2)
  selectedTomeId = signal<string | null>(null); // Pour filtrer les annexes (ex: "ANNEXES-1")
  selectedChapitre = signal<string | null>(null);
  selectedSection = signal<string | null>(null);
  sections = signal<{ titre: string; articles: string }[]>([]);
  sousSections = signal<{ titre: string; articles: string }[]>([]);
  paragraphes = signal<{ numero: number | string; titre: string; articles: string; sousSectionTitre?: string; sousSectionNumero?: number | string }[]>([]);

  // Computed
  selectedArticle = computed(() => this.articlesService.selectedArticle());

  filteredArticles = computed(() => {
    const articles = this.articlesService.articles();
    const query = this.searchQuery.toLowerCase().trim();
    const range = this.articleRange();
    const tome = this.selectedTome();
    const livre = this.selectedLivre();
    const tomeId = this.selectedTomeId();
    const chapitre = this.selectedChapitre();

    let result: Article[];

    // Filtrage par tomeId (pour les annexes)
    if (tomeId) {
      result = articles.filter(a => a.tome === tomeId);
    } else if (range) {
      result = articles.filter(a => {
        // Cas spécial: titres de section (T2L1C1-ST1, T2L1C2-ST10a, etc.)
        // Format: T{tome}L{livre}C{chapitre}-ST{numero}[a-z]?
        const sectionTitleMatch = a.numero.match(/^T(\d+)L(\d+)C(\d+)-ST\d+[a-z]?$/i);
        if (sectionTitleMatch) {
          const stTome = parseInt(sectionTitleMatch[1], 10);
          const stLivre = parseInt(sectionTitleMatch[2], 10);
          // Vérifier que le tome et livre correspondent à la sélection actuelle
          if (tome && stTome !== tome) return false;
          if (livre && stLivre !== livre) return false;
          // Vérifier que le chapitre de l'article correspond au chapitre sélectionné
          if (chapitre && a.chapitre && a.chapitre !== chapitre) return false;
          // Si pas de sélection spécifique de tome/livre, ne pas afficher les titres de section
          if (!tome || !livre) return false;
          return true;
        }

        const inRange = isArticleInRange(a.numero, range);
        if (!inRange) return false;

        // Filtrer par tome si spécifié
        if (tome) {
          const selectedTomeStr = String(tome);
          if (!a.tome || a.tome !== selectedTomeStr) {
            return false;
          }
        }

        // Filtrer par livre si spécifié (uniquement pour Tome 2)
        // Ne filtrer que si l'article a un champ livre défini
        if (livre && tome === 2 && a.livre) {
          const expectedLivre = `Livre ${livre}`;
          if (a.livre !== expectedLivre) {
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

    // Trier par numéro d'article, en regroupant par annexe
    return result.sort((a, b) => {
      // Fonction pour extraire la position de tri des titres de section
      // Format: T{tome}L{livre}C{chapitre}-ST{numero}[a-z]?
      const getSectionTitleSortNum = (numero: string): number | null => {
        const match = numero.match(/^T(\d+)L(\d+)C(\d+)-ST(\d+)([a-z])?$/i);
        if (!match) return null;
        const chapNum = parseInt(match[3], 10);
        const stNum = parseInt(match[4], 10);
        const suffix = match[5] ? match[5].toLowerCase().charCodeAt(0) - 96 : 0; // a=1, b=2, etc.
        // Mapping des titres de section par chapitre
        const positionMaps: Record<number, Record<number, number>> = {
          // Chapitre 1: De l'enregistrement
          1: {
            1: 4.9,   // ST1 avant Art. 5
            2: 7.9,   // ST2 avant Art. 8
            3: 11.9,  // ST3 avant Art. 12
            4: 12.9,  // ST4 avant Art. 13
          },
          // Chapitre 2: Assiette des droits
          2: {
            1: 17.9,  // ST1 avant Art. 18 - Baux et locations
            2: 20.9,  // ST2 avant Art. 21 - Contrats de mariage
            3: 21.9,  // ST3 avant Art. 22 - Échanges d'immeubles
            4: 22.9,  // ST4 avant Art. 23 - Jugements
            5: 23.9,  // ST5 avant Art. 24 - Marchés
            6: 24.9,  // ST6 avant Art. 25 - Partages
            7: 25.9,  // ST7 avant Art. 26 - Rentes
            8: 28.9,  // ST8 avant Art. 29 - Sociétés
            9: 29.9,  // ST9 avant Art. 30 - Transmission à titre onéreux et gratuit
            10: 37.9, // ST10 avant Art. 38 - Mutations par décès
            11: 50.9, // ST11 avant Art. 51 - Dispositions spéciales
          },
        };
        // Mapping spécifique pour les sous-sections avec suffixes (ST10a, ST10b, etc.)
        const suffixPositions: Record<string, number> = {
          'T2L1C2-ST10a': 37.91,  // 1) Règles générales - après ST10
          'T2L1C2-ST10b': 41.9,   // 2) Déduction des dettes et charges - avant Art. 42
        };
        if (suffixPositions[numero]) {
          return suffixPositions[numero];
        }
        const chapMap = positionMaps[chapNum];
        if (chapMap && chapMap[stNum] !== undefined) {
          return chapMap[stNum] + suffix * 0.01;
        }
        return stNum - 0.1 + suffix * 0.01;  // Fallback
      };

      const stNumA = getSectionTitleSortNum(a.numero);
      const stNumB = getSectionTitleSortNum(b.numero);

      // Si les deux sont des titres de section, trier par leur position
      if (stNumA !== null && stNumB !== null) {
        return stNumA - stNumB;
      }
      // Titre de section vs article normal
      if (stNumA !== null) {
        const numB = parseInt(b.numero.match(/(\d+)/)?.[1] || '0', 10);
        return stNumA - numB;
      }
      if (stNumB !== null) {
        const numA = parseInt(a.numero.match(/(\d+)/)?.[1] || '0', 10);
        return numA - stNumB;
      }

      // Fonction pour extraire le numéro d'annexe
      const getAnnexeNum = (article: Article): { num: number; suffix: string } | null => {
        // D'abord vérifier si c'est un en-tête d'annexe (ex: "Annexe 3 bis")
        const headerMatch = article.numero.match(/^Annexe\s+(\d+)(\s*(bis|ter|quater))?/i);
        if (headerMatch) {
          return { num: parseInt(headerMatch[1], 10), suffix: headerMatch[3] || '' };
        }
        // Sinon extraire de la section (ex: "Annexe 3 bis - Certificat...")
        if (article.section) {
          const sectionMatch = article.section.match(/^Annexe\s+(\d+)(\s*(bis|ter|quater))?/i);
          if (sectionMatch) {
            return { num: parseInt(sectionMatch[1], 10), suffix: sectionMatch[3] || '' };
          }
        }
        return null;
      };

      const annexeA = getAnnexeNum(a);
      const annexeB = getAnnexeNum(b);

      // Si les deux ont une annexe, trier par annexe
      if (annexeA && annexeB) {
        // D'abord par numéro d'annexe
        if (annexeA.num !== annexeB.num) return annexeA.num - annexeB.num;
        // Puis par suffixe (bis, ter, etc.)
        const suffixOrder: Record<string, number> = { '': 0, 'bis': 1, 'ter': 2, 'quater': 3 };
        const suffixDiff = (suffixOrder[annexeA.suffix.toLowerCase()] || 0) - (suffixOrder[annexeB.suffix.toLowerCase()] || 0);
        if (suffixDiff !== 0) return suffixDiff;

        // À l'intérieur de la même annexe : en-tête d'abord, puis articles par numéro
        const isHeaderA = a.numero.match(/^Annexe/i);
        const isHeaderB = b.numero.match(/^Annexe/i);
        if (isHeaderA && !isHeaderB) return -1;
        if (!isHeaderA && isHeaderB) return 1;

        // Trier les articles par numéro (extraire le numéro après le tiret pour A3bis-14, A6-26, etc.)
        const getArticleNum = (numero: string): number => {
          // Pour les articles avec préfixe d'annexe (A3bis-14, A6-26)
          const prefixMatch = numero.match(/^A\d+(?:bis|ter|quater)?-(\d+)/i);
          if (prefixMatch) return parseInt(prefixMatch[1], 10);
          // Pour les articles standard (Art. 14, 26)
          const stdMatch = numero.match(/(\d+)/);
          return stdMatch ? parseInt(stdMatch[1], 10) : 0;
        };
        const numA = getArticleNum(a.numero);
        const numB = getArticleNum(b.numero);
        if (numA !== numB) return numA - numB;
        return getArticleSortOrder(a.numero) - getArticleSortOrder(b.numero);
      }

      // Articles sans annexe vont à la fin
      if (annexeA && !annexeB) return -1;
      if (!annexeA && annexeB) return 1;

      // Tri standard pour les articles sans annexe
      const numA = parseInt(a.numero.match(/(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.numero.match(/(\d+)/)?.[1] || '0', 10);
      if (numA !== numB) return numA - numB;
      return getArticleSortOrder(a.numero) - getArticleSortOrder(b.numero);
    });
  });

  // Query param for direct article navigation
  private pendingArticleNumero: string | null = null;

  // Lifecycle
  ngOnInit(): void {
    // Read query params for direct article navigation
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryParams => {
        if (queryParams['article']) {
          this.pendingArticleNumero = queryParams['article'];
        }
      });

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
        // Check if we have a pending article to navigate to
        if (this.pendingArticleNumero) {
          this.navigateToArticle(this.pendingArticleNumero);
          this.pendingArticleNumero = null;
        } else {
          this.setDefaultSelection();
        }
      });
  }

  private setDefaultSelection(): void {
    this.articleRange.set(null);
    this.selectedTome.set(null);
    this.selectedLivre.set(null);
    this.selectedTomeId.set(null);
    this.selectedChapitre.set(null);
    this.activeTab.set('sommaire');
  }

  /**
   * Navigate directly to an article by its numero (from query param)
   */
  private navigateToArticle(articleNumero: string): void {
    const articles = this.articlesService.articles();
    // Find the article (case-insensitive, trim spaces)
    const targetNumero = articleNumero.trim().toLowerCase();
    const article = articles.find(a =>
      a.numero.toLowerCase() === targetNumero ||
      a.numero.toLowerCase().replace(/\s+/g, ' ') === targetNumero
    );

    if (article) {
      // Set up the view to show this article
      this.searchQuery = article.numero;
      this.articleRange.set(article.numero);
      this.activeTab.set('articles');
      // Select the article to open it in detail view
      this.articlesService.selectArticle(article);
      this.logger.info(`Navigation vers article ${articleNumero}`, 'CodeContainer');
    } else {
      // Article not found, fall back to search
      this.searchQuery = articleNumero;
      this.activeTab.set('articles');
      this.logger.warn(`Article ${articleNumero} non trouvé`, 'CodeContainer');
    }
  }

  // Event handlers
  onSearch(): void {
    this.articleRange.set(null);
    this.selectedTome.set(null);
    this.selectedTomeId.set(null);
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

    // Gestion des annexes par tomeId
    if (selection.type === 'annexe' && selection.tomeId) {
      this.searchQuery = '';
      this.articleRange.set(null);
      this.selectedTome.set(null);
      this.selectedLivre.set(null);
      this.selectedTomeId.set(selection.tomeId);
      this.selectedChapitre.set(null);
      this.selectedSection.set(null);
      this.sections.set([]);
      this.sousSections.set([]);
      this.paragraphes.set([]);
    } else if (selection.articles) {
      this.searchQuery = '';
      this.articleRange.set(selection.articles);
      this.selectedTome.set(selection.tome ?? null);
      this.selectedLivre.set(selection.livre ?? null);
      this.selectedTomeId.set(null);
      this.selectedChapitre.set(selection.chapitreTitre ?? null);
      this.selectedSection.set(selection.sectionTitre ?? null);
      this.sections.set(selection.sections ?? []);
      this.sousSections.set(selection.sousSections ?? []);
      this.paragraphes.set(selection.paragraphes ?? []);
    } else {
      this.articleRange.set(null);
      this.selectedTome.set(null);
      this.selectedLivre.set(null);
      this.selectedTomeId.set(null);
      this.selectedChapitre.set(null);
      this.selectedSection.set(null);
      this.sections.set([]);
      this.sousSections.set([]);
      this.paragraphes.set([]);
      this.searchQuery = selection.titre;
    }
    this.activeTab.set('articles');
  }

  // Header detection methods
  getSectionHeader(articleNumero: string): string | null {
    const sections = this.sections();
    if (!sections.length) return null;

    for (const section of sections) {
      // Extraire le premier article de la section (ex: "140A-140E" -> "140A", "127-127 quinquies" -> "127")
      const sectionFirstArticle = section.articles.split('-')[0].trim();

      // Comparer avec le numéro exact de l'article
      if (articleNumero === sectionFirstArticle) {
        return section.titre;
      }
    }
    return null;
  }

  getSousSectionHeader(articleNumero: string): string | null {
    return getSousSectionHeaderUtil(articleNumero, this.sousSections());
  }

  /**
   * Retourne le header du paragraphe si l'article est le premier du paragraphe
   * Format: "Paragraphe Y: Titre paragraphe"
   */
  getParagrapheHeader(articleNumero: string): string | null {
    const paragraphes = this.paragraphes();
    if (!paragraphes.length) return null;

    for (const para of paragraphes) {
      // Extraire le premier article du paragraphe (ex: "133-139" -> "133", "140-140 bis" -> "140")
      const paraFirstArticle = para.articles.split('-')[0].trim();

      // Comparer avec le numéro exact de l'article
      if (articleNumero === paraFirstArticle) {
        return `§${para.numero}) ${para.titre}`;
      }
    }
    return null;
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
    // Ne pas afficher de header de paragraphe pour les titres de section (déjà affichés)
    if (this.isSubdivisionHeader(article.numero)) return false;

    const paragraphPrefix = getParagraphPrefix(article.titre);
    // DEBUG
    if (article.numero.startsWith('126-D')) {
      console.log(`🔍 isFirstOfParagraph [${article.numero}]:`, { titre: article.titre, prefix: paragraphPrefix });
    }
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

  /**
   * Retourne les headers au début du contenu de l'article
   * Ex: ["2- Le calcul du résultat intégré", "a) La qualité de redevable unique"]
   * Patterns détectés: "X- Titre" et "a) Titre"
   */
  getPointHeaders(article: Article): string[] {
    if (!article.contenu) return [];

    const headers: string[] = [];
    const lines = article.contenu.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // Pattern "X- Titre" (ex: "1- Conditions", "2- Imposition")
      if (/^\d+-\s*.+$/.test(trimmed)) {
        headers.push(trimmed);
      }
      // Pattern "a) Titre" (ex: "a) La qualité de redevable unique")
      else if (/^[a-z]\)\s*.+$/.test(trimmed)) {
        headers.push(trimmed);
      }
      // Arrêter dès qu'on trouve une ligne qui n'est pas un header
      else if (trimmed.length > 0) {
        break;
      }
    }

    return headers;
  }

  /**
   * Retourne le premier header "X- Titre" (pour compatibilité)
   */
  getPointHeader(article: Article): string | null {
    const headers = this.getPointHeaders(article);
    const xHeader = headers.find(h => /^\d+-/.test(h));
    return xHeader || null;
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

  /**
   * Formate le numéro d'article pour l'affichage
   * - "A3bis-14" → "3bis Art 14"
   * - "A6-26" → "6 Art 26"
   * - "Annexe 1" → "Annexe 1"
   * - "123" → "Art. 123"
   */
  /**
   * Vérifie si c'est un en-tête de subdivision (a), b), etc.) ou un titre de section (T2L1C1-ST1, etc.)
   */
  isSubdivisionHeader(numero: string): boolean {
    // Pattern pour subdivisions d'annexe (A6-1a, A6-3b)
    if (/^A\d+-\d+[a-z]$/i.test(numero)) return true;
    // Pattern pour titres de section Tome 2 (T2L1C1-ST1, T2L1C2-ST10a, etc.)
    if (/^T\d+L\d+C\d+-ST\d+[a-z]?$/i.test(numero)) return true;
    return false;
  }

  formatArticleNumero(numero: string): string {
    // Pattern pour les en-têtes de subdivision d'annexe avec position (ex: A6-1a, A6-3b)
    const subdivMatch = numero.match(/^A(\d+)-(\d+)([a-z])$/i);
    if (subdivMatch) {
      return `${subdivMatch[3]})`;  // Affiche juste "a)" ou "b)"
    }

    // Pattern pour titres de section Tome 2 (T2L1C1-ST1, T2L1C2-ST10a, etc.) - pas de numéro affiché
    if (/^T\d+L\d+C\d+-ST\d+[a-z]?$/i.test(numero)) {
      return '';  // Le titre sera affiché à la place
    }

    // Pattern pour les articles d'annexes avec position (ex: A6-2-26, A6-4-18)
    const posArticleMatch = numero.match(/^A(\d+)-(\d+)-(\d+)$/i);
    if (posArticleMatch) {
      return `Art. ${posArticleMatch[3]}`;  // Affiche "Art. 26", "Art. 18"
    }

    // Pattern pour les articles d'annexes avec préfixe simple (ex: A3bis-14)
    const annexeMatch = numero.match(/^A(\d+(?:\s*bis|\s*ter|\s*quater)?)-(\d+)$/i);
    if (annexeMatch) {
      return `${annexeMatch[1]} Art ${annexeMatch[2]}`;
    }

    // Si c'est une annexe directe (Annexe 1, Annexe 3 bis)
    if (numero.startsWith('Annexe')) {
      return numero;
    }

    // Sinon, format standard
    return 'Art. ' + numero;
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
