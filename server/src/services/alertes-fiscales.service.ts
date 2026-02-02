// server/src/services/alertes-fiscales.service.ts
import { prisma } from '../config/database.js';
import { AlerteType, AlerteCategorie, AlerteFiscale, Prisma } from '@prisma/client';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('AlertesFiscalesService');

// Patterns regex pour l'extraction automatique
const PATTERNS = {
  // Échéances: "au plus tard le 15", "le 15 du mois"
  echeances: /au plus tard le (\d{1,2})/gi,

  // Montants: "100.000.000 FCFA", "3.000.000 francs"
  montants: /(\d{1,3}(?:[.,]\d{3})*)\s*(?:FCFA|francs)/gi,

  // Pourcentages: "28%", "1 %"
  pourcentages: /(\d{1,3}(?:[.,]\d{1,2})?)\s*%/g,

  // Sanctions: "amende de", "pénalité de", "sanction"
  sanctions: /(?:amende|pénalité|sanction)(?:\s+(?:fiscale|de))?\s+(?:de\s+)?(\d{1,3}(?:[.,]\d{3})*)/gi,
};

// Alertes prédéfinies basées sur le Chapitre 1 du CGI
const ALERTES_PREDEFINIES: Array<{
  articleNumero: string;
  type: AlerteType;
  categorie: AlerteCategorie;
  titre: string;
  description: string;
  valeur: string;
  valeurNumerique?: number;
  unite?: string;
  periodicite?: string;
}> = [
  // Taux IS
  {
    articleNumero: '86A',
    type: 'TAUX',
    categorie: 'IS',
    titre: 'Taux général IS',
    description: 'Taux de l\'impôt sur les sociétés applicable aux personnes morales de droit congolais',
    valeur: '28%',
    valeurNumerique: 28,
    unite: '%',
  },
  {
    articleNumero: '86A',
    type: 'TAUX',
    categorie: 'IS',
    titre: 'Taux IS microfinance',
    description: 'Taux de l\'impôt sur les sociétés applicable aux institutions de microfinance',
    valeur: '25%',
    valeurNumerique: 25,
    unite: '%',
  },
  {
    articleNumero: '86A',
    type: 'TAUX',
    categorie: 'PM_ETRANGERES',
    titre: 'Taux IS personnes morales étrangères',
    description: 'Taux de l\'impôt sur les sociétés applicable aux personnes morales étrangères',
    valeur: '33%',
    valeurNumerique: 33,
    unite: '%',
  },
  // Minimum de perception
  {
    articleNumero: '86C',
    type: 'TAUX',
    categorie: 'MINIMUM_PERCEPTION',
    titre: 'Minimum de perception IS',
    description: 'Taux du minimum de perception de l\'impôt sur les sociétés',
    valeur: '1%',
    valeurNumerique: 1,
    unite: '%',
  },
  // Échéances acomptes IS
  {
    articleNumero: '86C',
    type: 'ECHEANCE',
    categorie: 'IS',
    titre: 'Acompte IS - Mars',
    description: 'Date limite de paiement du premier acompte provisionnel IS (15 mars)',
    valeur: '15 mars',
    valeurNumerique: 15,
    unite: 'jour',
    periodicite: 'trimestriel',
  },
  {
    articleNumero: '86C',
    type: 'ECHEANCE',
    categorie: 'IS',
    titre: 'Acompte IS - Juin',
    description: 'Date limite de paiement du deuxième acompte provisionnel IS (15 juin)',
    valeur: '15 juin',
    valeurNumerique: 15,
    unite: 'jour',
    periodicite: 'trimestriel',
  },
  {
    articleNumero: '86C',
    type: 'ECHEANCE',
    categorie: 'IS',
    titre: 'Acompte IS - Septembre',
    description: 'Date limite de paiement du troisième acompte provisionnel IS (15 septembre)',
    valeur: '15 septembre',
    valeurNumerique: 15,
    unite: 'jour',
    periodicite: 'trimestriel',
  },
  {
    articleNumero: '86C',
    type: 'ECHEANCE',
    categorie: 'IS',
    titre: 'Acompte IS - Décembre',
    description: 'Date limite de paiement du quatrième acompte provisionnel IS (15 décembre)',
    valeur: '15 décembre',
    valeurNumerique: 15,
    unite: 'jour',
    periodicite: 'trimestriel',
  },
  // Prix de transfert
  {
    articleNumero: '81',
    type: 'SEUIL',
    categorie: 'PRIX_TRANSFERT',
    titre: 'Seuil documentation prix de transfert',
    description: 'Seuil de chiffre d\'affaires déclenchant l\'obligation de documentation des prix de transfert',
    valeur: '500.000.000 FCFA',
    valeurNumerique: 500000000,
    unite: 'FCFA',
  },
  // Retenue à la source
  {
    articleNumero: '92B',
    type: 'ECHEANCE',
    categorie: 'IS',
    titre: 'Paiement IS retenu à la source',
    description: 'Date limite de versement de l\'IS retenu à la source (15 du mois suivant)',
    valeur: '15 du mois suivant',
    valeurNumerique: 15,
    unite: 'jour',
    periodicite: 'mensuel',
  },
  // Sanctions
  {
    articleNumero: '92E',
    type: 'SANCTION',
    categorie: 'DECLARATIONS',
    titre: 'Défaut déclaration factures',
    description: 'Amende forfaitaire pour défaut de déclaration des factures',
    valeur: '100.000 FCFA',
    valeurNumerique: 100000,
    unite: 'FCFA',
  },
  {
    articleNumero: '92E',
    type: 'SANCTION',
    categorie: 'IS',
    titre: 'Non-paiement après mise en demeure',
    description: 'Pénalité pour non-paiement après mise en demeure',
    valeur: '100% des droits',
    valeurNumerique: 100,
    unite: '%',
  },
  {
    articleNumero: '92I',
    type: 'SANCTION',
    categorie: 'DECLARATIONS',
    titre: 'Défaut déclaration trimestrielle',
    description: 'Amende pour défaut de déclaration trimestrielle',
    valeur: '3.000.000 FCFA',
    valeurNumerique: 3000000,
    unite: 'FCFA',
  },
  {
    articleNumero: '92I',
    type: 'SANCTION',
    categorie: 'DECLARATIONS',
    titre: 'Défaut enregistrement contrat',
    description: 'Amende pour défaut d\'enregistrement de contrat',
    valeur: '5.000.000 FCFA',
    valeurNumerique: 5000000,
    unite: 'FCFA',
  },
  // Régime dérogatoire pétrolier
  {
    articleNumero: '92J',
    type: 'SEUIL',
    categorie: 'IS',
    titre: 'Régime dérogatoire pétrolier',
    description: 'Seuil du chiffre d\'affaires pour le régime dérogatoire pétrolier',
    valeur: '70% CA',
    valeurNumerique: 70,
    unite: '%',
  },

  // ========================================
  // CHAPITRE 2: IMPÔTS SUR LES REVENUS
  // ========================================

  // IBA - Impôt sur les bénéfices d'affaires
  {
    articleNumero: '95',
    type: 'TAUX',
    categorie: 'IBA',
    titre: 'Taux IBA régime réel',
    description: 'Taux de l\'impôt sur les bénéfices d\'affaires en régime réel',
    valeur: '28%',
    valeurNumerique: 28,
    unite: '%',
  },
  {
    articleNumero: '96',
    type: 'SEUIL',
    categorie: 'IBA',
    titre: 'Seuil TPE - Régime libératoire',
    description: 'Chiffre d\'affaires maximum pour les très petites entreprises (régime libératoire)',
    valeur: '30.000.000 FCFA',
    valeurNumerique: 30000000,
    unite: 'FCFA',
  },
  // NOTE: Les alertes IRCM et IRF ont été retirées car les numéros d'articles (106-113)
  // ont des doublons dans différentes parties du code (timbre, impôts directs).
  // Il faudrait ajouter un champ 'tome' ou 'partie' pour les distinguer.

  // ITS - Impôt sur les traitements et salaires
  // NOTE: Les alertes barème ITS ont été retirées car l'article 116 a des doublons.
  {
    articleNumero: '116A',
    type: 'ECHEANCE',
    categorie: 'ITS',
    titre: 'Versement ITS retenu',
    description: 'Date limite de versement de l\'ITS retenu par l\'employeur',
    valeur: '15 du mois suivant',
    valeurNumerique: 15,
    unite: 'jour',
    periodicite: 'mensuel',
  },

  // ========================================
  // CHAPITRE 4: DISPOSITIONS COMMUNES
  // ========================================
  {
    articleNumero: '128',
    type: 'ECHEANCE',
    categorie: 'DECLARATIONS',
    titre: 'Déclaration d\'existence',
    description: 'Délai pour souscrire une déclaration d\'existence auprès de l\'administration fiscale après le début des opérations',
    valeur: '15 jours',
    valeurNumerique: 15,
    unite: 'jour',
  },
  {
    articleNumero: '312',
    type: 'ECHEANCE',
    categorie: 'IBA',
    titre: 'Déclaration CA régime forfait',
    description: 'Date limite de dépôt de la déclaration de chiffre d\'affaires pour le régime du forfait',
    valeur: '30 avril',
    valeurNumerique: 30,
    unite: 'jour',
    periodicite: 'annuel',
  },
  // ========================================
  // PARTIE 2 - IMPÔTS LOCAUX
  // ========================================
  // NOTE: La plupart des articles de cette partie (277, 287, 309, 321, 326, 333, 354)
  // ont des doublons avec le timbre/enregistrement.
  // Ces alertes ont été retirées pour éviter toute confusion.
  // Pour les réactiver, il faudrait ajouter un champ 'tome' ou 'partie' au modèle.

  // Centimes additionnels
  {
    articleNumero: '369',
    type: 'TAUX',
    categorie: 'PATENTE',
    titre: 'Centimes additionnels patente - Maximum',
    description: 'Taux maximum des centimes additionnels à la patente',
    valeur: '7%',
    valeurNumerique: 7,
    unite: '%',
  },
  {
    articleNumero: '369 bis',
    type: 'TAUX',
    categorie: 'PATENTE',
    titre: 'Centimes additionnels patente - Taux fixé',
    description: 'Taux des centimes additionnels à la patente (L.F.2025)',
    valeur: '5%',
    valeurNumerique: 5,
    unite: '%',
  },

  // ========================================
  // PARTIE 3 - SANCTIONS ET RECOUVREMENT
  // ========================================

  // Sanctions
  {
    articleNumero: '372',
    type: 'SANCTION',
    categorie: 'SANCTIONS',
    titre: 'Taxation d\'office - Majoration',
    description: 'Majoration pour les contribuables taxés d\'office',
    valeur: '100%',
    valeurNumerique: 100,
    unite: '%',
  },
  {
    articleNumero: '373',
    type: 'SANCTION',
    categorie: 'SANCTIONS',
    titre: 'Déclaration inexacte - Majoration',
    description: 'Majoration pour insuffisance de déclaration relevée lors du contrôle',
    valeur: '50%',
    valeurNumerique: 50,
    unite: '%',
  },
  {
    articleNumero: '374',
    type: 'SANCTION',
    categorie: 'SANCTIONS',
    titre: 'Insuffisance déclaration - Majoration',
    description: 'Majoration pour inexactitude, insuffisance ou omission dans les déclarations',
    valeur: '50%',
    valeurNumerique: 50,
    unite: '%',
  },
  // NOTE: Articles 375, 381 retirés (contenu incorrect ou "Sans objet")

  // Prescriptions
  {
    articleNumero: '382',
    type: 'SEUIL',
    categorie: 'RECOUVREMENT',
    titre: 'Délai de prescription ordinaire',
    description: 'Délai de prescription du droit de reprise de l\'administration (quatrième année suivante)',
    valeur: '4 ans',
    valeurNumerique: 4,
    unite: 'an',
  },
  // NOTE: Article 383 retiré - dit 3 ans, pas 10 ans
  // NOTE: Articles 427, 435, 459, 481 retirés - contenus ne correspondent pas aux alertes
];

