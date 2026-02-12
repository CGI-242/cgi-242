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
  getParagraphPrefix,
  getLetterPrefix,
  getCleanTitle as getCleanTitleUtil,
  getParagraphHeader as getParagraphHeaderUtil,
  getLetterHeader as getLetterHeaderUtil,
  getUpperLetterHeader as getUpperLetterHeaderUtil,
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
        // Cas spécial: titres de section (T2L1C1-ST1, T2L1C2-ST10a, etc.) et articles non codifiés (T2L2C6-A1, etc.)
        // Format: T{tome}L{livre}C{chapitre}-ST{numero}[a-z]? ou T{tome}L{livre}C{chapitre}-A{numero}
        const sectionTitleMatch = a.numero.match(/^T(\d+)L(\d+)C(\d+)-(ST\d+[a-z]?|A\d+)$/i);
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
      // Fonction pour extraire la position de tri des titres de section et articles non codifiés
      // Format: T{tome}L{livre}C{chapitre}-ST{numero}[a-z]? ou T{tome}L{livre}C{chapitre}-A{numero}
      const getSectionTitleSortNum = (numero: string): number | null => {
        const match = numero.match(/^T(\d+)L(\d+)C(\d+)-(ST(\d+)([a-z])?|A(\d+))$/i);
        if (!match) return null;
        const chapNum = parseInt(match[3], 10);
        // Pour les articles non codifiés (T2L2C6-A1, etc.)
        if (match[7]) {
          const ncPositions: Record<string, number> = {
            'T2L2C6-A1': 152, 'T2L2C6-A2': 153, 'T2L2C6-A3': 154,
            'T2L2C6-A4': 155, 'T2L2C6-A5': 156, 'T2L2C6-A6': 157,
          };
          return ncPositions[numero] ?? null;
        }
        const stNum = parseInt(match[5], 10);
        const suffix = match[6] ? match[6].toLowerCase().charCodeAt(0) - 96 : 0; // a=1, b=2, etc.
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
          },
          // Chapitre 3: Délais pour l'enregistrement
          3: {
            1: 62.9,  // ST1 avant Art. 63 - Actes de ventes publiques mobilières
            2: 63.9,  // ST2 avant Art. 64 - Testaments
            3: 64.9,  // ST3 avant Art. 65 - Actes sous-seing privé et mutations verbales
            4: 66.9,  // ST4 avant Art. 67 - Locations verbales
            5: 68.9,  // ST5 avant Art. 69 - Droit au bail
            6: 69.9,  // ST6 avant Art. 70 - Fonds de commerce et clientèle
            7: 70.9,  // ST7 avant Art. 71 - Conventions synallagmatiques
            8: 73.9,  // ST8 avant Art. 74 - Mutations par décès
            9: 78.9,  // ST9 avant Art. 79 - Dispositions communes
          },
          // Chapitre 4: Bureaux d'enregistrement
          4: {
            1: 87.9,  // ST1 avant Art. 88 - Mutations par décès
          },
          // Chapitre 5: Paiement des droits
          5: {
            1: 89.9,  // ST1 avant Art. 90 - Obligation au paiement
            2: 92.9,  // ST2 avant Art. 93 - Contribution au paiement
            3: 96.9,  // ST3 avant Art. 97 - Fractionnement des droits
          },
          // Chapitre 6: Peines pour défaut d'enregistrement dans les délais
          6: {
            1: 98.9,   // ST1 avant Art. 99 - Actes publics
            2: 104.9,  // ST2 avant Art. 105 - Testaments
            3: 105.9,  // ST3 avant Art. 106 - Actes sous-seing privé et mutations verbales
            4: 111.9,  // ST4 avant Art. 112 - Mutations par décès
          },
          // Chapitre 7: Insuffisances et dissimulations
          7: {
            1: 116.9,  // ST1 avant Art. 117 - Insuffisances et expertise
            2: 124.9,  // ST2 avant Art. 125 - Dissimulations
          },
          // Chapitre 8: Obligations des parties
          8: {
            1: 131.9,  // ST1 avant Art. 132 - Actes en conséquence
            2: 146.9,  // ST2 avant Art. 147 - Dépôt d'un double
            3: 148.9,  // ST3 avant Art. 149 - Affirmation de sincérité
            4: 151.9,  // ST4 avant Art. 152 - Assistance judiciaire
            5: 152.9,  // ST5 avant Art. 153 - Droit de communication
            6: 159.9,  // ST6 avant Art. 160 - Répertoires
            7: 167.9,  // ST7 avant Art. 168 - Ventes publiques de meubles
            8: 174.9,  // ST8 avant Art. 175 - Mutations par décès
            9: 176.9,  // ST9 avant Art. 177 - I. Immeubles
            10: 177.9, // ST10 avant Art. 178 - II. Notice des décès
            11: 178.9, // ST11 avant Art. 179 - III. Rentes sur l'État
            12: 180.9, // ST12 avant Art. 181 - IV. Polices d'assurances
            13: 182.9, // ST13 avant Art. 183 - V. Obligations dépositaires
            14: 183.9, // ST14 avant Art. 184 - Obligations des receveurs
          },
          // Chapitre 9: Droits acquis et prescriptions
          9: {
            1: 187.9,  // ST1 avant Art. 188 - 1) Dispositions générales
            2: 192.9,  // ST2 avant Art. 193 - 3) Prescription, action de l'administration
            3: 199.9,  // ST3 avant Art. 200 - 4) Actions des parties
          },
        };
        // Mapping spécifique pour les sous-sections avec suffixes (ST10a, ST10b, etc.)
        const suffixPositions: Record<string, number> = {
          'T2L1C2-ST10a': 37.91,  // I. Règles générales - après ST10
          'T2L1C2-ST10b': 41.9,   // II. Déduction des dettes et charges - avant Art. 42
          'T2L1C2-ST10c': 50.9,   // III. Dispositions spéciales - avant Art. 51
          'T2L1C2-ST10d': 53.9,   // IV. Nue-propriété et l'usufruit - avant Art. 54
          'T2L1C9-ST1a': 188.9,   // 2) Dispositions particulières - avant Art. 189
          'T2L1C9-ST2a': 192.91,  // I. Droits - après ST2
          'T2L1C9-ST2b': 193.9,   // II. Pénalités - avant Art. 194
          'T2L1C9-ST2c': 194.9,   // III. Dispositions diverses - avant Art. 195
          'T2L1C11-INTRO': 208.9, // Introduction Chapitre 11 - avant Art. 209
          'T2L1C11-ST1': 208.91, // 1) Droit fixe 10.000 F - avant Art. 209
          'T2L1C11-ST2': 209.9,  // 2) Droit fixe 15.000 F - avant Art. 210
          'T2L1C11-ST3': 210.9,  // 3) Droit fixe 20.000 F - avant Art. 211
          'T2L1C11-ST4': 211.9,  // 4) Droits proportionnels - avant Art. 212
          'T2L1C11-ST5': 212.9,  // Abandonnements - avant Art. 213
          'T2L1C11-ST6': 213.9,  // Actions, obligations - avant Art. 214
          'T2L1C11-ST7': 215.5,  // Créances - avant Art. 215 bis
          'T2L1C11-ST8': 215.9,  // Baux - avant Art. 216
          'T2L1C11-ST9': 219.9,  // Command (élections ou déclarations de) - avant Art. 220
          'T2L1C11-ST10': 222.9, // Contrats de mariage - avant Art. 223
          'T2L1C11-ST11': 223.9, // Échanges d'immeubles - avant Art. 224
          'T2L1C11-ST12': 224.9, // Fonds de commerce et clientèle - avant Art. 225
          'T2L1C11-ST13': 226.9, // Jugements et arrêts - avant Art. 227
          'T2L1C11-ST14': 230.9, // Droit de titre - avant Art. 231
          'T2L1C11-ST15': 232.9, // Licitations - avant Art. 233
          'T2L1C11-ST16': 237.9, // Mutations à titre gratuit - avant Art. 238
          'T2L1C11-ST17': 242.9, // Mutations par décès - avant Art. 243
          'T2L1C11-ST18': 252.9, // Obligations hypothécaires négociables - avant Art. 253
          'T2L1C11-ST19': 254.9, // Partages - avant Art. 255
          'T2L1C11-ST20': 257.9, // Rentes (Constitutions et délégations) - avant Art. 258
          'T2L1C11-ST21': 258.9, // Sociétés - avant Art. 259
          'T2L1C11-ST22': 262.9, // Ventes immobilières - avant Art. 263
          'T2L1C12-ST1': 280.9,  // Actes à enregistrer gratis - avant Art. 281
          'T2L1C12-ST2': 285.9,  // Actes exempts de la formalité de l'enregistrement - avant Art. 286
          'T2L1C13-ST1': 331.9,  // 1) Assiette de la taxe - avant Art. 332
          'T2L1C13-ST2': 332.9,  // 2) Taux - avant Art. 333
          'T2L1C13-ST3': 334.9,  // 3) Dispense de la taxe - avant Art. 335
          'T2L1C13-ST4': 335.9,  // 4) Liquidation et paiement de la taxe - avant Art. 336
          'T2L1C13-ST5': 339.9,  // 5) Solidarité des redevables - avant Art. 340
          'T2L1C13-ST6': 340.9,  // 6) Obligations des assureurs - avant Art. 341
          'T2L1C13-ST7': 342.9,  // 7) Droit de communication - avant Art. 343
          'T2L1C13-ST8': 343.9,  // 8) Pénalités - avant Art. 344
          'T2L1C13-ST9': 344.9,  // 9) Prescription - avant Art. 345
          'T2L1C13-ST10': 347.9, // 10) Poursuites et instances - avant Art. 348
          'T2L2C1-ST1': 1.8,    // Débiteur des droits - avant Art. 2
          'T2L2C1-ST2': 3.8,    // Restrictions et prohibitions diverses - avant Art. 4
          'T2L2C1-ST3': 14.8,   // Poursuites et instances - Prescription - avant Art. 15
          'T2L2C1-ST4': 19.8,   // Droit de communication - avant Art. 20
          'T2L2C2-ST1': 33.8,   // A. Actes soumis au timbre de dimension - avant Art. 34
          'T2L2C2-ST1a': 33.81, // I. Règles générales - après ST1
          'T2L2C2-ST1b': 35.8,  // II. Applications particulières - avant Art. 36
          'T2L2C2-ST2': 36.8,   // B. Règles spéciales aux copies d'exploits - avant Art. 37
          'T2L2C2-ST3': 42.8,   // C. Prescriptions et prohibitions diverses - avant Art. 43
          'T2L2C4-ST1': 51.8,   // 1) Actes soumis à un visa spécial - avant Art. 52
          'T2L2C4-ST2': 52.8,   // 2) Actes visés pour timbre en débet - avant Art. 53
          'T2L2C4-ST3': 53.8,   // 3) Actes exempts de timbre - avant Art. 54
          'T2L2C6-ST1': 151.8,  // Droits de timbre non codifiés - après Art. 151
          'T2L2C6-ST2': 151.81, // 1. Timbre électronique fiscal - après ST1
          'T2L3C1-ST1': 0.8,   // I. Valeurs soumises à la taxe - avant Art. 1
          'T2L3C1-ST2': 2.8,   // II. Tarif de l'impôt - avant Art. 3
          'T2L3C1-ST3': 3.8,   // III. Assiette et mode de perception - avant Art. 4
          'T2L3C1-ST3a': 3.81, // 1) Détermination du revenu - après ST3
          'T2L3C1-ST3b': 4.8,  // 2) Mode d'évaluation du taux d'émission - avant Art. 5
          'T2L3C1-ST3c': 5.8,  // 3) Remboursements et amortissements - avant Art. 6
          'T2L3C1-ST3d': 6.8,  // 4) Lieu de paiement - avant Art. 7
          'T2L3C1-ST3e': 7.8,  // 5) Mode de paiement - avant Art. 8
          'T2L3C1-ST3f': 11.8, // 6) Pénalités - avant Art. 12
          'T2L3C2-ST1': 12.8,  // 1) Procédure - avant Art. 13
          'T2L3C2-ST2': 14.8,  // 2) Prescriptions - avant Art. 15
          'T2L3C2-ST3': 16.8,  // 3) Droit de communication - avant Art. 17
          'T2L2C6-A1': 152,    // Art. 1 - Institution du timbre électronique fiscal
          'T2L2C6-A2': 153,    // Art. 2 - Émission du timbre électronique par l'ARPCE
          'T2L2C6-A3': 154,    // Art. 3 - Montant du timbre électronique fiscal
          'T2L2C6-A4': 155,    // Art. 4 - Certification des paiements électroniques
          'T2L2C6-A5': 156,    // Art. 5 - Clé de répartition
          'T2L2C6-A6': 157,    // Art. 6 - Charges transaction non conforme
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
      // Extraction simple du numéro d'article
      const getArtNumSimple = (numero: string): number => {
        return parseInt(numero.match(/(\d+)/)?.[1] || '0', 10);
      };

      // Titre de section vs article normal
      if (stNumA !== null) {
        return stNumA - getArtNumSimple(b.numero);
      }
      if (stNumB !== null) {
        return getArtNumSimple(a.numero) - stNumB;
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
      const numA = getArtNumSimple(a.numero);
      const numB = getArtNumSimple(b.numero);
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
    this.articlesService.loadArticles({ limit: 3000 })
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

    // Pattern pour articles non codifiés (T2L2C6-A1, etc.) - afficher comme "Art. 1"
    const nonCodifMatch = numero.match(/^T\d+L\d+C\d+-A(\d+)$/i);
    if (nonCodifMatch) {
      return `Art. ${nonCodifMatch[1]}`;
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
