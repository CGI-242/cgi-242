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
  // Seuils régimes
  {
    articleNumero: '26',
    type: 'SEUIL',
    categorie: 'DECLARATIONS',
    titre: 'Seuil régime forfait',
    description: 'Seuil de chiffre d\'affaires pour le régime forfaitaire',
    valeur: '100.000.000 FCFA',
    valeurNumerique: 100000000,
    unite: 'FCFA',
  },
  {
    articleNumero: '30',
    type: 'SEUIL',
    categorie: 'DECLARATIONS',
    titre: 'Seuil régime réel obligatoire',
    description: 'Seuil de chiffre d\'affaires au-delà duquel le régime réel est obligatoire',
    valeur: '100.000.000 FCFA',
    valeurNumerique: 100000000,
    unite: 'FCFA',
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
   * Déterminer la catégorie d'une alerte basée sur le contenu de l'article
   */
  static determineCategorie(contenu: string, articleNumero: string): AlerteCategorie {
    const contenuLower = contenu.toLowerCase();

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
   * Extraction et ingestion des alertes depuis les articles du Chapitre 1
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

      // 2. Extraire automatiquement depuis les articles du Chapitre 1 (numéros 1-93)
      const articles = await prisma.article.findMany({
        where: {
          version,
          OR: [
            { chapitre: { contains: 'Chapitre 1' } },
            { chapitre: { contains: 'CHAPITRE 1' } },
            { chapitre: { contains: 'chapitre 1' } },
          ],
        },
      });

      logger.info(`${articles.length} articles du Chapitre 1 trouvés`);

      for (const article of articles) {
        const alertesExtraites = this.extractAlertesFromContent(article.contenu, article.numero);

        for (const alerteData of alertesExtraites) {
          const categorie = this.determineCategorie(article.contenu, article.numero);

          // Générer un titre basé sur le type
          const titreMap: Record<AlerteType, string> = {
            ECHEANCE: `Échéance - Article ${article.numero}`,
            SEUIL: `Seuil - Article ${article.numero}`,
            TAUX: `Taux - Article ${article.numero}`,
            SANCTION: `Sanction - Article ${article.numero}`,
            OBLIGATION: `Obligation - Article ${article.numero}`,
          };

          try {
            const result = await prisma.alerteFiscale.upsert({
              where: {
                articleNumero_type_valeur_version: {
                  articleNumero: article.numero,
                  type: alerteData.type,
                  valeur: alerteData.valeur,
                  version,
                },
              },
              create: {
                type: alerteData.type,
                categorie,
                titre: titreMap[alerteData.type],
                description: `Extrait automatiquement de l'article ${article.numero}`,
                valeur: alerteData.valeur,
                valeurNumerique: alerteData.valeurNumerique ? new Prisma.Decimal(alerteData.valeurNumerique) : null,
                unite: alerteData.unite,
                articleId: article.id,
                articleNumero: article.numero,
                version,
                actif: true,
              },
              update: {
                valeurNumerique: alerteData.valeurNumerique ? new Prisma.Decimal(alerteData.valeurNumerique) : null,
                unite: alerteData.unite,
                actif: true,
              },
            });

            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
              inserted++;
            } else {
              updated++;
            }
          } catch {
            // Ignorer les erreurs de contrainte unique (déjà traitée par les alertes prédéfinies)
            logger.debug(`Alerte déjà existante pour ${article.numero}`, { type: alerteData.type, valeur: alerteData.valeur });
          }
        }
      }

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
      IS: 0,
      PM_ETRANGERES: 0,
      MINIMUM_PERCEPTION: 0,
      PRIX_TRANSFERT: 0,
      DECLARATIONS: 0,
    };

    for (const item of counts) {
      result[item.categorie] = item._count;
    }

    return result;
  }
}

export default AlertesFiscalesService;