export interface AlerteFilters {
  type?: AlerteType;
  categorie?: AlerteCategorie;
  version?: string;
  actif?: boolean;
  articleNumero?: string;
}

export interface ExtractResult {
  total: number;
  inserted: number;
  updated: number;
}

export class AlertesFiscalesService {
  /**
   * Récupérer les alertes avec filtres
   */
  static async getAlertes(filters: AlerteFilters = {}): Promise<AlerteFiscale[]> {
    try {
      const where: Prisma.AlerteFiscaleWhereInput = {};

      if (filters.type) {
        where.type = filters.type;
      }
      if (filters.categorie) {
        where.categorie = filters.categorie;
      }
      if (filters.version) {
        where.version = filters.version;
      }
      if (filters.actif !== undefined) {
        where.actif = filters.actif;
      }
      if (filters.articleNumero) {
        where.articleNumero = filters.articleNumero;
      }

      const alertes = await prisma.alerteFiscale.findMany({
        where,
        orderBy: [
          { type: 'asc' },
          { categorie: 'asc' },
          { articleNumero: 'asc' },
        ],
        include: {
          article: {
            select: {
              id: true,
              numero: true,
              titre: true,
            },
          },
        },
      });

      logger.info(`${alertes.length} alertes récupérées`, { filters });
      return alertes;
    } catch (error) {
      logger.error('Erreur lors de la récupération des alertes', error);
      throw error;
    }
  }

