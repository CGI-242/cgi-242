/**
 * Service d'interprétation IRPP → Impôts cédulaires 2026
 *
 * Ce service gère la correspondance entre les références à l'IRPP (supprimé)
 * et les nouveaux impôts cédulaires introduits par la LF 2026 :
 * - IBA : Impôt sur les Bénéfices d'Affaires
 * - ITS : Impôt sur les Traitements et Salaires
 * - IRCM : Impôt sur le Revenu des Capitaux Mobiliers
 * - IRF : Impôt sur les Revenus Fonciers
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
export type NiveauConfiance = 'haute' | 'moyenne' | 'basse';
export type ImpotCedulaire = 'IBA' | 'ITS' | 'IRCM' | 'IRF';

export interface ModificationLF2026 {
  alineas_1_8?: string;
  alinea_9?: {
    statut: string;
    texte: string;
  };
  [key: string]: any;
}

export interface ArticleNonModifie {
  article: string;
  titre: string;
  chapitre: number;
  fichier_source: string;
  mention_irpp: boolean;
  texte_original_extrait?: string;
  contexte: string;
  interpretation_2026: ImpotCedulaire | ImpotCedulaire[];
  confiance: NiveauConfiance;
  statut_lf2026: 'non modifié' | 'partiellement modifié' | 'modifié';
  justification: string;
  modification_lf2026?: ModificationLF2026;
}

export interface ImpotCedulaireInfo {
  nom_complet: string;
  articles: string;
  champ: string;
  ancien_irpp: string;
}

export interface CorrespondancesIRPP {
  meta: {
    description: string;
    base_legale: string;
    date_application: string;
    note: string;
  };
  impots_cedulaires: Record<ImpotCedulaire, ImpotCedulaireInfo>;
  articles_non_modifies: ArticleNonModifie[];
  regles_interpretation: {
    principe: string;
    regles: Array<{
      contexte: string;
      interpretation: ImpotCedulaire | ImpotCedulaire[];
      confiance: NiveauConfiance;
    }>;
  };
  avertissement_utilisateur: {
    message_standard: string;
    message_confiance_moyenne: string;
    message_modification: string;
  };
}

export interface InterpretationResult {
  article: string;
  titre: string;
  mention_irpp: boolean;
  interpretation: ImpotCedulaire | ImpotCedulaire[];
  interpretation_texte: string;
  confiance: NiveauConfiance;
  note_utilisateur: string;
  modification_2026?: ModificationLF2026;
  statut_lf2026: string;
}

export interface RechercheResult {
  terme_recherche: string;
  articles_trouves: InterpretationResult[];
  total: number;
}

export class InterpretationIRPPService {
  private correspondances: CorrespondancesIRPP;
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(__dirname, '..', 'data', 'correspondances-irpp-2026.json');
    this.loadCorrespondances();
  }

  /**
   * Charge le fichier de correspondances
   */
  private loadCorrespondances(): void {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf-8');
      this.correspondances = JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors du chargement des correspondances IRPP:', error);
      throw new Error('Impossible de charger le fichier de correspondances IRPP');
    }
  }

  /**
   * Recharge les correspondances (utile après modification du fichier)
   */
  public reloadCorrespondances(): void {
    this.loadCorrespondances();
  }

  /**
   * Vérifie si un article mentionne IRPP et retourne l'interprétation 2026
   */
  public getInterpretation(articleNumber: string): InterpretationResult | null {
    const article = this.correspondances.articles_non_modifies.find(
      a => a.article.toLowerCase() === articleNumber.toLowerCase() ||
           a.article.replace('Art. ', '').toLowerCase() === articleNumber.toLowerCase().replace('art. ', '')
    );

    if (!article) return null;

    return {
      article: article.article,
      titre: article.titre,
      mention_irpp: article.mention_irpp,
      interpretation: article.interpretation_2026,
      interpretation_texte: this.formatInterpretation(article.interpretation_2026),
      confiance: article.confiance,
      note_utilisateur: this.generateNote(article),
      modification_2026: article.modification_lf2026,
      statut_lf2026: article.statut_lf2026
    };
  }

  /**
   * Formate l'interprétation en texte lisible
   */
  private formatInterpretation(interpretation: ImpotCedulaire | ImpotCedulaire[]): string {
    if (Array.isArray(interpretation)) {
      const noms = interpretation.map(i => this.getImpotNomComplet(i));
      return noms.join(' / ');
    }
    return this.getImpotNomComplet(interpretation);
  }

  /**
   * Retourne le nom complet d'un impôt cédulaire
   */
  public getImpotNomComplet(code: ImpotCedulaire): string {
    const info = this.correspondances.impots_cedulaires[code];
    return info ? `${code} (${info.nom_complet})` : code;
  }

  /**
   * Retourne les informations complètes d'un impôt cédulaire
   */
  public getImpotInfo(code: ImpotCedulaire): ImpotCedulaireInfo | null {
    return this.correspondances.impots_cedulaires[code] || null;
  }

  /**
   * Génère la note d'interprétation pour l'utilisateur
   */
  private generateNote(article: ArticleNonModifie): string {
    const impot = Array.isArray(article.interpretation_2026)
      ? article.interpretation_2026.map(i => this.getImpotNomComplet(i)).join(' ou ')
      : this.getImpotNomComplet(article.interpretation_2026);

    let note = `⚠️ NOTE CGI242 : Cet article mentionne "IRPP" qui a été supprimé par la LF 2026. `;
    note += `Selon le contexte (${article.contexte}), cette référence doit s'interpréter comme : ${impot}. `;
    note += `(Niveau de confiance : ${article.confiance})`;

    if (article.confiance === 'moyenne' || article.confiance === 'basse') {
      note += `\n\n💡 ${this.correspondances.avertissement_utilisateur.message_confiance_moyenne}`;
    }

    if (article.modification_lf2026) {
      note += `\n\n🆕 MODIFICATION LF 2026 : `;
      if (article.modification_lf2026.alinea_9) {
        note += `\nAlinéa 9 (nouveau) : ${article.modification_lf2026.alinea_9.texte}`;
      }
    }

    return note;
  }

  /**
   * Recherche tous les articles mentionnant un terme obsolète
   */
  public findArticlesWithObsoleteTerm(term: string): RechercheResult {
    const termLower = term.toLowerCase();

    const articlesFiltered = this.correspondances.articles_non_modifies
      .filter(a => {
        if (termLower === 'irpp') return a.mention_irpp;
        // Extensible pour d'autres termes obsolètes à l'avenir
        return false;
      })
      .map(a => this.getInterpretation(a.article)!)
      .filter(r => r !== null);

    return {
      terme_recherche: term,
      articles_trouves: articlesFiltered,
      total: articlesFiltered.length
    };
  }

  /**
   * Vérifie si un article a été modifié par la LF 2026
   */
  public hasModificationLF2026(articleNumber: string): boolean {
    const article = this.correspondances.articles_non_modifies.find(
      a => a.article === articleNumber
    );
    return article?.modification_lf2026 !== undefined;
  }

  /**
   * Retourne tous les articles non modifiés mentionnant IRPP
   */
  public getAllArticlesWithIRPP(): ArticleNonModifie[] {
    return this.correspondances.articles_non_modifies.filter(a => a.mention_irpp);
  }

  /**
   * Retourne les informations de tous les impôts cédulaires
   */
  public getAllImpotsCedulaires(): Record<ImpotCedulaire, ImpotCedulaireInfo> {
    return this.correspondances.impots_cedulaires;
  }

  /**
   * Retourne le message d'avertissement standard
   */
  public getAvertissementStandard(): string {
    return this.correspondances.avertissement_utilisateur.message_standard;
  }

  /**
   * Détermine l'interprétation basée sur le contexte textuel
   */
  public interpretByContext(contexte: string): {
    interpretation: ImpotCedulaire | ImpotCedulaire[];
    confiance: NiveauConfiance;
  } {
    const contexteLower = contexte.toLowerCase();

    // Mots-clés pour ITS
    if (contexteLower.includes('salaire') ||
        contexteLower.includes('traitement') ||
        contexteLower.includes('pension') ||
        contexteLower.includes('rente viagère') ||
        contexteLower.includes('employeur') ||
        contexteLower.includes('employé')) {
      return { interpretation: 'ITS', confiance: 'haute' };
    }

    // Mots-clés pour IBA
    if (contexteLower.includes('bénéfice') ||
        contexteLower.includes('commercial') ||
        contexteLower.includes('industriel') ||
        contexteLower.includes('artisan') ||
        contexteLower.includes('agricole') ||
        contexteLower.includes('profession libérale')) {
      return { interpretation: 'IBA', confiance: 'haute' };
    }

    // Mots-clés pour IRCM
    if (contexteLower.includes('dividende') ||
        contexteLower.includes('intérêt') ||
        contexteLower.includes('valeur mobilière') ||
        contexteLower.includes('capital')) {
      return { interpretation: 'IRCM', confiance: 'haute' };
    }

    // Mots-clés pour IRF
    if (contexteLower.includes('foncier') ||
        contexteLower.includes('locatif') ||
        contexteLower.includes('loyer') ||
        contexteLower.includes('propriété')) {
      return { interpretation: 'IRF', confiance: 'haute' };
    }

    // Contexte général ou mixte
    return {
      interpretation: ['IBA', 'ITS', 'IRCM', 'IRF'],
      confiance: 'moyenne'
    };
  }
}

// Export singleton pour utilisation dans l'application
export const interpretationIRPPService = new InterpretationIRPPService();