  /**
   * Récupérer une alerte par son ID
   */
  static async getAlerteById(id: string): Promise<AlerteFiscale | null> {
    try {
      const alerte = await prisma.alerteFiscale.findUnique({
        where: { id },
        include: {
          article: {
            select: {
              id: true,
              numero: true,
              titre: true,
              contenu: true,
            },
          },
        },
      });

      return alerte;
    } catch (error) {
      logger.error(`Erreur lors de la récupération de l'alerte ${id}`, error);
      throw error;
    }
  }

  /**
   * Récupérer les alertes d'un article par son numéro
   */
  static async getAlertesForArticle(articleNumero: string): Promise<AlerteFiscale[]> {
    try {
      const alertes = await prisma.alerteFiscale.findMany({
        where: {
          articleNumero,
          actif: true,
        },
        orderBy: [
          { type: 'asc' },
          { titre: 'asc' },
        ],
        include: {
          article: {
            select: {
              id: true,
              numero: true,
              titre: true,
            },
          },
        },
      });

      logger.info(`${alertes.length} alertes trouvées pour l'article ${articleNumero}`);
      return alertes;
    } catch (error) {
      logger.error(`Erreur lors de la récupération des alertes pour l'article ${articleNumero}`, error);
      throw error;
    }
  }

  /**
   * Extraire les alertes depuis le contenu d'un article
   */
  static extractAlertesFromContent(contenu: string, articleNumero: string): Array<{
    type: AlerteType;
    valeur: string;
    valeurNumerique?: number;
    unite?: string;
  }> {
    const alertes: Array<{
      type: AlerteType;
      valeur: string;
      valeurNumerique?: number;
      unite?: string;
    }> = [];

    // Extraction des échéances
    let match;
    while ((match = PATTERNS.echeances.exec(contenu)) !== null) {
      alertes.push({
        type: 'ECHEANCE',
        valeur: match[1],
        valeurNumerique: parseInt(match[1], 10),
        unite: 'jour',
      });
    }

    // Extraction des montants
    while ((match = PATTERNS.montants.exec(contenu)) !== null) {
      const montantStr = match[1].replace(/[.,]/g, '');
      alertes.push({
        type: 'SEUIL',
        valeur: `${match[1]} FCFA`,
        valeurNumerique: parseInt(montantStr, 10),
        unite: 'FCFA',
      });
    }

    // Extraction des pourcentages
    while ((match = PATTERNS.pourcentages.exec(contenu)) !== null) {
      const pourcentage = match[1].replace(',', '.');
      alertes.push({
        type: 'TAUX',
        valeur: `${match[1]}%`,
        valeurNumerique: parseFloat(pourcentage),
        unite: '%',
      });
    }

    // Extraction des sanctions
    while ((match = PATTERNS.sanctions.exec(contenu)) !== null) {
      const montantStr = match[1].replace(/[.,]/g, '');
      alertes.push({
        type: 'SANCTION',
        valeur: `${match[1]} FCFA`,
        valeurNumerique: parseInt(montantStr, 10),
        unite: 'FCFA',
      });
    }

    logger.debug(`Alertes extraites de l'article ${articleNumero}`, { count: alertes.length });
    return alertes;
  }

  /**
   * Déterminer la catégorie d'une alerte basée sur le contenu et le numéro de l'article
   */
  static determineCategorie(contenu: string, articleNumero: string): AlerteCategorie {
    const contenuLower = contenu.toLowerCase();
    const numArticle = parseInt(articleNumero.replace(/[^\d]/g, ''), 10);

    // Partie 3 - Sanctions et Recouvrement (Art. 372-520)
    if (numArticle >= 372 && numArticle <= 406) {
      if (contenuLower.includes('amende') || contenuLower.includes('pénalité') || contenuLower.includes('majoration')) {
        return 'SANCTIONS';
      }
      return 'DECLARATIONS';
    }
    if (numArticle >= 407 && numArticle <= 458) {
      if (contenuLower.includes('réclamation') || contenuLower.includes('contentieux')) {
        return 'RECLAMATIONS';
      }
      return 'DECLARATIONS';
    }
    if (numArticle >= 459 && numArticle <= 520) {
      return 'RECOUVREMENT';
    }

    // Partie 2 - Impôts locaux (Art. 250-371)
    if (numArticle >= 250 && numArticle <= 262) {
      return 'FONCIER_BATI';
    }
    if (numArticle >= 263 && numArticle <= 276) {
      return 'FONCIER_NON_BATI';
    }
    if (numArticle >= 277 && numArticle <= 320) {
      return 'PATENTE';
    }
    if (numArticle >= 321 && numArticle <= 327) {
      return 'TAXE_REGIONALE';
    }
    if (numArticle >= 331 && numArticle <= 341) {
      return 'TAXE_SPECTACLES';
    }
    if (numArticle >= 342 && numArticle <= 364) {
      return 'TAXES_FACULTATIVES';
    }
    if (numArticle >= 365 && numArticle <= 371) {
      return 'PATENTE'; // Centimes additionnels à la patente
    }

    // Chapitre 5 - Taxes diverses (Art. 141-171N)
    if (numArticle >= 157 && numArticle <= 167) {
      return 'TAXE_TERRAINS';
    }
    if (articleNumero.startsWith('171') && articleNumero.includes('A')) {
      return 'TAXE_VEHICULES';
    }

    // Chapitre 4 - Dispositions communes (Art. 127-140K)
    if (numArticle >= 127 && numArticle <= 140) {
      if (contenuLower.includes('vérification') || contenuLower.includes('contrôle')) {
        return 'VERIFICATION';
      }
      return 'DECLARATIONS';
    }

    // Chapitre 2 - Impôts sur les revenus (Art. 93-116I)
    if (numArticle >= 93 && numArticle <= 102) {
      return 'IBA';
    }
    if (numArticle >= 103 && numArticle <= 110) {
      return 'IRCM';
    }
    if (numArticle >= 111 && numArticle <= 113) {
      return 'IRF';
    }
    if (numArticle >= 114 && numArticle <= 126) {
      return 'ITS';
    }

    // Chapitre 1 - IS (Art. 1-92K)
    if (articleNumero.startsWith('81') || contenuLower.includes('prix de transfert')) {
      return 'PRIX_TRANSFERT';
    }
    if (contenuLower.includes('personnes morales étrangères') || contenuLower.includes('établissement stable')) {
      return 'PM_ETRANGERES';
    }
    if (contenuLower.includes('minimum de perception') || contenuLower.includes('minimum fiscal')) {
      return 'MINIMUM_PERCEPTION';
    }
    if (contenuLower.includes('déclaration') || contenuLower.includes('obligation déclarative')) {
      return 'DECLARATIONS';
    }

    // Par défaut, IS
    return 'IS';
  }

  /**
   * Extraction et ingestion des alertes depuis TOUS les articles du CGI
   */
  static async extractAndIngest(version: string = '2026'): Promise<ExtractResult> {
    let inserted = 0;
    let updated = 0;

    try {
      logger.info(`Début de l'extraction des alertes fiscales pour la version ${version}`);

      // 1. Insérer les alertes prédéfinies
      for (const alerte of ALERTES_PREDEFINIES) {
        // Chercher l'article correspondant
        const article = await prisma.article.findFirst({
          where: {
            numero: alerte.articleNumero,
            version,
          },
        });

        const result = await prisma.alerteFiscale.upsert({
          where: {
            articleNumero_type_valeur_version: {
              articleNumero: alerte.articleNumero,
              type: alerte.type,
              valeur: alerte.valeur,
              version,
            },
          },
          create: {
            type: alerte.type,
            categorie: alerte.categorie,
            titre: alerte.titre,
            description: alerte.description,
            valeur: alerte.valeur,
            valeurNumerique: alerte.valeurNumerique ? new Prisma.Decimal(alerte.valeurNumerique) : null,
            unite: alerte.unite,
            periodicite: alerte.periodicite,
            articleId: article?.id,
            articleNumero: alerte.articleNumero,
            version,
            actif: true,
          },
          update: {
            titre: alerte.titre,
            description: alerte.description,
            valeurNumerique: alerte.valeurNumerique ? new Prisma.Decimal(alerte.valeurNumerique) : null,
            unite: alerte.unite,
            periodicite: alerte.periodicite,
            articleId: article?.id,
            actif: true,
          },
        });

        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          inserted++;
        } else {
          updated++;
        }
      }

      // Note: L'extraction automatique a été désactivée car elle génère des alertes
      // peu claires (ex: "Échéance - Article 10" avec valeur "30").
      // Seules les alertes prédéfinies (manuellement curées) sont utilisées.

      const total = inserted + updated;
      logger.info(`Extraction terminée`, { total, inserted, updated });

      return { total, inserted, updated };
    } catch (error) {
      logger.error('Erreur lors de l\'extraction des alertes', error);
      throw error;
    }
  }

  /**
   * Compter les alertes par type
   */
  static async countByType(version?: string): Promise<Record<AlerteType, number>> {
    const where: Prisma.AlerteFiscaleWhereInput = { actif: true };
    if (version) {
      where.version = version;
    }

    const counts = await prisma.alerteFiscale.groupBy({
      by: ['type'],
      where,
      _count: true,
    });

    const result: Record<AlerteType, number> = {
      ECHEANCE: 0,
      SEUIL: 0,
      TAUX: 0,
      SANCTION: 0,
      OBLIGATION: 0,
    };

    for (const item of counts) {
      result[item.type] = item._count;
    }

    return result;
  }

  /**
   * Compter les alertes par catégorie
   */
  static async countByCategorie(version?: string): Promise<Record<AlerteCategorie, number>> {
    const where: Prisma.AlerteFiscaleWhereInput = { actif: true };
    if (version) {
      where.version = version;
    }

    const counts = await prisma.alerteFiscale.groupBy({
      by: ['categorie'],
      where,
      _count: true,
    });

    const result: Record<AlerteCategorie, number> = {
      // Partie 1 - Chapitre 1: IS
      IS: 0,
      PM_ETRANGERES: 0,
      MINIMUM_PERCEPTION: 0,
      PRIX_TRANSFERT: 0,
      // Partie 1 - Chapitre 2: Impôts sur les revenus
      IBA: 0,
      IRCM: 0,
      IRF: 0,
      ITS: 0,
      // Partie 1 - Chapitres 4-5
      DECLARATIONS: 0,
      VERIFICATION: 0,
      TAXE_TERRAINS: 0,
      TAXE_VEHICULES: 0,
      // Partie 2 - Impôts locaux
      FONCIER_BATI: 0,
      FONCIER_NON_BATI: 0,
      PATENTE: 0,
      TAXE_REGIONALE: 0,
      TAXE_SPECTACLES: 0,
      TAXES_FACULTATIVES: 0,
      // Partie 3 - Dispositions communes
      SANCTIONS: 0,
      RECOUVREMENT: 0,
      RECLAMATIONS: 0,
      // Tome 2
      TVA: 0,
    };

    for (const item of counts) {
      result[item.categorie] = item._count;
    }

    return result;
  }
}

export default AlertesFiscalesService;
